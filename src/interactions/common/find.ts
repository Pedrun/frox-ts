//@ts-ignore
import { findBestMatch } from "string-similarity";

type match = { target: string; rating: number };
export function sortBestMatches(mainString: string, targetStrings: string[]) {
  const { ratings } = findBestMatch(mainString, targetStrings);
  return ratings
    .sort((a: match, b: match) => b.rating - a.rating)
    .map((m:match) => m.target);
}
