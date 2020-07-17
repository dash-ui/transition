<hr>
<div align="center">
  <br/>
  <br/>
  <img src='https://github.com/dash-ui/styles/raw/master/assets/logo.png'/>
  <br/>
  <br/>
</div>

<p align="center">
  <a href="https://bundlephobia.com/result?p=@dash-ui/transition">
    <img alt="Bundlephobia" src="https://img.shields.io/bundlephobia/minzip/@dash-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Types" href="https://www.npmjs.com/package/@dash-ui/transition">
    <img alt="Types" src="https://img.shields.io/npm/types/@dash-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Code coverage report" href="https://codecov.io/gh/dash-ui/transition">
    <img alt="Code coverage" src="https://img.shields.io/codecov/c/gh/dash-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="Build status" href="https://travis-ci.com/dash-ui/transition">
    <img alt="Build status" src="https://img.shields.io/travis/com/dash-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@dash-ui/transition">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/@dash-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
  <a aria-label="License" href="https://jaredlunde.mit-license.org/">
    <img alt="MIT License" src="https://img.shields.io/npm/l/@dash-ui/transition?style=for-the-badge&labelColor=24292e">
  </a>
</p>

<pre align="center">npm i @dash-ui/transition</pre>
<hr>

A library for creating CSS transitions with [**dash-ui**](https://github.com/dash-ui/styles)

## Quick Start

```jsx harmony
import {styles} from '@dash-ui/styles'
import transition from '@dash-ui/transition'

styles.insertVariables({
  transition: {
    duration: {
      slow: '1s',
    },
  },
})

const fade = transition(styles, {
  // default styles and options
  default: {
    duration: 100,
  },
  // Use a callback to access variables
  in: ({transition}) => ({
    opacity: 1,
    duration: transition.duration.slow,
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
