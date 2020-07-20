import type {Styles, StyleObject, DashVariables} from '@dash-ui/styles'
declare const transition: <
  TransitionNames extends string,
  Variables extends DashVariables = DashVariables
>(
  styles: Styles<Variables, never>,
  transitions: TransitionMap<TransitionNames, Variables>
) => Transitioner<TransitionNames, Variables>
export default transition
export interface Transitioner<
  TransitionNames extends string,
  Variables extends DashVariables = DashVariables
> {
  (...args: (TransitionNames | TransitionObject<TransitionNames>)[]): string
  css: (
    ...names: (TransitionNames | TransitionObject<TransitionNames>)[]
  ) => string
  style: (
    ...names: (TransitionNames | TransitionObject<TransitionNames>)[]
  ) => StyleObject
  transitions: TransitionMap<TransitionNames, Variables>
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
  Variables extends DashVariables = DashVariables
> = {
  [Name in TransitionNames | 'default']?: TransitionValue<Variables>
}
export declare type TransitionValue<
  Variables extends DashVariables = DashVariables
> = TransitionPhase | ((variables: Variables) => TransitionPhase)
declare type TransitionObject<TransitionNames extends string = string> = {
  [Name in TransitionNames]?: boolean | null | undefined | string | number
}
