import { SlashCommandBuilder, ModalSubmitInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel, ButtonStyle, Embed, ButtonInteraction, MessageFlags, ModalSubmitInteractionCollectorOptions } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import { increment } from "../utility/stats";
import dotenv from 'dotenv';

dotenv.config();

const beachPath = path.join(__dirname, "../../../jsons/beach.json");
const beach = JSON.parse(fs.readFileSync(beachPath, "utf-8"));
function now() { return Math.floor(Date.now() / 1000); }

export const data = new SlashCommandBuilder()
    .setName("beachfind")
    .setDescription("find a new bottle on the beach")

export async function reply2(client: Client, interaction:ModalSubmitInteraction) {
    
    await interaction.deferReply({flags:MessageFlags.Ephemeral});

    const oldbottleID = interaction.customId.split('-')[1];
    const bottletemplate = beach.bottletemplate;
    
    if (!beach.cache[oldbottleID]) {
        await interaction.reply({
            content: 'invalid bottle ID',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    // check if too old to reply to
    if (beach.cache[oldbottleID].date + parseInt(process.env.reply_window) < now()) {
        if (beach.cache[oldbottleID].date + parseInt(process.env.cache_window) < now()) delete beach.cache[oldbottleID];
        await interaction.followUp({
            content: 'sorry, this bottle is too old to reply to',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const newBottle = {
        ...bottletemplate,
        message: interaction.fields.getTextInputValue('reply'),
        author: interaction.user.tag,
        authorID: interaction.user.id,
        hush:  'N',
        reply: [beach.cache[oldbottleID].hush === 'Y' ? 'someone' : beach.cache[oldbottleID].author, beach.cache[oldbottleID].message],
        date: Math.floor(Date.now() / 1000)
    }

    beach.bottles.push(newBottle);
    
    fs.writeFileSync(beachPath, JSON.stringify(beach, null, 2));
    await increment(interaction.user.id, "bottles_thrown", 1, 1);
    const logC = await client.channels.fetch(process.env.bottle_log) as TextChannel;
    await logC.send(JSON.stringify(newBottle, null, 2));
    await interaction.followUp({
        content: "you toss the bottle into the sea... (again)",
        flags: MessageFlags.Ephemeral
    });
}

export async function like(bottle: number, client: Client, interaction:ButtonInteraction) {
    await interaction.deferReply({flags:MessageFlags.Ephemeral});

    if (beach.cache[bottle].date + parseInt(process.env.cache_window) < now()) delete beach.cache[bottle];

    if (!beach.cache[bottle]) {
        await interaction.reply({
            content: 'sorry, this bottle is either too old or doesn\'t exist',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    if (beach.cache[bottle].likes.includes(interaction.user.id)) {
        await interaction.followUp({
            content: 'you already liked this bottle',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    beach.cache[bottle].likes.push(interaction.user.id);
    fs.writeFileSync(beachPath, JSON.stringify(beach, null, 2));

    const likeCount = beach.cache[bottle].likes.length;
    await interaction.message.edit({content: `\n<:like:1430633436355498014> **${likeCount}** ${likeCount === 1 ? 'like' : 'likes'}`});


    const thrower = beach.cache[bottle].authorID;
    if (thrower) {
        try {
            await increment(thrower, "bottle_likes", 1, 1);
            await interaction.followUp({
                content: 'liked!',
                flags: MessageFlags.Ephemeral
            });
            return;
        } catch (err) {
            console.error('error incrementing likes: ', err);
            await interaction.followUp({
                content: 'stats error, but liked!',
                flags: MessageFlags.Ephemeral
            });
            return;
        }
    } else {
        await interaction.followUp({
            content: 'liked! (but couldn\'t find the thrower to give them their like, rip)',
            flags: MessageFlags.Ephemeral
        });
        return;
    }
}

export async function report(bottle: number, client: Client, interaction: ButtonInteraction) {
    if (!interaction.memberPermissions?.has("ManageMessages")) {
        await interaction.reply({
            content: 'sorry, but only mods can do this due to abuse - better fix is in the works',
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    if (!bottle || !beach.cache[bottle]) {
        await interaction.reply({
            content: 'invalid bottle ID',
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    const rBottle = beach.cache[bottle];
    const bottleban = new ButtonBuilder()
        .setCustomId(`ban-${bottle}`)
        .setLabel('ban from beach')
        .setStyle(ButtonStyle.Primary)
    const reportban = new ButtonBuilder()
        .setCustomId(`report-${interaction.user.id}`)
        .setLabel('ban reporter from reporting')
        .setStyle(ButtonStyle.Secondary)
    const blacklist = new ButtonBuilder()
        .setCustomId(`blacklist-${bottle}`)
        .setLabel('blacklist user')
        .setStyle(ButtonStyle.Danger)
    const beachRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(bottleban, reportban, blacklist)
    const logC = await client.channels.fetch(process.env.mod_log) as TextChannel;
    await logC.send({
        content: `## reported by ${interaction.user.tag} (${interaction.user.id}):\n`+JSON.stringify(rBottle, null, 2),
        components: [beachRow]
    });
    await interaction.message.edit({
        content: `**bottle reported by <@${interaction.user.id}>**`,
        components: []
    });
    await interaction.reply({
        content: 'reported - it\'ll be dealt with',
        flags: MessageFlags.Ephemeral
    });
}

export async function execute(
    client: Client,
    interaction: ChatInputCommandInteraction
) {
    if (Math.floor(Math.random() * 150) == 0) {
        interaction.reply({
            embeds: [new EmbedBuilder({
                title: 'picked up a crab!',
                description: 'ouch',
                footer: {text: 'ID: 🦀 | 56,973,736,970 crabs on the beach'}
            })]
        });
        return;
    }

    await interaction.deferReply();

    
    const now_ = now();
    const cooldown = beach.cooldowns;
    let factor = 0;
    let cooldownTime = 0;
    for (const entry of cooldown) {
        if (entry[0] === interaction.user.id) {
            factor += 1;
            cooldownTime = Math.max(cooldownTime, entry[1]);
        }
    }
    if (cooldownTime !== 0) {
        const calcdown = cooldownTime + Number(process.env.pull_cd_base) * Math.pow(Number(process.env.pull_cd_factor), factor-1);
        if (calcdown > now_) {
            await interaction.followUp({
                content: `chill, don't drain the beach - you can have another go <t:${calcdown}:R>`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }
    }
    cooldown.push([interaction.user.id, now_]);
    cooldown.splice(0, cooldown.length - Number(process.env.max_cd_entries));
    
    const bottles = beach.bottles;
    const cache = beach.cache;
    
    for (const id in cache) if (cache[id].date + Number(process.env.cache_window) < now_) delete cache[id];

    if (bottles.length === 0) {
        await interaction.reply("you're unlucky this time... maybe throw a bottle in the sea with /beachadd and try again later?");
        return;
    }

    let bottle: { author: string, authorID: number, message: string, date: string, reply: [string, string] | null, hush: string };
    const iIndex = Math.floor(Math.random() * bottles.length);
    for (let i = 0; i < bottles.length; i++) {
          bottle = bottles[(i + iIndex) % bottles.length];
          if (bottle.author != interaction.user.tag) break;
          else bottle = null;
    }
    
    if (!bottle) {
        await interaction.followUp("either there aren't any bottles here or all of them were thrown by you - try again later or ask someone else to /beachadd");
        return;
    }

    const bID = beach.bottleID;
    beach.bottleID += 1;

    bottles.splice(bottles.indexOf(bottle), 1);


    bottle.message = bottle.message.replace(/{name}/g, interaction.guild ? (interaction.member as GuildMember).nickname : interaction.user.displayName)
                                   .replace(/{time}/g, `<t:${now_}:t>`)
                                   .replace(/{date}/g, `<t:${now_}:D>`)
                                   .replace(/{ping}/g, `<@${interaction.user.id}>`);

    const place = Math.floor(Math.random() * 100) < 5 ? 'fish tank' : 'beach';
    const item = Math.floor(Math.random() * 100) < 2.5 ? 'fortune cookie' : 'bottle';
    const header = Math.floor(Math.random() * 100) < 1 ? (bottle.hush !== 'Y' ? bottle.author : 'some guy') + ` just walked up to you and handed you this ${item} idk` : `picked up a ${item}!${bottle.hush !== 'Y' ? ` (from ${bottle.author})` : '' }`;
    
    cache[bID] = {
        author: bottle.author,
        authorID: bottle.authorID,
        hush: bottle.hush,
        message: bottle.message,
        reply: bottle.reply,
        likes: [],
        date: now_
    }

    const time = bottle.date;

    fs.writeFileSync(beachPath, JSON.stringify(beach, null, 2));

    const reportB = new ButtonBuilder()
        .setCustomId(`beachReport-${bID}`)
        .setLabel(`report`)
        .setStyle(ButtonStyle.Danger)
        .setEmoji('<:report:1430633462989193287>')

    const replyB = new ButtonBuilder()
        .setCustomId(`beachReply-${bID}`)
        .setLabel('reply')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('<:reply:1440461154072924212>')

    const likeB = new ButtonBuilder()
        .setCustomId(`like-${bID}`)
        .setLabel('like')
        .setStyle(ButtonStyle.Success)
        .setEmoji('<:like:1430633436355498014>')
    const beachRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(likeB, replyB, reportB)

    const embed = new EmbedBuilder()
        .setTitle(header)
        .setDescription(bottle.message + "\n\n-# left on: <t:" + time + ':s>')
        .setFooter({ text: `ID: ${bID + (bID % 100 == 0 ? ' 🎉' : '')} | ${bottles.length} bottles on the ${place}` });

    let replyEmbed = null
    
    if (bottle.reply) {
        replyEmbed = new EmbedBuilder()
            .setTitle(`(reply to a bottle by ${bottle.reply[0]})`)
            .setDescription(bottle.reply[1])
    }

    await interaction.followUp({ components: [beachRow], embeds: (replyEmbed ? [embed, replyEmbed] : [embed]) });
};
