import { MessageFlags, TextChannel, type Client, type Interaction } from "discord.js";
import { handleModalSubmit } from "../../commands/user/recscreate";
import { reply, reply2, report } from "../../commands/user/beach view";
import * as fs from "fs";
import * as path from "path";

// Execute slash commands
export default async function handleInteraction(
  client: Client,
  interaction: Interaction
) {
  if (interaction.isModalSubmit()) { 
    switch (interaction.customId) {
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
    switch (interaction.customId) {
      case ('beachReply'):
        await reply(interaction);
        break;
      case ('beachReport'):
        await report(interaction.message.embeds[0], client, interaction);
        break;
      default:
        await interaction.reply({
          content: '[error code 72] you clicked a button that doesn\'t exist?????? how the fuck',
          flags: MessageFlags.Ephemeral
        });
    }
  }
	
  if (interaction.isChatInputCommand()) {

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.warn(`[error code 21] No command matching "${interaction.commandName}"`);
      return;
    }

    const blacklistPath = path.join(__dirname, "../../../jsons/config.json");
    const blacklist = JSON.parse(fs.readFileSync(blacklistPath, "utf-8")).blacklist;

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

    try {
      const logC = await client.channels.fetch(process.env.global_log) as TextChannel;
      await logC.send(`Executing ${interaction.commandName} command for ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name || "DMs or user install"} \n full command data: \`\`\`${String(interaction)}\`\`\``);
      console.log(`Executing ${interaction.commandName} command for ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild?.name || "DMs or user install"}`);
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
