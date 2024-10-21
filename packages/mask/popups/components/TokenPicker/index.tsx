import { SelectNetworkSidebar } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useFungibleAssets, useNetworks, useWallet } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Box, List, type BoxProps } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { TokenItem, type TokenItemProps } from './TokenItem.js'
import { useOKXTokenList } from '@masknet/web3-hooks-evm'

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
    chains?: ChainId[]
    /** okx provides their own token list */
    assetSource?: 'standard' | 'okx'
    /** Do not allow to select other chains */
    lockChainId?: boolean
    onChainChange?: (chainId: Web3Helper.ChainIdAll | undefined) => void
}

export const TokenPicker = memo(function TokenPicker({
    defaultChainId,
    chainId,
    address,
    assetSource = 'standard',
    lockChainId = false,
    className,
    onSelect,
    onChainChange,
    ...rest
}: TokenPickerProps) {
    const { classes, cx } = useStyles()
    const [standardAssets] = useFungibleAssets(NetworkPluginID.PLUGIN_EVM, undefined, {
        chainId,
    })
    const { data: okxTokens } = useOKXTokenList(chainId as ChainId, assetSource === 'okx')
    const okxAssets = useMemo(() => okxTokens ?? EMPTY_LIST, [okxTokens])
    const assets = assetSource === 'okx' ? okxAssets : standardAssets
    const [sidebarChainId, setSidebarChainId] = useState<Web3Helper.ChainIdAll | undefined>(defaultChainId)
    const handleChainChange = useCallback(
        (chainId: Web3Helper.ChainIdAll | undefined) => {
            onChainChange?.(chainId)
            setSidebarChainId(chainId)
        },
        [onChainChange],
    )
    const availableAssets = useMemo(() => {
        if (!sidebarChainId) return assets
        return assets.filter((x) => x.chainId === sidebarChainId)
    }, [assets, sidebarChainId])

    const isSmartPay = !!useWallet()?.owner
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM, true)
    const filteredNetworks = useMemo(() => {
        if (isSmartPay) return networks.filter((x) => x.chainId === ChainId.Polygon && !x.isCustomized)
        return networks
    }, [networks, isSmartPay])

    return (
        <Box className={cx(classes.picker, className)} {...rest}>
            {!lockChainId ?
                <SelectNetworkSidebar
                    className={classes.sidebar}
                    networks={filteredNetworks}
                    pluginID={NetworkPluginID.PLUGIN_EVM}
                    chainId={sidebarChainId}
                    hideAllButton
                    onChainChange={handleChainChange}
                />
            :   null}
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
