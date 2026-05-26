import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, Client, GuildMember, ButtonInteraction, ChatInputCommandInteraction, TextChannel, ButtonStyle } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import dotenv from 'dotenv';

dotenv.config();

export async function pageturn(
    interaction: ButtonInteraction,
    page: number
) {
    const beachPath = path.join(__dirname, "../../../jsons/beach.json");
    const beach = JSON.parse(fs.readFileSync(beachPath, "utf-8"));
    const now = Math.floor(Date.now() / 1000);
    const cache = beach.cache;

    const cacheKeys = Object.keys(cache);
    const arr = cacheKeys.map(key => ({ id: Number(key), ...cache[key] }));
    const cachepage = arr.slice(page * 5, Math.min((page + 1) * 5, arr.length));                                                

    let viewLikeRow = new ActionRowBuilder<ButtonBuilder>();
    let viewReplyRow = new ActionRowBuilder<ButtonBuilder>();
    let pageList = [];
    
    for (let index = page * 5; index < Math.min((page + 1) * 5, cachepage.length); index++) {
        const element = cachepage[index];
        
        viewLikeRow.addComponents(new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('#' + element.id)
            .setCustomId('like-' + element.id)
            .setEmoji('<:like:1430633436355498014>'));
        viewReplyRow.addComponents(new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel('#' + element.id)
            .setCustomId('beachReply-' + element.id)
            .setEmoji('<:reply:1440461154072924212>'));
        pageList.push(new EmbedBuilder()
                .setTitle(`#${element.id} - written by ${element.hush == 'Y' ? 'someone' : element.author}`+(element.likes && element.likes.length > 0 ? ` - <:like:1430633436355498014> ${element.likes.length} like${element.likes.length > 1 ? 's' : ''}` : ''))
                .setDescription(element.message + (element.reply == null ? '' : '\n\nreply to a bottle by ' + element.reply[0] + ':\n' + element.reply[1])));//*/
    }

    let pageRow = null;

    if (arr.length > 5) {
        pageRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(new ButtonBuilder()
                .setLabel('prev')
                .setDisabled(page === 0)
                .setCustomId((page > 0 ? 'page-'+(page-1) : 'page-0'))
                .setEmoji('◀')
                .setStyle(ButtonStyle.Primary))
            .addComponents(new ButtonBuilder()
                .setLabel('next')
                .setDisabled((page + 1) * 5 >= arr.length)
                .setCustomId('page-'+(page+1))
                .setEmoji('▶')
                .setStyle(ButtonStyle.Primary))
    }

    const componentsToSend: ActionRowBuilder<ButtonBuilder>[] = [];
    if (viewLikeRow.components.length > 0) componentsToSend.push(viewLikeRow);
    if (viewReplyRow.components.length > 0) componentsToSend.push(viewReplyRow);
    if (pageRow !== null && pageRow.components.length > 0) componentsToSend.push(pageRow);

    await interaction.message.edit({ components: componentsToSend.length > 0 ? componentsToSend : undefined, embeds: pageList });//*/
}

export const data = new SlashCommandBuilder()
    .setName("beachview")
    .setDescription("look at today's found bottles")
export async function execute(
    client: Client,
    interaction: ChatInputCommandInteraction
) {
    const beachPath = path.join(__dirname, "../../../jsons/beach.json");
    const beach = JSON.parse(fs.readFileSync(beachPath, "utf-8"));
    const now = Math.floor(Date.now() / 1000);
    const cache = beach.cache;
    
    for (const id in cache) if (cache[id].date + Number(process.env.cache_window) < now) delete cache[id];

    await interaction.deferReply();
    
    fs.writeFileSync(beachPath, JSON.stringify(beach, null, 2));

    const cacheKeys = Object.keys(cache);
    if (cacheKeys.length === 0) {
        await interaction.followUp("no bottles here... strange. maybe try and find one?");
        return;
    }

    const arr = cacheKeys.map(key => ({ id: Number(key), ...cache[key] }));
    const cachepage = arr.slice(0, Math.min(5, arr.length));
                                                         

    //await interaction.followUp(JSON.stringify(cachepage[0]));
    
    let viewLikeRow = new ActionRowBuilder<ButtonBuilder>();
    let viewReplyRow = new ActionRowBuilder<ButtonBuilder>();
    let pageList = [];
    
    for (let index = 0; index < cachepage.length; index++) {
        const element = cachepage[index];
        
        viewLikeRow.addComponents(new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('#' + element.id)
            .setCustomId('like-' + element.id)
            .setEmoji('<:like:1430633436355498014>'));
        viewReplyRow.addComponents(new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel('#' + element.id)
            .setCustomId('beachReply-' + element.id)
            .setEmoji('<:reply:1440461154072924212>'));
        pageList.push(new EmbedBuilder()
                .setTitle(`#${element.id} - written by ${element.hush == 'Y' ? 'someone' : element.author}`+(element.likes && element.likes.length > 0 ? ` - <:like:1430633436355498014> ${element.likes.length} like${element.likes.length > 1 ? 's' : ''}` : ''))
                .setDescription(element.message + (element.reply == null ? '' : '\n\nreply to a bottle by ' + element.reply[0] + ':\n' + element.reply[1])));//*/
    }

    let pageRow = null;

    if (arr.length > 5) {
        pageRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(new ButtonBuilder()
                .setLabel('prev')
                .setDisabled(true)
                .setCustomId('placeholder')
                .setEmoji('◀')
                .setStyle(ButtonStyle.Primary))
            .addComponents(new ButtonBuilder()
                .setLabel('next')
                .setCustomId('page-1')
                .setEmoji('▶')
                .setStyle(ButtonStyle.Primary))
    }

    const componentsToSend: ActionRowBuilder<ButtonBuilder>[] = [];
    if (viewLikeRow.components.length > 0) componentsToSend.push(viewLikeRow);
    if (viewReplyRow.components.length > 0) componentsToSend.push(viewReplyRow);
    if (pageRow !== null && pageRow.components.length > 0) componentsToSend.push(pageRow);

    await interaction.followUp({ components: componentsToSend.length > 0 ? componentsToSend : undefined, embeds: pageList });//*/
};
