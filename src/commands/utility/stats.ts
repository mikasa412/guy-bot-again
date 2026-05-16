import { SlashCommandBuilder, EmbedBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel, MessageFlags } from "discord.js";
import dotenv from 'dotenv';
import * as fs from "fs";
import * as path from "path";
import { pool } from '../../index';
const statsPath = path.join(__dirname, "../../../jsons/stats.json");

dotenv.config();

export async function ruthbaderginsburg(
	game: string,
	winnerID: string,
	loserID: string,
	draw: number = 0
) {
	const sqlConn = await pool.getConnection();
	
	try {
		if (draw) {
			const statD = `UPDATE ${process.env.sql_usertable} SET ${game} = JSON_SET(${game}, '$[2]', JSON_EXTRACT(${game}, '$[2]') + 1) WHERE Hdiscord_id IN (${winnerID}, ${loserID});`;
			await sqlConn.query(statD);
			return;
		}
		const statWL1 = `UPDATE ${process.env.sql_usertable} SET ${game} = JSON_SET(${game}, '$[0]', JSON_EXTRACT(${game}, '$[0]') + 1) WHERE Hdiscord_id = ${winnerID};`;
		await sqlConn.query(statWL1);
		const statWL2 = `UPDATE ${process.env.sql_usertable} SET ${game} = JSON_SET(${game}, '$[1]', JSON_EXTRACT(${game}, '$[1]') + 1) WHERE Hdiscord_id = ${loserID};`;
		await sqlConn.query(statWL2);
	} catch (err) {
		console.error('error on increment: ', err);
	} finally {
		if (sqlConn?.release) await sqlConn.release();
	}
}

export async function increment(
	ID: string,
	command: string,
	user: number = 0,
	amount: number = 1
) {
	
	const sqlConn = await pool.getConnection();
	const statG = `UPDATE ${process.env.sql_globaltable} SET \`${command}\` = \`${command}\` + ${amount};`;
	await sqlConn.query(statG);

	if (user) {
		// sql for user - open a connection from the pool on each call
		try {
			
			const statU = `INSERT INTO ${process.env.sql_usertable} (Hdiscord_id, \`${command}\`) VALUES (${ID}, ${amount}) ON DUPLICATE KEY UPDATE \`${command}\` = \`${command}\` + ${amount};`;
			await sqlConn.query(statU);
			
		} catch (err) {
			console.error('error on increment: ', err);
		}
	}
	sqlConn.release();
}

export const data = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("look at your stats for commands and things")
  .addUserOption(option =>
		option.setName("user")
			.setDescription("look at someone else's stats")
			.setRequired(false));
export async function execute(
  client: Client,
  interaction: ChatInputCommandInteraction
  ) {
  	//get member
  	const member = interaction.member as GuildMember;
  	const userId = interaction.user.id;
	const userOption = interaction.options.getUser("user");
	
	await increment(interaction.user.id, "stats_checks");
	
	const target = userOption ? userOption.id : userId;
	const targetMember = userOption ? await interaction.guild.members.fetch(userOption.id) : member;



  	try {
		const sqlConn = await pool.getConnection();
        if (target == process.env.bot_id) {
			const globalstats = await sqlConn.query(`SELECT * FROM ${process.env.sql_globaltable};`);
			var statsglobal = Object.entries(globalstats[0]).map(([key, value]) => `**${key}:** ${value}`).join('\n');
			statsglobal = statsglobal.replace(/_/g, " ");
			const embed = new EmbedBuilder()
				.setTitle("Global Stats")
				.setDescription(statsglobal)
				.setTimestamp();
			await interaction.reply({ embeds: [embed]});
			return;
		}
		let statsuser = `no stats found for ${targetMember.nickname ? targetMember.nickname : targetMember.user.displayName}`;
        const result = await sqlConn.query(`SELECT * FROM ${process.env.sql_usertable} WHERE Hdiscord_id = ${target};`);
        if (result.length !== 0) {
            const userStats = result[0];
            const stats = Object.entries(userStats).filter(([key, value]) => key[0] !== 'H'  && value != 0).map(([key, value]) => `**${key}:** ${value}`).join('\n');
            if (stats) statsuser = stats;
			statsuser = statsuser.replace(/_/g, " ");
        }

		const evilchance: boolean = Math.floor(Math.random() * 50) == 0;

		const embed = new EmbedBuilder()
			.setTitle((evilchance ? 'EVIL ' : '') + `stats for ${targetMember.nickname ? targetMember.nickname : targetMember.user.displayName}`)
			.setDescription(statsuser)
			.setTimestamp();
			if (evilchance) embed.setColor(0xFF0000);

		await interaction.reply({ embeds: [embed]});
		
		sqlConn.release();
  	} catch (err) {
		console.error('Error in request:', err);
		await interaction.reply({
			content: 'SQL error in stats fetch, go yell at me to fix it',
			flags: MessageFlags.Ephemeral
		});
  	}
}