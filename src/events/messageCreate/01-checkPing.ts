import { Client, GuildMember, TextChannel, Message } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import { increment } from "../../commands/utility/stats";

const reactPath = path.join(__dirname, "../../../jsons/reactions.json");

export default async function execute(
    client: Client,
    interaction: Message
) {
    if (interaction.mentions.has(client.user.id) && !interaction.author.bot) {
        //get json & member
        const reactions = JSON.parse(fs.readFileSync(reactPath, "utf-8"));
        const member = interaction.member as GuildMember;

        //grab reaction
        const msgindex = Math.floor(Math.random() * reactions.length);
        const msgtosend = reactions[msgindex] as string;

        await increment(interaction.author.id, "reacts", 1, 1);
        await interaction.reply(msgtosend.replace(/"/g, ''));
    }
}