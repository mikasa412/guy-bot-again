import { SlashCommandBuilder, EmbedBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel, MessageFlags } from "discord.js";
import dotenv from 'dotenv';
import * as fs from "fs";
import * as path from "path";
import { pool } from '../../index';
const statsPath = path.join(__dirname, "../../../jsons/stats.json");

dotenv.config();

/*const mariadb = require('mariadb');

const pool = mariadb.createPool({
	host: process.env.sql_host,
	user: process.env.sql_user,
	password: process.env.sql_pass,
	database: process.env.sql_db,
	connectionLimit: 5
});
let conn;
try {
	conn = pool.getConnection();
} catch (err) {
	console.error('error connecting to SQL db:', err);
	if (conn) { conn.close(); }
}

export { conn };*/
export async function increment(
	ID: string,
	command: string,
	amount: number = 1
) {
	
	// json for global
	const globalstats = JSON.parse(fs.readFileSync(statsPath, "utf-8"));

	if (!globalstats.global[command]) { globalstats.global[command] = 0; }
	globalstats.global[command] += amount;
	fs.writeFileSync(statsPath, JSON.stringify(globalstats, null, 4));

// sql for user - open a connection from the pool on each call
	try {
        const sqlConn = await pool.getConnection();
        const statU = `
            INSERT INTO ${process.env.sql_usertable} (discord_id, ${command}) VALUES (${ID}, ${amount})
            ON DUPLICATE KEY UPDATE ${command} = ${command} + ${amount};
        `;
        await sqlConn.query(statU);
        sqlConn.release();
    } catch (err) {
        console.error('error on increment: ', err);
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
	const other = userOption ? await client.users.fetch(userOption.id) : null;
	
	const target = userOption ? other.id : userId;
	const targetMember = userOption ? await interaction.guild.members.fetch(other.id) : member;

	if (target == process.env.bot_id) {
		const globalstats = JSON.parse(fs.readFileSync(statsPath, "utf-8"));
		var statsuser = JSON.stringify(globalstats.global, null, 4);
		statsuser = statsuser.replace(/[{}]/g, "");
		statsuser = statsuser.replace(/"|,/g, "");
		statsuser = statsuser.trimEnd();
		const embed = new EmbedBuilder()
			.setTitle("Global Stats")
			.setDescription(statsuser)
			.setTimestamp();
		await interaction.reply({ embeds: [embed]});
		return;
	}

  	try {
        const sqlConn = await pool.getConnection();
        const result = await sqlConn.query(`SELECT * FROM ${process.env.sql_usertable} WHERE discord_id = ${target};`);
        if (result.length !== 0) {
            var statsuser = JSON.stringify(result[0], null, 4);
            statsuser = statsuser.replace(/[{}]/g, "");
            statsuser = statsuser.replace(/"|,/g, "");
            statsuser = statsuser.trimEnd();
        }
  	const embed = new EmbedBuilder()
        .setTitle(`Stats for ${targetMember.nickname ? targetMember.nickname : targetMember.user.displayName}`)
        .setDescription(result.length === 0 ? ("no stats found for " + (targetMember.nickname ? targetMember.nickname : targetMember.user.displayName)) : statsuser)
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