import urlcat from 'urlcat'
import { memo, useCallback } from 'react'
import { useMount } from 'react-use'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import {
    getRegisteredWeb3Networks,
    getRegisteredWeb3Providers,
    useWeb3UI,
    Web3Plugin,
} from '@masknet/plugin-infra/web3'
import { useTitle } from '../../../hook/useTitle'
import { useI18N } from '../../../../../utils'
import { PopupContext } from '../../../hook/usePopupContext'
import { NetworkPluginID } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    box: {
        height: 'calc( 100% - 50px )',
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
        fontFamily: 'Helvetica',
        fontWeight: 700,
        color: 'rgba(118, 127, 141, 1)',
    },
}))

const ConnectWalletPage = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const navigate = useNavigate()

    const { setSigned } = PopupContext.useContainer()

    // connect to ethereum mainnet
    const network = getRegisteredWeb3Networks().find(
        (x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM && x.chainId === ChainId.Mainnet,
    )
    const providers = getRegisteredWeb3Providers().filter(
        (x) => x.providerAdaptorPluginID === NetworkPluginID.PLUGIN_EVM,
    )
    const { ProviderIconClickBait } = useWeb3UI(NetworkPluginID.PLUGIN_EVM).SelectProviderDialog ?? {}

    const onClick = useCallback((network: Web3Plugin.NetworkDescriptor, provider: Web3Plugin.ProviderDescriptor) => {
        if (provider.type !== ProviderType.MaskWallet) return
        navigate(
            urlcat(PopupRoutes.SelectWallet, {
                popup: true,
            }),
        )
    }, [])

    const onSubmit = useCallback(
        async (
            network: Web3Plugin.NetworkDescriptor,
            provider: Web3Plugin.ProviderDescriptor,
            result?: Web3Plugin.ConnectionResult,
        ) => {
            navigate(PopupRoutes.VerifyWallet, {
                state: result,
            })
        },
        [],
    )

    useTitle(t('plugin_wallet_on_connect'))

    useMount(() => {
        setSigned(false)
    })
    if (!network) return null

    return (
        <div className={classes.box}>
            <div className={classes.container}>
                {providers.map((provider) => {
                    return ProviderIconClickBait ? (
                        <ProviderIconClickBait
                            key={provider.ID}
                            network={network}
                            provider={provider}
                            onClick={onClick}
                            onSubmit={onSubmit}>
                            <div className={classes.walletItem}>
                                <img src={provider.icon.toString()} className={classes.walletIcon} />
                                <Typography className={classes.walletName}>{provider.name}</Typography>
                            </div>
                        </ProviderIconClickBait>
                    ) : (
                        <div className={classes.walletItem} key={provider.ID}>
                            <img src={provider.icon.toString()} className={classes.walletIcon} />
                            <Typography className={classes.walletName}>{provider.name}</Typography>
                        </div>
                    )
                })}
            </div>
        </div>
    )
})

export default ConnectWalletPage
