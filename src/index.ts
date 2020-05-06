import type {Dash, Styles, StyleObject, DashVariables} from '@dash-ui/styles'

declare const __DEV__: boolean

const transition = <
  TransitionNames extends string,
  Variables extends DashVariables = DashVariables
>(
  styles: Styles<Variables>,
  transitions: TransitionMap<TransitionNames, Variables>
): Transitioner<TransitionNames, Variables> => {
  const transitioner: Transitioner<TransitionNames, Variables> = (...args) =>
    styles.one(createTransitionsFromArgs(styles.dash, transitions, args))()
  transitioner.css = (...names) =>
    styles.one(transitioner.style(...names)).css()
  transitioner.style = (...names): StyleObject =>
    createTransitionsFromArgs(styles.dash, transitions, names)
  transitioner.transitions = transitions
  return transitioner
}

const createTransitions = <
  TransitionNames extends string,
  Variables extends DashVariables = DashVariables
>(
  dash: Dash,
  transitionMap: TransitionMap<TransitionNames, DashVariables>,
  styleName?: string | TransitionObject
): StyleObject => {
  const styleMap: StyleObject = {}
  const transitions: string[] = []
  let duration: string | undefined,
    delay: string | undefined,
    timing: string | undefined

  if (transitionMap.default !== void 0) {
    transitions.push('default')
    let defs = transitionMap.default
    if (typeof defs === 'function') defs = defs(dash.variables)
    duration = unit(defs.duration, 'ms')
    delay = unit(defs.delay, 'ms')
    timing = defs.timing
  }

  if (typeof styleName === 'string') {
    transitions.push(styleName)
  } else {
    for (const name in styleName) if (styleName[name]) transitions.push(name)
  }

  const transition: string[] = []

  for (let i = 0; i < transitions.length; i++) {
    const name = transitions[i] as TransitionNames
    let phase = transitionMap[name]
    if (typeof phase === 'function') phase = phase(dash.variables)

    const {
      duration: phaseDuration,
      delay: phaseDelay,
      timing: phaseTiming,
    } = phase as TransitionPhase

    const phaseStyles: TransitionPhase = Object.assign({}, phase)
    delete phaseStyles.duration
    delete phaseStyles.delay
    delete phaseStyles.timing

    const transitionDuration =
      phaseDuration === void 0 ? duration : unit(phaseDuration, 'ms')

    /* istanbul ignore next */
    if (__DEV__) {
      if (transitionDuration === void 0 || transitionDuration === null) {
        throw new Error(
          `No duration was found for the phase "${transitions[i]}". All phases require a duration.`
        )
      }
    }

    let transitionDelayAndTiming = (
      ((phaseDelay === void 0 ? delay : unit(phaseDelay, 'ms')) || '') +
      ' ' +
      ((phaseTiming === void 0 ? timing : phaseTiming) || '')
    ).trim()
    transitionDelayAndTiming = transitionDelayAndTiming
      ? ' ' + transitionDelayAndTiming
      : ''
    const styleKeys = Object.keys(phaseStyles)

    for (let j = 0; j < styleKeys.length; j++) {
      let key: string = styleKeys[j]
      let value = phaseStyles[key]

      if (value !== void 0 && value !== null) {
        let transitionProperty: string

        if (transforms[key] !== void 0) {
          key = transforms[key] || key
          styleMap.transform = (styleMap.transform || {}) as StyleObject

          if (pxTransforms.test(key)) {
            value = Array.isArray(value)
              ? value.map((v) => unit(v))
              : unit(value)
          } else if (degTransforms.test(key)) {
            value = Array.isArray(value)
              ? value.map((v) => unit(v, 'deg'))
              : unit(value, 'deg')
          }

          styleMap.transform[key] = value
          transitionProperty = 'transform'
        } else {
          styleMap[key] = value
          transitionProperty = cssCase(key)
        }

        const transitionValue =
          transitionProperty +
          ' ' +
          transitionDuration +
          transitionDelayAndTiming

        transition.indexOf(transitionValue) === -1 &&
          transition.push(transitionValue)
      }
    }
  }

  if (typeof styleMap.transform === 'object')
    styleMap.transform = Object.keys(styleMap.transform)
      .map((key) => {
        const value = (styleMap.transform as StyleObject)[key]
        return `${key}(${Array.isArray(value) ? value.join(',') : value})`
      })
      .join(' ')

  styleMap.transition = transition.join(',')
  return styleMap
}

const createTransitionsFromArgs = <
  TransitionNames extends string,
  Variables extends DashVariables = DashVariables
>(
  dash: Dash,
  transitionMap: TransitionMap<TransitionNames, typeof dash.variables>,
  args: (string | TransitionObject<TransitionNames>)[]
): StyleObject => {
  if (args.length > 1) {
    const argMap: Record<string, boolean> = {}

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      if (typeof arg === 'string') argMap[arg] = true
      else if (typeof arg === 'object') Object.assign(argMap, arg)
    }

    return createTransitions<TransitionNames, Variables>(
      dash,
      transitionMap,
      argMap
    )
  } else
    return createTransitions<TransitionNames, Variables>(
      dash,
      transitionMap,
      args[0]
    )
}

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
  timing?: string
  [property: string]: any
}
export type TransitionMap<
  TransitionNames extends string,
  Variables extends DashVariables = DashVariables
> = {
  [Name in TransitionNames | 'default']?: TransitionValue<Variables>
}

export type TransitionValue<Variables extends DashVariables = DashVariables> =
  | TransitionPhase
  | ((variables: Variables) => TransitionPhase)

type TransitionObject<TransitionNames extends string = string> = {
  [Name in TransitionNames]?: boolean | null | undefined | string | number
}

const transforms: Record<string, 0 | string> = {
  matrix: 0,
  matrix3d: 0,
  perspective: 0,
  rotate: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  rotate3d: 0,
  scale: 0,
  scaleX: 0,
  scaleY: 0,
  scaleZ: 0,
  scale3d: 0,
  skew: 0,
  skewX: 0,
  skewY: 0,
  translate3d: 0,
  translate: 0,
  x: 'translateX',
  y: 'translateY',
  z: 'translateZ',
}

const unit = (value: any, unit = 'px') =>
  isNaN(value) || value === null ? value : `${value}${unit}`
const pxTransforms = /^(translate|perspective)/
const degTransforms = /^(skew|rotate)/
const cssCaseRe = /[A-Z]|^ms/g
const cssCase = (string: string): string =>
  string.replace(cssCaseRe, '-$&').toLowerCase()

export default transition
