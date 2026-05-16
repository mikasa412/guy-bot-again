import { ButtonInteraction, StringSelectMenuInteraction, CacheType, Interaction, MessageFlags, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { SlashCommandBuilder, EmbedBuilder, Client, GuildMember, ActionRowBuilder, ButtonBuilder, ChatInputCommandInteraction, TextChannel, ButtonStyle } from "discord.js";
import { increment, ruthbaderginsburg } from "../utility/stats";
import dotenv from 'dotenv';

dotenv.config();

async function connect4menu(
        turn: number, 
        challengerId: string, 
        targetId: string) {
    const favoriteStarterSelect = new StringSelectMenuBuilder()
            .setCustomId('start4')
            .setPlaceholder('Make a selection!')
            .addOptions(
                // String select menu options
                new StringSelectMenuOptionBuilder()
                    .setLabel('column 1')
                    .setValue('1-' + turn + '-' + challengerId + '-' + targetId),
                new StringSelectMenuOptionBuilder()
                    .setLabel('column 2')
                    .setValue('2-' + turn + '-' + challengerId + '-' + targetId),
                new StringSelectMenuOptionBuilder()
                    .setLabel('column 3')
                    .setValue('3-' + turn + '-' + challengerId + '-' + targetId),
                new StringSelectMenuOptionBuilder()
                    .setLabel('column 4')
                    .setValue('4-' + turn + '-' + challengerId + '-' + targetId),
                new StringSelectMenuOptionBuilder()
                    .setLabel('column 5')
                    .setValue('5-' + turn + '-' + challengerId + '-' + targetId),
                new StringSelectMenuOptionBuilder()
                    .setLabel('column 6')
                    .setValue('6-' + turn + '-' + challengerId + '-' + targetId),
                new StringSelectMenuOptionBuilder()
                    .setLabel('column 7')
                    .setValue('7-' + turn + '-' + challengerId + '-' + targetId)
            );
        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(favoriteStarterSelect);
        return row;
}

async function windetect(board: string[][]): Promise<string> {
    const isEmpty = (cell: string) => cell === "⬛";

    const rows = board.length;
    const cols = board[0]?.length ?? 0;
    const directions = [ [0, 1], [1, 0], [1, 1], [1, -1] ] as const;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const current = board[row][col];
            if (!current || isEmpty(current)) continue;

            for (const [dRow, dCol] of directions) {
                let count = 1;
                for (let step = 1; step < 4; step++) {
                    const nextRow = row + dRow * step;
                    const nextCol = col + dCol * step;
                    if (
                        nextRow < 0 ||
                        nextRow >= rows ||
                        nextCol < 0 ||
                        nextCol >= cols ||
                        board[nextRow][nextCol] !== current
                    ) {
                        break;
                    }
                    count++;
                }

                if (count >= 4)  return current == "🔴" ? "red" : "yellow";
            }
        }
    }
    const hasEmptyCell = board.some(row => row.includes("⬛"));
    return hasEmptyCell ? "" : "draw";
}

async function boardplace(
        board: string[][], 
        column: number, 
        piece: number
): Promise<string> {
    for (let row = board.length - 1; row >= 0; row--) {
        if (board[row][column] === "⬛") {
            board[row][column] = piece == 0 ? "🔴" : "🟡";
            return board.map(r => r.join("")).join("\n");
        }
    }
    return 'full';
}

export async function c4accept(
        interaction: ButtonInteraction<CacheType>,
        targetId: string,
        challengerId: string
) {
    await increment(interaction.user.id, "connect4_games");
    
    if (targetId !== interaction.user.id) {
        await interaction.reply({
            content: "this isn't for you :P",
            flags: MessageFlags.Ephemeral
        });
        return;
    }
    const row = await connect4menu(0, challengerId, targetId);

    const orig = interaction.message;
    await orig.edit({
        components: [row],
        embeds: [{ description: "# <@"+targetId+"> vs <@"+challengerId+">\n<@"+targetId+"> accepted the challenge! pick a column to drop your piece in :)", title: "connect 4" }]
    });
}

export async function c4turn(
    interaction: StringSelectMenuInteraction<CacheType>
) {
    const vals = interaction.values[0].split('-');
    const column: number = Number(vals[0]);
    const turn: number = Number(vals[1]);
    const challengerId: string = vals[2];
    const targetId: string = vals[3];
    if (interaction.user.id !== interaction.values[0].split("-")[turn%2+2]) { await interaction.reply({ content: "dialog3.txt", flags: MessageFlags.Ephemeral }); return; }
    const orig = interaction.message;
    if (turn == 0) {
        await orig.edit({
        components: [await connect4menu(1, challengerId, targetId)],
        embeds: [{ description: "⬛⬛⬛⬛⬛⬛⬛\n".repeat(5) + "⬛".repeat(column-1) + "🔴" + "⬛".repeat(7-column) }],
        content: `<@${interaction.values[0].split("-")[turn%2+2]}> dropped a piece in column ${column}!\n<@${interaction.values[0].split("-")[turn%2?2:3]}> it's your turn!`
        });
    } else {
            const board = orig.embeds[0].description?.split("\n").map(r => Array.from(r)) ?? [];
            const newBoard = await boardplace(board, column-1, turn%2);
            const win: string = await windetect(board);
            if (newBoard === 'full') {
                    await interaction.reply({
                            content: "column full!!!!!!!!!!!!!!!!!!!!!!",

                            flags: MessageFlags.Ephemeral
                    });
                    return;
            } else if (win !== '') {
                    await orig.edit({
                            components: [],
                            embeds: [{ description: newBoard }],
                            content: `<@${interaction.values[0].split("-")[turn%2+2]}> dropped a piece in column ${column} and won the game!`
                    });
                    await ruthbaderginsburg('connect4', interaction.values[0].split("-")[turn%2+2], interaction.values[0].split("-")[turn%2?2:3]);
            } else if (await windetect(board) === 'draw') {
                    await orig.edit({
                            components: [],
                            embeds: [{ description: newBoard }],
                            content: `<@${interaction.values[0].split("-")[turn%2+2]}> dropped a piece in column ${column} and the game is a draw!`
                    });
                    await ruthbaderginsburg('connect4', interaction.values[0].split("-")[turn%2+2], interaction.values[0].split("-")[turn%2?2:3], 1);
            } else {
                    await orig.edit({
                            components: [await connect4menu(turn + 1, challengerId, targetId)],
                            embeds: [{ description: newBoard }],
                            content: `<@${interaction.values[0].split("-")[turn%2+2]}> dropped a piece in column ${column}!\n<@${interaction.values[0].split("-")[turn%2?2:3]}> it's your turn!`
                    });
            }
    }
    await interaction.reply({
            content: `it worked ? column ${column} turn ${turn}`,
            flags: MessageFlags.Ephemeral
    });
}

export const data = new SlashCommandBuilder()
    .setName("connect4")
    .setDescription("connect connect connect connect")
    .addUserOption(option =>
        option.setName("opponent")
            .setDescription("who are you playing against?")
            .setRequired(true)
    );
export async function execute(
        client: Client,
        interaction: ChatInputCommandInteraction
) {
    const target = interaction.options.getUser("opponent", true);
    const member = interaction.member as GuildMember;
    if (target.id == member.id) {
        await interaction.reply("play with yourself some other way");
        return;
    } else if (!interaction.guild?.name) {
        await interaction.reply('this one only works in servers with the bot in it');
        return;
    } else if (target.id == client.user.id) {
        await interaction.reply('I\'m not smart enough for that :)');
        return;
    } else if (target.bot) {
        await interaction.reply('play against a real person');
        return;
    }
    const embed = new EmbedBuilder()
        .setTitle("challenge!")
        .setDescription(`play connect 4 with ${member.nickname || member.user.globalName}?`)
        .setColor(0x00FFFF)
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setLabel("accept")
                .setCustomId("start4-" + target.id + "-" + member.id)
                .setStyle(ButtonStyle.Primary))
    await interaction.reply({ content: `challenge for <@${target.id}>!!`, embeds: [embed], components: [row] });
}