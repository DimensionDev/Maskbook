import type { PaletteMode, ThemeOptions } from '@material-ui/core'
import type { Color } from './constants'

function css_var<T extends Record<string, unknown>>(
    unique_name: string,
    keys: T,
): { [key in keyof T]: string & ((defaultValue?: string) => string) } {
    for (const k in keys) keys[k] = createVar(k) as any
    return keys as any
    function createVar(name: string) {
        const val = '--' + unique_name + '-' + name
        function use(defaultValue?: string): string {
            return `var(${val}${typeof defaultValue === 'undefined' ? '' : ', ' + defaultValue})`
        }
        use.toString = () => val
        return use
    }
}
type Theme = ThemeOptions | ((mode: PaletteMode, colors: Color) => ThemeOptions)

export const Grid: Theme = {
    components: { MuiGrid: {} },
}

const button = css_var('m-button', { main: 1, contrast: 1, light: 1 })
export const Button: Theme = (mode, colors): ThemeOptions => ({
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    opacity: 1,
                    fontWeight: 400,
                    transitionProperty: 'background-color, color, box-shadow, opacity',
                    '&:hover': { boxShadow: '0 0 5px ' + button.main() },
                    '&[disabled]': { opacity: 0.5 },
                },
            },
            variants: [
                {
                    props: { variant: 'contained' },
                    style: {
                        backgroundColor: button.main(),
                        color: button.contrast(),
                        '&:hover': { backgroundColor: button.main() },
                        '&[disabled]': { backgroundColor: button.main(), color: button.contrast() },
                    },
                },
                {
                    props: { variant: 'outlined' },
                    style: {
                        borderColor: button.light(),
                        color: button.main(),
                        '&:hover': { borderColor: button.light() },
                        '&[disabled]': { borderColor: button.light(), color: button.main() },
                    },
                },
                { props: { variant: 'text' }, style: { '&:hover': { boxShadow: 'unset' } } },
                {
                    props: { color: 'primary' },
                    style: { [button.main]: colors.primary, [button.contrast]: colors.primaryContrastText },
                },
                {
                    props: { color: 'secondary' },
                    style: { [button.main]: colors.secondary, [button.contrast]: colors.secondaryContrastText },
                },
                {
                    props: { color: 'secondary', variant: 'outlined' },
                    style: { [button.light]: colors.secondary, [button.main]: colors.primary },
                },
                {
                    props: { color: 'error' as any },
                    style: { [button.main]: colors.redMain, [button.contrast]: colors.redContrastText },
                },
            ],
        },
    },
})

export const Dialog: Theme = {
    components: {
        MuiDialog: {
            styleOverrides: {
                paper: { minHeight: 200, minWidth: 440 },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: { justifyContent: 'center', paddingBottom: 24, '&>:not(:first-of-type)': { marginLeft: 18 } },
            },
        },
    },
}

export const TextField: Theme = {
    components: {
        MuiFilledInput: {
            // alternative way, but less beauty
            // defaultProps: { disableUnderline: false },
            styleOverrides: {
                underline: {
                    '&:before': { display: 'none' },
                },
            },
        },
        MuiFormHelperText: {
            styleOverrides: {
                contained: {
                    paddingLeft: 14,
                    paddingRight: 14,
                    marginLeft: 0,
                    marginRight: 0,
                    borderLeft: '2px solid',
                },
                root: {},
            },
        },
    },
}

export const List: Theme = (mode, colors) => ({
    components: {
        MuiListItem: {
            styleOverrides: {
                button: {
                    '&:hover': mode === 'light' ? { backgroundColor: '#f5fcff' } : {},
                },
            },
        },
    },
})
