import { memo, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import urlcat from 'urlcat'
import { getRegisteredWeb3Providers, EVMWeb3 } from '@masknet/web3-providers'
import { ExtensionSite, NetworkPluginID, PopupModalRoutes, PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { Box, Typography } from '@mui/material'
import { useWallets } from '@masknet/web3-hooks-base'
import Services from '#services'
import { useModalNavigate } from '../index.js'
import { PopupHomeTabType } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2,1fr)',
        gap: 16,
    },
    providerItem: {
        cursor: 'pointer',
        background: theme.palette.maskColor.bg,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: theme.spacing(1.5),
    },
    providerIcon: {
        width: 36,
        height: 36,
    },
    providerName: {
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
    },
}))

export const SelectProvider = memo(function SelectProvider() {
    const { classes } = useStyles()

    const wallets = useWallets()
    const navigate = useNavigate()
    const [params] = useSearchParams()

    const onlyMask = params.get('onlyMask')
    const providers = getRegisteredWeb3Providers(NetworkPluginID.PLUGIN_EVM)
    const modalNavigate = useModalNavigate()

    const onClick = useCallback(
        async (providerType: ProviderType) => {
            if (providerType === ProviderType.MaskWallet) {
                const hasWallets = wallets.filter((x) => !x.owner).length
                navigate(
                    hasWallets ?
                        urlcat(PopupRoutes.SelectWallet, {
                            setNFTAvatar: onlyMask ? true : undefined,
                            verifyWallet: !onlyMask ? true : undefined,
                            chainId: ChainId.Mainnet,
                        })
                    :   PopupRoutes.Wallet,
                )
                return
            } else if (providerType === ProviderType.WalletConnect) {
                const account = await EVMWeb3.connect({ providerType })

                // wallet connect has been connected
                if (account) {
                    navigate(PopupRoutes.ConnectWallet)
                    return
                }
            } else {
                if (await Services.Helper.hasPopupWindowOpened()) {
                    modalNavigate(PopupModalRoutes.ConnectProvider, { providerType })
                    return
                }

                await Services.Helper.openPopupWindow(
                    PopupRoutes.Personas,
                    { providerType, from: PopupModalRoutes.SelectProvider, tab: PopupHomeTabType.ConnectedWallets },
                    { bypassWalletLock: true },
                )

                return
            }
        },
        [wallets, onlyMask],
    )

    return (
        <Box className={classes.container}>
            {providers
                .filter((x) => {
                    if (onlyMask) {
                        return x.type === ProviderType.MaskWallet || x.type === ProviderType.WalletConnect
                    }

                    return (x.enableRequirements?.supportedExtensionSites ?? []).includes(ExtensionSite.Popup)
                })
                .map((provider) => {
                    return (
                        <div className={classes.providerItem} key={provider.ID} onClick={() => onClick(provider.type)}>
                            <img src={provider.icon} className={classes.providerIcon} />
                            <Typography className={classes.providerName}>{provider.name}</Typography>
                        </div>
                    )
                })}
        </Box>
    )
})
