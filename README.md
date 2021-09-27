<hr/>

<img src='https://github.com/dash-ui/styles/raw/main/assets/logo.png'/>

> A library for creating CSS transitions with dash-ui

```sh
npm i @dash-ui/transition
```

<p>
  <a href="https://bundlephobia.com/result?p=@dash-ui/transition">
    <img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/@dash-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Types" href="https://www.npmjs.com/package/@dash-ui/transition">
    <img alt="Types" src="https://img.shields.io/npm/types/@dash-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Code coverage report" href="https://codecov.io/gh/dash-ui/transition">
    <img alt="Code coverage" src="https://img.shields.io/codecov/c/gh/dash-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Build status" href="https://github.com/dash-ui/transition/actions/workflows/release.yml">
    <img alt="Build status" src="https://img.shields.io/github/workflow/status/dash-ui/transition/release/main?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@dash-ui/transition">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/@dash-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="License" href="https://jaredlunde.mit-license.org/">
    <img alt="MIT License" src="https://img.shields.io/npm/l/@dash-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
</p>

---

## Quick Start

[Check out an example on **CodeSandbox**](https://codesandbox.io/s/dash-uitransition-example-lj5sv?file=/src/App.tsx)

```jsx harmony
import { styles } from "@dash-ui/styles";
import transition from "@dash-ui/transition";

styles.insertTokens({
  transition: {
    duration: {
      slow: "1s",
    },
  },
});

const fade = transition(styles, {
  // default styles and options
  default: {
    duration: 100,
  },
  // Use a callback to access tokens
  in: ({ transition }) => ({
    opacity: 1,
    duration: transition.duration.slow,
  }),
  out: {
    opacity: 0,
  },
});

const Component = ({ visible }) => (
  <div className={fade(visible ? "in" : "out")}>
    <div className={fade({ in: visible, out: !visible })}>Foo</div>
  </div>
);
```

## API

## LICENSE

MIT
