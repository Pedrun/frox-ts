export type AttributeList = Map<string, number>;

export interface RogscriptObject {
  value: number;
  values: number[];
  boolean: boolean;
  text: string;
  dice: number;
}
export interface RogscriptResult {
  expression: RogscriptObject;
  text: string;
  dice: number;
  labeled: boolean;
  attributes: AttributeList;
  variables: AttributeList;
}