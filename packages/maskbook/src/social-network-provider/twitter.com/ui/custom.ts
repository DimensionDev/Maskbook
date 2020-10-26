import { useMemo } from 'react'
import { ValueRef, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { unstable_createMuiStrictModeTheme, ThemeProvider, makeStyles } from '@material-ui/core'
import { useMaskbookTheme } from '../../../utils/theme'
import type { SocialNetworkUICustomUI } from '../../../social-network/ui'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { composeAnchorSelector } from '../utils/selector'
import React from 'react'
import { toRGB, getBackgroundColor, fromRGB, shade, isDark } from '../../../utils/theme-tools'
import { Appearance } from '../../../settings/settings'
import produce, { setAutoFreeze } from 'immer'
import type { InjectedDialogClassKey } from '../../../components/shared/InjectedDialog'
import type { StyleRules } from '@material-ui/core'

const primaryColorRef = new ValueRef(toRGB([29, 161, 242]))
const backgroundColorRef = new ValueRef(toRGB([255, 255, 255]))

export function startWatchThemeColor() {
    function updateThemeColor() {
        const color = getBackgroundColor(composeAnchorSelector().evaluate()!)
        const backgroundColor = getBackgroundColor(document.body)

        if (color) {
            primaryColorRef.value = color
        }
        if (backgroundColor) {
            backgroundColorRef.value = backgroundColor
        }
    }
    new MutationObserverWatcher(composeAnchorSelector())
        .addListener('onAdd', updateThemeColor)
        .addListener('onChange', updateThemeColor)
        .startWatch({
            childList: true,
            subtree: true,
        })
}
function useTheme() {
    const backgroundColor = useValueRef(backgroundColorRef)
    const primaryColor = useValueRef(primaryColorRef)
    const MaskbookTheme = useMaskbookTheme({
        theme: isDark(fromRGB(backgroundColor)!) ? Appearance.dark : Appearance.light,
    })
    return useMemo(() => {
        const primaryColorRGB = fromRGB(primaryColor)!
        setAutoFreeze(false)
        const TwitterTheme = produce(MaskbookTheme, (theme) => {
            theme.palette.background.paper = backgroundColor
            theme.palette.primary = {
                light: toRGB(shade(primaryColorRGB, 10)),
                main: toRGB(primaryColorRGB),
                dark: toRGB(shade(primaryColorRGB, -10)),
                contrastText: theme.palette.getContrastText(backgroundColor),
            }
            theme.shape.borderRadius = 15
            theme.breakpoints.values = { xs: 0, sm: 687, md: 1024, lg: 1280, xl: 1920 }
            theme.overrides = theme.overrides || {}
            theme.overrides!.MuiButton = {
                root: {
                    borderRadius: 500,
                    textTransform: 'initial',
                    fontWeight: 'bold',
                    minHeight: 39,
                    boxShadow: 'none',
                    [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                        '&': {
                            height: '28px !important',
                            minHeight: 'auto !important',
                            padding: '0 14px !important',
                        },
                    },
                },
            }
            theme.overrides!.MuiTab = {
                root: {
                    textTransform: 'none',
                },
            }
        })
        setAutoFreeze(true)
        return unstable_createMuiStrictModeTheme(TwitterTheme)
    }, [MaskbookTheme, backgroundColor, primaryColor])
}

export function TwitterThemeProvider(props: Required<React.PropsWithChildren<{}>>) {
    if (!process.env.STORYBOOK) throw new Error('This API is only for Storybook!')
    return React.createElement(ThemeProvider, { theme: useTheme(), ...props })
}
const useInjectedDialogClassesOverwrite = makeStyles((theme) =>
    createStyles<InjectedDialogClassKey>({
        root: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                display: 'block !important',
            },
        },
        container: {
            alignItems: 'center',
        },
        paper: {
            width: '600px !important',
            boxShadow: 'none',
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                '&': {
                    display: 'block !important',
                    borderRadius: '0 !important',
                },
            },
        },
        dialogTitle: {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 15px',
            borderBottom: `1px solid ${theme.palette.type === 'dark' ? '#2f3336' : '#ccd6dd'}`,
            '& > h2': {
                display: 'inline-block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                '&': {
                    display: 'flex',
                    justifyContent: 'space-between',
                    maxWidth: 600,
                    margin: '0 auto',
                    padding: '7px 14px 6px 11px !important',
                },
            },
        },
        dialogContent: {
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 600,
                margin: '0 auto',
                padding: '7px 14px 6px !important',
            },
        },
        dialogActions: {
            padding: '10px 15px',
            [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                maxWidth: 600,
                margin: '0 auto',
                padding: '7px 14px 6px !important',
            },
        },
        dialogTitleTypography: {
            verticalAlign: 'middle',
            marginLeft: 6,
        },
    }),
)
export const twitterUICustomUI: SocialNetworkUICustomUI = {
    useTheme,
    componentOverwrite: {
        InjectedDialog: {
            classes: useInjectedDialogClassesOverwrite,
        },
    },
}
function createStyles<ClassKey extends string>(styles: Partial<StyleRules<ClassKey, {}>>): StyleRules<ClassKey> {
    return styles as any
}
