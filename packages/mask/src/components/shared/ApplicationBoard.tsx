import { Fragment, useState } from 'react'
import { makeStyles, getMaskColor } from '@masknet/theme'
import { Typography, useTheme, CircularProgress } from '@mui/material'
import { useChainId } from '@masknet/web3-shared-evm'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useCurrentWeb3NetworkPluginID, useAccount } from '@masknet/plugin-infra/web3'
import { getCurrentSNSNetwork } from '../../social-network-adaptor/utils'
import { activatedSocialNetworkUI } from '../../social-network'
import { useI18N } from '../../utils'
import { ApplicationSettingDialog } from './ApplicationSettingDialog'
import { Application, useUnListedApplicationList } from './ApplicationSettingPluginList'
import { currentPersonaIdentifier } from '../../settings/settings'
import { useValueRef } from '@masknet/shared-base-ui'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        applicationWrapper: {
            marginTop: theme.spacing(0.5),
            paddingRight: 16,
            overflowY: 'scroll',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: '100px',
            gridGap: theme.spacing(1.5),
            justifyContent: 'space-between',
            height: 324,
            [smallQuery]: {
                overflow: 'auto',
                overscrollBehavior: 'contain',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridGap: theme.spacing(1),
            },
        },
        subTitle: {
            fontSize: 18,
            lineHeight: '24px',
            fontWeight: 600,
            color: theme.palette.text.primary,
        },
        loadingWrapper: {
            display: 'flex',
            height: 324,
            justifyContent: 'center',
            alignItems: 'center',
        },
        header: {
            display: 'flex',
            paddingRight: 16,
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 11.5,
        },
        settingIcon: {
            height: 24,
            width: 24,
            cursor: 'pointer',
        },
        placeholderWrapper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingRight: 24,
            height: 324,
        },
        placeholder: {
            color: getMaskColor(theme).textLight,
        },
    }
})

export function ApplicationBoard() {
    const { classes } = useStyles()
    const theme = useTheme()
    const { t } = useI18N()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const [openSettings, setOpenSettings] = useState(false)
    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor('any')
    const currentWeb3Network = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId()
    const account = useAccount()
    const currentSNSNetwork = getCurrentSNSNetwork(activatedSocialNetworkUI.networkIdentifier)
    const SettingIconDarkModeUrl = new URL('./assets/settings_dark_mode.png', import.meta.url).toString()
    const SettingIconLightModeUrl = new URL('./assets/settings_light_mode.png', import.meta.url).toString()
    const applicationList = snsAdaptorPlugins
        .reduce<Application[]>((acc, cur) => {
            if (!cur.ApplicationEntries) return acc
            const currentWeb3NetworkSupportedChainIds = cur.enableRequirement.web3?.[currentWeb3Network]
            const isWeb3Enabled = Boolean(
                currentWeb3NetworkSupportedChainIds === undefined ||
                    currentWeb3NetworkSupportedChainIds.supportedChainIds?.includes(chainId),
            )
            const isWalletConnectedRequired = currentWeb3NetworkSupportedChainIds !== undefined
            const currentSNSIsSupportedNetwork = cur.enableRequirement.networks.networks[currentSNSNetwork]
            const isSNSEnabled = currentSNSIsSupportedNetwork === undefined || currentSNSIsSupportedNetwork

            return acc.concat(
                cur.ApplicationEntries.map((x) => {
                    return {
                        entry: x,
                        enabled: isSNSEnabled && (account ? isWeb3Enabled : !isWalletConnectedRequired),
                        pluginId: cur.ID,
                    }
                }) ?? [],
            )
        }, [])
        .sort((a, b) => (a.entry.appBoardSortingDefaultPriority ?? 0) - (b.entry.appBoardSortingDefaultPriority ?? 0))
        .filter((x) => Boolean(x.entry.RenderEntryComponent))

    const { value, retry, loading } = useUnListedApplicationList(applicationList, currentIdentifier)
    const listedAppList = value?.listedAppList ?? applicationList
    return (
        <>
            <div className={classes.header}>
                <Typography className={classes.subTitle}>{t('applications')}</Typography>
                <img
                    src={theme.palette.mode === 'dark' ? SettingIconDarkModeUrl : SettingIconLightModeUrl}
                    className={classes.settingIcon}
                    onClick={() => setOpenSettings(true)}
                />
            </div>

            {loading ? (
                <div className={classes.loadingWrapper}>
                    <CircularProgress size={24} color="primary" sx={{ marginRight: 1 }} />
                </div>
            ) : listedAppList.length > 0 ? (
                <section className={classes.applicationWrapper}>
                    {listedAppList.map((X, i) => {
                        const RenderEntryComponent = X.entry.RenderEntryComponent!
                        return (
                            <Fragment key={i + X.pluginId}>
                                <RenderEntryComponentWrapper application={X} />
                            </Fragment>
                        )
                    })}
                </section>
            ) : (
                <div className={classes.placeholderWrapper}>
                    <Typography className={classes.placeholder}>
                        {t('application_settings_tab_plug_app-unlisted-placeholder')}
                    </Typography>
                </div>
            )}
            {openSettings ? (
                <ApplicationSettingDialog
                    open={openSettings}
                    onClose={() => {
                        setOpenSettings(false)
                        retry()
                    }}
                />
            ) : null}
        </>
    )
}

interface RenderEntryComponentWrapperProps {
    application: Application
}

function RenderEntryComponentWrapper({ application }: RenderEntryComponentWrapperProps) {
    const RenderEntryComponent = application.entry.RenderEntryComponent!
    const { t } = useI18N()
    return (
        <RenderEntryComponent
            disabled={!application.enabled}
            AppIcon={application.entry.AppIcon}
            title={
                application.entry.name.i18nKey
                    ? t(application.entry.name.i18nKey as unknown as Parameters<typeof t>[0])
                    : application.entry.name.fallback
            }
        />
    )
}
