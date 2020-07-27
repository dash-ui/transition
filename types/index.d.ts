import type {Styles, StyleObject, DashTokens} from '@dash-ui/styles'
declare const transition: <
  TransitionNames extends string,
  Tokens extends DashTokens = DashTokens
>(
  styles: Styles<Tokens, never>,
  transitions: TransitionMap<TransitionNames, Tokens>
) => Transitioner<TransitionNames, Tokens>
export default transition
export interface Transitioner<
  TransitionNames extends string,
  Tokens extends DashTokens = DashTokens
> {
  (...args: (TransitionNames | TransitionObject<TransitionNames>)[]): string
  css: (
    ...names: (TransitionNames | TransitionObject<TransitionNames>)[]
  ) => string
  style: (
    ...names: (TransitionNames | TransitionObject<TransitionNames>)[]
  ) => StyleObject
  transitions: TransitionMap<TransitionNames, Tokens>
}
export interface TransitionPhase {
  duration?: number | string
  delay?: number | string
  timing?: string | [number, number, number, number]
  origin?: string | (number | string)[]
  [property: string]: any
}
export declare type TransitionMap<
  TransitionNames extends string,
  Tokens extends DashTokens = DashTokens
> = {
  [Name in TransitionNames | 'default']?: TransitionValue<Tokens>
}
export declare type TransitionValue<Tokens extends DashTokens = DashTokens> =
  | TransitionPhase
  | ((tokens: Tokens) => TransitionPhase)
declare type TransitionObject<TransitionNames extends string = string> = {
  [Name in TransitionNames]?: boolean | null | undefined | string | number
}
