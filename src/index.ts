import Discord, { Intents } from "discord.js";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import { Instance, InstanceManager, InstanceOptions } from "./rog";
import { FroxClient } from "./types";
import { loadInteractions } from "./interactions";
import dotenv from "dotenv";
import * as handlers from "./interactions/handlers";
import { evaluateRoll } from "./parser";

const saveFiles = fs.readdirSync("./saves").filter((f) => f.endsWith(".json"));
const client = <FroxClient>new Discord.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
});

dotenv.config();
client.token = process.env.TOKEN!;
client.instances = new InstanceManager();

client.saveInstances = async function () {
  client.instances.each((instance) => {
    fs.writeFileSync(`./saves/${instance.id}.json`, JSON.stringify(instance, null, "\t"));
  });
  console.log(
    `[${chalk.greenBright(
      "SAVE"
    )}] Todos os saves foram salvos em "./saves" ${chalk.magenta(Date())}`
  );
};

for (const saveFile of saveFiles) {
  const fileContent = fs.readFileSync(`./saves/${saveFile}`).toString();
  const instance = <InstanceOptions>JSON.parse(fileContent);
  client.instances.set(instance.id, new Instance(instance));
}

client.on("ready", async () => {
  console.log("Pronto!");

  const guilds = client.guilds.cache;
  console.group(chalk.yellowBright("Guilds"));
  for (const [, guild] of guilds) {
    console.group(`${chalk.cyanBright(guild.name)} [${guild.memberCount}]`);
    console.log(`${chalk.green("id:")} ${guild.id}`);
    console.log(`${chalk.green("icon:")} ${guild.iconURL()}`);
    console.log(`${chalk.green("joined:")} ${chalk.magenta(guild.joinedAt)}`);
    console.log();
    console.groupEnd();
  }
  console.groupEnd();
});

client.on("interactionCreate", async (interaction) => {
  let interactionHandler = (...args: any[]): any => {
    throw Error(
      `Recebida Interação não suportada de tipo: "${interaction.type}"`
    );
  };
  // console.log(interaction);

  if (interaction.isAutocomplete())
    interactionHandler = handlers.autocompleteHandler;
  else if (interaction.isCommand())
    interactionHandler = handlers.slashCommandHandler;
  else if (interaction.isMessageContextMenu())
    interactionHandler = handlers.messageCommandHandler;
  else if (interaction.isUserContextMenu())
    interactionHandler = handlers.userCommandHandler;
  else if (interaction.isMessageComponent())
    interactionHandler = handlers.componentHandler;
  else if (interaction.isModalSubmit())
    interactionHandler = handlers.modalHandler;

  await interactionHandler(client, interaction);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  const instance = client.instances.greate(message.guildId!);
  const player = instance.greateUser(message.author.id);
  let content = message.content;
  let prefix = 0;

  if (content.startsWith("=")) {
    content = content.slice(1);
    prefix = 1;
  } else if (content.startsWith("rs:multiline")) {
    content = content.split(/rs:multiline\s+/)[1];
    prefix = 2;
  }

  let result = evaluateRoll(content, player, message.member!, prefix);

  if (result?.length) {
    message.reply(result);
    console.log(`[${chalk.cyan("ROLL")}] (${message.author.tag}) ${chalk.magenta(Date())}\n${result.trim()}`);
  }
});

(async () => {
  await loadInteractions(client, path.join(__dirname, "interactions"));
  await client.login();
  setInterval(client.saveInstances, 1800000);
  client.saveInstances();
})();
