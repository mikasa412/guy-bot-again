import { SlashCommandBuilder, EmbedBuilder, Client, GuildMember, ChatInputCommandInteraction, TextChannel } from "discord.js";
import dotenv from 'dotenv';

dotenv.config();

export async function increment(
  ID: string,
  command: string,
  amount: number = 1
) {
  const mariadb = require('mariadb');

  const pool = mariadb.createPool({
      host: process.env.sql_host,
      user: process.env.sql_user,
      password: process.env.sql_pass,
      database: process.env.sql_db,
      connectionLimit: 1000
  });
  let conn;
  try {
    conn = await pool.getConnection();
    
    const statU = `
      INSERT INTO ${process.env.sql_usertable} (discord_id, ${command}) VALUES (${ID}, ${amount})
      ON DUPLICATE KEY UPDATE ${command} = ${command} + ${amount};
    `;
    await conn.query(statU);

  } catch (err) {
      console.error('Error updating user stats:', err);
  } finally {
    if (conn) { conn.release(); }
  }

}

export const data = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("look at your stats for commands and things");
export async function execute(
  client: Client,
  interaction: ChatInputCommandInteraction
  ) {
  //get json & member
  const member = interaction.member as GuildMember;
  const userId = interaction.user.id;

  const mariadb = require('mariadb');

  const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'discord',
    connectionLimit: 5
  });

  let conn;

  try {
    conn = await pool.getConnection();

    await increment(interaction.user.id, "stats_checks");
    
    const result = await conn.query(`SELECT * FROM ${process.env.sql_usertable} WHERE discord_id = ${userId};`);
    if (result.length === 0) {
      await interaction.reply('dev: sql doesn\'t think you exist yet - no clue why. go yell at me about it');
      return;
    }
    var statsuser = JSON.stringify(result[0], null, 4);
    statsuser = statsuser.replace(/[{}]/g, "");
    statsuser = statsuser.replace(/"|,/g, "");
    statsuser = statsuser.trimEnd();

  const embed = new EmbedBuilder()
        .setTitle(`Stats for ${member.nickname ? member.nickname : member.user.displayName}`)
        .setDescription(statsuser)
        .setTimestamp();

  await interaction.reply({ embeds: [embed]});
  } catch (err) {
    console.error('Error in request:', err);
    await interaction.reply('SQL error in stats fetch, go yell at me to fix it');
  } finally {
    if (conn) { conn.release(); }
  }


}