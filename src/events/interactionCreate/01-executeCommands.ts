import { MessageFlags, ModalBuilder, LabelBuilder, TextInputBuilder, TextInputStyle, TextChannel, type Client, type Interaction } from "discord.js";
import { handleModalSubmit } from "../../commands/user/recscreate";
import { reply2, report, like } from "../../commands/user/beach view";
import { c4accept, c4turn } from "../../commands/user/redditcares copy";
import * as fs from "fs";
import * as path from "path";

const blacklistPath = path.join(__dirname, "../../../jsons/config.json");
const blacklist = JSON.parse(fs.readFileSync(blacklistPath, "utf-8")).blacklist;
const bottleban = JSON.parse(fs.readFileSync(blacklistPath, "utf-8")).bottleban;
const reportban = JSON.parse(fs.readFileSync(blacklistPath, "utf-8")).reportban;

// Execute slash commands
export default async function handleInteraction(
  client: Client,
  interaction: Interaction
) {
  const logC = await client.channels.fetch(process.env.global_log) as TextChannel;
  if (interaction.isModalSubmit()) { 
    console.log(`Processing modal submit: ${interaction.customId} from ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name || "user install"}`);
    await logC.send(`Processing modal submit: ${interaction.customId} from ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name || "user install"} \n full interaction data: \`\`\`${String(interaction.context)}\`\`\``);
    switch (interaction.customId.split('-')[0] || interaction.customId) {
      case ('recmodal'): 
        await handleModalSubmit(client, interaction);
        break;
      case ('replymodal'):
        await reply2(client, interaction);
        break;
      default:
        await interaction.reply({
          content: '[error code 71] you submitted a modal that doesn\'t exist?????? how the fuck',
          flags: MessageFlags.Ephemeral
        });
    } 
  }

  if (interaction.isButton()) {
    console.log(`Processing button click: ${interaction.customId} from ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name || "user install"}`);
    await logC.send(`Processing button click: ${interaction.customId} from ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name || "user install"}`);
    switch (interaction.customId.split('-')[0] || interaction.customId) {
      case ('ban'):
        bottleban.push(interaction.user.id);
        fs.writeFileSync(blacklistPath, JSON.stringify({ blacklist, bottleban, reportban }, null, 4));
        await interaction.reply({ content: 'user banned from adding bottles', flags: MessageFlags.Ephemeral });
        break;
      case ('report'):
        reportban.push(interaction.user.id);
        fs.writeFileSync(blacklistPath, JSON.stringify({ blacklist, bottleban, reportban }, null, 4));
        await interaction.reply({ content: 'user banned from reporting bottles', flags: MessageFlags.Ephemeral });
        break;
      case ('blacklist'):
        blacklist.users.push(interaction.user.id);
        fs.writeFileSync(blacklistPath, JSON.stringify({ blacklist, bottleban, reportban }, null, 4));
        await interaction.reply({ content: 'user banned from bot', flags: MessageFlags.Ephemeral });
        break;
      case ('beachReply'):
        const id = interaction.customId.split('-')[1];
        const modal = new ModalBuilder()
          .setCustomId('replymodal-'+id)
          .setTitle('replying to bottle #'+id);

        const replyInput = new TextInputBuilder()
          .setCustomId('reply')
          .setStyle(TextInputStyle.Short)
          .setMaxLength(255)
          .setMinLength(10)

        const titleLabel = new LabelBuilder()
          .setLabel("ok so what do you want to say")
          .setTextInputComponent(replyInput);

        modal.addLabelComponents(titleLabel)

        await interaction.showModal(modal);

        break;
      case ('start4'): 
        await c4accept(interaction, interaction.customId.split('-')[1], interaction.customId.split('-')[2]);
        await interaction.reply({ content: 'yippee', flags: MessageFlags.Ephemeral });
        break;
      case ('beachReport'):
        if (reportban.includes(interaction.user.id)) {
          await interaction.reply({
            content: 'you are banned from reporting bottles',
            flags: MessageFlags.Ephemeral
          });
          return;
        }
        await report(Number(interaction.customId.split('-')[1]), client, interaction);
        break;
      case ('like'):
        await like(Number(interaction.customId.split('-')[1]), client, interaction);
        break;
      case ('placeholder'):
          await interaction.reply({
            content: 'be patient now',
            flags: MessageFlags.Ephemeral
          });
        break;
      default:
        await interaction.reply({
          content: '[error code 72] you clicked a button that doesn\'t exist?????? how the fuck',
          flags: MessageFlags.Ephemeral
        });
    }
  }

	if (interaction.isStringSelectMenu()) {
    switch (interaction.customId.split('-')[0] || interaction.customId) {
      case ('start4'): { await c4turn(interaction); break; }
      default: await interaction.reply({ content: '[error code 73] yellow diamonds shinin like pee pee', flags: MessageFlags.Ephemeral });
    }
  }
  
  if (interaction.isChatInputCommand()) {

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.warn(`[error code 21] No command matching "${interaction.commandName}"`);
      return;
    }

    if (blacklist.users.includes(interaction.user.id)) {
      await interaction.reply({
        content: "[error code 99] blacklisted user",
        flags: MessageFlags.Ephemeral
      });
      return;
    } else if (interaction.guildId && blacklist.guilds.includes(interaction.guildId)) {
      await interaction.reply({
        content: "[error code 98] blacklisted server",
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    const line1 = `Executing ${interaction.commandName} command for ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name || "user install"}`;
    if (interaction.options.getUser)
    await logC.send(line1 + `\n full command data: \`\`\`${String(interaction)}\`\`\``);
    console.log(line1);

    try {
      
      await command.execute(client, interaction);
    } catch (err) {
      console.error(`[${interaction.commandName}] execution error:`, err);
      const logC = await client.channels.fetch(process.env.crash_log) as TextChannel;
      await logC.send(`[${interaction.commandName}] execution error: ` + err);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "[error code 12] something went wrong after execution",
          flags: MessageFlags.Ephemeral
        });
      } else {
        await interaction.reply({
          content: "[error code 11] something went wrong on execution",
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
}
