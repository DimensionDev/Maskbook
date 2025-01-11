import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { EmptyStatus, SelectNetworkSidebar } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, MaskTextField } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useAccount, useFungibleAssets, useNetworks, useUserTokenBalances, useWallet } from '@masknet/web3-hooks-base'
import { useOKXTokenList } from '@masknet/web3-hooks-evm'
import {
    isEqual,
    isGreaterThan,
    isSameAddress,
    multipliedBy,
    rightShift,
    type ReasonableNetwork,
} from '@masknet/web3-shared-base'
import { ChainId, getMaskTokenAddress, getNativeTokenAddress } from '@masknet/web3-shared-evm'
import { Box, type BoxProps } from '@mui/material'
import Fuse from 'fuse.js'
import { memo, useCallback, useMemo, useState } from 'react'
import { FixedSizeList, type ListChildComponentProps } from 'react-window'
import { TokenItem, type TokenItemProps } from './TokenItem.js'

type RowProps = ListChildComponentProps<{
    tokens: Array<Web3Helper.FungibleTokenAll | Web3Helper.FungibleAssetAll>
    networks: Array<ReasonableNetwork<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll, Web3Helper.NetworkTypeAll>>
    chainId?: Web3Helper.ChainIdAll
    /** Selected address */
    address?: string
    onSelect?(asset: Web3Helper.FungibleAssetAll | Web3Helper.FungibleTokenAll): void
}>

const Row = memo(function Row({ data, index, style }: RowProps) {
    const { tokens, networks, chainId, address, onSelect } = data
    const asset = tokens[index]

    const network = networks.find((x) => x.chainId === asset.chainId)
    const selected = asset.chainId === chainId && isSameAddress(asset.address, address)
    return (
        <TokenItem
            key={`${asset.chainId}.${asset.address}`}
            asset={asset}
            network={network}
            selected={selected}
            onSelect={onSelect}
            style={{
                ...style,
                height: 63,
            }}
        />
    )
})

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
        content: {
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(1),
            boxSizing: 'border-box',
        },
    }
})

export enum AssetSource {
    Standard = 'standard',
    Okx = 'okx',
}

export interface TokenPickerProps extends Omit<BoxProps, 'onSelect'>, Pick<TokenItemProps, 'onSelect'> {
    defaultChainId?: ChainId
    chainId?: ChainId
    address?: string
    chains?: ChainId[]
    /** okx provides their own token list */
    assetSource?: AssetSource
    /** Do not allow to select other chains */
    lockChainId?: boolean
    onChainChange?: (chainId: Web3Helper.ChainIdAll | undefined) => void
}

export const TokenPicker = memo(function TokenPicker({
    defaultChainId,
    chainId: propChainId,
    address,
    assetSource = AssetSource.Standard,
    lockChainId = false,
    chains,
    className,
    onSelect,
    onChainChange,
    ...rest
}: TokenPickerProps) {
    const { classes, cx } = useStyles()
    const [sidebarChainId, setSidebarChainId] = useState<Web3Helper.ChainIdAll | undefined>(defaultChainId)
    const chainId = (sidebarChainId || propChainId || defaultChainId) as ChainId
    const [standardAssets] = useFungibleAssets(NetworkPluginID.PLUGIN_EVM, undefined, {
        chainId,
    })
    const isFromOkx = assetSource === AssetSource.Okx
    const { data: okxTokens } = useOKXTokenList(chainId, isFromOkx)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { data: balances } = useUserTokenBalances(chainId, account, isFromOkx)
    const okxAssets = useMemo(() => {
        if (!okxTokens?.length) return EMPTY_LIST
        if (!balances) {
            const balanceMap = new Map(standardAssets.map((x) => [x.address.toLowerCase(), x.balance]))
            // To reduce queries, get balance from standardAssets and patch okxTokens with it
            return okxTokens.map((x) => {
                const balance = balanceMap.get(x.address.toLowerCase())
                return !balance || balance === '0' ? x : { ...x, balance }
            }) as typeof okxTokens
        } else {
            const assets = okxTokens.map((x) => {
                const balance = balances.get(x.address.toLowerCase())
                return !balance ? x : { ...x, balance: rightShift(balance.balance, x.decimals).toFixed(0) }
            }) as Array<Web3Helper.FungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>> // typeof okxTokens
            return assets.sort((a, z) => {
                // native token
                const isNativeTokenA = isSameAddress(a.address, getNativeTokenAddress(a.chainId))
                if (isNativeTokenA) return -1
                const isNativeTokenZ = isSameAddress(z.address, getNativeTokenAddress(z.chainId))
                if (isNativeTokenZ) return 1

                const aBalance = balances.get(a.address.toLowerCase())
                const zBalance = balances.get(z.address.toLowerCase())
                const isMaskTokenA = isSameAddress(a.address, getMaskTokenAddress(a.chainId))
                const isMaskTokenZ = isSameAddress(z.address, getMaskTokenAddress(z.chainId))
                // mask token with position value
                const aUSD = multipliedBy(aBalance?.balance ?? 0, aBalance?.tokenPrice ?? 0)
                if (aUSD.isPositive() && isMaskTokenA) return -1
                const zUSD = multipliedBy(zBalance?.balance ?? 0, zBalance?.tokenPrice ?? 0)
                if (zUSD.isPositive() && isMaskTokenZ) return 1

                // token value
                if (!aUSD.isEqualTo(zUSD)) return zUSD.gt(aUSD) ? 1 : -1

                // token balance
                if (!isEqual(aBalance?.balance || 0, zBalance?.balance || 0))
                    return isGreaterThan(zBalance?.balance || 0, aBalance?.balance || 0) ? 1 : -1

                // mask token with position value
                if (isMaskTokenA) return -1
                if (isMaskTokenZ) return 1

                return 0
            })
        }
    }, [okxTokens, standardAssets, balances])
    const assets = assetSource === AssetSource.Okx ? okxAssets : standardAssets
    const handleChainChange = useCallback(
        (chainId: Web3Helper.ChainIdAll | undefined) => {
            onChainChange?.(chainId)
            setSidebarChainId(chainId)
        },
        [onChainChange],
    )
    const [keyword, setKeyword] = useState('')
    const availableAssets = useMemo(() => {
        if (!sidebarChainId) return assets
        return assets.filter((x) => x.chainId === sidebarChainId)
    }, [assets, sidebarChainId])
    const fuse = useMemo(() => {
        return new Fuse(availableAssets, {
            shouldSort: true,
            isCaseSensitive: false,
            threshold: 0.45,
            minMatchCharLength: 1,
            keys: ['address', 'symbol', 'name'],
        })
    }, [availableAssets])
    const filteredAssets = useMemo(() => {
        if (!keyword) return availableAssets
        return fuse.search(keyword).map((x) => x.item)
    }, [fuse, keyword])

    const isSmartPay = !!useWallet()?.owner
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM, true)
    const filteredNetworks = useMemo(() => {
        const list = isSmartPay ? networks.filter((x) => x.chainId === ChainId.Polygon && !x.isCustomized) : networks
        return chains ? list.filter((x) => chains.includes(x.chainId)) : list
    }, [chains, networks, isSmartPay])
    const selectedIndex = filteredAssets.findIndex((x) => x.chainId === chainId && isSameAddress(x.address, address))

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
            <div className={classes.content}>
                <MaskTextField
                    value={keyword}
                    placeholder={t`Name or Contract address e.g. USDC or 0x234...`}
                    autoFocus
                    fullWidth
                    wrapperProps={{
                        padding: '2px',
                    }}
                    InputProps={{
                        style: { height: 40 },
                        inputProps: { style: { paddingLeft: 4 } },
                        startAdornment: <Icons.Search size={18} />,
                        endAdornment: keyword ? <Icons.Close size={18} onClick={() => setKeyword('')} /> : null,
                    }}
                    onChange={(e) => {
                        setKeyword(e.target.value)
                    }}
                />
                {keyword && !filteredAssets.length ?
                    <EmptyStatus flexGrow={1} alignItems="center">
                        <Trans>No matched tokens</Trans>
                    </EmptyStatus>
                :   <FixedSizeList
                        itemCount={filteredAssets.length}
                        itemSize={71}
                        height={403}
                        overscanCount={20}
                        // show half of previous token
                        initialScrollOffset={Math.max(0, selectedIndex - 0.5) * 71}
                        itemData={{
                            tokens: filteredAssets,
                            networks: filteredNetworks,
                            chainId,
                            address,
                            onSelect,
                        }}
                        itemKey={(index, data) => {
                            const asset = data.tokens[index]
                            return `${asset.chainId}.${asset.address}`
                        }}
                        style={{
                            scrollbarWidth: 'none',
                        }}
                        width="100%">
                        {Row}
                    </FixedSizeList>
                }
            </div>
        </Box>
    )
})
