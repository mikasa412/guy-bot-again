import { SlashCommandBuilder, ModalSubmitInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel, MessageFlags, ButtonBuilder, ButtonStyle } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("dmme")
  .setDescription("ask the dev to do stuff")
  .addStringOption(option =>
      option.setName("message")
          .setDescription("the message to send to the dev")
          .setRequired(true))
export async function execute(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  const message = interaction.options.getString("message", true);

  if (interaction.user.id === "1388566151092506664") {
    const sendmodal = new ModalBuilder()
        .setCustomId('send')
        .setTitle('send to...');

    const uidInput = new TextInputBuilder()
        .setCustomId('uid')
        .setStyle(TextInputStyle.Short);

    const uidLabel = new LabelBuilder()
        .setLabel("uid?")
        .setTextInputComponent(uidInput);

    const replyInput = new TextInputBuilder()
        .setCustomId('reply')
        .setStyle(TextInputStyle.Paragraph)
        .setValue(message);

    const titleLabel = new LabelBuilder()
        .setLabel("reply")
        .setTextInputComponent(replyInput);

    sendmodal.addLabelComponents(titleLabel, uidLabel)

    await interaction.showModal(sendmodal);
  } else {
    client.users.send("1388566151092506664", `User ${interaction.user.tag} <@${interaction.user.id}> used /dmme in server ${interaction.guild?.name} (${interaction.guild?.id}) with message: ${message}`);
    await interaction.reply({
      content: `message sent to the dev!`,
      flags: MessageFlags.Ephemeral
    });
  }
}