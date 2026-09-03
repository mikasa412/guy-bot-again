import { Client, GuildMember, TextChannel, Message } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import dotenv from 'dotenv';
import { increment } from "../../commands/utility/stats";

dotenv.config()

const reactPath = path.join(__dirname, "../../../jsons/reactions.json");

export default async function execute(
    client: Client,
    interaction: Message
) {
    if (interaction.mentions.has(client.user.id) && (interaction.author.id !== client.user.id)) {
        try {
            if (interaction.content.includes('?')) {
                if (interaction.content.includes(' or ')) {
                    const raw = interaction.content.replace(`<@${process.env.bot_id}>`, '').replace('?','');
                    let options = raw.split(' or ');
                    if (options.length == 2 && options[0].split(', ').length > 1 && options[1].split(', ').length == 1) {
                        let first = options[0].split(', ')
                        first.push(options[1])
                        first = first.filter(e => String(e).trim());
                        options = first
                    }
                    const choice = options[Math.floor(Math.random() * options.length)];
                    interaction.reply(`${interaction.content} \n 🎲 **${choice}**`);
                    return;
                }
                const question = interaction.content;
                const ballers = [
                    "Without a doubt",
                    "fuck yea [#100percent](https://coolmathgames.com)",
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
        } catch (error) {
            console.log(error);
        }
    }
}