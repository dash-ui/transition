import rootStyles, {
  Variables,
  StyleObject,
  Styles,
  DashCache,
  StyleObjectArgument,
} from '@-ui/styles'

const __DEV__ =
  typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'

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

const unit = (value, unit = 'px') =>
  isNaN(value) || value === null ? value : `${value}${unit}`
const pxTransforms = /^(translate|perspective)/
const degTransforms = /^(skew|rotate)/
const cssCaseRe = /[A-Z]|^ms/g
const cssCase = (string: string): string =>
  string.replace(cssCaseRe, '-$&').toLowerCase()

const createTransitions = (
  dash: DashCache,
  transitionDefs: TransitionDefs,
  styleName?: string | StyleObjectArgument
): StyleObject => {
  const styleDefs: StyleObject = {}
  const transitions: string[] = []
  let duration, delay, timing

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
      ...phaseStyles
    } = phase
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
        let transitionProperty

        if (transforms[key] !== void 0) {
          key = transforms[key] || key
          styleDefs.transform = styleDefs.transform || {}

          if (pxTransforms.test(key)) {
            value = Array.isArray(value)
              ? value.map(v => unit(v, 'px'))
              : unit(value, 'px')
          } else if (degTransforms.test(key)) {
            value = Array.isArray(value)
              ? value.map(v => unit(v, 'deg'))
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
      .map(key => {
        const value = styleDefs.transform[key]
        return `${key}(${Array.isArray(value) ? value.join(',') : value})`
      })
      .join(' ')

  styleDefs.transition = transition.join(',')
  return styleDefs
}

const createTransitionsFromArgs = (
  dash: DashCache,
  transitionDefs: TransitionDefs,
  args: (string | StyleObjectArgument)[]
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

export interface Transitioner {
  (...args: (string | StyleObjectArgument)[]): string
  css: (...names: (string | StyleObjectArgument)[]) => string
  style: (...names: (string | StyleObjectArgument)[]) => StyleObject
  transitions: TransitionDefs
}

export interface TransitionPhase {
  [phase: string]: any
  duration?: number | string
  delay?: number | string
  timing?: string
}

export type TransitionDef =
  | TransitionPhase
  | ((variables: Variables) => TransitionPhase)

export interface TransitionDefs {
  [property: string]: TransitionDef
}

export interface Transition {
  (...transitionArgs: (TransitionDefs | Transitioner)[]): Transitioner
  dash: DashCache
  create: (styles: Styles) => Transition
}

const createTransition = (styles: Styles): Transition => {
  const transition = (
    ...transitionArgs: (TransitionDefs | Transitioner)[]
  ): Transitioner => {
    const transitions = Object.assign(
      {},
      ...transitionArgs.map((arg: TransitionDefs | Transitioner) =>
        typeof arg === 'function' ? arg.transitions : arg
      )
    )

    const transitioner = (
      ...args: (string | StyleObjectArgument)[]
    ): string => {
      const normalizedStyleDefs = createTransitionsFromArgs(
        styles.dash,
        transitions,
        args
      )
      if (!normalizedStyleDefs) return ''
      return styles.one(normalizedStyleDefs)()
    }

    transitioner.css = (...names: (string | StyleObjectArgument)[]): string =>
      styles.one(transitioner.style(...names)).css()
    transitioner.style = (
      ...names: (string | StyleObjectArgument)[]
    ): StyleObject => {
      const normalizedStyleDefs = createTransitionsFromArgs(
        styles.dash,
        transitions,
        names
      )
      if (!normalizedStyleDefs) return {}
      return normalizedStyleDefs
    }
    transitioner.transitions = transitions
    return transitioner
  }

  transition.dash = styles.dash
  transition.create = (styles: Styles): Transition => createTransition(styles)
  return transition
}

export default createTransition(rootStyles)
