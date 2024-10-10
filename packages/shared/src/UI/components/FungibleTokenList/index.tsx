import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { uniqBy } from 'lodash-es'
import { EMPTY_LIST, EMPTY_OBJECT, type NetworkPluginID } from '@masknet/shared-base'
import { SearchableList, makeStyles, type MaskSearchableListProps, type MaskTextFieldProps } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { AddressType } from '@masknet/web3-shared-evm'
import {
    useAccount,
    useAddressType,
    useBlockedFungibleTokens,
    useChainId,
    useFungibleAssets,
    useFungibleToken,
    useFungibleTokenBalance,
    useFungibleTokensBalance,
    useFungibleTokensFromTokenList,
    useNetworkContext,
    useTrustedFungibleTokens,
    useWeb3Utils,
    useWeb3State,
} from '@masknet/web3-hooks-base'
import {
    CurrencyType,
    ZERO,
    currySameAddress,
    isSameAddress,
    leftShift,
    toZero,
    type FungibleToken,
} from '@masknet/web3-shared-base'
import { Box, Stack } from '@mui/material'
import { getFungibleTokenItem } from './FungibleTokenItem.js'
import { ManageTokenListBar } from './ManageTokenListBar.js'
import { TokenListMode } from './type.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export * from './type.js'

const SEARCH_KEYS = ['address', 'symbol', 'name']

export interface FungibleTokenListProps<T extends NetworkPluginID>
    extends withClasses<'channel' | 'bar' | 'listBox' | 'searchInput'>,
        Pick<MaskSearchableListProps<never>, 'disableSearch' | 'loading' | 'FixedSizeListProps'> {
    pluginID?: T
    chainId?: Web3Helper.ChainIdAll
    whitelist?: string[]
    blacklist?: string[]
    tokens?: Array<FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    /** Extend tokens inside by adding trusted tokens and so on */
    extendTokens?: boolean
    selectedChainId?: Web3Helper.ChainIdAll
    selectedTokens?: string[]

    onSelect?(token: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null): void

    onSearchError?(error: boolean): void

    SearchTextFieldProps?: MaskTextFieldProps
    enableManage?: boolean
    isHiddenChainIcon?: boolean

    setMode?(mode: TokenListMode): void
    mode?: TokenListMode
}

const useStyles = makeStyles()({
    channel: {
        width: '100%',
    },
    bar: {
        position: 'absolute',
        flexShrink: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
})

export function FungibleTokenList<T extends NetworkPluginID>(props: FungibleTokenListProps<T>) {
    const { _ } = useLingui()
    const {
        tokens = EMPTY_LIST,
        extendTokens = true,
        whitelist: includeTokens,
        blacklist: excludeTokens = EMPTY_LIST,
        onSelect,
        onSearchError,
        FixedSizeListProps,
        selectedChainId,
        selectedTokens = EMPTY_LIST,
        enableManage = false,
        isHiddenChainIcon = true,
        setMode,
        mode = TokenListMode.List,
    } = props
    const { classes } = useStyles()

    const { pluginID } = useNetworkContext<T>(props.pluginID)
    const account = useAccount(pluginID)
    const chainId = useChainId(pluginID, props.chainId)
    const { Token } = useWeb3State<'all'>(pluginID)
    const Utils = useWeb3Utils(pluginID)

    const { data: fungibleTokens = EMPTY_LIST } = useFungibleTokensFromTokenList(pluginID, {
        chainId,
    })

    const [fungibleAssets] = useFungibleAssets(pluginID, undefined, {
        chainId,
    })

    const trustedFungibleTokens = useTrustedFungibleTokens(pluginID, undefined, chainId)
    const blockedFungibleTokens = useBlockedFungibleTokens(pluginID)
    const nativeToken = useMemo(() => Utils.chainResolver.nativeCurrency(chainId), [chainId])

    const filteredFungibleTokens = useMemo(() => {
        const allFungibleTokens =
            extendTokens ?
                uniqBy(
                    [...(nativeToken ? [nativeToken] : []), ...tokens, ...fungibleTokens, ...trustedFungibleTokens],
                    (x) => x.address.toLowerCase(),
                )
            :   tokens

        const blockedTokenAddresses = new Map(blockedFungibleTokens.map((x) => [x.address.toLowerCase(), true]))
        const includeMap = includeTokens ? new Map(includeTokens.map((x) => [x.toLowerCase(), true])) : null
        const excludeMap = excludeTokens.length ? new Map(excludeTokens.map((x) => [x.toLowerCase(), true])) : null
        return allFungibleTokens.filter((token) => {
            const addr = token.address.toLowerCase()
            const isIncluded = !includeMap || includeMap.has(addr)
            const isExcluded = excludeMap ? excludeMap.has(addr) : false
            const isBlocked = blockedTokenAddresses.has(addr)

            return isIncluded && !isExcluded && !isBlocked
        })
    }, [
        nativeToken,
        tokens,
        fungibleTokens,
        trustedFungibleTokens,
        includeTokens,
        excludeTokens,
        blockedFungibleTokens,
    ])

    const { value: fungibleTokensBalance = EMPTY_OBJECT } = useFungibleTokensBalance(
        pluginID,
        filteredFungibleTokens.map((x) => x.address),
        { account, chainId },
    )

    // To avoid SearchableList re-render, reduce the dep
    const sortedFungibleTokensForManage = useMemo(() => {
        if (mode === TokenListMode.List) return EMPTY_LIST
        const isTrustedToken = currySameAddress(trustedFungibleTokens.map((x) => x.address))

        return uniqBy([...(nativeToken ? [nativeToken] : []), ...fungibleTokens, ...trustedFungibleTokens], (x) =>
            x.address.toLowerCase(),
        ).sort((a, z) => {
            // trusted token
            if (isTrustedToken(a.address)) return -1
            if (isTrustedToken(z.address)) return 1

            const isNativeTokenA = isSameAddress(a.address, Utils.getNativeTokenAddress(a.chainId))
            if (isNativeTokenA) return -1
            const isNativeTokenZ = isSameAddress(z.address, Utils.getNativeTokenAddress(z.chainId))
            if (isNativeTokenZ) return 1

            // mask token with position value
            const isMaskTokenA = isSameAddress(a.address, Utils.getMaskTokenAddress(a.chainId))
            if (isMaskTokenA) return -1
            const isMaskTokenZ = isSameAddress(z.address, Utils.getMaskTokenAddress(z.chainId))
            if (isMaskTokenZ) return 1

            if (z.rank && (!a.rank || a.rank - z.rank > 0)) return 1
            if (a.rank && (!z.rank || z.rank - a.rank > 0)) return -1

            // alphabet
            if (a.name !== z.name) return a.name < z.name ? -1 : 1

            return 0
        })
    }, [chainId, trustedFungibleTokens, fungibleTokens, nativeToken, mode])

    const sortedFungibleTokensForList = useMemo(() => {
        if (mode === TokenListMode.Manage) return EMPTY_LIST
        const fungibleAssetsTable = Object.fromEntries(
            fungibleAssets.filter((x) => x.chainId === chainId).map((x) => [x.address, x]),
        )
        const isTrustedToken = currySameAddress(trustedFungibleTokens.map((x) => x.address))

        const getTokenValue = (address: string) => {
            const value = fungibleAssetsTable[address]?.value?.[CurrencyType.USD]
            return value ? toZero(value) : ZERO
        }
        const { getNativeTokenAddress, getMaskTokenAddress } = Utils
        return filteredFungibleTokens
            .map((x) => ({
                ...x,
                // To avoid reduce re-render, merge balance into token, when value is `undefined` to represent loading
                balance: fungibleTokensBalance[x.address],
            }))
            .sort((a, z) => {
                // the currently selected chain id
                if (a.chainId !== z.chainId) {
                    if (a.chainId === chainId) return -1
                    if (z.chainId === chainId) return 1
                }

                // native token
                const isNativeTokenA = isSameAddress(a.address, getNativeTokenAddress(a.chainId))
                if (isNativeTokenA) return -1
                const isNativeTokenZ = isSameAddress(z.address, getNativeTokenAddress(z.chainId))
                if (isNativeTokenZ) return 1

                // mask token with position value
                const aUSD = getTokenValue(a.address)
                const isMaskTokenA = isSameAddress(a.address, getMaskTokenAddress(a.chainId))
                if (aUSD.isPositive() && isMaskTokenA) return -1
                const zUSD = getTokenValue(z.address)
                const isMaskTokenZ = isSameAddress(z.address, getMaskTokenAddress(z.chainId))
                if (zUSD.isPositive() && isMaskTokenZ) return 1

                // token value
                if (!aUSD.isEqualTo(zUSD)) return zUSD.gt(aUSD) ? 1 : -1

                const aBalance = leftShift(fungibleTokensBalance[a.address] ?? '0', a.decimals)
                const zBalance = leftShift(fungibleTokensBalance[z.address] ?? '0', z.decimals)
                // token balance
                if (!aBalance.isEqualTo(zBalance)) return zBalance.gt(aBalance) ? 1 : -1

                // trusted token
                if (isTrustedToken(a.address)) return -1
                if (isTrustedToken(z.address)) return 1

                // mask token with position value
                if (isMaskTokenA) return -1
                if (isMaskTokenZ) return 1

                if (z.rank && (!a.rank || a.rank - z.rank > 0)) return 1
                if (a.rank && (!z.rank || z.rank - a.rank > 0)) return -1

                // alphabet
                if (a.name !== z.name) return a.name < z.name ? -1 : 1

                return 0
            })
    }, [mode, chainId, fungibleAssets, trustedFungibleTokens, filteredFungibleTokens, fungibleTokensBalance])

    // #region add token by address
    const [keyword, setKeyword] = useState('')

    const { value: addressType } = useAddressType(pluginID, !Utils.isValidAddress?.(keyword ?? '') ? '' : keyword, {
        chainId,
    })

    const isAddressNotContract = addressType !== AddressType.Contract && Utils.isValidAddress(keyword)

    const searchedTokenAddress = useMemo(() => {
        if (!keyword) return

        return (
                Utils.isValidAddress(keyword) &&
                    !sortedFungibleTokensForList.some((x) => isSameAddress(x.address, keyword))
            ) ?
                keyword
            :   ''
    }, [keyword, sortedFungibleTokensForList])
    const searchError =
        keyword.match(/^0x.+/i) && !Utils.isValidAddress(keyword) ? <Trans>Incorrect contract address.</Trans> : ''
    useEffect(() => {
        onSearchError?.(!!searchError)
    }, [searchError, !searchError])

    const { data: searchedToken } = useFungibleToken(pluginID, searchedTokenAddress, undefined, {
        chainId,
    })

    const isCustomToken = useMemo(
        () =>
            !sortedFungibleTokensForManage.find(
                (x) => isSameAddress(x.address, searchedToken?.address) && searchedToken?.chainId === x.chainId,
            ) && Boolean(searchedToken),
        [sortedFungibleTokensForManage, searchedToken],
    )

    const { data: tokenBalance = '' } = useFungibleTokenBalance(pluginID, searchedToken?.address, {
        chainId,
        account,
    })
    // #endregion

    const itemRender = useMemo(() => {
        return getFungibleTokenItem<T>(
            (address) => {
                if (isSameAddress(nativeToken?.address, address)) return 'official-native'

                const inOfficialList = fungibleTokens.some((x) => isSameAddress(x.address, address))
                if (inOfficialList) return 'official'

                const inPersonaList = trustedFungibleTokens.some((x) => isSameAddress(x.address, address))
                if (inPersonaList) return 'personal'

                return 'external'
            },
            (address, tokenChainId) => {
                if (tokenChainId !== selectedChainId) return false
                return selectedTokens.some((x) => isSameAddress(x, address))
            },
            mode,
            async (
                token: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
                strategy: 'add' | 'remove',
            ) => {
                if (strategy === 'add') await Token?.addToken?.(account, token)
                if (strategy === 'remove') await Token?.removeToken?.(account, token)
            },
            async (
                token: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
                strategy: 'trust' | 'block',
            ) => {
                if (strategy === 'trust') await Token?.trustToken?.(account, token)
                if (strategy === 'block') await Token?.blockToken?.(account, token)
            },
            isHiddenChainIcon,
            isCustomToken,
        )
    }, [
        chainId,
        nativeToken?.address,
        selectedTokens,
        mode,
        trustedFungibleTokens,
        fungibleTokens,
        isCustomToken,
        isHiddenChainIcon,
    ])
    const SearchFieldProps = useMemo(
        () => ({
            placeholder: _(msg`Name or Contract address e.g. USDC or 0x234...`),
            helperText: searchError,
            error: !!searchError,
            ...props.SearchTextFieldProps,
        }),
        [searchError, JSON.stringify(props.SearchTextFieldProps)],
    )

    const [, startTransition] = useTransition()

    const handleSelect = useCallback(
        (token: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null) =>
            startTransition(() => onSelect?.(token)),
        [onSelect],
    )

    const data = useMemo(() => {
        return (
            isAddressNotContract ? EMPTY_LIST
            : searchedToken && isSameAddress(searchedToken.address, searchedTokenAddress) ?
                // balance field work for case: user search someone token by contract and whitelist is empty.
                [{ ...searchedToken, balance: tokenBalance, isCustomToken }]
            : mode === TokenListMode.List ? sortedFungibleTokensForList
            : sortedFungibleTokensForManage
        )
    }, [
        isAddressNotContract,
        searchedToken,
        searchedTokenAddress,
        tokenBalance,
        isCustomToken,
        sortedFungibleTokensForList,
        sortedFungibleTokensForManage,
    ])

    return (
        <Stack className={classes.channel}>
            <SearchableList<
                FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> & {
                    balance?: string
                    isCustomToken?: boolean
                }
            >
                onSelect={handleSelect}
                onSearch={setKeyword}
                data={data}
                searchKey={SEARCH_KEYS}
                disableSearch={props.disableSearch}
                loading={props.loading}
                itemKey="address"
                itemRender={itemRender}
                FixedSizeListProps={FixedSizeListProps}
                SearchFieldProps={SearchFieldProps}
            />
            {mode === TokenListMode.List && enableManage && !props.loading ?
                <Box className={classes.bar}>
                    <ManageTokenListBar onEdit={() => setMode?.(TokenListMode.Manage)} />
                </Box>
            :   null}
        </Stack>
    )
}

FungibleTokenList.displayName = 'FungibleTokenList'
