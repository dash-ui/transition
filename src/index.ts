import {StyleObject, Styles, DashCache, StyleObjectArgument} from '@-ui/styles'

declare const __DEV__: boolean

const transforms = {
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

const createTransitions = <Names extends string>(
  dash: DashCache,
  transitionDefs: TransitionDefs<Names, typeof dash.variables>,
  styleName?: string | StyleObjectArgument<Names>
): StyleObject => {
  const styleDefs: StyleObject = {}
  const transitions: string[] = []
  let duration: string | undefined,
    delay: string | undefined,
    timing: string | undefined

  if (transitionDefs.default !== void 0) {
    transitions.push('default')
    let defs = transitionDefs.default
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
    let phase = transitionDefs[transitions[i]]
    if (typeof phase === 'function') phase = phase(dash.variables)

    const {
      duration: phaseDuration,
      delay: phaseDelay,
      timing: phaseTiming,
    } = phase

    const phaseStyles = Object.assign({}, phase)
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
      let key = styleKeys[j]
      let value = phaseStyles[key]

      if (value !== void 0 && value !== null) {
        let transitionProperty: string

        if (transforms[key] !== void 0) {
          key = transforms[key] || key
          styleDefs.transform = styleDefs.transform || {}

          if (pxTransforms.test(key)) {
            value = Array.isArray(value)
              ? value.map((v) => unit(v))
              : unit(value)
          } else if (degTransforms.test(key)) {
            value = Array.isArray(value)
              ? value.map((v) => unit(v, 'deg'))
              : unit(value, 'deg')
          }

          styleDefs.transform[key] = value
          transitionProperty = 'transform'
        } else {
          styleDefs[key] = value
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

  if (typeof styleDefs.transform === 'object')
    styleDefs.transform = Object.keys(styleDefs.transform)
      .map((key) => {
        const value = styleDefs.transform[key]
        return `${key}(${Array.isArray(value) ? value.join(',') : value})`
      })
      .join(' ')

  styleDefs.transition = transition.join(',')
  return styleDefs
}

const createTransitionsFromArgs = <Names extends string>(
  dash: DashCache,
  transitionDefs: TransitionDefs<Names, typeof dash.variables>,
  args: (string | StyleObjectArgument<Names>)[]
): StyleObject => {
  if (args.length > 1) {
    const argDefs = {}

    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      if (typeof arg === 'string') argDefs[arg] = true
      else if (typeof arg === 'object') Object.assign(argDefs, arg)
    }

    return createTransitions(dash, transitionDefs, argDefs)
  } else return createTransitions(dash, transitionDefs, args[0])
}

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

export type TransitionDef<Vars = any> =
  | TransitionPhase
  | ((variables: Vars) => TransitionPhase)

export type TransitionDefs<Names extends string, Vars> = {
  [Name in Names | 'default']?: TransitionDef<Vars>
}

function transition<Names extends string, Vars = any>(
  styles: Styles<Vars>,
  transitions: TransitionDefs<Names, Vars>
): Transitioner<Names, Vars> {
  const transitioner: Transitioner<Names, Vars> = (...args) =>
    styles.one(createTransitionsFromArgs(styles.dash, transitions, args))()
  transitioner.css = (...names) =>
    styles.one(transitioner.style(...names)).css()
  transitioner.style = (...names): StyleObject =>
    createTransitionsFromArgs(styles.dash, transitions, names)
  transitioner.transitions = transitions
  return transitioner
}

export default transition
