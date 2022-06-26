import Collection from "@discordjs/collection";
import { clamp, normalizeStr } from "../utils";
import { GuildMember, Snowflake } from "discord.js";

type JSONObject = {
  [s: string]: unknown;
};
function toJSON(this: JSONObject) {
  let json: JSONObject = {};
  for (let [key, val] of Object.entries(this)) {
    if (val instanceof Map) {
      json[key] = Array.from(val);
      continue;
    }

    json[key] = val;
  }

  return json;
}

const possibleAttr = /^[A-Z_]{1,32}$/;
const tagRegex = /\{([A-Z_]+)\}/g;

export class InstanceManager extends Collection<string, Instance> {
  greate(key: Snowflake) {
    if (this.has(key)) return this.get(key)!;
    const newInstance = new Instance({ id: key });
    this.set(key, newInstance);
    return newInstance;
  }
}

export interface InstanceOptions {
  id: Snowflake;
  users?: [Snowflake, PlayerOptions][];
  settings?: InstanceSettings;
  scripts?: [string, string][];
}

export class Instance {
  id: string;
  users: Collection<Snowflake, Player>;
  settings: InstanceSettings;
  scripts: Collection<string, string>;

  constructor(options: InstanceOptions) {
    this.id = options.id;
    this.users = new Collection(options.users).mapValues((p) => new Player(p));
    this.settings = options.settings ?? { listChannel: "", DMrole: "" };
    this.scripts = new Collection(options.scripts);
  }

  createUser(userId: string) {
    const newUser = new Player({
      id: userId,
      guildId: this.id,
    });
    this.users.set(userId, newUser);
    return newUser;
  }
  hasUser(userId: string) {
    return this.users.has(userId);
  }
  getUser(userId: string) {
    return this.users.get(userId);
  }
  greateUser(userId: string) {
    if (this.hasUser(userId)) {
      return this.getUser(userId)!;
    }
    return this.createUser(userId);
  }

  toJSON = toJSON;
}

export interface InstanceSettings {
  listChannel: string;
  DMrole: string;
}

export interface PlayerOptions {
  id: Snowflake;
  guildId: Snowflake;
  nameSuffix?: [string, string];
  cardIndex?: number;
  cards?: CardOptions[];
}

export class Player {
  id: Snowflake;
  guildId: Snowflake;
  nameSuffix: [string, string];
  cardIndex: number;
  cards: Card[];
  constructor(options: PlayerOptions) {
    this.id = options.id;
    this.guildId = options.guildId;
    this.nameSuffix = options.nameSuffix ?? ["", ""];
    this.cardIndex = options.cardIndex ?? 0;
    this.cards = (options.cards ?? []).map((c) => new Card(c));
  }

  setSuffix(separator = "", suffix = "") {
    this.nameSuffix = [separator, suffix];
    return this;
  }
  async updateSuffix(member: GuildMember) {
    const [separator, suffix] = this.nameSuffix;
    if (separator.length < 1 || suffix.length < 1) return false;

    const newTag = suffix.replace(tagRegex, (match, group) => {
      if (this.card && this.card.hasAttr(group))
        return this.card.getAttr(group)!.toString();
      return match;
    });

    try {
      let username = member.displayName.split(separator)[0];
      username = username.slice(0, 32 - (newTag.length + separator.length));

      await member.setNickname(`${username}${separator}${newTag}`);
      return true;
    } catch (e) {
      // console.log(e);
      return false;
    }
  }

  createCard(cardName: string) {
    const name = cardName.slice(0, 32);
    if (this.cards.length >= 5) {
      return Error("Número máximo de cards por player é 5.");
    }
    const newCard = new Card({
      name,
      color: "",
      attributes: [],
      bars: [],
      isPrivate: false,
    });

    this.cards.push(newCard);
    return newCard;
  }
  removeCard(cardName: string) {
    const searchName = cardName.toLowerCase();
    const index = this.cards.findIndex(
      (c) => c.name.toLowerCase() === searchName
    );
    if (index < 0) return null;
    const [removed] = this.cards.splice(index, 1);

    if (this.cardIndex === index) {
      this.cardIndex = 0;
    } else if (this.cardIndex > index) {
      this.cardIndex--;
    }

    return removed;
  }
  selectCard(identifier: string | number) {
    if (this.cards.length === 0) return null;

    if (typeof identifier === "string") {
      const searchName = identifier.toLowerCase();
      const index = this.cards.findIndex(
        (c) => c.name.toLowerCase() === searchName
      );

      if (index < 0) return null;

      this.cardIndex = index;
      return this.card!;
    }

    if (identifier >= 0 && identifier < this.cards.length) {
      this.cardIndex = identifier;
      return this.card!;
    }
    return null;
  }

  get card(): Card | undefined {
    return this.cards[this.cardIndex];
  }
}

export interface CardOptions {
  name: string;
  color: string;
  attributes: [string, number][];
  //buffs:[];
  bars: CardBar[];
  isPrivate: boolean;
}

export class Card {
  name: string;
  color: string;
  attributes: Collection<string, number>;
  //buffs:[]
  bars: CardBar[];
  isPrivate: boolean;
  constructor(options: CardOptions) {
    this.name = options.name;
    this.color = options.color;
    this.attributes = new Collection(options.attributes);
    this.bars = options.bars;

    this.isPrivate = options.isPrivate;
  }

  hasAttr(attr: string) {
    const cleanAttr = normalizeStr(attr.toUpperCase());
    return this.attributes.has(cleanAttr);
  }
  getAttr(attr: string) {
    const cleanAttr = normalizeStr(attr.toUpperCase());
    return this.attributes.get(cleanAttr);
  }
  getAttrBulk() {
    return this.attributes.map((v, k) => this.getAttr(k));
  }
  setAttr(attr: string, value: number) {
    const cleanAttr = normalizeStr(attr.toUpperCase());
    if (!this.hasAttr(cleanAttr))
      throw TypeError(`"${cleanAttr}" is not a defined attribute`);

    const val = limitAttribute(value);

    this.attributes.set(cleanAttr, val);
    return this;
  }
  setAttrBulk(attrMap: Iterable<readonly [string, number]>) {
    for (const [k, v] of attrMap) {
      if (this.hasAttr(k)) this.setAttr(k, v);
    }
    return this;
  }
  addAttr(attr: string, value: number) {
    const cleanAttr = normalizeStr(attr.toUpperCase());
    const val = limitAttribute(value);

    if (!possibleAttr.test(cleanAttr))
      throw SyntaxError(
        `Attr "${cleanAttr}" does not match the regex ${possibleAttr}`
      );

    this.attributes.set(cleanAttr, val);
    return this;
  }
  removeAttr(attr: string) {
    if (this.hasAttr(attr)) {
      const cleanAttr = normalizeStr(attr);
      this.attributes.delete(cleanAttr);
    }
    return this;
  }
  setPrivate(state: boolean) {
    this.isPrivate = state;
    return this;
  }
  getBar(
    bar: CardBar,
    barSize = 6,
    fill = "<:bar2:957638608490217502>",
    empty = "<:barempty2:957638608557322270>"
  ) {
    let value = this.getAttr(bar.value);
    let max = this.getAttr(bar.max);
    if (value == null || max == null) return "[ ATRIBUTO INVÁLIDO ]";

    const ratio = value / max;
    let barCount;
    if (ratio > 1 || isNaN(ratio)) barCount = barSize;
    else if (ratio < 0) barCount = 0;
    else barCount = Math.round(ratio * barSize);

    const status = `${value}/${max} (${Math.round(ratio * 100)}%)`;
    const fillBars = fill.repeat(barCount);
    const emptyBars = empty.repeat(barSize - barCount);
    return `${status}\n[${fillBars}${emptyBars}]`;
  }
  toString() {
    return this.name;
  }
  toJSON = toJSON;
}

export interface CardBar {
  name: string;
  value: string;
  max: string;
}

export function limitAttribute(attr: number) {
  return clamp(Math.abs(attr), -1000000000, 1000000000);
}

export function formatAttribute(attr: number) {
  return attr.toLocaleString();
}

export function hasDMPermissions(member: GuildMember, DMrole: Snowflake) {
  return (
    member.roles.cache.has(DMrole) || member.permissions.has("ADMINISTRATOR")
  );
}
