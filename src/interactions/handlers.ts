import chalk from "chalk";
import {
  AutocompleteInteraction,
  CommandInteraction,
  ContextMenuInteraction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import { FroxClient } from "../types";

export async function autocompleteHandler(
  client: FroxClient,
  interaction: AutocompleteInteraction
) {
  const autocomplete = client.autocomplete.get(interaction.commandName);
  if (!autocomplete) return;

  try {
    await autocomplete.execute(interaction, client);
  } catch (err) {
    console.log(chalk.red(err));
  }
}

export async function slashCommandHandler(
  client: FroxClient,
  interaction: CommandInteraction
) {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  console.log(
    `[${chalk.cyan(interaction.toString())}] (${
      interaction.user.tag
    }) ${chalk.magenta(interaction.createdAt)}`
  );

  try {
    await command.execute(interaction, client);
  } catch (e) {
    console.log(chalk.red(e));
    if (!interaction.replied && !interaction.deferred)
      await interaction.reply({
        content: "Ocorreu um erro ao tentar executar esse comando! (o-o;;",
        ephemeral: true,
      });
  }
}

export async function messageCommandHandler(
  client: FroxClient,
  interaction: ContextMenuInteraction
) {
  const command = client.messageCommands.get(interaction.commandName);
  if (!command) return;

  console.log(
    `[${chalk.cyan(interaction.commandName)}] (${
      interaction.user.tag
    }) ${chalk.magenta(interaction.createdAt)}`
  );

  try {
    await command.execute(interaction, client);
  } catch (e) {
    console.log(chalk.red(e));
    if (!interaction.replied && !interaction.deferred)
      await interaction.reply({
        content: "Ocorreu um erro ao tentar executar esse comando! (o-o;;",
        ephemeral: true,
      });
  }
}

export async function userCommandHandler(
  client: FroxClient,
  interaction: ContextMenuInteraction
) {
  const command = client.userCommands.get(interaction.commandName);
  if (!command) return;

  console.log(
    `[${chalk.cyan(interaction.commandName)}] (${
      interaction.user.tag
    }) ${chalk.magenta(interaction.createdAt)}`
  );

  try {
    await command.execute(interaction, client);
  } catch (e) {
    console.log(chalk.red(e));
    if (!interaction.replied && !interaction.deferred)
      await interaction.reply({
        content: "Ocorreu um erro ao tentar executar esse comando! (o-o;;",
        ephemeral: true,
      });
  }
}

export async function componentHandler(
  client: FroxClient,
  interaction: MessageComponentInteraction
) {
  const [componentName] = interaction.customId.split(":", 1);

  const component = client.components.get(componentName);
  if (!component) return;

  console.log(
    `[${chalk.cyan(interaction.customId)}] (${
      interaction.user.tag
    }) ${chalk.magenta(interaction.createdAt)}`
  );
  try {
    await component.execute(interaction, client);
  } catch (e) {
    console.log(chalk.red(e));
    await interaction.reply({
      content: "Ocorreu um erro ao tentar executar essa ação! (o-o;;",
      ephemeral: true,
    });
  }
}

export async function modalHandler(
  client: FroxClient,
  interaction: ModalSubmitInteraction
) {
  const componentName = interaction.customId;

  const component = client.modals.get(componentName);
  if (!component) return;

  console.log(
    `[${chalk.cyan(interaction.customId)}] (${
      interaction.user.tag
    }) ${chalk.magenta(interaction.createdAt)}`
  );
  try {
    await component.execute(interaction, client);
  } catch (e) {
    console.log(chalk.red(e));
    await interaction.reply({
      content: "Ocorreu um erro ao tentar executar essa ação! (o-o;;",
      ephemeral: true,
    });
  }
}
