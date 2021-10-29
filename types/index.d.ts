import type {
  DashThemes,
  DashTokens,
  StyleObject,
  Styles,
  TokensUnion,
} from "@dash-ui/styles";
declare function transition<
  TransitionNames extends string,
  Tokens extends DashTokens = DashTokens,
  Themes extends DashThemes = DashThemes
>(
  styles: Styles<Tokens, Themes>,
  transitions: TransitionMap<TransitionNames, Tokens, Themes>
): Transitioner<TransitionNames, Tokens, Themes>;
export default transition;
export interface Transitioner<
  TransitionNames extends string,
  Tokens extends DashTokens = DashTokens,
  Themes extends DashThemes = DashThemes
> {
  (...args: (TransitionNames | TransitionObject<TransitionNames>)[]): string;
  css: (
    ...names: (TransitionNames | TransitionObject<TransitionNames>)[]
  ) => string;
  style: (
    ...names: (TransitionNames | TransitionObject<TransitionNames>)[]
  ) => StyleObject;
  transitions: TransitionMap<TransitionNames, Tokens, Themes>;
}
export interface TransitionPhase {
  duration?: number | string;
  delay?: number | string;
  timing?: string | [number, number, number, number];
  origin?: string | (number | string)[];
  [property: string]: any;
}
export declare type TransitionMap<
  TransitionNames extends string,
  Tokens extends DashTokens = DashTokens,
  Themes extends DashThemes = DashThemes
> = {
  [Name in TransitionNames | "default"]?: TransitionValue<Tokens, Themes>;
};
export declare type TransitionValue<
  Tokens extends DashTokens = DashTokens,
  Themes extends DashThemes = DashThemes
> =
  | TransitionPhase
  | ((tokens: TokensUnion<Tokens, Themes>) => TransitionPhase);
declare type TransitionObject<TransitionNames extends string = string> = {
  [Name in TransitionNames]?: boolean | null | undefined | string | number;
};
