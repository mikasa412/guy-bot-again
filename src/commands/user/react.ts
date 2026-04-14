import { SlashCommandBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import { increment } from "../utility/stats";

const reactPath = path.join(__dirname, "../../../jsons/reactions.json");

export const data = new SlashCommandBuilder()
  .setName("react")
  .setDescription("high quality reactions");
export async function execute(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  //get json & member
  const reactions = JSON.parse(fs.readFileSync(reactPath, "utf-8"));
  const member = interaction.member as GuildMember;

  //grab reaction
  const msgindex = Math.floor(Math.random() * reactions.length);
  const msgtosend = reactions[msgindex] as string;

  await increment(interaction.user.id, "reacts", 1, 1);
  await interaction.reply(msgtosend.replace(/"/g, ''));
}