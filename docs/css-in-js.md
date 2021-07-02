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
- 🚫 DO NOT mix two styling solution together. It may cause unknown bugs. FYI: `makeStyles` is `JSS`, `Box`, `sx` and `styled` are `@emotion`.

## Guides on the `makeStyles` style

```js
const useStyle = makeStyles((theme) => ({
  root: { margin: theme.spacing(4) },
}))
```

### ✅ &#9888; You can use `makeStyles` in the project

Reason: This is the recommend way of writing way in @material-ui 4.

&#9888; In @material-ui 5 there is [an RFC](https://github.com/mui-org/material-ui/issues/26571) about to add `makeStyles` API back and migrate to based on emotion. Even if this RFC doesn't land, there is a community solution called [tss-react](https://github.com/garronej/tss-react) that we can migrate to. Therefore it's safe to continue use the `makeStyles` API.

#### Change style of MUI components

✅ DO

```js
<Button classes={{ disabled: classes.disabled }} />
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

### &#9888; Calculated selector to the deeper elements of the library

&#9888; Not recommended. Please perfer to use `makeStyles` in this case.

&#9888; Caution: Please aware of CSS selector. You may want `& > .${selected}` or `&.${selected}` in most cases instead of `& .${selected}`.

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
