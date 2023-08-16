import { SelectNetworkSidebar } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useFungibleAssets, useNetworks, useWallet } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Box, List, type BoxProps } from '@mui/material'
import { memo, useMemo, useState } from 'react'
import { TokenItem, type TokenItemProps } from './TokenItem.js'

const useStyles = makeStyles()((theme) => {
    return {
        picker: {
            display: 'flex',
            gap: theme.spacing(0.5),
            flexDirection: 'row',
            overflow: 'auto',
        },
        sidebar: {
            paddingRight: theme.spacing(1),
        },
        list: {
            overflow: 'auto',
            width: '100%',
        },
    }
})

export interface TokenPickerProps extends Omit<BoxProps, 'onSelect'>, Pick<TokenItemProps, 'onSelect'> {
    defaultChainId?: ChainId
    chainId?: ChainId
    address?: string
}

export const TokenPicker = memo(function TokenPicker({
    defaultChainId,
    chainId,
    address,
    className,
    onSelect,
    ...rest
}: TokenPickerProps) {
    const { classes, cx } = useStyles()
    const { data: assets = EMPTY_LIST } = useFungibleAssets(NetworkPluginID.PLUGIN_EVM, undefined, {
        chainId,
    })
    const [sidebarChainId, setSidebarChainId] = useState<Web3Helper.ChainIdAll | undefined>(defaultChainId)
    const availableAssets = useMemo(() => {
        if (!sidebarChainId) return assets
        return assets.filter((x) => x.chainId === sidebarChainId)
    }, [assets, sidebarChainId])

    const isSmartPay = !!useWallet(NetworkPluginID.PLUGIN_EVM)?.owner
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM, true)
    const filteredNetworks = useMemo(() => {
        if (isSmartPay) return networks.filter((x) => x.chainId === ChainId.Matic && !x.isCustomized)
        return networks
    }, [networks, isSmartPay])

    return (
        <Box className={cx(classes.picker, className)} {...rest}>
            <SelectNetworkSidebar
                className={classes.sidebar}
                networks={filteredNetworks}
                pluginID={NetworkPluginID.PLUGIN_EVM}
                chainId={sidebarChainId}
                hideAllButton
                onChainChange={setSidebarChainId}
            />
            <List className={classes.list} data-hide-scrollbar>
                {availableAssets.map((asset) => {
                    const network = filteredNetworks.find((x) => x.chainId === asset.chainId)!
                    const selected = asset.chainId === chainId && isSameAddress(asset.address, address)
                    return (
                        <TokenItem
                            key={`${asset.chainId}.${asset.address}`}
                            asset={asset}
                            network={network}
                            selected={selected}
                            onSelect={onSelect}
                        />
                    )
                })}
            </List>
        </Box>
    )
})
