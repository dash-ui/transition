import rootStyles, {
  Variables,
  StyleObject,
  Styles,
  DashCache,
  StyleObjectArgument,
} from '@-ui/styles'
import memoize from 'trie-memoize'

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

const getProperties = memoize([WeakMap], (phase: StyleObject) => {
  const props: string[] = []

  for (let key in phase) {
    if (transforms[key] !== void 0) key = 'transform'
    if (props.indexOf(key) === -1) props.push(cssCase(key))
  }

  return props
})

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
    duration = defs.duration
    delay = defs.delay
    timing = defs.timing
  }
  if (typeof styleName === 'string') {
    transitions.push(styleName)
  } else {
    for (const name in styleName) if (styleName[name]) transitions.push(name)
  }

  const transition: string[] = []

  for (const name of transitions) {
    let phase = transitionDefs[name]
    if (typeof phase === 'function') phase = phase(dash.variables)
    const {
      duration: phaseDuration,
      delay: phaseDelay,
      timing: phaseTiming,
      ...phaseStyles
    } = phase
    const transitionDuration = unit(
      phaseDuration === void 0 ? duration : phaseDuration,
      'ms'
    )

    /* istanbul ignore next */
    if (__DEV__) {
      if (transitionDuration === void 0 || transitionDuration === null) {
        throw new Error(
          `No duration was found for the phase "${name}". All phases require a duration.`
        )
      }
    }

    const transitionDelay =
      unit(phaseDelay === void 0 ? delay : phaseDelay, 'ms') || ''
    const transitionTiming =
      (phaseTiming === void 0 ? timing : phaseTiming) || ''

    for (const property of getProperties(phaseStyles)) {
      transition.push(
        (
          property +
          ' ' +
          transitionDuration +
          ' ' +
          transitionDelay +
          ' ' +
          transitionTiming
        )
          .trim()
          .replace(/\s+/g, ' ')
      )
    }

    for (let key in phaseStyles) {
      let value = phaseStyles[key]

      if (value !== void 0 && value !== null) {
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
        } else {
          styleDefs[key] = value
        }
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
  dash: DashCache
  transitions: TransitionDefs
  create?: (styles: Styles) => Transition
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
}

const createTransition = (styles: Styles): Transition => {
  return (
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

    transitioner.css = (...names: (string | StyleObjectArgument)[]): string => {
      const normalizedStyleDefs = createTransitionsFromArgs(
        styles.dash,
        transitions,
        names
      )
      if (!normalizedStyleDefs) return ''
      return styles.one(normalizedStyleDefs).css()
    }

    transitioner.transitions = transitions
    transitioner.dash = styles.dash
    transitioner.create = (styles: Styles): Transition =>
      createTransition(styles)
    return transitioner
  }
}

export default createTransition(rootStyles)
