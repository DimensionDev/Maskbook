---
author: Jack-Works
maintainer:
  - Jack-Works
  - Septs
---

# CSS in JS guide in Mask Network

## General guides

- ✅ For recommendations
- &#9888; For warnings
- 🚫 For forbiddens
- ✅ Use [the Box component provided by the library](https://next.material-ui.com/components/box/#main-content)
  when the CSS is simple and only used once.
- ✅ CSS custom variables is OK but do not abuse it.
  Get the variable from the theme if it is possible.
- ✅ CSS grid is OK but you may want to use the `Grid` component.
  Choose the fit one based on your need.
- 🚫 DO NOT use mystery abbreviations in the `sx` properties, e.g. `<Box sx={{ p: 5 }} />`
  (DON'T) but `<Box sx={{ padding: 5 }}>` (DO, easier to read).

## Guides on the `makeStyles` style

```ts
const useStyle = makeStyles<Props>()((theme) => ({
  root: { margin: theme.spacing(4) },
}))
```

### Change style of MUI components

✅ DO

```js
<Button classes={{ disabled: classes.disabled }} />
```

## Guides on the `styled component`

```js
const Title = style.div`
    display: flex;
`
```

### ✅ &#9888; You can use `styled component` in the project

#### 🚫 DO NOT use dynamic styles

```js
// 🚫 Bad
const Title = style(Typography)(
  ({ theme }) => `
    marign-left: ${theme.spacing(4)};
`,
)

// 🚫 Bad
const Title = style(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(4),
}))
```

### 🚫 Direct selector to the deeper elements of the library

```js
const Title = style.div`
    & .Mui-Button-root { display: flex; }
`
```

DO NOT do this.

Reason: Not type-checked. Easy to get things wrong.

### 🚫 Selector used in the styled component

Please use `makeStyles` in this case.

```js
const Dialog1 = style(Dialog)`
    & > .Mui-Some-Mui-Selector {}
`
```

### ✅ `components` or `*Component` style

Overwriting styles in this way is acceptable.

```js
const MyExample = styled(Example)`
    /* CSS goes here */
`

// Use it via:
<Parent components={{ example: MyExample }} />
// Or:
<Parent ExampleComponent={MyExample} />
```

&#9888; No every component has this kind of API that allowing to overwrite
the inner component so this method may not be able to use.
