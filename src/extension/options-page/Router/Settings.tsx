import React from 'react'
import { Typography, Card, List } from '@material-ui/core'
import { makeStyles, createStyles, ThemeProvider, Theme } from '@material-ui/core/styles'

import { SettingsUI, SettingsUIEnum } from '../../../components/shared-settings/useSettingsUI'
import {
    debugModeSetting,
    steganographyModeSetting,
    disableOpenNewTabInBackgroundSettings,
    languageSettings,
    Language,
    renderInShadowRootSettings,
} from '../../../components/shared-settings/settings'
import { useValueRef } from '../../../utils/hooks/useValueRef'

import EnhancedEncryptionIcon from '@material-ui/icons/EnhancedEncryption'
import NoEncryptionIcon from '@material-ui/icons/NoEncryption'
import MemoryOutlinedIcon from '@material-ui/icons/MemoryOutlined'
import WallpaperOutlinedIcon from '@material-ui/icons/WallpaperOutlined'
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser'
import LanguageIcon from '@material-ui/icons/Language'
import DashboardRouterContainer from './Container'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.paper,
        },
        title: {
            marginBottom: theme.spacing(1.5),
        },
        section: {
            padding: theme.spacing(4),
        },
    }),
)

const settingsTheme = (theme: Theme): Theme => ({
    ...theme,
    typography: {
        ...theme.typography,
        body1: {
            ...theme.typography.body1,
            lineHeight: 1.75,
        },
    },
    overrides: {
        ...theme.overrides,
        MuiListItem: {
            root: {
                paddingTop: theme.spacing(1.5),
                paddingBottom: theme.spacing(1.5),
                borderBottom: `1px solid ${theme.palette.divider}`,
            },
            secondaryAction: {
                paddingRight: '90px',
            },
        },
        MuiListItemIcon: {
            root: {
                justifyContent: 'flex-start',
                minWidth: 'unset',
                marginLeft: theme.spacing(2),
                marginRight: theme.spacing(3),
            },
        },
        MuiOutlinedInput: {
            input: {
                paddingTop: theme.spacing(1),
                paddingBottom: theme.spacing(1),
            },
        },
        MuiSwitch: {
            colorPrimary: {
                '&$checked$checked': {
                    color: 'var(--textOnPrimary)',
                },
            },
            track: {
                '$checked$checked + &': {
                    opacity: '1 !important',
                },
            },
        },
    },
})

function Settings() {
    const currentLang = useValueRef(languageSettings)
    const langMapper = React.useRef((x: Language) => {
        if (x === Language.en) return 'English'
        if (x === Language.zh) return '中文'
        return ''
    }).current
    const classes = useStyles()
    const shadowRoot = useValueRef(renderInShadowRootSettings)
    return (
        <ThemeProvider theme={settingsTheme}>
            <section className={classes.section}>
                <Typography className={classes.title} variant="h6" color="textPrimary">
                    General
                </Typography>
                <Card elevation={0}>
                    <List disablePadding>
                        <SettingsUIEnum
                            secondary={langMapper(currentLang)}
                            enumObject={Language}
                            getText={langMapper}
                            icon={<LanguageIcon />}
                            value={languageSettings}
                        />
                    </List>
                </Card>
            </section>
            <section className={classes.section}>
                <Typography className={classes.title} variant="h6" color="textPrimary">
                    Advanced Options
                </Typography>
                <Card elevation={0}>
                    <List disablePadding>
                        <SettingsUI icon={<WallpaperOutlinedIcon />} value={steganographyModeSetting} />
                        <SettingsUI icon={<OpenInBrowserIcon />} value={disableOpenNewTabInBackgroundSettings} />
                        {process.env.NODE_ENV === 'development' ? (
                            <SettingsUI
                                icon={shadowRoot ? <EnhancedEncryptionIcon /> : <NoEncryptionIcon />}
                                value={renderInShadowRootSettings}
                                secondary="Development mode only"
                            />
                        ) : /** This settings is not ready for production */ null}
                        <SettingsUI icon={<MemoryOutlinedIcon />} value={debugModeSetting} />
                    </List>
                </Card>
            </section>
        </ThemeProvider>
    )
}

export default function DashboardSettingsRouter() {
    return (
        <DashboardRouterContainer title="Settings">
            <Settings />
        </DashboardRouterContainer>
    )
}
