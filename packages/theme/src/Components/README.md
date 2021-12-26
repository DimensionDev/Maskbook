# Rules of Design components

- Our own version of @mui/material components starts with `Mask`
- Export value and types separately (see `./Dialogs/index.ts` as an example)

  Reason: Build tools might need cross-file knowledge for `export {} from` syntax to generate a valid ES Module file.

- Split components into composable parts (`MaskDialogTitle` for example)
- Provide meaningful default set (see `MaskDialog`) but still allows built from the @mui/material libs
