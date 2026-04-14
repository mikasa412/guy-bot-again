import { SlashCommandBuilder, EmbedBuilder, Client, CommandInteraction } from "discord.js";
import * as fs from "fs";

export const data = new SlashCommandBuilder()
  .setName("changelog")
  .setDescription("Replies with the changelog");

export async function execute(
  client: Client,
  interaction: CommandInteraction
) {
  const readme: string = await fs.promises.readFile("../../README.md", "utf-8");

  const changelog = new EmbedBuilder()
    .setTitle("changelog (fetched from the github)")
    .setDescription(readme);

  await interaction.reply({ embeds: [changelog] });
}