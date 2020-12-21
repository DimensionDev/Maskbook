import type { ThemeOptions } from '@material-ui/core'

/**
 * ? lg changed to 1440, other values untouched (default value)
 */
export const Breakpoints: ThemeOptions = {
    breakpoints: { values: { xs: 0, sm: 600, md: 960, lg: 1440, xl: 1920 } },
}

/**
 * ? Paper should be used as the main building block in the page
 * ? Paper should be 12px
 * ? Dialog should be 12px
 * ? Input (Button, TextField and Select) should be 4px(small) 6px(medium) and 8px(large)
 */
export const BorderRadius: ThemeOptions = {
    components: {
        MuiPaper: { styleOverrides: { rounded: { borderRadius: 12 } } },
        MuiDialog: { styleOverrides: { root: { borderRadius: 12 } } },
        MuiButton: {
            styleOverrides: {
                sizeSmall: { borderRadius: 4 },
                // Medium has no style class
                root: { borderRadius: 6 },
                sizeLarge: { borderRadius: 8 },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                sizeSmall: { borderRadius: 4 },
                // Medium has no style class
                root: { borderRadius: 6 },
                // No large for InputBase
            },
        },
    },
}
/**
 * ? No auto text-transform will be applied in this theme
 */
export const NoAutoTextTransform: ThemeOptions = {
    components: { MuiButton: { styleOverrides: { root: { textTransform: 'none' } } } },
}

/**
 * ? TextField, Select use "outlined" as default variant
 */
export const DefaultVariants: ThemeOptions = {
    components: {
        MuiButton: { defaultProps: { variant: 'contained' } },
        MuiTextField: { defaultProps: { variant: 'outlined' } },
        MuiSelect: { defaultProps: { variant: 'outlined' } },
    },
}
