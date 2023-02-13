import { Icons } from '@masknet/icons'
import type { PaletteMode, ThemeOptions } from '@mui/material'
import { css_var } from '../../CSSVariables/createVars.js'
import type { Color } from '../../CSSVariables/index.js'

type Theme = ThemeOptions | ((mode: PaletteMode, colors: Color) => ThemeOptions)

export const BaseLine: Theme = (mode, colors): ThemeOptions => ({
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: 'red',
                    '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                        width: '10px',
                    },
                    '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                        borderRadius: '6px',
                        border: '2px solid rgba(0, 0, 0, 0)',
                        backgroundColor: mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                        backgroundClip: 'padding-box',
                    },
                },
            },
        },
    },
})

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
                // new variant for rounded button
                {
                    props: { variant: 'rounded' },
                    style: {
                        borderRadius: '24px',
                        backgroundColor: button.main(),
                        color: button.contrast(),
                        '&:hover': { backgroundColor: button.main() },
                        '&[disabled]': { backgroundColor: button.main(), color: button.contrast() },
                    },
                },
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
                    props: { color: 'error' },
                    style: { [button.main]: colors.redMain, [button.contrast]: colors.primaryContrastText },
                },
                {
                    props: { color: 'warning' },
                    style: { [button.main]: colors.warning, [button.contrast]: colors.primaryContrastText },
                },
                {
                    props: { size: 'small' },
                    style: { height: '28px', fontSize: '12px' },
                },
                {
                    props: { size: 'medium' },
                    style: { height: '38px', fontSize: '14px' },
                },
                {
                    props: { size: 'large' },
                    style: { height: '48px', fontSize: '16px' },
                },
            ],
        },
    },
})

export const Dialog: Theme = (mode, colors): ThemeOptions => ({
    components: {
        MuiDialog: {
            styleOverrides: {
                root: {
                    '& .dashboard-style': {
                        backgroundColor: mode === 'dark' ? colors.primaryBackground : colors.secondaryBackground,
                    },
                    // workaround for common component be used in dashboard and twitter
                    '& .dashboard.token-list': {
                        padding: '10px 16px',
                        '&:hover': {
                            background: mode === 'dark' ? 'transparent !important' : '#F9F9F9',
                        },
                    },
                    '& .dashboard.token-list-symbol': {
                        color: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#7B8192',
                        fontSize: 12,
                    },
                },
                paper: { minHeight: 200, minWidth: 440, background: colors.mainBackground },
            },
            defaultProps: {
                BackdropProps: {
                    sx: {
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    },
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    backgroundColor: colors.mainBackground,
                    '&.dashboard-dialog-title-hook': {
                        backgroundColor: colors.mainBackground,
                        display: 'flex',
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                        p: {
                            width: '100%',
                            display: 'inline-flex',
                            justifyContent: 'start',
                        },
                    },
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    backgroundColor: colors.mainBackground,
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    justifyContent: 'center',
                    paddingBottom: 24,
                    '&>:not(:first-of-type)': { marginLeft: 18 },
                    backgroundColor: colors.mainBackground,
                },
            },
        },
    },
})

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

export const Card: Theme = (mode, colors) => ({
    components: {
        MuiCard: {
            styleOverrides: {},
            variants: [
                {
                    props: { variant: 'outlined' },
                    style: {
                        border: `1px solid ${colors.lineLight}`,
                    },
                },
                {
                    props: { variant: 'background' },
                    style: {
                        padding: 8,
                        border: 'none',
                        background: mode === 'dark' ? colors.lightBackground : colors.normalBackground,
                    },
                },
            ],
        },
    },
})

export const Paper: Theme = (mode, colors) => ({
    components: {
        MuiPaper: {
            styleOverrides: {},
            variants: [
                {
                    props: { variant: 'outlined' },
                    style: {
                        borderRadius: 12,
                    },
                },
                {
                    props: { variant: 'rounded' },
                    style: {
                        borderRadius: 16,
                        backgroundColor: colors.primaryBackground,
                    },
                },
            ],
        },
    },
})

export const Tabs: Theme = () => ({
    components: {
        MuiTab: {
            styleOverrides: {
                root: {
                    // up-sm
                    '@media screen and (min-width: 600px)': {
                        minWidth: 160,
                    },
                },
            },
        },
    },
})
export const Link: Theme = () => ({
    components: {
        MuiLink: { defaultProps: { underline: 'hover' } },
    },
})

export const Typography: Theme = (mode, colors) => ({
    components: {
        MuiTypography: {
            styleOverrides: {},
            variants: [
                // UI component: h3
                {
                    props: { variant: 'h3' },
                    style: {
                        fontSize: 24,
                        lineHeight: '30px',
                        color: colors.textPrimary,
                    },
                },
                // UI component: h4
                {
                    props: { variant: 'h4' },
                    style: {
                        fontSize: 18,
                        lineHeight: '24px',
                        fontStyle: 'normal',
                        color: colors.textPrimary,
                    },
                },
                // UI component: h5
                {
                    props: { variant: 'h5' },
                    style: {
                        fontSize: 16,
                        lineHeight: '22px',
                        color: colors.textPrimary,
                    },
                },
                // UI component: P4
                {
                    props: { variant: 'body2', paragraph: true },
                    style: {
                        fontSize: 14,
                        color: colors.textSecondary,
                    },
                },
                // UI component: P12
                {
                    props: { variant: 'body2', component: 'span' },
                    style: {
                        fontSize: 12,
                        color: colors.textSecondary,
                        lineHeight: '16px',
                    },
                },
            ],
        },
    },
})

export const Checkbox: Theme = (mode, colors) => ({
    components: {
        MuiCheckbox: {
            defaultProps: {
                size: 'medium',
                checkedIcon: <Icons.Checkbox size={18} color="#1C68F3" />,
                icon: <Icons.CheckboxBlank size={18} />,
                disableRipple: true,
            },
        },
    },
})
