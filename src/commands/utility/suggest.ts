import { SlashCommandBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel, MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } from "discord.js";
import dotenv from 'dotenv';
import { pool } from '../../index';

dotenv.config();

export async function accept(phrase: string, uid: string, client: Client) {
    const sqlConn = await pool.getConnection();
    await sqlConn.query(`INSERT INTO reactbot (phrase, gif) VALUES ("${phrase.replace('\n', '\\n').replace(/"/g, '\\"')}", ${Number(phrase.includes('https://'))})`)
    await client.users.send(
          uid,
          `this reaction you suggested: ${phrase} - was accepted! congrats`
        ); 
    return;
}


export const data = new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("suggest a reaction to be added to the bot's vocab")
    .addStringOption(option =>
            option.setName("text")
                    .setDescription("what do you think man (supports image/gif embed links)")
                    .setRequired(true))
export async function execute(
    client: Client,
    interaction: ChatInputCommandInteraction
) {
    const message = interaction.options.getString("text", true);
    const mCh = await client.channels.fetch(process.env.mod_log) as TextChannel;

    const accB = new ButtonBuilder()
        .setCustomId('accept')
        .setLabel('add into bot')
        .setStyle(ButtonStyle.Secondary);
    const rejB = new ButtonBuilder()
        .setCustomId('reject')
        .setLabel('reject suggestion')
        .setStyle(ButtonStyle.Primary);
    const blkB = new ButtonBuilder()
        .setCustomId(`blacklist-${interaction.user.id}`)
        .setLabel('blacklist from bot')
        .setStyle(ButtonStyle.Danger);
    const aRow = new ActionRowBuilder<ButtonBuilder>()
        .setComponents(accB, rejB, blkB)
        ;
    
    const emb = new EmbedBuilder()
        .setTitle('suggested reaction by '+interaction.user.tag)
        .setDescription(message)
        .setFooter({text: 'u id: '+interaction.user.id})
    await mCh.send({
        components: [aRow],
        embeds: [emb]
    });

    await interaction.reply({
        content: 'it\'s been sent off to the council...... \n(the bot\'ll update you in dm if it gets added or not)',
        flags: MessageFlags.Ephemeral
    });
}