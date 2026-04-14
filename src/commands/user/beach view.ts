import { SlashCommandBuilder, ModalSubmitInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel, ButtonStyle, Embed, ButtonInteraction, MessageFlags, ModalSubmitInteractionCollectorOptions } from "discord.js";
import * as fs from "fs";
import * as path from "path";
import { increment } from "../utility/stats";

const beachPath = path.join(__dirname, "../../../jsons/beach.json");
const beach = JSON.parse(fs.readFileSync(beachPath, "utf-8"));

export const data = new SlashCommandBuilder()
    .setName("beachview")
    .setDescription("find a bottle on the beach")

export function replyModal() {
    const modal = new ModalBuilder().setCustomId('replymodal').setTitle('holy crap lois');

    const replyInput = new TextInputBuilder()
        .setCustomId('reply')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(255)
        .setMinLength(10)

    const titleLabel = new LabelBuilder()
        .setLabel("ok so what do you want to say")
        .setTextInputComponent(replyInput);

    const idInput = new TextInputBuilder()
        .setCustomId('bottle')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(6)

    const idLabel = new LabelBuilder()
        .setLabel("get the ID at the bottom of the bottle")
        .setTextInputComponent(idInput);

    modal.addLabelComponents(idLabel, titleLabel)
    return modal;
}

export async function reply(interaction:ButtonInteraction) {
    const modal = replyModal();
    await interaction.showModal(modal);
}

export async function reply2(client: Client, interaction:ModalSubmitInteraction) {
    const beach = JSON.parse(fs.readFileSync(beachPath, "utf-8"));
    const oldbottleID = interaction.fields.getTextInputValue('bottle');
    const newuser = interaction.user.tag;
    const content = interaction.fields.getTextInputValue('reply');
    const bottletemplate = beach.bottletemplate;

    if (!beach.cache[oldbottleID]) {
        await interaction.reply({
            content: 'invalid bottle ID',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    interaction.deferReply({flags:MessageFlags.Ephemeral});

    // check if too old to reply to
    const now = Math.floor(Date.now() / 1000);
    if (beach.cache[oldbottleID].date + 600 /*10 min*/ < now) {
        delete beach.cache[oldbottleID];
        await interaction.reply({
            content: 'sorry, this bottle is too old to reply to',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const newBottle = {
        ...bottletemplate,
        message: content,
        author: newuser,
        hush:  'N',
        reply: [beach.cache[oldbottleID].author, beach.cache[oldbottleID].message],
        date: Math.floor(Date.now() / 1000)
    }

    beach.bottles.push(newBottle);
    
    fs.writeFileSync(beachPath, JSON.stringify(beach, null, 2));
    await increment(interaction.user.id, "bottles_thrown", 1, 1);
    const logC = await client.channels.fetch(process.env.bottle_log) as TextChannel;
    await logC.send(JSON.stringify(newBottle, null, 2));
    await interaction.followUp({
        content: "you toss the bottle into the sea... (again)",
        flags: MessageFlags.Ephemeral
    });
}

export async function report(bottle:Embed, client: Client, interaction: ButtonInteraction) {
    const beach = JSON.parse(fs.readFileSync(beachPath, "utf-8"));
    if (!interaction.memberPermissions?.has("ManageMessages")) {
        await interaction.reply({
            content: 'sorry, but only mods can do this due to abuse - better fix is in the works',
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    const reportbottleID = bottle.footer?.text?.split(' ')[1];
    if (!reportbottleID || !beach.cache[reportbottleID]) {
        await interaction.reply({
            content: 'invalid bottle ID',
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    const rBottle = beach.cache[reportbottleID];
    const bottleban = new ButtonBuilder()
        .setCustomId(`ban-${reportbottleID}`)
        .setLabel('ban from beach')
        .setStyle(ButtonStyle.Primary)
    const reportban = new ButtonBuilder()
        .setCustomId(`report-${interaction.user.id}`)
        .setLabel('ban reporter from reporting')
        .setStyle(ButtonStyle.Secondary)
    const blacklist = new ButtonBuilder()
        .setCustomId(`blacklist-${reportbottleID}`)
        .setLabel('blacklist user')
        .setStyle(ButtonStyle.Danger)
    const beachRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(bottleban, reportban, blacklist)
    const logC = await client.channels.fetch(process.env.mod_log) as TextChannel;
    await logC.send({
        content: `## reported by ${interaction.user.tag} (${interaction.user.id}):\n`+JSON.stringify(rBottle, null, 2),
        components: [beachRow]
    });
    await interaction.message.edit({
        content: `**bottle reported by <@${interaction.user.id}>**`,
        components: []
    });
    await interaction.reply({
        content: 'reported - it\'ll be dealt with',
        flags: MessageFlags.Ephemeral
    });
}

export async function execute(
    client: Client,
    interaction: ChatInputCommandInteraction
) {
    const beach = JSON.parse(fs.readFileSync(beachPath, "utf-8"));

    const bID = beach.bottleID;

    beach.bottleID += 1;
    
    const bottles = beach.bottles;
    const cache = beach.cache;
    
    // Clean old cache entries
    const now = Math.floor(Date.now() / 1000);
    for (const id in cache) {
        if (cache[id].date + 600 < now) {
            delete cache[id];
        }
    }

    await interaction.deferReply();
    
    if (bottles.length === 0) {
        await interaction.reply("you're unlucky this time... maybe throw a bottle in the sea with /beachadd and try again later?");
        return;
    }

    let bottle: { author: string, message: string, date: string, reply: [string, string] | null, hush: string };
        while (!bottle) {
            bottle = bottles[Math.floor(Math.random() * bottles.length)];
            if (bottle.author == interaction.user.tag) {
                bottle = null;
            }
        }
        bottles.splice(bottles.indexOf(bottle), 1);
    
    
    cache[bID] = {
        author: bottle.hush === 'Y' ? 'someone' : bottle.author,
        message: bottle.message,
        date: Math.floor(Date.now() / 1000)
    }

    const time = bottle.date;

    fs.writeFileSync(beachPath, JSON.stringify(beach, null, 2));

    const reportB = new ButtonBuilder()
        .setCustomId('beachReport')
        .setLabel('report')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('⚠')

    const replyB = new ButtonBuilder()
        .setCustomId(`beachReply`)
        .setLabel('reply')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('💬')

    const beachRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(replyB, reportB)

    const embed = new EmbedBuilder()
        .setTitle(`picked up a bottle!${bottle.hush !== 'Y' ? ` (from ${bottle.author})` : '' }`)
        .setDescription(bottle.message + "\n\n-# left on: <t:" + time + ':s>')
        .setFooter({ text: `ID: ${bID + (bID % 100 == 0 ? ' 🎉' : '')} | ${bottles.length} bottles on the beach` });

    let replyEmbed = null
    
    if (bottle.reply) {
        replyEmbed = new EmbedBuilder()
            .setTitle(`(original by ${bottle.reply[0]})`)
            .setDescription(bottle.reply[1])
    }

    

    await interaction.followUp({ components: [beachRow], embeds: (replyEmbed ? [embed, replyEmbed] : [embed]) });
};