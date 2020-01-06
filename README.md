<hr>
<div align="center">
  <h1 align="center">
    @-ui/transition
  </h1>
</div>

<p align="center">
  <a href="https://bundlephobia.com/result?p=@-ui/transition">
    <img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/@-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Types" href="https://www.npmjs.com/package/@-ui/transition">
    <img alt="Types" src="https://img.shields.io/npm/types/@-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Code coverage report" href="https://codecov.io/gh/dash-ui/transition">
    <img alt="Code coverage" src="https://img.shields.io/codecov/c/gh/dash-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Build status" href="https://travis-ci.org/dash-ui/transition">
    <img alt="Build status" src="https://img.shields.io/travis/dash-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@-ui/transition">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/@-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="License" href="https://jaredlunde.mit-license.org/">
    <img alt="MIT License" src="https://img.shields.io/npm/l/@-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
</p>

<pre align="center">npm i @-ui/transition</pre>
<hr>

A library for creating CSS transitions with -ui

## Quick Start

```jsx harmony
import styles from '@-ui/styles'
import transition from '@-ui/transition'

styles.variables({
  transitions: {
    durations: {
      slow: '1s',
    },
  },
})

const fade = transition({
  // default styles and options
  default: {
    duration: 100,
  },
  // Use a callback to access variables
  in: ({transitions}) => ({
    opacity: 1,
    duration: transitions.duration.slow,
  }),
  out: {
    opacity: 0,
  },
})

const Component = ({visible}) => (
  <div className={fade(visible ? 'in' : 'out')}>
    <div className={fade({in: visible, out: !visible})}>Foo</div>
  </div>
)
```

## API

## LICENSE

MIT
