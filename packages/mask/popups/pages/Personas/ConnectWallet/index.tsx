import { Icons } from '@masknet/icons'
import { FormattedAddress, PopupHomeTabType } from '@masknet/shared'
import { PopupModalRoutes, PopupRoutes, type NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext, useNetworkContext, useReverseAddress, useWallets } from '@masknet/web3-hooks-base'
import { EVMExplorerResolver, EVMProviderResolver, EVMWeb3 } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatDomainName, formatEthereumAddress, ProviderType } from '@masknet/web3-shared-evm'
import { Box, Button, Link, Typography } from '@mui/material'
import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import urlcat from 'urlcat'

import Services from '#services'
import { Trans, useLingui } from '@lingui/react/macro'
import { BottomController } from '../../../components/BottomController/index.js'
import { useModalNavigate } from '../../../components/index.js'
import { useTitle } from '../../../hooks/index.js'
import { WalletAvatar } from '../../../components/WalletAvatar/index.js'

const useStyles = makeStyles()((theme) => ({
    provider: {
        background: theme.vars.palette.maskColor.bg,
        borderRadius: 8,
        padding: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    accountInfo: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
    },
    address: {
        color: theme.vars.palette.maskColor.second,
        fontSize: 10,
        lineHeight: '10px',
        display: 'flex',
        alignItems: 'center',
    },
    link: {
        color: theme.vars.palette.maskColor.second,
        height: 10,
    },
    description: {
        marginTop: theme.spacing(1.5),
        fontSize: 12,
        lineHeight: '16px',
        color: theme.vars.palette.maskColor.second,
    },
}))

export const Component = memo(function ConnectWalletPage() {
    const { t } = useLingui()

    const { classes } = useStyles()
    const navigate = useNavigate()
    const modalNavigate = useModalNavigate()

    const { pluginID } = useNetworkContext<NetworkPluginID.PLUGIN_EVM>()

    const { providerType, chainId, account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const wallets = useWallets()

    const { data: domain } = useReverseAddress(pluginID, account)

    const walletAlias = (() => {
        if (domain) return formatDomainName(domain)
        if (providerType !== ProviderType.MaskWallet) return `${EVMProviderResolver.providerName(providerType)} Wallet`
        return wallets.find((x) => isSameAddress(x.address, account))?.name ?? formatEthereumAddress(account, 4)
    })()

    const handleCancel = useCallback(async () => {
        if (providerType === ProviderType.MaskWallet || providerType === ProviderType.WalletConnect) {
            navigate(-1)
            return
        }
        // reset to MaskWallet after cancellation
        const maskAccount = wallets.some((x) => isSameAddress(x.address, account)) ? account : wallets[0].address
        await EVMWeb3.connect({
            providerType: ProviderType.MaskWallet,
            account: maskAccount,
        })
        await Services.Helper.removePopupWindow()
    }, [wallets, account, navigate, providerType])

    const handleChooseAnotherWallet = useCallback(() => {
        modalNavigate(PopupModalRoutes.SelectProvider)
    }, [modalNavigate])

    const handleDone = useCallback(async () => {
        if (providerType !== ProviderType.MaskWallet) await EVMWeb3.disconnect({ providerType })
        if (providerType === ProviderType.MaskWallet) {
            navigate(-1)
            return
        }
        if (providerType === ProviderType.WalletConnect) {
            navigate(urlcat(PopupRoutes.Personas, { tab: PopupHomeTabType.ConnectedWallets }), {
                replace: true,
            })
        }
        await Services.Helper.removePopupWindow()
    }, [providerType, navigate])

    const handleBack = useCallback(() => {
        navigate(urlcat(PopupRoutes.Personas, { tab: PopupHomeTabType.ConnectedWallets }), {
            replace: true,
        })
    }, [])

    useTitle(t`Connect Wallet`, handleBack)

    return (
        <Box sx={{ p: 2 }}>
            <Box className={classes.provider}>
                <Box className={classes.accountInfo}>
                    <WalletAvatar address={account} size={30} />
                    <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, lineHeight: '18px' }}>
                            {walletAlias}
                        </Typography>
                        <Typography className={classes.address}>
                            <FormattedAddress address={account} size={4} formatter={formatEthereumAddress} />
                            <Link
                                className={classes.link}
                                href={account ? EVMExplorerResolver.addressLink(chainId, account) : '#'}
                                target="_blank"
                                title={t`View on Explorer`}
                                rel="noopener noreferrer">
                                <Icons.LinkOut size={12} />
                            </Link>
                        </Typography>
                    </Box>
                </Box>
                <Button size="small" onClick={handleChooseAnotherWallet}>
                    <Trans>Change</Trans>
                </Button>
            </Box>
            <Typography className={classes.description}>
                <Trans>
                    Adding your wallets will allow you to own, view, and utilize your digital identities. Note that you
                    will be required to sign and authenticate the transaction to prove ownership of your wallet.
                </Trans>
            </Typography>
            <BottomController>
                <Button variant="outlined" fullWidth onClick={handleCancel}>
                    <Trans>Cancel</Trans>
                </Button>
                <ActionButton fullWidth onClick={handleDone}>
                    <Trans>Done</Trans>
                </ActionButton>
            </BottomController>
        </Box>
    )
})
