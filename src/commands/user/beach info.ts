import { SlashCommandBuilder, EmbedBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel, MessageFlags } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import dotenv from 'dotenv';

dotenv.config();

const beachPath = path.join(__dirname, "../../../jsons/beach.json");

export const data = new SlashCommandBuilder()
    .setName("beachstats")
    .setDescription("get stats on the beach currently")
    export async function execute(
    client: Client,
    interaction: ChatInputCommandInteraction
) {
    const beach = JSON.parse(fs.readFileSync(beachPath, "utf-8"));
    const bottles = beach.bottles;
    const member = interaction.member as GuildMember;
    const now = Math.floor(Date.now() / 1000);

    for (const bottle in beach.cache) {
        const element = beach.cache[bottle];
        if (element.date + Number(process.env.reply_window) < now) {
            delete beach.cache[bottle];
        }
    }

    const embed = new EmbedBuilder()
        .setTitle('beach stats:')
        .setDescription(`there have been **${beach.bottleID + bottles.length}** bottles thrown,\nand ${beach.bottleID-1} of those have been picked up\n(meaning there are ${bottles.length} left to find)\n\nthe current oldest bottle is from <t:${bottles[0].date}:s> and was left by ${bottles[0].author}\nthe latest bottle was dropped in on <t:${bottles.at(-1).date}:s> by ${bottles.at(-1).author}`)
        .setFooter({text: 'thanks for being curious about my bot! -mikasa'});

    
    fs.writeFileSync(beachPath, JSON.stringify(beach, null, 2));
    interaction.reply({
        embeds: [embed]
    });
};