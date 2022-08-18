/* eslint-disable prefer-const */
import type {
  DashThemes,
  DashTokens,
  StyleObject,
  Styles,
  TokensUnion,
} from "@dash-ui/styles";

function transition<
  TransitionNames extends string,
  Tokens extends DashTokens = DashTokens,
  Themes extends DashThemes = DashThemes
>(
  styles: Styles<Tokens, Themes>,
  transitions: TransitionMap<TransitionNames, Tokens, Themes>
): Transitioner<TransitionNames, Tokens, Themes> {
  const transitioner: Transitioner<TransitionNames, Tokens, Themes> = (
    ...args
  ) => styles.one(createTransitionsFromArgs(styles, transitions, args))();

  transitioner.css = (...names): string =>
    styles.one(transitioner.style(...names)).css();

  transitioner.style = (...names): StyleObject =>
    createTransitionsFromArgs(styles, transitions, names);

  transitioner.transitions = transitions;

  return transitioner;
}

const createTransitions = <
  TransitionNames extends string,
  Tokens extends DashTokens = DashTokens,
  Themes extends DashThemes = DashThemes
>(
  styles: Styles<Tokens, Themes>,
  transitionMap: TransitionMap<TransitionNames, DashTokens, Themes>,
  styleName?: string | TransitionObject
): StyleObject => {
  const styleMap: StyleObject = {};
  const transitions: string[] = [];
  let duration: TransitionPhase["duration"];
  let delay: TransitionPhase["delay"];
  let timing: TransitionPhase["timing"];
  let origin: TransitionPhase["origin"];

  if (transitionMap.default !== void 0) {
    transitions.push("default");
    let defs = transitionMap.default;
    if (typeof defs === "function") defs = defs(styles.tokens);
    duration = unit(defs.duration, "ms");
    delay = unit(defs.delay, "ms");
    timing = defs.timing;
    origin = Array.isArray(defs.origin)
      ? defs.origin.map((v) => unit(v)).join(" ")
      : unit(defs.origin);
    if (Array.isArray(timing)) timing = `cubic-bezier(${timing.join(",")})`;
  }

  if (typeof styleName === "string") {
    transitions.push(styleName);
  } else {
    for (const name in styleName) if (styleName[name]) transitions.push(name);
  }

  const transition: string[] = [];

  for (let i = 0; i < transitions.length; i++) {
    const name = transitions[i] as TransitionNames;
    let phase = transitionMap[name];
    if (typeof phase === "function") phase = phase(styles.tokens);

    let {
      duration: phaseDuration,
      delay: phaseDelay,
      timing: phaseTiming,
      origin: phaseOrigin,
      ...phaseStyles
    } = phase as TransitionPhase;
    if (Array.isArray(phaseTiming))
      phaseTiming = `cubic-bezier(${phaseTiming.join(",")})`;

    if (phaseOrigin) {
      origin = Array.isArray(phaseOrigin)
        ? phaseOrigin.map((v) => unit(v)).join(" ")
        : unit(phaseOrigin);
    }

    if (origin) styleMap.transformOrigin = origin as string;

    const transitionDuration =
      phaseDuration === void 0 ? duration : unit(phaseDuration, "ms");

    /* istanbul ignore next */
    if (
      typeof process !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      if (transitionDuration === void 0 || transitionDuration === null) {
        throw new Error(
          `No duration was found for the phase "${transitions[i]}". All phases require a duration.`
        );
      }
    }

    let transitionDelayAndTiming = (
      ((phaseDelay === void 0 ? delay : unit(phaseDelay, "ms")) || "") +
      " " +
      ((phaseTiming === void 0 ? timing : phaseTiming) || "")
    ).trim();
    transitionDelayAndTiming = transitionDelayAndTiming
      ? " " + transitionDelayAndTiming
      : "";
    const styleKeys = Object.keys(phaseStyles);

    for (let j = 0; j < styleKeys.length; j++) {
      let key: string = styleKeys[j];
      let value = phaseStyles[key];

      if (value !== void 0 && value !== null) {
        let transitionProperty: string;

        if (key in transforms) {
          key = transforms[key as keyof typeof transforms] || key;
          (styleMap.transform as unknown as StyleObject) =
            (styleMap.transform || {}) as StyleObject;

          if (pxTransforms.test(key)) {
            value = Array.isArray(value)
              ? value.map((v) => unit(v))
              : unit(value);
          } else if (degTransforms.test(key)) {
            value = Array.isArray(value)
              ? value.map((v) => unit(v, "deg"))
              : unit(value, "deg");
          }

          (styleMap.transform as unknown as StyleObject)[key] = value;
          transitionProperty = "transform";
        } else {
          styleMap[key] = value;
          transitionProperty = cssCase(key);
        }

        const transitionValue =
          transitionProperty +
          " " +
          transitionDuration +
          transitionDelayAndTiming;

        transition.indexOf(transitionValue) === -1 &&
          transition.push(transitionValue);
      }
    }
  }

  if (typeof styleMap.transform === "object")
    styleMap.transform = Object.keys(styleMap.transform)
      .map((key) => {
        const value = (styleMap.transform as unknown as StyleObject)[key];
        return `${key}(${Array.isArray(value) ? value.join(",") : value})`;
      })
      .join(" ");

  styleMap.transition = transition.join(",");
  return styleMap;
};

const createTransitionsFromArgs = <
  TransitionNames extends string,
  Tokens extends DashTokens = DashTokens,
  Themes extends DashThemes = DashThemes
>(
  styles: Styles<Tokens, Themes>,
  transitionMap: TransitionMap<TransitionNames, typeof styles.tokens>,
  args: (string | TransitionObject<TransitionNames>)[]
): StyleObject => {
  if (args.length > 1) {
    const argMap: Record<string, boolean> = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (typeof arg === "string") argMap[arg] = true;
      else if (typeof arg === "object") Object.assign(argMap, arg);
    }

    return createTransitions<TransitionNames, Tokens, Themes>(
      styles,
      transitionMap,
      argMap
    );
  } else {
    return createTransitions<TransitionNames, Tokens, Themes>(
      styles,
      transitionMap,
      args[0]
    );
  }
};

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
  x: "translateX",
  y: "translateY",
  z: "translateZ",
} as const;

const unit = <T>(value: T, unit = "px"): T | string =>
  isNaN(value as any) || value === null ? value : `${value}${unit}`;
const pxTransforms = /^(translate|perspective)/;
const degTransforms = /^(skew|rotate)/;
const cssCaseRe = /[A-Z]|^ms/g;
const cssCase = (string: string): string =>
  string.replace(cssCaseRe, "-$&").toLowerCase();

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

export type TransitionMap<
  TransitionNames extends string,
  Tokens extends DashTokens = DashTokens,
  Themes extends DashThemes = DashThemes
> = {
  [Name in TransitionNames | "default"]?: TransitionValue<Tokens, Themes>;
};

export type TransitionValue<
  Tokens extends DashTokens = DashTokens,
  Themes extends DashThemes = DashThemes
> =
  | TransitionPhase
  | ((tokens: TokensUnion<Tokens, Themes>) => TransitionPhase);

type TransitionObject<TransitionNames extends string = string> = {
  [Name in TransitionNames]?: boolean | null | undefined | string | number;
};
