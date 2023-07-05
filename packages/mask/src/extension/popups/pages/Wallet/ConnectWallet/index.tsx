import urlcat from 'urlcat'
import React, { memo, useCallback } from 'react'
import { useMount } from 'react-use'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ExtensionSite, PopupRoutes, NetworkPluginID } from '@masknet/shared-base'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { useWeb3UI, useWallets } from '@masknet/web3-hooks-base'
import { getRegisteredWeb3Networks, getRegisteredWeb3Providers } from '@masknet/plugin-infra'
import { Web3 } from '@masknet/web3-providers'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/index.js'
import { PopupContext } from '../../../hook/usePopupContext.js'
import { useWalletLockStatus } from '../hooks/useWalletLockStatus.js'
import Services from '../../../../service.js'

const useStyles = makeStyles()((theme) => ({
    box: {
        height: 'calc(100% - 50px)',
        background: '#F7F9FA',
    },
    container: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: 12,
        rowGap: 16,
        padding: '16px',
        boxSizing: 'border-box',
    },
    walletItem: {
        cursor: 'pointer',
        background: '#fff',
        width: 'calc( 50% - 6px )',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '12px 0',
        boxSizing: 'content-box',
        height: 'fit-content',
    },
    walletIcon: {
        width: '30px',
        height: '30px',
    },
    walletName: {
        fontSize: 12,
        fontWeight: 700,
        color: 'rgba(118, 127, 141, 1)',
    },
}))

const ConnectWalletPage = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { setSigned } = PopupContext.useContainer()
    const wallets = useWallets()
    const { isLocked, loading: getLockStatusLoading } = useWalletLockStatus()
    // connect to ethereum mainnet
    const network = getRegisteredWeb3Networks().find(
        (x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM && x.chainId === ChainId.Mainnet,
    ) as Web3Helper.Web3NetworkDescriptor<NetworkPluginID.PLUGIN_EVM> | undefined
    const providers = getRegisteredWeb3Providers().filter(
        (x) => x.providerAdaptorPluginID === NetworkPluginID.PLUGIN_EVM,
    ) as Array<Web3Helper.Web3ProviderDescriptor<NetworkPluginID.PLUGIN_EVM>>

    const { ProviderIconClickBait } = useWeb3UI(NetworkPluginID.PLUGIN_EVM).SelectProviderDialog ?? {}

    const onClick = useCallback(
        async (
            network: Web3Helper.Web3NetworkDescriptor<NetworkPluginID.PLUGIN_EVM>,
            provider: Web3Helper.Web3ProviderDescriptor<NetworkPluginID.PLUGIN_EVM>,
        ) => {
            if (provider.type === ProviderType.MaskWallet) {
                await Web3.disconnect({
                    providerType: ProviderType.MaskWallet,
                })

                if (isLocked && !getLockStatusLoading) {
                    navigate(urlcat(PopupRoutes.Unlock, { from: PopupRoutes.SelectWallet, goBack: true, popup: true }))
                    return
                }

                if (!wallets.length) {
                    await Services.Helper.openWalletStartUpWindow({
                        toBeClose: 1,
                    })
                    return
                }

                navigate(
                    urlcat(PopupRoutes.SelectWallet, {
                        popup: true,
                    }),
                )
            } else {
                const chainId = await Web3.getChainId()
                const account = await Web3.connect({ chainId, providerType: provider.type })

                navigate(PopupRoutes.VerifyWallet, {
                    state: {
                        ...account,
                        providerType: provider.type,
                    },
                })
            }
        },
        [isLocked, getLockStatusLoading, wallets.length],
    )
    useTitle(t('plugin_wallet_on_connect'))

    useMount(() => {
        setSigned(false)
    })
    if (!network) return null

    const createProvider = (
        provider: Web3Helper.Web3ProviderDescriptor<NetworkPluginID.PLUGIN_EVM>,
        options?: {
            onClick: () => void
        },
    ) => {
        return (
            <div className={classes.walletItem} onClick={options?.onClick}>
                <img src={provider.icon.toString()} className={classes.walletIcon} />
                <Typography className={classes.walletName}>{provider.name}</Typography>
            </div>
        )
    }

    return (
        <div className={classes.box}>
            <div className={classes.container}>
                {providers
                    .filter((x) => (x.enableRequirements?.supportedExtensionSites ?? []).includes(ExtensionSite.Popup))
                    .map((provider) => {
                        return ProviderIconClickBait ? (
                            <ProviderIconClickBait key={provider.ID} provider={provider} onClick={onClick}>
                                {createProvider(provider)}
                            </ProviderIconClickBait>
                        ) : (
                            <React.Fragment key={provider.ID}>
                                {createProvider(provider, {
                                    onClick: () => onClick(network, provider),
                                })}
                            </React.Fragment>
                        )
                    })}
            </div>
        </div>
    )
})

export default ConnectWalletPage
