import { memo, useCallback } from 'react'
import { Box, MenuItem, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Flags } from '../../../../utils'
import { ChainId, ProviderType, useAccount } from '@masknet/web3-shared-evm'
import { getRegisteredWeb3Networks, Web3Plugin } from '@masknet/plugin-infra'
import { currentMaskWalletChainIdSettings, currentProviderSettings } from '../../../../plugins/Wallet/settings'
import { ChainIcon, useMenu, useValueRef, WalletIcon } from '@masknet/shared'
import { ArrowDownRound } from '@masknet/icons'
import { WalletRPC } from '../../../../plugins/Wallet/messages'

const useStyles = makeStyles()((theme) => ({
    root: {
        minWidth: 140,
        backgroundColor: theme.palette.primary.main,
        padding: '4px 12px 4px 4px',
        minHeight: 28,
        borderRadius: 18,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconWrapper: {
        width: 20,
        height: 20,
        borderRadius: 20,
        marginRight: 10,
    },
    title: {
        color: '#ffffff',
        fontSize: 12,
        lineHeight: '16px',
    },
    arrow: {
        stroke: '#ffffff',
        fontSize: 16,
    },
    networkName: {
        marginLeft: 10,
    },
}))

export const NetworkSelector = memo(() => {
    const networks = getRegisteredWeb3Networks()
    const account = useAccount()
    const currentChainId = useValueRef(currentMaskWalletChainIdSettings)
    const currentProvider = useValueRef(currentProviderSettings)
    const onChainChange = useCallback(
        async (chainId: ChainId) => {
            if (currentProvider === ProviderType.MaskWallet) {
                await WalletRPC.updateAccount({
                    chainId,
                })
            }
            return WalletRPC.updateMaskAccount({
                chainId,
            })
        },
        [currentProvider, account],
    )

    return (
        <NetworkSelectorUI
            currentNetwork={networks.find((x) => x.chainId === currentChainId) ?? networks[0]}
            onChainChange={onChainChange}
            networks={networks}
        />
    )
})

export interface NetworkSelectorUIProps {
    currentNetwork: Web3Plugin.NetworkDescriptor
    networks: Web3Plugin.NetworkDescriptor[]
    onChainChange: (chainId: ChainId) => void
}

export const NetworkSelectorUI = memo<NetworkSelectorUIProps>(({ currentNetwork, onChainChange }) => {
    const { classes } = useStyles()
    const networks = getRegisteredWeb3Networks()
    const [menu, openMenu] = useMenu(
        ...(networks?.map((network) => {
            const chainId = network.chainId

            return (
                <MenuItem
                    key={chainId}
                    onClick={() => onChainChange(chainId)}
                    selected={chainId === currentNetwork.chainId}>
                    {network.isMainnet ? (
                        <WalletIcon size={16} networkIcon={network.icon} />
                    ) : Flags.support_eth_network_switch ? (
                        <ChainIcon color={network.iconColor} />
                    ) : null}
                    <Typography sx={{ marginLeft: 1 }}>{network.name}</Typography>
                </MenuItem>
            )
        }) ?? []),
    )

    return (
        <>
            <Box className={classes.root} onClick={openMenu}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {currentNetwork.isMainnet ? (
                        <WalletIcon size={16} networkIcon={currentNetwork.icon} />
                    ) : (
                        <div className={classes.iconWrapper}>
                            <ChainIcon color={currentNetwork.iconColor} />
                        </div>
                    )}
                    <Typography className={classes.title}>{currentNetwork.name}</Typography>
                </div>
                <ArrowDownRound className={classes.arrow} />
            </Box>
            {menu}
        </>
    )
})
