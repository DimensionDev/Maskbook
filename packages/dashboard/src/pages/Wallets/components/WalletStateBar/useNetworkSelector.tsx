import { MenuItem, Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { SuccessIcon } from '@masknet/icons'
import { useMenu, WalletIcon } from '@masknet/shared'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import {
    useChainId,
    useNetworkDescriptors,
    useProviderDescriptor,
    useWeb3State,
    useWeb3UI,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import { useCallback } from 'react'

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

    const currentChainId = useChainId()
    const providerDescriptor = useProviderDescriptor() as Web3Helper.ProviderDescriptorAll
    const networkDescriptors = useNetworkDescriptors() as Web3Helper.NetworkDescriptorAll[]
    const Web3UI = useWeb3UI() as Web3Helper.Web3UIAll
    const { NetworkIconClickBait } = Web3UI.SelectNetworkMenu ?? {}
    const { Connection } = useWeb3State(pluginID) as Web3Helper.Web3StateAll

    const onConnect = useCallback(
        async (chainId: Web3Helper.ChainIdAll) => {
            if (!chainId || !Connection) throw new Error('Failed to connect to provider.')
            const connection = await Connection.getConnection?.({
                providerType: providerDescriptor.type,
            })
            if (!connection) throw new Error('Failed to build connection.')

            await connection.switchChain?.({ chainId })
        },
        [Connection, providerDescriptor],
    )

    return useMenu(
        ...(networkDescriptors
            ?.filter((x) => x.isMainnet)
            .map((network) => {
                const menuItem = (
                    <MenuItem
                        sx={{ mx: 2, py: 1 }}
                        classes={{ root: classes.item }}
                        key={network.ID}
                        onClick={() => onConnect(network.chainId)}>
                        <Stack direction="row" gap={0.5} alignItems="center">
                            <Stack justifyContent="center" width={18}>
                                {network.chainId === currentChainId && <SuccessIcon sx={{ fontSize: 18 }} />}
                            </Stack>
                            <Stack justifyContent="center" alignItems="center" width={30}>
                                <WalletIcon networkIcon={network.icon} size={30} />
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
