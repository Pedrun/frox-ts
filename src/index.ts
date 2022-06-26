import Discord, { Intents, Interaction } from "discord.js";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import { Instance, InstanceManager, InstanceOptions } from "./rog";
import { FroxClient } from "./types";
import { loadInteractions } from "./interactions";
import dotenv from "dotenv";
import * as handlers from "./interactions/handlers";

const saveFiles = fs
  .readdirSync("./saves")
  .filter((f) => f.startsWith(".json"));
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
    fs.writeFileSync(`./saves/${instance.id}.json`, JSON.stringify(instance));
  });
  console.log(
    `[${chalk.greenBright(
      "SAVE"
    )}] Todos os saves foram salvos em "./saves" ${chalk.magenta(Date())}`
  );
};

for (const saveFile of saveFiles) {
  const fileContent = fs.readFileSync(`./save/${saveFile}`).toString();
  const instance = <InstanceOptions>JSON.parse(fileContent);
  client.instances.set(instance.id, new Instance(instance));
}

client
  .on("ready", async () => {
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
  })
  .on("interactionCreate", async (interaction) => {
    let handler = (...args: any[]): any => {
      throw Error(
        `Recebida Interação não suportada de tipo: "${interaction.type}"`
      );
    };

    // console.log(interaction);

    if (interaction.isAutocomplete()) 
      handler = handlers.autocompleteHandler;
    else if (interaction.isCommand())
      handler = handlers.slashCommandHandler;
    else if (interaction.isMessageContextMenu())
      handler = handlers.messageCommandHandler;
    else if (interaction.isUserContextMenu())
      handler = handlers.userCommandHandler;
    else if (interaction.isMessageComponent())
      handler = handlers.componentHandler;
    else if (interaction.isModalSubmit()) handler = handlers.modalHandler;

    await handler(client, interaction);
  });

async function main() {
  await loadInteractions(client, path.join(__dirname, "interactions"));
  await client.login();
  setInterval(client.saveInstances, 1800000);
}
main();
