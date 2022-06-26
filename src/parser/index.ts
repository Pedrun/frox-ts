import chalk from "chalk";
import { GuildMember } from "discord.js";
import { Player } from "../rog";
import { AttributeList } from "../types/rogscript";
import { ellipsis, normalizeStr } from "../utils";
import { parse } from "./rogscript";

const repeatRegex = /^(\d+)#/;

export function parseLine(input:string, attributes?:AttributeList, variables?:AttributeList) {
  let results = [];
  let dice = 0;
  attributes = attributes ?? new Map();
  variables = variables ?? new Map();
  const repeatExp = input.match(repeatRegex) ?? ["", "1"];

  input = input.slice(repeatExp[0].length).trim();
  let repeat = parseInt(repeatExp[1], 10);
  repeat = Math.min(100, Math.max(repeat, 1));

  for (let i=0; i<repeat; i++) {
    if (dice >= 1000) {
      throw Error("Número de dados por linha excedeu o limite de 1000.");
    }
    let currentResult = parse(input, { attributes, variables });
    dice      += currentResult.dice;
    attributes = currentResult.attributes;
    variables  = currentResult.variables;
    results.push(currentResult);
  }

  return {
    results,
    attributes,
    variables,
    dice,
    lineCount: repeat
  };
}

export function parseBlock(input:string, attributes?:AttributeList, variables?:AttributeList) {
  let results = [];
  let dice = 0;
  let lineCount = 0;
  attributes = attributes ?? new Map();
  variables = variables ?? new Map();

  for (let line of input.trim().split(/[\n\r]+/)) {
    if (lineCount >= 100) {
      throw Error("Número de linhas excedeu o limite de 100.");
    }
    line = line.trim();
    let currentLine = parseLine(line, attributes, variables);
    lineCount += currentLine.lineCount;
    dice      += currentLine.dice;
    attributes = currentLine.attributes;
    variables  = currentLine.variables;
    results.push(...currentLine.results);
  }

  return {
    results,
    attributes,
    variables,
    dice
  };
}

export function evaluateRoll(text:string, player:Player, member:GuildMember, rollMode=1, variables?:AttributeList) {
  let content = normalizeStr(text);
  let roll;

  try {
    if (rollMode === 2) {
      roll = parseBlock(content, player.card?.attributes, variables);
    } else {
      roll = parseLine(content, player.card?.attributes, variables);
    }

    if (roll.dice || rollMode) {
      let results = roll.results.reduce((a,b) => `${a}${b.text}\n`, "");
      results = ellipsis(results);
      
      if (player.card) {
        player.card.setAttrBulk(roll.attributes);
        if (member) player.updateSuffix(member);
      }

      return results;
    }
  } catch (e) {
    if (process.env.PARSER_ERRORS) console.error(chalk.red(e));
    return null;
  }
}