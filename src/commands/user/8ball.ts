import { SlashCommandBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel } from "discord.js";
import * as fs from "fs";
import * as path from "path";

const reactPath = path.join(__dirname, "../../../config.json");

export const data = new SlashCommandBuilder()
  .setName("8ball")
  .setDescription("ask the spirits a question")
  .addStringOption(option =>
      option.setName("question")
          .setDescription("yep.")
          .setRequired(true);
export async function execute(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  const question = interaction.options.getString("question", true);
  const ballers = [
      "Without a doubt",
      "fuck yea [#100percent](https://hashtag)",
      "You may rely on it",
      "As I see it, yes",
      "Most likely",
      "Outlook good",
      "Signs point to yes",

      "Not sure, ask <@801288893244506162>",
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
  const msgtosend = serverReactions[msgindex] as string;

  const embed = new EmbedBuilder()
      .setDescription("🎱 " + msgtosend)

  await interaction.reply({
    content: question + "?",
    embeds: [embed]
}