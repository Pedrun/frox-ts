import { AutocompleteModel } from "../../types";
import { normalizeStr } from "../../utils";
import { sortBestMatches } from "../common/find";

const model: AutocompleteModel = {
  name: "exe",
  execute(interaction, client) {
    const instance = client.instances.greate(interaction.guildId!);
    const focused = normalizeStr(
      interaction.options.getFocused()
    ).toLowerCase();

    let scriptNames = [...instance.scripts.keys()];
    scriptNames = sortBestMatches(focused, scriptNames).slice(0, 25);

    const response = scriptNames.map((name) => {
      return { name: `⤷ ${name}`, value: name };
    });

    interaction.respond(response);
  },
};
export { model as default };
