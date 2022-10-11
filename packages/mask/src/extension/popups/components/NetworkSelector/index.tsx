import { memo, useCallback } from 'react'
import { Box, MenuItem, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Flags } from '../../../../../shared/index.js'
import { getRegisteredWeb3Networks } from '@masknet/plugin-infra'
import { ChainId, ProviderType, NetworkType } from '@masknet/web3-shared-evm'
import { useAccount, useChainId, useProviderType } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { currentMaskWalletAccountSettings } from '../../../../../shared/legacy-settings/wallet-settings.js'
import { ChainIcon, useMenuConfig, WalletIcon } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { WalletRPC } from '../../../../plugins/Wallet/messages.js'
import type { NetworkDescriptor } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'

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
        marginLeft: 4,
    },
    networkName: {
        marginLeft: 10,
    },
    menu: {
        maxHeight: 466,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

export const NetworkSelector = memo(() => {
    const networks = getRegisteredWeb3Networks().filter(
        (x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM,
    ) as Array<NetworkDescriptor<ChainId, NetworkType>>

    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const providerType = useProviderType(NetworkPluginID.PLUGIN_EVM)
    const onChainChange = useCallback(
        async (chainId: Web3Helper.Definition[NetworkPluginID.PLUGIN_EVM]['ChainId']) => {
            if (providerType === ProviderType.MaskWallet) {
                await WalletRPC.updateMaskAccount({ chainId })
            }
            return WalletRPC.updateMaskAccount({
                chainId,
                account: currentMaskWalletAccountSettings.value,
            })
        },
        [providerType, account],
    )

    return (
        <NetworkSelectorUI
            currentNetwork={networks.find((x) => x.chainId === chainId) ?? networks[0]}
            onChainChange={onChainChange}
            networks={networks}
        />
    )
})

export interface NetworkSelectorUIProps {
    currentNetwork: NetworkDescriptor<ChainId, NetworkType>
    networks: Array<NetworkDescriptor<ChainId, NetworkType>>
    onChainChange: (chainId: ChainId) => void
}

export const NetworkSelectorUI = memo<NetworkSelectorUIProps>(({ currentNetwork, onChainChange, networks }) => {
    const { classes } = useStyles()

    const [menu, openMenu] = useMenuConfig(
        networks
            ?.filter((x) => x.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM)
            .filter((x) => (Flags.support_testnet_switch ? true : x.isMainnet))
            .map((network) => {
                const chainId = network.chainId

                return (
                    <MenuItem
                        key={chainId}
                        onClick={() => onChainChange(chainId)}
                        selected={chainId === currentNetwork.chainId}>
                        {network.isMainnet ? (
                            <WalletIcon size={20} mainIcon={network.icon} />
                        ) : Flags.support_testnet_switch ? (
                            <ChainIcon color={network.iconColor} />
                        ) : null}
                        <Typography sx={{ marginLeft: 1 }}>{network.name}</Typography>
                    </MenuItem>
                )
            }) ?? [],
        {
            classes: { paper: classes.menu },
        },
    )

    return (
        <>
            <Box className={classes.root} onClick={openMenu}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {currentNetwork.isMainnet ? (
                        <WalletIcon size={20} mainIcon={currentNetwork.icon} />
                    ) : (
                        <div className={classes.iconWrapper}>
                            <ChainIcon color={currentNetwork.iconColor} />
                        </div>
                    )}
                    <Typography className={classes.title}>{currentNetwork.name}</Typography>
                </div>
                <Icons.ArrowDownRound size={16} color="#fff" />
            </Box>
            {menu}
        </>
    )
})
