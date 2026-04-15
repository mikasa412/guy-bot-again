import { SlashCommandBuilder, EmbedBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel, MessageFlags } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import { increment } from "../utility/stats";

const beachPath = path.join(__dirname, "../../../jsons/beach.json");
const blacklistPath = path.join(__dirname, "../../../jsons/config.json");
const blacklist = JSON.parse(fs.readFileSync(blacklistPath, "utf-8"));

export const data = new SlashCommandBuilder()
    .setName("beachadd")
    .setDescription("throw a bottle into the sea")
    .addStringOption(option =>
            option.setName("message")
                    .setDescription("the message in the bottle")
                    .setRequired(true))
    .addStringOption(option =>
            option.setName("hush")
                    .setDescription("do you want to be anonymous?")
                    .addChoices(
                        { name: "yes", value: "Y" },
                        { name: "no", value: "N" }
                    ));
export async function execute(
    client: Client,
    interaction: ChatInputCommandInteraction
) {
    const beach = JSON.parse(fs.readFileSync(beachPath, "utf-8"));
    const bottletemplate = beach.bottletemplate;
    const bottles = beach.bottles;
    const member = interaction.member as GuildMember;
    const message = interaction.options.getString("message", true);
    const hush = interaction.options.getString('hush', false);

    if (blacklist.blacklist.users.includes(interaction.user.id)) {
        await interaction.reply({
            content: 'you are banned from adding to the beach',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const newBottle = {
        ...bottletemplate,
        message: message,
        author: interaction.user.tag,
        authorID: interaction.user.id,
        hush:  hush ? hush : 'N',
        reply: null, 
        date: Math.floor(Date.now() / 1000)
    };

    await interaction.deferReply({flags:MessageFlags.Ephemeral});

    bottles.push(newBottle);

    fs.writeFileSync(beachPath, JSON.stringify(beach, null, 2));
    await increment(interaction.user.id, "bottles_thrown", 1, 1);
    const logC = await client.channels.fetch(process.env.bottle_log) as TextChannel;
    await logC.send(JSON.stringify(newBottle, null, 2).replace(/@/g, '@ '));
    await interaction.followUp({
        content: "you toss the bottle into the sea...",
        flags: MessageFlags.Ephemeral
    });
};