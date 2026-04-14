import { SlashCommandBuilder, EmbedBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel, MessageFlags } from "discord.js";
import dotenv from 'dotenv';
import * as fs from "fs";
import * as path from "path";
import { pool } from '../../index';
const statsPath = path.join(__dirname, "../../../jsons/stats.json");

dotenv.config();

export async function increment(
	ID: string,
	command: string,
	user: number = 0,
	amount: number = 1
) {
	
	// json for global
	const globalstats = JSON.parse(fs.readFileSync(statsPath, "utf-8"));

	if (!globalstats.global[command]) { globalstats.global[command] = 0; }
	globalstats.global[command] += amount;
	fs.writeFileSync(statsPath, JSON.stringify(globalstats, null, 4));

	if (user) {
		// sql for user - open a connection from the pool on each call
		try {
			const sqlConn = await pool.getConnection();
			const statU = `INSERT INTO ${process.env.sql_usertable} (Hdiscord_id, \`${command}\`) VALUES (?, ?) ON DUPLICATE KEY UPDATE \`${command}\` = \`${command}\` + ?;`;
			await sqlConn.query(statU, [ID, amount, amount]);
			sqlConn.release();
		} catch (err) {
			console.error('error on increment: ', err);
		}
	}
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

	if (target == process.env.bot_id) {
		const globalstats = JSON.parse(fs.readFileSync(statsPath, "utf-8"));
		var statsglobal = Object.entries(globalstats.global).map(([key, value]) => `**${key}:** ${value}`).join('\n');
		statsglobal = statsglobal.replace(/_/g, " ");
		const embed = new EmbedBuilder()
			.setTitle("Global Stats")
			.setDescription(statsglobal)
			.setTimestamp();
		await interaction.reply({ embeds: [embed]});
		return;
	}

  	try {
		let statsuser = `no stats found for ${targetMember.nickname ? targetMember.nickname : targetMember.user.displayName}`;
        const sqlConn = await pool.getConnection();
        const result = await sqlConn.query(`SELECT * FROM ${process.env.sql_usertable} WHERE Hdiscord_id = ${target};`);
        if (result.length !== 0) {
            const userStats = result[0];
            const stats = Object.entries(userStats).filter(([key, value]) => key[0] !== 'H'  && value != 0).map(([key, value]) => `**${key}:** ${value}`).join('\n');
            if (stats) statsuser = stats;
			statsuser = statsuser.replace(/_/g, " ");
        }
  	const embed = new EmbedBuilder()
        .setTitle(`stats for ${targetMember.nickname ? targetMember.nickname : targetMember.user.displayName}`)
        .setDescription(statsuser)
        .setTimestamp();

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