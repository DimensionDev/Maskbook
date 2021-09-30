import { useRef } from 'react'
import { Typography, Card, List, Paper, ListItemText, ListItemIcon } from '@material-ui/core'
import ListItemButton from '@material-ui/core/ListItemButton'
import { ThemeProvider, useTheme } from '@material-ui/core/styles'
import { makeStyles } from '@masknet/theme'
import { Appearance } from '@masknet/theme'
import { LanguageOptions } from '@masknet/public-api'
import { getEnumAsObject, useValueRef } from '@masknet/shared'
import { getChainName, ChainId, ProviderType, useAccount, PortfolioProvider } from '@masknet/web3-shared'

import { useMatchXS, extendsTheme, useI18N, Flags } from '../../../utils'
import { SettingsUI, SettingsUIEnum, SettingsUIDummy } from '../../../components/shared-settings/useSettingsUI'
import {
    debugModeSetting,
    languageSettings,
    allPostReplacementSettings,
    appearanceSettings,
    launchPageSettings,
    newDashboardConnection,
} from '../../../settings/settings'
import { LaunchPage } from '../../../settings/types'

import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet'
import TrendingUpIcon from '@material-ui/icons/TrendingUp'
import SwapHorizIcon from '@material-ui/icons/SwapHoriz'
import MemoryOutlinedIcon from '@material-ui/icons/MemoryOutlined'
import ArchiveOutlinedIcon from '@material-ui/icons/ArchiveOutlined'
import UnarchiveOutlinedIcon from '@material-ui/icons/UnarchiveOutlined'
import FlipToFrontIcon from '@material-ui/icons/FlipToFront'
import PaletteIcon from '@material-ui/icons/Palette'
import LanguageIcon from '@material-ui/icons/Language'
import WifiIcon from '@material-ui/icons/Wifi'
import LaunchIcon from '@material-ui/icons/Launch'
import NewIcon from '@material-ui/icons/NewReleases'

import DashboardRouterContainer from './Container'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardBackupDialog, DashboardRestoreDialog } from '../DashboardDialogs/Backup'
import { currentDataProviderSettings, currentTradeProviderSettings } from '../../../plugins/Trader/settings'
import { resolveDataProviderName, resolveTradeProviderName } from '../../../plugins/Trader/pipes'
import { resolvePortfolioDataProviderName } from '../../../plugins/Wallet/pipes'
import {
    currentPortfolioDataProviderSettings,
    currentChainIdSettings,
    currentProviderSettings,
} from '../../../plugins/Wallet/settings'
import { useAvailableTraderProviders } from '../../../plugins/Trader/trending/useAvailableTraderProviders'
import { useAvailableDataProviders } from '../../../plugins/Trader/trending/useAvailableDataProviders'
import { useCurrentTradeProvider } from '../../../plugins/Trader/trending/useCurrentTradeProvider'
import { useCurrentDataProvider } from '../../../plugins/Trader/trending/useCurrentDataProvider'
import { DataProvider, TradeProvider } from '@masknet/public-api'
import { safeUnreachable } from '@dimensiondev/kit'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
    },
    title: {
        fontWeight: 'normal',
        lineHeight: '30px',
        marginBottom: theme.spacing(1.5),
        [theme.breakpoints.down('sm')]: {
            marginBottom: 0,
        },
    },
    section: {
        padding: '26px 40px',
        margin: theme.spacing(3, 0),
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(2),
        },
    },
    secondaryAction: {
        paddingRight: 90,
    },
    list: {
        [theme.breakpoints.down('sm')]: {
            marginLeft: theme.spacing(-2),
            marginRight: theme.spacing(-2),
        },
    },
    listItemRoot: {
        paddingTop: theme.spacing(1.5),
        paddingBottom: theme.spacing(1.5),
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    listItemIcon: {
        color: theme.palette.text.primary,
        justifyContent: 'flex-start',
        minWidth: 'unset',
        marginLeft: 0,
        marginRight: theme.spacing(3),
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
}))

const settingsTheme = extendsTheme((theme) => ({
    wrapper: {
        padding: theme.spacing(0, 3),
    },
    typography: {
        body1: {
            lineHeight: 1.75,
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                rounded: {
                    borderRadius: 12,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    overflow: 'visible',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                input: {
                    paddingTop: theme.spacing(1),
                    paddingBottom: theme.spacing(1),
                },
            },
        },
    },
}))

export default function DashboardSettingsRouter() {
    const { t } = useI18N()
    const isMobile = useMatchXS()
    const notReadyLanguages = [
        LanguageOptions.esES,
        LanguageOptions.zhCN,
        LanguageOptions.faIR,
        LanguageOptions.ruRU,
        LanguageOptions.itIT,
        LanguageOptions.frFR,
    ]
    const langMapper = useRef((x: LanguageOptions) => {
        /* spell-checker: disable */
        if (x === LanguageOptions.enUS) return 'English'
        if (x === LanguageOptions.zhTW) return '正體中文'
        if (x === LanguageOptions.zhCN) return '简体中文'
        if (x === LanguageOptions.koKR) return '한국인'
        if (x === LanguageOptions.jaJP) return '日本語'
        if (x === LanguageOptions.itIT) return 'lingua italiana'
        if (x === LanguageOptions.esES) return 'lengua española'
        if (x === LanguageOptions.ruRU) return 'русский язык'
        if (x === LanguageOptions.frFR) return 'langue française'
        if (x === LanguageOptions.faIR) return 'زبان فارسی'
        if (x === LanguageOptions.__auto__) return t('language_auto')
        /* spell-checker: enable */
        safeUnreachable(x)
        return x
    }).current
    const appearanceMapper = useRef((x: Appearance) => {
        if (x === Appearance.dark) return t('settings_appearance_dark')
        if (x === Appearance.light) return t('settings_appearance_light')
        return t('settings_appearance_default')
    }).current
    const launchPageMapper = useRef((x: LaunchPage) => {
        if (x === LaunchPage.facebook) return 'Facebook'
        if (x === LaunchPage.twitter) return 'Twitter'
        return t('dashboard')
    }).current

    const { classes } = useStyles()
    const theme = useTheme()
    const elevation = theme.palette.mode === 'dark' ? 1 : 0

    const account = useAccount()
    const providerType = useValueRef(currentProviderSettings)

    const [backupDialog, openBackupDialog] = useModal(DashboardBackupDialog)
    const [restoreDialog, openRestoreDialog] = useModal(DashboardRestoreDialog)

    const listStyle = {
        secondaryAction: classes.secondaryAction,
        listItemRoot: classes.listItemRoot,
        listItemIcon: classes.listItemIcon,
    }
    const history = useHistory()

    //#region the trader plugin
    const { value: dataProviders = [] } = useAvailableDataProviders()
    const { value: tradeProviders = [] } = useAvailableTraderProviders()
    const dataProvider = useCurrentDataProvider(dataProviders)
    const tradeProvider = useCurrentTradeProvider()
    //#endregion

    return (
        <DashboardRouterContainer title={t('settings')}>
            <ThemeProvider theme={settingsTheme}>
                <div className="wrapper">
                    <Paper component="section" className={classes.section} elevation={elevation}>
                        <Typography className={classes.title} variant="h6" color="textPrimary">
                            {t('settings_title_general')}
                        </Typography>
                        <Card elevation={0}>
                            <List className={classes.list} disablePadding>
                                {Flags.v2_enabled && (
                                    <ListItemButton onClick={() => (location.href = '/next.html')}>
                                        <ListItemIcon children={<NewIcon />} />
                                        <ListItemText
                                            primary="Open new dashboard (integrated) (dev-only)"
                                            secondary="/packages/dashboard/"
                                        />
                                    </ListItemButton>
                                )}
                                <SettingsUIEnum
                                    classes={listStyle}
                                    enumObject={LanguageOptions}
                                    ignoredItems={process.env.build !== 'stable' ? [] : notReadyLanguages}
                                    getText={langMapper}
                                    icon={<LanguageIcon />}
                                    value={languageSettings}
                                />
                                <SettingsUIEnum
                                    classes={listStyle}
                                    enumObject={Appearance}
                                    getText={appearanceMapper}
                                    icon={<PaletteIcon />}
                                    value={appearanceSettings}
                                />
                                {Flags.support_eth_network_switch &&
                                account &&
                                providerType === ProviderType.MaskWallet ? (
                                    <SettingsUIEnum
                                        classes={listStyle}
                                        enumObject={ChainId}
                                        getText={getChainName}
                                        icon={<WifiIcon />}
                                        value={currentChainIdSettings}
                                    />
                                ) : null}
                                {tradeProviders.length ? (
                                    <SettingsUIEnum
                                        classes={listStyle}
                                        enumObject={getEnumAsObject(tradeProviders, (v) => TradeProvider[v])}
                                        getText={resolveTradeProviderName}
                                        icon={<TrendingUpIcon />}
                                        value={currentTradeProviderSettings}
                                        SelectProps={{
                                            value: tradeProvider,
                                        }}
                                    />
                                ) : null}
                                {dataProviders.length ? (
                                    <SettingsUIEnum
                                        classes={listStyle}
                                        enumObject={getEnumAsObject(dataProviders, (v) => DataProvider[v])}
                                        getText={resolveDataProviderName}
                                        icon={<SwapHorizIcon />}
                                        value={currentDataProviderSettings}
                                        SelectProps={{
                                            value: dataProvider,
                                        }}
                                    />
                                ) : null}
                                <SettingsUIEnum
                                    classes={listStyle}
                                    enumObject={PortfolioProvider}
                                    getText={resolvePortfolioDataProviderName}
                                    icon={<AccountBalanceWalletIcon />}
                                    value={currentPortfolioDataProviderSettings}
                                />
                                {isMobile ? (
                                    <SettingsUIEnum
                                        classes={listStyle}
                                        enumObject={LaunchPage}
                                        getText={launchPageMapper}
                                        icon={<LaunchIcon />}
                                        value={launchPageSettings}
                                    />
                                ) : null}
                            </List>
                        </Card>
                    </Paper>

                    <Paper component="section" className={classes.section} elevation={elevation}>
                        <Typography className={classes.title} variant="h6" color="textPrimary">
                            {t('settings_title_advanced_options')}
                        </Typography>
                        <Card elevation={0}>
                            <List className={classes.list} disablePadding>
                                <SettingsUI
                                    classes={listStyle}
                                    icon={<MemoryOutlinedIcon />}
                                    value={debugModeSetting}
                                />
                                <SettingsUI
                                    classes={listStyle}
                                    icon={<FlipToFrontIcon />}
                                    value={allPostReplacementSettings}
                                />
                                {process.env.NODE_ENV === 'development' || process.env.build !== 'stable' ? (
                                    <SettingsUI
                                        classes={listStyle}
                                        icon={<MemoryOutlinedIcon />}
                                        value={newDashboardConnection}
                                    />
                                ) : null}
                            </List>
                        </Card>
                    </Paper>

                    <Paper component="section" className={classes.section} elevation={elevation}>
                        <Typography className={classes.title} variant="h6" color="textPrimary">
                            {t('settings_title_database_management')}
                        </Typography>
                        <Card elevation={0}>
                            <List className={classes.list} disablePadding>
                                <SettingsUIDummy
                                    classes={listStyle}
                                    icon={<UnarchiveOutlinedIcon />}
                                    primary={t('backup_database')}
                                    secondary={t('dashboard_backup_database_hint')}
                                    onClick={openBackupDialog}
                                />
                                <SettingsUIDummy
                                    classes={listStyle}
                                    icon={<ArchiveOutlinedIcon />}
                                    primary={t('restore_database')}
                                    secondary={t('dashboard_import_database_hint')}
                                    onClick={openRestoreDialog}
                                />
                            </List>
                        </Card>
                        {backupDialog}
                        {restoreDialog}
                    </Paper>
                </div>
            </ThemeProvider>
        </DashboardRouterContainer>
    )
}
