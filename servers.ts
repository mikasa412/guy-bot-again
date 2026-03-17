import { SlashCommandBuilder, Client, CommandInteraction } from "discord.js";
import { increment } from "./src/commands/utility/stats";

export const data = new SlashCommandBuilder()
  .setName("servers") // only able to run in mod server
  .setDescription("replies with servers (mod server only)");

export async function execute(
  client: Client,
  interaction: CommandInteraction
) {
  await increment(interaction.user.id, "pings");
  await interaction.reply(`currently in: \n- ${client.guilds.cache.map(g => g.name).join("\n- ")}`);
}
