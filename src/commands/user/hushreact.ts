import { SlashCommandBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel, MessageFlags } from "discord.js";
import { increment, react } from "../utility/stats";

export const data = new SlashCommandBuilder()
  .setName("hushreact")
  .setDescription("high quality reactions (while staying anonymous)");
export async function execute(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  const reaction = await react();

  await increment(interaction.user.id, "reacts", 1, 1);
  await interaction.channel.send(reaction);
  await interaction.reply({
    content: "sent!",
    flags: MessageFlags.Ephemeral
  });
}