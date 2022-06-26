import { AttributeList, RogscriptResult } from "../types/rogscript";

declare function parse(
  input: string,
  options?: { attributes: AttributeList; variables: AttributeList }
): RogscriptResult;

declare function SyntaxError(
  message: string,
  expected: string,
  found: string,
  location: string
): SyntaxError;
