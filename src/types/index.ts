import {
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import {
  AutocompleteInteraction,
  Client,
  Collection,
  CommandInteraction,
  ContextMenuInteraction,
  Interaction,
  MessageComponentInteraction,
  ModalSubmitInteraction,
  Snowflake,
} from "discord.js";
import { InstanceManager } from "../rog";

export interface AutocompleteModel {
  name: string;
  execute: (
    interaction: AutocompleteInteraction,
    client: FroxClient
  ) => Promise<void> | void;
}

type SlashCommandBuilderTypes =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
export interface SlashCommandModel {
  data: SlashCommandBuilderTypes;
  execute: (
    interaction: CommandInteraction,
    client: FroxClient
  ) => Promise<void> | void;
}

export interface ContextMenuModel {
  data: ContextMenuCommandBuilder;
  execute: (
    interaction: ContextMenuInteraction,
    client: FroxClient
  ) => Promise<void> | void;
}

export interface ComponentModel {
  name: string;
  execute: (
    interaction: MessageComponentInteraction,
    client: FroxClient
  ) => Promise<void> | void;
}

export interface ModalModel {
  name: string;
  execute: (
    interaction: ModalSubmitInteraction,
    client: FroxClient
  ) => Promise<void> | void;
}

export type Model =
  | AutocompleteModel
  | SlashCommandModel
  | ContextMenuModel
  | ComponentModel
  | ModalModel;

export interface FroxClient extends Client {
  instances: InstanceManager;
  autocomplete: Collection<Snowflake, AutocompleteModel>;
  slashCommands: Collection<Snowflake, SlashCommandModel>;
  messageCommands: Collection<Snowflake, ContextMenuModel>;
  userCommands: Collection<Snowflake, ContextMenuModel>;
  components: Collection<Snowflake, ComponentModel>;
  modals: Collection<Snowflake, ModalModel>;

  saveInstances: () => Promise<void>;
}
