import { SlashCommandBuilder, TextChannel, Client, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, TextDisplayBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalSubmitInteraction, MessageFlags } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import dotenv from 'dotenv';
import { increment } from "../utility/stats";

dotenv.config();

const recsPath = path.join(__dirname, "../../../jsons/recs.json");

export const data = new SlashCommandBuilder()
  .setName("recscreate")
  .setDescription("make a recommendation for a thing");

export function recModal() {
  const modal = new ModalBuilder().setCustomId('recmodal').setTitle('recommending...');

  const opentextInput = new TextInputBuilder()
    .setCustomId('review')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('start writing!!!!!!');
  const titleInput = new TextInputBuilder()
    .setCustomId('title')
    .setStyle(TextInputStyle.Short)
  const favoriteStarterSelect = new StringSelectMenuBuilder()
    .setCustomId('starter')
    .setRequired(true)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('artist')
        .setDescription('(musician/band)')
        .setValue('artist'),
      new StringSelectMenuOptionBuilder()
        .setLabel('song')
        .setValue('song'),
      new StringSelectMenuOptionBuilder()
        .setLabel('album')
        .setValue('album'),
      new StringSelectMenuOptionBuilder()
        .setLabel('steam game')
        .setValue('steam'),
      new StringSelectMenuOptionBuilder()
        .setLabel('mobile game')
        .setValue('mobile'),
      new StringSelectMenuOptionBuilder()
        .setLabel('website')
        .setDescription('(game specifically)')
        .setValue('webgame'),
      new StringSelectMenuOptionBuilder()
        .setLabel('website')
        .setDescription('(of any type)')
        .setValue('website'),
      new StringSelectMenuOptionBuilder()
        .setLabel('book')
        .setValue('book'),
      new StringSelectMenuOptionBuilder()
        .setLabel('TV show')
        .setValue('show'),
      new StringSelectMenuOptionBuilder()
        .setLabel('movie')
        .setValue('movie'),
      new StringSelectMenuOptionBuilder()
        .setLabel('manga/anime')
        .setValue('japan')
    );
  
  const ratingPick = new StringSelectMenuBuilder()
    .setCustomId('rating')
    .setRequired(true)
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('1 star')
        .setValue('1'),
      new StringSelectMenuOptionBuilder()
        .setLabel('2 stars')
        .setValue('2'),
      new StringSelectMenuOptionBuilder()
        .setLabel('3 stars')
        .setValue('3'),
      new StringSelectMenuOptionBuilder()
        .setLabel('4 stars')
        .setValue('4'),
      new StringSelectMenuOptionBuilder()
        .setLabel('5 stars')
        .setValue('5')
    );

  const favoriteStarterLabel = new LabelBuilder()
    .setLabel("which type of media is it?")
    .setStringSelectMenuComponent(favoriteStarterSelect);

  const titleLabel = new LabelBuilder()
    .setLabel("What's the title of the thing?")
    .setTextInputComponent(titleInput);

  const opentextLabel = new LabelBuilder()
    .setLabel("what's your pitch?")
    .setDescription('recommend this to someone who you\'d think would like it')
    .setTextInputComponent(opentextInput);

  const ratingLabel = new LabelBuilder()
    .setLabel("how many stars would you give it??")
    .setStringSelectMenuComponent(ratingPick);

  const text = new TextDisplayBuilder().setContent(
    'note this is not anonymous - if you put a spam/offensive review in it\'s easy to remove it and blacklist you from the bot',
  );

  modal
    .addLabelComponents(favoriteStarterLabel, titleLabel, opentextLabel, ratingLabel)
    .addTextDisplayComponents(text);
  return modal;
}

export async function handleModalSubmit(
  client: Client,
  interaction: ModalSubmitInteraction) {
  if (interaction.customId === 'recmodal') {
    const recs = JSON.parse(fs.readFileSync(recsPath, "utf-8"));
    const thingRev = interaction.fields.getTextInputValue('review');
    const mType = interaction.fields.getStringSelectValues('starter')[0];
    const thingR = interaction.fields.getStringSelectValues('rating')[0];
    const title = interaction.fields.getTextInputValue('title');

    const newRec = {
      ...recs.rectemplate,
      author: interaction.user.id,
      title: title,
      review: thingRev,
      rating: Number(thingR)
    }

    recs[mType].push(newRec);
    
    const logC = await client.channels.fetch(process.env.recs_log) as TextChannel;
    await logC.send(JSON.stringify(newRec, null, 2));

    fs.writeFileSync(recsPath, JSON.stringify(recs, null, 2));
      interaction.reply({
        content: "posted!",
        flags: MessageFlags.Ephemeral
      });
  }
}

export async function execute(
  client: Client,
  interaction: ChatInputCommandInteraction
) {
  await increment(interaction.user.id, "recs_created", 1, 1);
  const modal = recModal();
  await interaction.showModal(modal);
}