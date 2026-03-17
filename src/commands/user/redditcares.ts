import { SlashCommandBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel, MessageFlags } from "discord.js";
import {increment} from "../utility/stats";


export const data = new SlashCommandBuilder()
  .setName("redditcares")
  .setDescription("reddit cares about someone you know")
  .addUserOption(option =>
    option.setName("user")
      .setDescription("the user to care about")
      .setRequired(true)
  );
export async function execute(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  
  
  const user = interaction.options.getUser("user", true);
  const id = user.id;
  try {
      await client.users.send(id, `
      **Hi there**,

      A concerned redditor (from r/${interaction.guild?.name || "discord"}) reached out to us about you.

      When you're in the middle of something painful, it may feel like you don't have a lot of options. But whatever you're going through, you deserve help and there are people who are here for you.

      Text CHAT to Crisis Text Line at 741741. You'll be connected to a Crisis Counselor from Crisis Text Line, who is there to listen and provide support, no matter what your situation is. It's free, confidential, and available 24/7.

      If you'd rather talk to someone over the phone or chat online, there are additional resources and people to talk to. Find Someone Now

      If you think you may be depressed or struggling in another way, don't ignore it or brush it aside. Take yourself and your feelings seriously, and reach out to someone.

      It may not feel like it, but you have options. There are people available to listen to you, and ways to move forward.

      Your fellow redditors care about you and there are people who want to help.

      If you think you may have gotten this message in error, report this message.

      To stop receiving messages from u/IShowFinance, reply “STOP” to this message. 
      `);
  } catch (error) {
      await interaction.reply({
        content: `couldn't send the message to ${user.displayName ? user.displayName : user.globalName}`,
        flags: MessageFlags.Ephemeral
      });
      return;
  }
  await increment(interaction.user.id, "redditcares");
  interaction.reply({
    content: `sent to ${user.displayName ? user.displayName : user.globalName}`,
    flags: MessageFlags.Ephemeral
  });
}