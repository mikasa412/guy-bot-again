import { SlashCommandBuilder, ModalSubmitInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel, ButtonStyle, Embed, ButtonInteraction, MessageFlags, ModalSubmitInteractionCollectorOptions } from "discord.js";
import { pool } from '../../index';
import * as fs from "fs";
import * as path from "path";
import { increment } from "../utility/stats";
import dotenv from 'dotenv';

dotenv.config();

const config = path.join(__dirname, "../../../jsons/config.json");
const raw = JSON.parse(fs.readFileSync(config, "utf-8"));
function now() { return Math.floor(Date.now() / 1000); }

export const data = new SlashCommandBuilder()
    .setName("beachview")
    .setDescription("find a new bottle on the beach")

export async function reply2(client: Client, interaction:ModalSubmitInteraction) {

    const now_ = now();
    
    await interaction.deferReply({flags:MessageFlags.Ephemeral});

    const sqlConn = await pool.getConnection();

    const oldbottleID = interaction.customId.split('-')[1];

    await sqlConn.query(`DELETE FROM cache WHERE time < ${now_ - Number(process.env.cache_window)};`);
    const cache = await sqlConn.query(`SELECT * FROM cache;`);

    let bottle;
    for (var temp of cache) { if (temp.bID == oldbottleID) { bottle = temp; break; } }

    
    if (!bottle) {
        await interaction.reply({
            content: 'sorry, this one\'s too old',
            flags: MessageFlags.Ephemeral
        });
        await sqlConn.release();
        return;
    }

    const replyString = `${bottle.hush === 'Y' ? 'someone' : bottle.author} bottle.message.replace(/"/g, '\\"')}`.replace(/,/g, '", "')

    await sqlConn.query(`
        INSERT INTO ${process.env.sql_beachtable} (message, author, authorID, hush, replyA, reply, date) 
        VALUES (\"${interaction.fields.getTextInputValue('reply').replace(/"/g, '\\"')}\", \"${interaction.user.tag}\", \"${interaction.user.id}\", 0, \"${bottle.hush === 'Y' ? 'someone' : bottle.author}\", \"${bottle.message.replace(/"/g, '\\"')}\", \"${Math.floor(Date.now() / 1000)}\");
    `);
	
	sqlConn.release();
    
    await increment(interaction.user.id, "bottles_thrown", 1, 1);
    const logC = await client.channels.fetch(process.env.bottle_log) as TextChannel;
    await logC.send(`(\"${interaction.fields.getTextInputValue('reply').replace(/"/g, '\\"')}\", \"${interaction.user.tag}\", \"${interaction.user.id}\", 0, \"[${replyString}]\", \"${Math.floor(Date.now() / 1000)}\")`);

    await interaction.followUp({
        content: "you toss the bottle (back) into the sea...",
        flags: MessageFlags.Ephemeral
    });
}

export async function like(bID: number, client: Client, interaction:ButtonInteraction) {
    await interaction.deferReply({flags:MessageFlags.Ephemeral});

    const now_ = now();
    const sqlConn = await pool.getConnection();

    await sqlConn.query(`DELETE FROM cache WHERE time < ${now_ - Number(process.env.cache_window)};`);
    const cache = await sqlConn.query(`SELECT * FROM cache;`);


    let bottle;
    for (var temp of cache) { if (temp.bID == bID) { bottle = temp; break; } }

    if (!bottle) {
        await interaction.reply({
            content: 'sorry, this bottle is either too old or doesn\'t exist',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const likes: string[] = JSON.parse(`{"likes": [${bottle.likes}]}`).likes;

    if (likes.includes(interaction.user.id)) {
        await interaction.followUp( 'you already liked this bottle' );
        return;
    }

    likes.push(interaction.user.id);

    await sqlConn.query(`UPDATE cache SET likes=\"[${likes}]\" WHERE bID=${bID};`);

    const likeCount = likes.length;
    await interaction.message.edit({content: `\n<:like:1430633436355498014> **${likeCount}** ${likeCount === 1 ? 'like' : 'likes'}`});


    const thrower = bottle.authorID;

    try {
        await increment(thrower, "bottle_likes", 1, 1);
        await interaction.followUp({
            content: 'liked!',
            flags: MessageFlags.Ephemeral
        });
        await sqlConn.release();
        return;
    } catch (err) {
        console.error('error incrementing likes: ', err);
        await interaction.followUp({
            content: 'stats error, but liked!',
            flags: MessageFlags.Ephemeral
        });
        await sqlConn.release();
        return;
    }
    
}

export async function report(bID: number, client: Client, interaction: ButtonInteraction) {
    if (!interaction.memberPermissions?.has("ManageMessages")) {
        await interaction.reply({
            content: 'sorry, but only mods can do this due to abuse - better fix is in the works',
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    const now_ = now();
    const sqlConn = await pool.getConnection();

    await sqlConn.query(`DELETE FROM cache WHERE time < ${now_ - Number(process.env.cache_window)};`);
    const cache = await sqlConn.query(`SELECT * FROM cache WHERE (bID = ${bID}) LIMIT 1;`);

    if (!cache || cache.length == 0) {
        await interaction.reply({
            content: 'either it\'s too old or something\'s REALLY wrong',
            flags: MessageFlags.Ephemeral
        });
        await sqlConn.release();
        return;
    }

    let bottle = cache[0];

    const bottleban = new ButtonBuilder()
        .setCustomId(`ban-${bottle.authorID}`)
        .setLabel('ban from beach')
        .setStyle(ButtonStyle.Primary)
    const reportban = new ButtonBuilder()
        .setCustomId(`report-${interaction.user.id}`)
        .setLabel('ban reporter from reporting')
        .setStyle(ButtonStyle.Secondary)
    const blacklist = new ButtonBuilder()
        .setCustomId(`blacklist-${bottle.authorID}`)
        .setLabel('blacklist user')
        .setStyle(ButtonStyle.Danger)
    const beachRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(bottleban, reportban, blacklist)
    const logC = await client.channels.fetch(process.env.mod_log) as TextChannel;
    await logC.send({
        content: `## reported by ${interaction.user.tag} (${interaction.user.id}):\n`+JSON.stringify(bottle, null, 2),
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
        await interaction.reply({
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
	const sqlConn = await pool.getConnection();
    const cooldown = await sqlConn.query(`SELECT * FROM cooldowns ORDER BY time DESC;`);
    let factor = 0;
    let cooldownTime = 0;
    for (const entry of cooldown) {
        if (entry.uID === interaction.user.id) {
            factor += 1;
            cooldownTime = Math.max(cooldownTime, parseInt(entry.time));
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
    await sqlConn.query(`INSERT INTO cooldowns (uID, time) VALUES (\"${interaction.user.id}\", ${now_});`);
    await sqlConn.query(`DELETE FROM cooldowns ORDER BY time ASC LIMIT 1;`);

    const bottles: { 
        author: string, 
        authorID: string, 
        message: string, 
        hush: boolean, 
        reply: string | null, replyA: string | null, 
        date: string
    }[] = await sqlConn.query(`SELECT * FROM beach WHERE (author != "${interaction.user.tag}") ORDER BY RAND() LIMIT 1;`);
    
    if (bottles.length === 0) {
        await interaction.followUp("either there aren't any bottles here or all of them were thrown by you - try again later or ask someone else to /beachadd");
        return;
    } 
    
    const bottle = bottles[0];

    const bID = raw.bottleID;
    raw.bottleID += 1;
    fs.writeFileSync(config, JSON.stringify(raw, null, 2));

    await sqlConn.query(`DELETE FROM cache WHERE time < ${now_ - Number(process.env.cache_window)}`);

    bottle.message = bottle.message.replace(/{name}/g, interaction.guild ? (interaction.member as GuildMember).nickname : interaction.user.displayName)
                                   .replace(/{time}/g, `<t:${now}:t>`)
                                   .replace(/{date}/g, `<t:${now}:D>`)
                                   .replace(/{ping}/g, `<@${interaction.user.id}>`);

    const place = Math.floor(Math.random() * 100) < 5 ? 'fish tank' : 'beach';
    const item = Math.floor(Math.random() * 100) < 2.5 ? 'fortune cookie' : 'bottle';
    const header = Math.floor(Math.random() * 100) < 1 ? (!bottle.hush ? bottle.author : 'some guy') + ` just walked up to you and handed you this ${item} idk` : `picked up a ${item}!${!bottle.hush ? ` (from ${bottle.author})` : '' }`;
    
    if (bottle.reply) await sqlConn.query(`INSERT INTO cache (bID, author, authorID, message, hush, reply, replyA, time) VALUES (${bID}, \"${bottle.author}\", \"${bottle.authorID}\", \"${bottle.message.replace(/"/g, '\\"').replace(/\n/g, '\\\\n')}\", ${bottle.hush}, \"${bottle.reply}\", \"${bottle.replyA}\", ${now_})`);
    else              await sqlConn.query(`INSERT INTO cache (bID, author, authorID, message, hush, time) VALUES (${bID}, \"${bottle.author}\", \"${bottle.authorID}\", \"${bottle.message.replace(/"/g, '\\"').replace(/\n/g, '\\\\n')}\", ${bottle.hush}, ${now_})`);
    await sqlConn.query(`DELETE FROM beach WHERE message=\"${bottle.message.replace(/"/g, '\\"')}\";`);
    await sqlConn.release();

    const time = bottle.date;


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
        .setFooter({ text: `ID: ${bID + (bID % 100 == 0 ? ' 🎉' : '')} | ${bottles.length - 1} bottles on the ${place}` });

    let replyEmbed = bottle.reply ? new EmbedBuilder().setTitle(`(reply to a bottle by ${bottle.hush ? bottle.replyA : 'someone'})`).setDescription(bottle.reply) : null;

    await interaction.followUp({ components: [beachRow], embeds: (replyEmbed ? [embed, replyEmbed] : [embed]) });
};