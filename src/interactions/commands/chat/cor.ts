import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { SlashCommandModel } from "../../../types";
import { randomColorHex } from "../../../utils";

const model: SlashCommandModel = {
  data: new SlashCommandBuilder()
    .setName("cor")
    .setDescription("Mostra uma cor aleatória ou defenida de um código HEX")
    .addStringOption((option) =>
      option.setName("hex").setDescription("Um código HEX de cor (Ex: #f67fed)")
    ),
  execute(interaction) {
    let hex = interaction.options.getString("hex") || randomColorHex();

    if (!isColorHex(hex))
      return interaction.reply({
        content: `${interaction.user}, **Esse não é um código HEX de cor válido**`,
        ephemeral: true,
      });

    const embed = new MessageEmbed().setTitle(hex).setColor(hex);

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setURL("https://www.google.com/search?q=color+picker")
        .setLabel("Seletor de cores")
        .setStyle("LINK")
    );

    interaction.reply({ embeds: [embed], components: [row] });
  },
};

function isColorHex(hex: string): hex is `#${string}` {
  return colorRegex.test(hex);
}

const colorRegex = /^#?[0-9a-f]{6}$/i;
export { model as default };
