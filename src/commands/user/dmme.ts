import { SlashCommandBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("dmme")
  .setDescription("ask the dev to do stuff")
  .addStringOption(option =>
      option.setName("message")
          .setDescription("the message to send to the dev")
          .setRequired(true))
  .addStringOption(option =>
      option.setName("user")
          .setDescription("(DEV ONLY) user ID to dm")
          .setRequired(false));
export async function execute(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  const message = interaction.options.getString("message", true);
  const userId = interaction.options.getString("user");

  if (userId && interaction.user.id === "893991732855832648") {
    try {
      client.users.send(userId, `dev: ${message}`);
      await interaction.reply({
        content: `<@${userId}> sent! `
      });
    } catch (error) {
      await interaction.reply({
        content: `failed to send message to <@${userId}>`
      });
    }
  } else if (userId) {
    await interaction.reply({
      content: `lmao! try it without the ID next`
    });
  } else {
    client.users.send("893991732855832648", `User ${interaction.user.tag} <@${interaction.user.id}> used /dmme in server ${interaction.guild?.name} (${interaction.guild?.id}) with message: ${message}`);
    await interaction.reply({
      content: `message sent to the dev!`
    });
  }
}