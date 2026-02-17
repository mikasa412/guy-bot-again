import { SlashCommandBuilder, Client, CommandInteraction } from "discord.js";
import { increment } from "./stats";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with pong");

export async function execute(
  client: Client,
  interaction: CommandInteraction
) {
  await increment(interaction.user.id, "pings");
  await interaction.reply(`pong (${client.ws.ping}ms)`);
}
