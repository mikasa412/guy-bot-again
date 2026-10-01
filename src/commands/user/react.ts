import { SlashCommandBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel } from "discord.js";
import { increment, react } from "../utility/stats";

export const data = new SlashCommandBuilder()
  .setName("react")
  .setDescription("high quality reactions");
export async function execute(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  const reaction = await react();

  await increment(interaction.user.id, "reacts", 1, 1);
  await interaction.reply(reaction);
}