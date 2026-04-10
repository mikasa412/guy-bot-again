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
        if (interaction.content.includes('?')) {
            const question = interaction.content;
            const ballers = [
                "Without a doubt",
                "fuck yea [#100percent](https://hashtag)",
                "You may rely on it",
                "As I see it, yes",
                "Most likely",
                "Outlook good",
                "Signs point to yes",

                "<@801288893244506162> thoughts?",
                "Reply hazy, try again",
                "Ask again later",
                "Better not tell you now",
                "Cannot predict now",
                "Concentrate and ask again",
                "Seek the answer elsewhere",

                "Don't count on it",
                "My reply is no",
                "My sources say no",
                "Outlook not so good",
                "Very doubtful",
                "LMAO not a chance",
                "Don't keep your hopes up"
            ]
            //grab reaction
            const msgindex = Math.floor(Math.random() * ballers.length);
            const msgtosend = ballers[msgindex] as string;

            await increment(interaction.author.id, "8balls", 1, 1);
            await interaction.reply((question) + "\n**🎱 " + msgtosend + "**");
            return;
        }
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