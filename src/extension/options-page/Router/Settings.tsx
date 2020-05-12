import React from 'react'
import { Typography, Card, List, Paper } from '@material-ui/core'
import { makeStyles, createStyles, ThemeProvider, Theme, useTheme } from '@material-ui/core/styles'

import { SettingsUI, SettingsUIEnum, SettingsUIDummy } from '../../../components/shared-settings/useSettingsUI'
import {
    debugModeSetting,
    disableOpenNewTabInBackgroundSettings,
    languageSettings,
    Language,
    renderInShadowRootSettings,
    Appearance,
    appearanceSettings,
} from '../../../components/shared-settings/settings'
import { useValueRef } from '../../../utils/hooks/useValueRef'

import EnhancedEncryptionIcon from '@material-ui/icons/EnhancedEncryption'
import NoEncryptionIcon from '@material-ui/icons/NoEncryption'
import NightsStay from '@material-ui/icons/NightsStay'
import MemoryOutlinedIcon from '@material-ui/icons/MemoryOutlined'
import WallpaperOutlinedIcon from '@material-ui/icons/WallpaperOutlined'
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser'
import ArchiveOutlinedIcon from '@material-ui/icons/ArchiveOutlined'
import UnarchiveOutlinedIcon from '@material-ui/icons/UnarchiveOutlined'
import TabIcon from '@material-ui/icons/Tab'
import PaletteIcon from '@material-ui/icons/Palette'
import LanguageIcon from '@material-ui/icons/Language'
import DashboardRouterContainer from './Container'
import { useI18N } from '../../../utils/i18n-next-ui'
import { merge, cloneDeep } from 'lodash-es'
import { useModal } from '../Dialog/Base'
import { DashboardDatabaseBackupDialog, DashboardDatabaseRestoreDialog } from '../Dialog/Database'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.paper,
        },
        title: {
            fontWeight: 'normal',
            lineHeight: '30px',
            marginBottom: theme.spacing(1.5),
        },
        section: {
            padding: '26px 40px',
            margin: theme.spacing(3, 0),
        },
    }),
)

const settingsTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        wrapper: {
            padding: '0 24px',
        },
        typography: {
            body1: {
                lineHeight: 1.75,
            },
        },
        overrides: {
            MuiPaper: {
                rounded: {
                    borderRadius: '12px',
                },
            },
            MuiCard: {
                root: {
                    overflow: 'visible',
                },
            },
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
                    color: theme.palette.text,
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

export default function DashboardSettingsRouter() {
    const { t } = useI18N()
    const currentLang = useValueRef(languageSettings)
    const currentApperance = useValueRef(appearanceSettings)
    const langMapper = React.useRef((x: Language) => {
        if (x === Language.en) return 'English'
        if (x === Language.zh) return '中文'
        return ''
    }).current
    const apperanceMapper = React.useRef((x: Appearance) => {
        if (x === Appearance.dark) return t('settings_appearance_dark')
        if (x === Appearance.light) return t('settings_appearance_light')
        return t('settings_appearance_default')
    }).current
    const classes = useStyles()
    const shadowRoot = useValueRef(renderInShadowRootSettings)
    const theme = useTheme()
    const elevation = theme.palette.type === 'dark' ? 1 : 0

    const [backupDatabase, openBackupDatabase] = useModal(DashboardDatabaseBackupDialog)
    const [restoreDatabase, openRestoreDatabase] = useModal(DashboardDatabaseRestoreDialog)

    return (
        <DashboardRouterContainer title={t('settings')}>
            <div className="wrapper">
                <ThemeProvider theme={settingsTheme}>
                    <Paper component="section" className={classes.section} elevation={elevation}>
                        <Typography className={classes.title} variant="h6" color="textPrimary">
                            {t('general')}
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
                                <SettingsUIEnum
                                    secondary={apperanceMapper(currentApperance)}
                                    enumObject={Appearance}
                                    getText={apperanceMapper}
                                    icon={<PaletteIcon />}
                                    value={appearanceSettings}
                                />
                            </List>
                        </Card>
                    </Paper>
                    <Paper component="section" className={classes.section} elevation={elevation}>
                        <Typography className={classes.title} variant="h6" color="textPrimary">
                            {t('advanced_options')}
                        </Typography>
                        <Card elevation={0}>
                            <List disablePadding>
                                <SettingsUI icon={<TabIcon />} value={disableOpenNewTabInBackgroundSettings} />
                                {/* This feature is not ready for iOS */}
                                {webpackEnv.target !== 'WKWebview' ? (
                                    <SettingsUI
                                        icon={shadowRoot ? <EnhancedEncryptionIcon /> : <NoEncryptionIcon />}
                                        value={renderInShadowRootSettings}
                                    />
                                ) : null}
                                <SettingsUI icon={<MemoryOutlinedIcon />} value={debugModeSetting} />
                            </List>
                        </Card>
                    </Paper>
                    <Paper component="section" className={classes.section} elevation={elevation}>
                        <Typography className={classes.title} variant="h6" color="textPrimary">
                            {t('database_management')}
                        </Typography>
                        <Card elevation={0}>
                            <List disablePadding>
                                <SettingsUIDummy
                                    icon={<UnarchiveOutlinedIcon />}
                                    primary={t('backup_database')}
                                    secondary={t('dashboard_backup_database_hint')}
                                    onClick={openBackupDatabase}
                                />
                                <SettingsUIDummy
                                    icon={<ArchiveOutlinedIcon />}
                                    primary={t('restore_database')}
                                    secondary={t('dashboard_import_database_hint')}
                                    onClick={openRestoreDatabase}
                                />
                            </List>
                        </Card>
                        {backupDatabase}
                        {restoreDatabase}
                    </Paper>
                </ThemeProvider>
            </div>
        </DashboardRouterContainer>
    )
}
