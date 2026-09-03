import { SlashCommandBuilder, EmbedBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel } from "discord.js";
import * as fs from "fs";


export const data = new SlashCommandBuilder()
    .setName("info")
    .setDescription("help for the bot & its commands")
export async function execute(
    client: Client,
    interaction: ChatInputCommandInteraction
) {
    const readme: string = await fs.promises.readFile("./README.md", "utf-8");

    const changelog = new EmbedBuilder()
        .setTitle("info & stuff")
        .setDescription(readme)
        .setColor('DarkRed');

    await interaction.reply({ embeds: [changelog] });
}