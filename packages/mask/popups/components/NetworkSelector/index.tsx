import { memo, useCallback, useMemo } from 'react'
import { Box, MenuItem, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { ChainId, NetworkType, SchemaType } from '@masknet/web3-shared-evm'
import { useChainContext, useNetworks, useWeb3State } from '@masknet/web3-hooks-base'
import { ImageIcon, NetworkIcon, TRADER_WEB3_CONFIG, useMenuConfig } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import type { ReasonableNetwork } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { first } from 'lodash-es'

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
    title: {
        color: '#ffffff',
        fontSize: 12,
        lineHeight: '16px',
        marginLeft: 4,
    },
    menu: {
        maxHeight: 466,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

export const NetworkSelector = memo(() => {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM)
    const { Network } = useWeb3State(NetworkPluginID.PLUGIN_EVM)

    const chainIdList = TRADER_WEB3_CONFIG[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? []

    const actualNetworks = useMemo(
        () => networks.filter((x) => chainIdList.includes(x.chainId)),
        [networks, chainIdList],
    )

    const onChainChange = useCallback(
        async (network: ReasonableNetwork<ChainId, SchemaType, NetworkType>) => {
            await Network?.switchNetwork(network.ID)
            await EVMWeb3.switchChain?.(network.chainId)
        },
        [Network, EVMWeb3],
    )

    return (
        <NetworkSelectorUI
            currentNetwork={actualNetworks.find((x) => x.chainId === chainId) ?? first(actualNetworks)}
            onChainChange={onChainChange}
            networks={actualNetworks}
        />
    )
})

interface NetworkSelectorUIProps {
    currentNetwork?: ReasonableNetwork<ChainId, SchemaType, NetworkType>
    networks: Array<ReasonableNetwork<ChainId, SchemaType, NetworkType>>
    onChainChange: (network: ReasonableNetwork<ChainId, SchemaType, NetworkType>) => void
}

const NetworkSelectorUI = memo<NetworkSelectorUIProps>(({ currentNetwork, onChainChange, networks }) => {
    const { classes } = useStyles()

    const [menu, openMenu] = useMenuConfig(
        networks.map((network) => {
            const chainId = network.chainId

            return (
                <MenuItem
                    key={chainId}
                    onClick={() => onChainChange(network)}
                    selected={chainId === currentNetwork?.chainId}>
                    {network.iconUrl ?
                        <ImageIcon size={20} icon={network.iconUrl} name={network.name} />
                    :   <NetworkIcon
                            pluginID={NetworkPluginID.PLUGIN_EVM}
                            chainId={network.chainId}
                            size={20}
                            network={network}
                        />
                    }

                    <Typography sx={{ marginLeft: 1 }}>{network.name}</Typography>
                </MenuItem>
            )
        }) ?? [],
        {
            classes: { paper: classes.menu },
        },
    )

    if (!currentNetwork) return
    return (
        <>
            <Box className={classes.root} onClick={openMenu}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {currentNetwork.iconUrl ?
                        <ImageIcon size={20} icon={currentNetwork.iconUrl} name={currentNetwork.name} />
                    :   <NetworkIcon
                            pluginID={NetworkPluginID.PLUGIN_EVM}
                            chainId={currentNetwork.chainId}
                            size={20}
                            network={currentNetwork}
                        />
                    }
                    <Typography className={classes.title}>{currentNetwork?.name}</Typography>
                </div>
                <Icons.ArrowDownRound size={16} color="#fff" />
            </Box>
            {menu}
        </>
    )
})
