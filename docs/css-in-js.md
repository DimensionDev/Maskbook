---
author: Jack-Works
maintainer:
  - Jack-Works
  - Septs
---

# How to use CSS in JS

## General guides

- ✅ For recommendations
- &#9888; For warnings
- 🚫 For forbiddens
- ✅ Use [the Box component provided by the library](https://next.material-ui.com/components/box/#main-content) when the CSS is simple and only used once.
- ✅ CSS custom variables is OK but do not abuse it. Get the variable from the theme if it is possible.
- ✅ CSS grid is OK but you may want to use the `Grid` component. Choose the fit one based on your need.
- 🚫 DO NOT use mystery abbreviations in the `sx` properties, e.g. `<Box sx={{ p: 5 }} />` (DON'T) but `<Box sx={{ padding: 5 }}>` (DO, easier to read).
- 🚫 DO NOT mix two styling solution together. It may cause unknown bugs. FYI: `makeStyles` is `JSS`, `Box` and `styled` are `@emotion`.

## Guides on the `makeStyles` style

```js
const useStyle = makeStyles((theme) => ({
  root: { margin: theme.spacing(4) },
}))
```

### ✅ &#9888; You can use `makeStyles` in the project

Reason: This is the recommend way of writing way in @material-ui 4.

&#9888; In @material-ui 5 the recommend way has changed to the `styled-component` style.

&#9888; I (@Jack-Works) will try to convince the library team to make a emotion styled version makeStyles or make it on my own so we can get rid of 2 different CSS-in-JS framework in our project.

#### Change style of MUI components

🚫 DON'T ([reason](https://github.com/mui-org/material-ui/issues/25011#issuecomment-789105382))

```js
<Button classes={{ disabled: classes.disabled }} />
```

✅ DO

```js
import { buttonClasses } from '@material-ui/core'
const useStyle = makeStyles(theme => ({
    button: {
      // way 1
      ['&.' + buttonClasses.disabled]: {},
      // way 2 (if applicable)
      '&[disabled]': {}
    }
}))
<Button className={classes.button} />
```

## Guides on the `styled` style (let's call it `styled component`)

```js
const Title = style.div`
    display: flex;
`
```

### ✅ You can use `styled component` in the project

Reason: Good DX (Note: you may want to install editor plugins for styled-components).

### &#9888; You may want to use "object style" when it involves dynamic styles

Reason: _Potential_ performance lost.

Not enforcement because it is not confirmed.

```js
// ⚠ Not so good
const Title = style(Typography)(
  ({ theme }) => `
    marign-left: ${theme.spacing(4)};
`,
)

// ✅ OK
const Title = style(Typography)(({ theme }) => {
  marginLeft: theme.spacing(4)
})
```

### 🚫 Direct selector to the deeper elements of the library

```js
const Title = style.div`
    & .Mui-selected { display: flex; }
`
```

DO NOT do this.

Reason: Not type-checked. Easy to get things wrong.

### ✅ Calculated selector to the deeper elements of the library

&#9888; Caution: Please aware of CSS selector. You may want `& > .${selected}` or `&.${selected}` in most cases.

```js
import { buttonClasses } from '@material-ui/core'
// Way 1
const Button1 = style(Button)`
    &[disabled] {}
`
// way 2 (if applicable)
const Button2 = style(Button)`
    &.${buttonClasses.disabled} {}
`
```

### ✅ `components` or `*Component` style

Overwriting styles in this way is good.

```js
const MyExample = styled(Example)`
    /* CSS goes here */
`

// Use it via:
<Parent components={{ example: MyExample }} />
// Or:
<Parent ExampleComponent={MyExample} />
```

&#9888; No every component has this kind of API that allowing to overwrite the inner component so this method may not be able to use.
