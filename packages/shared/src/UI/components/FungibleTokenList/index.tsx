import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { uniqBy } from 'lodash-es'
import { EMPTY_LIST, EMPTY_OBJECT, type NetworkPluginID } from '@masknet/shared-base'
import { SearchableList, makeStyles, type MaskFixedSizeListProps, type MaskTextFieldProps } from '@masknet/theme'
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
    useWeb3Others,
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
import { useSharedI18N } from '../../../locales/index.js'
import { getFungibleTokenItem } from './FungibleTokenItem.js'
import { ManageTokenListBar } from './ManageTokenListBar.js'
import { TokenListMode } from './type.js'

export * from './type.js'

const SEARCH_KEYS = ['address', 'symbol', 'name']

export interface FungibleTokenListProps<T extends NetworkPluginID>
    extends withClasses<'channel' | 'bar' | 'listBox' | 'searchInput'> {
    pluginID?: T
    chainId?: Web3Helper.ChainIdAll
    whitelist?: string[]
    blacklist?: string[]
    tokens?: Array<FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    selectedTokens?: string[]
    disableSearch?: boolean
    onSelect?(token: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null): void
    onSearchError?(error: boolean): void
    FixedSizeListProps?: Partial<MaskFixedSizeListProps>
    SearchTextFieldProps?: MaskTextFieldProps
    enableManage?: boolean
    isHiddenChainIcon?: boolean
    setMode?(mode: TokenListMode): void
    mode?: TokenListMode
}

const useStyles = makeStyles<{ enableMange: boolean }>()((theme, { enableMange }) => ({
    channel: {
        position: enableMange ? 'relative' : 'unset',
    },
    bar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
}))

export function FungibleTokenList<T extends NetworkPluginID>(props: FungibleTokenListProps<T>) {
    const {
        tokens = EMPTY_LIST,
        whitelist: includeTokens,
        blacklist: excludeTokens = EMPTY_LIST,
        onSelect,
        onSearchError,
        FixedSizeListProps,
        selectedTokens = EMPTY_LIST,
        enableManage = false,
        isHiddenChainIcon = true,
        setMode,
        mode = TokenListMode.List,
    } = props

    const t = useSharedI18N()
    const { classes } = useStyles({ enableMange: mode === TokenListMode.List && enableManage }, { props })

    const { pluginID } = useNetworkContext<T>(props.pluginID)
    const account = useAccount(pluginID)
    const chainId = useChainId(pluginID, props.chainId)
    const { Token } = useWeb3State<'all'>(pluginID)
    const Others = useWeb3Others(pluginID)

    const { value: fungibleTokens = EMPTY_LIST } = useFungibleTokensFromTokenList(pluginID, {
        chainId,
    })

    const { data: fungibleAssets = EMPTY_LIST } = useFungibleAssets(pluginID, undefined, {
        chainId,
    })

    const trustedFungibleTokens = useTrustedFungibleTokens(pluginID, undefined, chainId)
    const blockedFungibleTokens = useBlockedFungibleTokens(pluginID)
    const nativeToken = useMemo(() => Others.chainResolver.nativeCurrency(chainId), [chainId])

    const filteredFungibleTokens = useMemo(() => {
        const allFungibleTokens = uniqBy(
            [...(nativeToken ? [nativeToken] : []), ...tokens, ...fungibleTokens, ...trustedFungibleTokens],
            (x) => x.address.toLowerCase(),
        )

        const blockedTokenAddresses = blockedFungibleTokens.map((x) => x.address)
        return allFungibleTokens.filter((token) => {
            const checkSameAddress = (addr: string) => addr.toLowerCase() === token.address.toLowerCase()
            const isIncluded = !includeTokens || includeTokens.some(checkSameAddress)
            const isExcluded = excludeTokens.length ? excludeTokens.some(checkSameAddress) : false
            const isBlocked = blockedTokenAddresses.some(checkSameAddress)

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

            const isNativeTokenA = isSameAddress(a.address, Others.getNativeTokenAddress(a.chainId))
            if (isNativeTokenA) return -1
            const isNativeTokenZ = isSameAddress(z.address, Others.getNativeTokenAddress(z.chainId))
            if (isNativeTokenZ) return 1

            // mask token with position value
            const isMaskTokenA = isSameAddress(a.address, Others.getMaskTokenAddress(a.chainId))
            if (isMaskTokenA) return -1
            const isMaskTokenZ = isSameAddress(z.address, Others.getMaskTokenAddress(z.chainId))
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
        const { getNativeTokenAddress, getMaskTokenAddress } = Others
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

    const { value: addressType } = useAddressType(pluginID, !Others.isValidAddress?.(keyword ?? '') ? '' : keyword, {
        chainId,
    })

    const isAddressNotContract = addressType !== AddressType.Contract && Others.isValidAddress(keyword)

    const searchedTokenAddress = useMemo(() => {
        if (!keyword) return

        return Others.isValidAddress(keyword) &&
            !sortedFungibleTokensForList.some((x) => isSameAddress(x.address, keyword))
            ? keyword
            : ''
    }, [keyword, sortedFungibleTokensForList])
    const searchError = keyword.match(/^0x.+/i) && !Others.isValidAddress(keyword) ? t.erc20_search_wrong_address() : ''
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
            (address) => selectedTokens.some((x) => isSameAddress(x, address)),
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
            placeholder: t.erc20_token_list_placeholder(),
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
                data={
                    isAddressNotContract
                        ? EMPTY_LIST
                        : searchedToken && isSameAddress(searchedToken.address, searchedTokenAddress)
                        ? // balance field work for case: user search someone token by contract and whitelist is empty.
                          [{ ...searchedToken, balance: tokenBalance, isCustomToken }]
                        : mode === TokenListMode.List
                        ? sortedFungibleTokensForList
                        : sortedFungibleTokensForManage
                }
                searchKey={SEARCH_KEYS}
                disableSearch={!!props.disableSearch}
                itemKey="address"
                classes={{ listBox: classes.listBox, searchInput: classes.searchInput }}
                itemRender={itemRender}
                FixedSizeListProps={FixedSizeListProps}
                SearchFieldProps={SearchFieldProps}
            />
            {mode === TokenListMode.List && enableManage ? (
                <Box className={classes.bar}>
                    <ManageTokenListBar onClick={() => setMode?.(TokenListMode.Manage)} />
                </Box>
            ) : null}
        </Stack>
    )
}

FungibleTokenList.displayName = 'FungibleTokenList'
