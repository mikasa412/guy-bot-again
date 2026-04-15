import { SlashCommandBuilder, EmbedBuilder, Client, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import dotenv from 'dotenv';
import { pool } from '../../index';

dotenv.config();

export const data = new SlashCommandBuilder()
	.setName("leaderboard")
	.setDescription("see the top users for a command")
	.addStringOption(option =>
		option.setName("type")
			.setDescription("which command leaderboard to look at")
			.setRequired(true)
			.addChoices(
            { name: "bottles thrown", value: "bottles_thrown" },
            { name: "bottle likes", value: "bottle_likes" },
            { name: "redditcares", value: "redditcares" }
          ));
export async function execute(
	client: Client,
	interaction: ChatInputCommandInteraction
	) {
		const type = interaction.options.getString("type", true);
		
		let statsuser = `no stats found for ${type}`;

		try {
			const sqlConn = await pool.getConnection();
			const result = await sqlConn.query(`SELECT Hdiscord_id, ${type} FROM ${process.env.sql_usertable} ORDER BY ${type} DESC LIMIT 10;`);
			if (result.length !== 0) {
				const stats = result.filter((user: any) => user[type] !== 0).map((user: any) => `<@${user.Hdiscord_id}>: **${user[type]}**`).join('\n');
				if (stats) statsuser = stats;
			}
		const embed = new EmbedBuilder()
			.setTitle(`top users for ${type.replace(/_/g, " ")}`)
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