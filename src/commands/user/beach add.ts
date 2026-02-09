import { SlashCommandBuilder, EmbedBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel } from "discord.js";
import * as fs from "fs";
import * as path from "path";

const reactPath = path.join(__dirname, "../../../config.json");

export const data = new SlashCommandBuilder()
  .setName("beachadd")
  .setDescription("throw a bottle into the sea")
  .addStringOption(option =>
      option.setName("message")
          .setDescription("the message in the bottle")
          .setRequired(true))
export async function execute(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  const config = JSON.parse(fs.readFileSync(reactPath, "utf-8"));
  const beach = config.beach;
  const bottletemplate = beach.bottletemplate;
  const bottles = beach.bottles;
  const member = interaction.member as GuildMember;
  const message = interaction.options.getString("message", true);

  const newBottle = {
    ...bottletemplate,
    message: message,
    author: member.user.tag,
    date: new Date().toISOString()
  };

  bottles.push(newBottle);

  fs.writeFileSync(reactPath, JSON.stringify(config, null, 2));
  interaction.reply({
    content: "you toss the bottle into the sea...",
    ephemeral: true
  });
};