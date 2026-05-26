import { SlashCommandBuilder, EmbedBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel } from "discord.js";
import * as fs from "fs";
import * as path from "path";

const recsPath = path.join(__dirname, "../../../jsons/recs.json");

export const data = new SlashCommandBuilder()
  .setName("recsget")
  .setDescription("get a recommendation from the community")
  .addStringOption(option =>
      option.setName("type")
          .setDescription("the type of recommendation you want")
          .setRequired(true)
          .addChoices(
            { name: "artist", value: "artist" },
            { name: "song", value: "song" },
            { name: "album", value: "album" },
            { name: "steam game", value: "steam" },
            { name: "mobile game", value: "mobile" },
            { name: "website (game)", value: "webgame" },
            { name: "website (any)", value: "website" },
            { name: "book", value: "book" },
            { name: "TV show", value: "show" },
            { name: "movie", value: "movie" },
            { name: "manga/anime", value: "japan"}
          ));
export async function execute(
  client: Client,
  interaction: ChatInputCommandInteraction
) {

  await interaction.deferReply();

  const recs = JSON.parse(fs.readFileSync(recsPath, "utf-8"));
  const type = interaction.options.getString("type", true);
  
  if (recs[type].length == 0) {
    await interaction.reply("you're unlucky this time... no reviews in this category yet");
    return;
  }
  const rec = recs[type][Math.floor(Math.random() * recs[type].length)];
  
  const user = await client.users.fetch(rec.author);
  const stars = "⭐".repeat(rec.rating);

  const embed = new EmbedBuilder()
    .setTitle(`recommendation for ${rec.title}`)
    .setDescription(`${stars}\n${rec.review}\n\n-<@${user.id}>`)
    .setFooter({ text: `category: ${type} | ${recs[type].length} total reviews in this category` });

  fs.writeFileSync(recsPath, JSON.stringify(recs, null, 2));
  await interaction.followUp({ embeds: [embed] });
};