// eslint-disable-next-line import/no-empty-named-blocks, unicorn/require-module-specifiers
import type {} from '@mui/material/themeCssVarsAugmentation'
import { MaskColors } from './colors.js'
import { unstable_createMuiStrictModeTheme } from '@mui/material'
import {
    Alert,
    Button,
    Checkbox,
    InputBase,
    LinearProgress,
    Radio,
    Select,
    Slider,
    Switch,
    TextField,
    Tooltip,
} from './component-changes.js'

export const MaskTheme = unstable_createMuiStrictModeTheme({
    typography: {
        fontFamily: 'Helvetica',
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 1112,
            lg: 1280,
            xl: 1920,
        },
    },
    components: {
        ...Alert.components,
        ...Button.components,
        ...Checkbox.components,
        ...InputBase.components,
        ...LinearProgress.components,
        ...Radio.components,
        ...Select.components,
        ...Slider.components,
        ...Switch.components,
        ...TextField.components,
        ...Tooltip.components,
        MuiLink: { defaultProps: { underline: 'hover' } },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'unset',
                    padding: '0',
                    // up-sm
                    '@media screen and (min-width: 600px)': {
                        minWidth: 160,
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: '12px',
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontSize: 14,
                },
            },
        },
        MuiPaper: {
            // https://github.com/mui-org/material-ui/pull/25522
            styleOverrides: { root: { backgroundImage: 'unset' } },
        },
    },
    modularCssLayers: true,
    cssVariables: {
        colorSchemeSelector: 'data',
    },
    colorSchemes: {
        light: {
            palette: MaskColors.light,
        },
        dark: {
            palette: MaskColors.dark,
        },
    },
})
