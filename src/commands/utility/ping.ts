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
  const evilchance = Math.random();
  const response = evilchance < 0.04 ? `EVIL pong! (${client.ws.ping * 6}ms)` : `pong (${client.ws.ping}ms)`;
  await interaction.reply(response);
}