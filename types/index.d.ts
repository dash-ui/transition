import {StyleObject, Styles, StyleObjectArgument} from '@-ui/styles'
export interface Transitioner<Names extends string, Vars = any> {
  (...args: (Names | StyleObjectArgument<Names>)[]): string
  css: (...names: (Names | StyleObjectArgument<Names>)[]) => string
  style: (...names: (Names | StyleObjectArgument<Names>)[]) => StyleObject
  transitions: TransitionDefs<Names, Vars>
}
export interface TransitionPhase {
  duration?: number | string
  delay?: number | string
  timing?: string
  [property: string]: any
}
export declare type TransitionDef<Vars = any> =
  | TransitionPhase
  | ((variables: Vars) => TransitionPhase)
export declare type TransitionDefs<Names extends string, Vars> = {
  [Name in Names | 'default']?: TransitionDef<Vars>
}
declare function transition<Names extends string, Vars = any>(
  styles: Styles<Vars>,
  transitions: TransitionDefs<Names, Vars>
): Transitioner<Names, Vars>
export default transition
