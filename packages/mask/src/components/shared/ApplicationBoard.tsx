import { Fragment, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { Typography, useTheme } from '@mui/material'
import { useChainId } from '@masknet/web3-shared-evm'
import { useActivatedPluginsSNSAdaptor, useCurrentWeb3NetworkPluginID, Plugin, useAccount } from '@masknet/plugin-infra'
import { getCurrentSNSNetwork } from '../../social-network-adaptor/utils'
import { activatedSocialNetworkUI } from '../../social-network'
import { useI18N } from '../../utils'
import { ApplicationSettingDialog } from './ApplicationSettingDialog'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        applicationWrapper: {
            marginTop: theme.spacing(0.5),
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
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 11.5,
        },
        settingIcon: {
            height: 24,
            width: 24,
            cursor: 'pointer',
        },
    }
})

export function ApplicationBoard() {
    const { classes } = useStyles()
    const theme = useTheme()
    const { t } = useI18N()
    const [openSettings, setOpenSettings] = useState(false)
    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor('any')
    const currentWeb3Network = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId()
    const account = useAccount()
    const currentSNSNetwork = getCurrentSNSNetwork(activatedSocialNetworkUI.networkIdentifier)
    const SettingIconDarkModeUrl = new URL('./assets/settings_dark_mode.png', import.meta.url).toString()
    const SettingIconLightModeUrl = new URL('./assets/settings_light_mode.png', import.meta.url).toString()

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

            <section className={classes.applicationWrapper}>
                {snsAdaptorPlugins
                    .reduce<{ entry: Plugin.SNSAdaptor.ApplicationEntry; enabled: boolean; pluginId: string }[]>(
                        (acc, cur) => {
                            if (!cur.ApplicationEntries) return acc
                            const currentWeb3NetworkSupportedChainIds = cur.enableRequirement.web3?.[currentWeb3Network]
                            const isWeb3Enabled = Boolean(
                                currentWeb3NetworkSupportedChainIds === undefined ||
                                    currentWeb3NetworkSupportedChainIds.supportedChainIds?.includes(chainId),
                            )
                            const isWalletConnectedRequired = currentWeb3NetworkSupportedChainIds !== undefined
                            const currentSNSIsSupportedNetwork =
                                cur.enableRequirement.networks.networks[currentSNSNetwork]
                            const isSNSEnabled =
                                currentSNSIsSupportedNetwork === undefined || currentSNSIsSupportedNetwork

                            return acc.concat(
                                cur.ApplicationEntries.map((x) => {
                                    return {
                                        entry: x,
                                        enabled: isSNSEnabled && (account ? isWeb3Enabled : !isWalletConnectedRequired),
                                        pluginId: cur.ID,
                                    }
                                }) ?? [],
                            )
                        },
                        [],
                    )
                    .sort((a, b) => (a.entry.defaultSortingPriority ?? 0) - (b.entry.defaultSortingPriority ?? 0))
                    .filter((x) => Boolean(x.entry.RenderEntryComponent))
                    .map((X, i) => {
                        const RenderEntryComponent = X.entry.RenderEntryComponent!
                        return (
                            <Fragment key={i + X.pluginId}>
                                <RenderEntryComponent disabled={!X.enabled} AppIcon={X.entry.AppIcon} />
                            </Fragment>
                        )
                    })}
            </section>
            {openSettings ? (
                <ApplicationSettingDialog open={openSettings} onClose={() => setOpenSettings(false)} />
            ) : null}
        </>
    )
}
