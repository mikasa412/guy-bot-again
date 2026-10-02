import { SlashCommandBuilder, EmbedBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel, MessageFlags } from "discord.js";
import { pool } from '../../index';
import * as fs from "fs";
import * as path from "path";
import dotenv from 'dotenv';

dotenv.config();

const config = path.join(__dirname, "../../../jsons/config.json");

export const data = new SlashCommandBuilder()
    .setName("beachstats")
    .setDescription("get stats on the beach currently")
    export async function execute(
    client: Client,
    interaction: ChatInputCommandInteraction
) {
    const sqlConn = await pool.getConnection();
    const raw = JSON.parse(fs.readFileSync(config, "utf-8"));
    const bottles = await sqlConn.query(`SELECT * FROM beach;`);

    await sqlConn.query(`DELETE FROM cache WHERE time < ${Math.floor(Date.now() / 1000) - Number(process.env.cache_window)};`);

    const embed = new EmbedBuilder()
        .setTitle('beach stats:')
        .setDescription(`there have been **${raw.bottleID + bottles.length - 1}** bottles thrown,\nand ${raw.bottleID - 1} of those have been picked up\n(meaning there are ${bottles.length} left to find)\n\nthe current oldest bottle is from <t:${bottles[0].date}:s> and was left by ${bottles[0].author}\nthe latest bottle was dropped in on <t:${bottles.at(-1).date}:s> by ${bottles.at(-1).author}`)
        .setFooter({text: 'thanks for being curious about my bot! -mikasa'});

    
    fs.writeFileSync(config, JSON.stringify(raw, null, 2));
    interaction.reply({
        embeds: [embed]
    });
};