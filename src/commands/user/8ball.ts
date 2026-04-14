import { SlashCommandBuilder, Client, GuildMember, ChatInputCommandInteraction } from "discord.js";
import { increment } from "../utility/stats";

export const data = new SlashCommandBuilder()
  .setName("8ball")
  .setDescription("ask the spirits a question")
  .addStringOption(option =>
      option.setName("question")
          .setDescription("so, uhh..."))
export async function execute(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  const question = interaction.options.getString("question") ?? "";
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

  await increment(interaction.user.id, "8balls", 1, 1);
  await interaction.reply((question ? question + "?" : "") + "\n**🎱 " + msgtosend + "**")
}