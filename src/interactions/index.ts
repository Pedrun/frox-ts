import {  Collection } from "discord.js";
import fs from "fs";
import { FroxClient, Model } from "../types";

function readdirs(
  filter: (file: string) => boolean,
  ...paths: string[]
) {
  const dirs = [];
  for (const path of paths) {
    dirs.push(fs.readdirSync(path).filter(filter));
  }
  return dirs;
}

async function loadInteractionFile<M extends Model>(
  files: string[],
  dirPath: string
) {
  const col = new Collection<string, M>();
  for (const file of files) {
    const model: M = (await import(`${dirPath}/${file}`)).default;
    col.set("data" in model ? model.data.name : model.name, model);
  }
  return col;
}

export async function loadInteractions(
  client: FroxClient,
  interactionDir: string
) {
  const [
    autocompleteFiles,
    slashCommandFiles,
    messageCommandFiles,
    userCommandFiles,
    componentFiles,
    modalFiles,
  ] = readdirs(
    (file) => file.endsWith(".ts") || file.endsWith(".js"),
    `${interactionDir}/autocomplete`,
    `${interactionDir}/commands/chat`,
    `${interactionDir}/commands/message`,
    `${interactionDir}/commands/user`,
    `${interactionDir}/components`,
    `${interactionDir}/modals`
  );

  client.autocomplete = await loadInteractionFile(
    autocompleteFiles,
    `${interactionDir}/autocomplete`
  );
  client.slashCommands = await loadInteractionFile(
    slashCommandFiles,
    `${interactionDir}/commands/chat`
  );
  client.messageCommands = await loadInteractionFile(
    messageCommandFiles,
    `${interactionDir}/commands/message`
  );
  client.userCommands = await loadInteractionFile(
    userCommandFiles,
    `${interactionDir}/commands/user`
  );
  client.components = await loadInteractionFile(
    componentFiles,
    `${interactionDir}/components`
  );
  client.modals = await loadInteractionFile(
    modalFiles,
    `${interactionDir}/modals`
  );
}
