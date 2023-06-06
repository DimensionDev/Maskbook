import { useCallback } from 'react'
import { MenuItem, Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { useMenu, WalletIcon } from '@masknet/shared'
import type { NetworkPluginID } from '@masknet/shared-base'
import {
    useChainContext,
    useNetworkDescriptors,
    useProviderDescriptor,
    useWeb3Connection,
    useWeb3UI,
} from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'

const useStyles = makeStyles()((theme) => ({
    item: {
        minWidth: 130,
        paddingLeft: 8,
        paddingRight: 8,
        '&:first-child': {
            marginTop: '12px',
        },
        '&:last-child': {
            marginBottom: '12px',
        },
    },
}))

export const useNetworkSelector = (pluginID?: NetworkPluginID) => {
    const { classes } = useStyles()

    const { chainId } = useChainContext()
    const providerDescriptor = useProviderDescriptor()
    const networkDescriptors = useNetworkDescriptors()
    const Web3UI = useWeb3UI()
    const Web3 = useWeb3Connection(pluginID)
    const { NetworkIconClickBait } = Web3UI.SelectNetworkMenu ?? {}

    const onConnect = useCallback(
        async (chainId: Web3Helper.ChainIdAll) => {
            if (!chainId) throw new Error('Failed to connect to provider.')
            await Web3.switchChain?.(chainId, { providerType: providerDescriptor.type })
        },
        [Web3, providerDescriptor],
    )

    return useMenu(
        ...(networkDescriptors
            .filter((x) => x.isMainnet)
            .map((network) => {
                const menuItem = (
                    <MenuItem
                        sx={{ mx: 2, py: 1 }}
                        classes={{ root: classes.item }}
                        key={network.ID}
                        onClick={() => onConnect(network.chainId)}>
                        <Stack direction="row" gap={0.5} alignItems="center">
                            <Stack justifyContent="center" width={18}>
                                {network.chainId === chainId && <Icons.Success size={18} />}
                            </Stack>
                            <Stack justifyContent="center" alignItems="center" width={30}>
                                <WalletIcon mainIcon={network.icon} size={30} />
                            </Stack>
                            <Typography flex={1}>{network.name}</Typography>
                        </Stack>
                    </MenuItem>
                )

                return NetworkIconClickBait && providerDescriptor ? (
                    <NetworkIconClickBait network={network} provider={providerDescriptor}>
                        {menuItem}
                    </NetworkIconClickBait>
                ) : (
                    menuItem
                )
            }) ?? []),
    )
}
