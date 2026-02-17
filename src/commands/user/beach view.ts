import { SlashCommandBuilder, EmbedBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import { increment } from "../utility/stats";

const reactPath = path.join(__dirname, "../../../config.json");

export const data = new SlashCommandBuilder()
  .setName("beachview")
  .setDescription("find a bottle on the beach")
export async function execute(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  const config = JSON.parse(fs.readFileSync(reactPath, "utf-8"));
  const beach = config.beach;
  const bottles = beach.bottles;
  
  if (bottles.length === 0) {
    await interaction.reply("you're unlucky this time... maybe throw a bottle in the sea with /beachadd and try again later?");
    return;
  }
  const bottle = bottles[Math.floor(Math.random() * bottles.length)];
  bottles.splice(bottles.indexOf(bottle), 1);

  const time1 = bottle.date.replace(/T/g, " ");
  const time = bottle.date.replace(/Z/g, " ");

  const embed = new EmbedBuilder()
    .setTitle(`picked up a bottle! (from ${bottle.author})`)
    .setDescription(bottle.message)
    .setFooter({ text: `left on: ${time}` });
  fs.writeFileSync(reactPath, JSON.stringify(config, null, 2));
  await increment(interaction.user.id, "bottles_read");
  interaction.reply({ embeds: [embed] });
};