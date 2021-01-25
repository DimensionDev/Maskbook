import type { ThemeOptions } from '@material-ui/core'

export const Font: ThemeOptions = {
    typography: {
        // TODO: lang=JP? offer different font list for different lang target?
        // Firefox doesn't support "system-ui" so we need fallback
        fontFamily: `system-ui, Segoe UI, Roboto, Ubuntu, Helvetica Neue, Helvetica, Arial,
        PingFang TC, Hiragino Sans TC, Source Han Sans TC, Noto Sans CJK TC, Microsoft JhengHei UI, Microsoft JhengHei, sans-serif;`,
    },
}

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
        MuiFilledInput: {
            styleOverrides: {
                sizeSmall: {
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4,
                },
                // Medium has no style class
                root: {
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                    borderBottomLeftRadius: 6,
                    borderBottomRightRadius: 6,
                },
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
        MuiTextField: { defaultProps: {} },
    },
}
