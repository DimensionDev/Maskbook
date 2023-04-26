import { EMPTY_LIST, EMPTY_OBJECT, type NetworkPluginID } from '@masknet/shared-base'
import { SearchableList, makeStyles, type MaskFixedSizeListProps, type MaskTextFieldProps } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import {
    useAccount,
    useBlockedFungibleTokens,
    useFungibleToken,
    useFungibleTokenBalance,
    useFungibleTokensBalance,
    useNetworkContext,
    useTrustedFungibleTokens,
    useWeb3State,
} from '@masknet/web3-hooks-base'
import {
    CurrencyType,
    ZERO,
    currySameAddress,
    isSameAddress,
    leftShift,
    minus,
    toZero,
    type FungibleToken,
} from '@masknet/web3-shared-base'
import { Box, Stack } from '@mui/material'
import { uniqBy } from 'lodash-es'
import { useCallback, useMemo, useState, useTransition } from 'react'
import { useSharedI18N } from '../../../locales/index.js'
import { getFungibleTokenItem } from './FungibleTokenItem.js'
import { ManageTokenListBar } from './ManageTokenListBar.js'
import { TokenListMode } from './type.js'

const SEARCH_KEYS = ['address', 'symbol', 'name']

export interface FungibleTokenListProps<T extends NetworkPluginID> extends withClasses<'channel' | 'bar' | 'listBox'> {
    pluginID?: T
    chainId?: Web3Helper.ChainIdAll
    whitelist?: string[]
    blacklist?: string[]
    tokens?: Array<FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    selectedTokens?: string[]
    disableSearch?: boolean
    onSelect?(token: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null): void
    FixedSizeListProps?: Partial<MaskFixedSizeListProps>
    SearchTextFieldProps?: MaskTextFieldProps
    enableManage?: boolean
    fungibleTokens: Web3Helper.FungibleTokenScope[]
    setMode?(mode: TokenListMode): void
    mode?: TokenListMode
    fungibleAssets: Web3Helper.FungibleAssetScope[]
}

const useStyles = makeStyles()({
    channel: {
        position: 'relative',
    },
    bar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    listBox: {},
})

export const FungibleTokenList = function <T extends NetworkPluginID>(props: FungibleTokenListProps<T>) {
    const {
        tokens = EMPTY_LIST,
        whitelist: includeTokens,
        blacklist: excludeTokens = EMPTY_LIST,
        onSelect,
        FixedSizeListProps,
        selectedTokens = EMPTY_LIST,
        enableManage = false,
        fungibleTokens,
        fungibleAssets,
        setMode,
        mode = TokenListMode.List,
    } = props

    const t = useSharedI18N()
    const { classes } = useStyles(undefined, { props: { classes: props.classes } })

    const { pluginID } = useNetworkContext<T>(props.pluginID)
    const account = useAccount(pluginID)
    const chainId = props.chainId
    const { Token, Others } = useWeb3State<'all'>(pluginID)

    const trustedFungibleTokens = useTrustedFungibleTokens(pluginID, undefined, chainId)
    const blockedFungibleTokens = useBlockedFungibleTokens(pluginID)
    const nativeToken = useMemo(() => Others?.chainResolver.nativeCurrency(chainId), [chainId])

    const filteredFungibleTokens = useMemo(() => {
        const allFungibleTokens = uniqBy(
            [...(nativeToken ? [nativeToken] : []), ...tokens, ...fungibleTokens, ...trustedFungibleTokens],
            (x) => x.address.toLowerCase(),
        )

        return allFungibleTokens.filter(
            (token) =>
                (!includeTokens || includeTokens.some(currySameAddress(token.address))) &&
                (!excludeTokens.length || !excludeTokens.some(currySameAddress(token.address))),
        )
    }, [nativeToken, tokens, fungibleTokens, trustedFungibleTokens, includeTokens, excludeTokens])

    const { value: fungibleTokensBalance = EMPTY_OBJECT } = useFungibleTokensBalance(
        pluginID,
        filteredFungibleTokens.map((x) => x.address),
        { account, chainId },
    )

    // To avoid SearchableList re-render, reduce the dep
    const sortedFungibleTokensForManage = useMemo(() => {
        if (mode === TokenListMode.List) return []
        const isTrustedToken = currySameAddress(trustedFungibleTokens.map((x) => x.address))

        return filteredFungibleTokens.sort((a, z) => {
            // trusted token
            if (isTrustedToken(a.address)) return -1
            if (isTrustedToken(z.address)) return 1

            const isNativeTokenA = isSameAddress(a.address, Others?.getNativeTokenAddress(a.chainId))
            const isNativeTokenZ = isSameAddress(z.address, Others?.getNativeTokenAddress(z.chainId))

            const isMaskTokenA = isSameAddress(a.address, Others?.getMaskTokenAddress(a.chainId))
            const isMaskTokenZ = isSameAddress(z.address, Others?.getMaskTokenAddress(z.chainId))

            // native token
            if (isNativeTokenA) return -1
            if (isNativeTokenZ) return 1

            // mask token with position value
            if (isMaskTokenA) return -1
            if (isMaskTokenZ) return 1

            if (z.rank && (!a.rank || a.rank - z.rank > 0)) return 1
            if (a.rank && (!z.rank || z.rank - a.rank > 0)) return -1

            // alphabet
            if (a.name !== z.name) return a.name < z.name ? -1 : 1

            return 0
        })
    }, [chainId, trustedFungibleTokens, Others, mode])

    const sortedFungibleTokensForList = useMemo(() => {
        if (mode === TokenListMode.Manage) return []
        const fungibleAssetsTable = Object.fromEntries(
            fungibleAssets.filter((x) => x.chainId === chainId).map((x) => [x.address, x]),
        )
        const isTrustedToken = currySameAddress(trustedFungibleTokens.map((x) => x.address))
        const isBlockedToken = currySameAddress(blockedFungibleTokens.map((x) => x.address))

        const getTokenValue = (address: string) => {
            const value = fungibleAssetsTable[address]?.value?.[CurrencyType.USD]
            return value ? toZero(value) : ZERO
        }
        return filteredFungibleTokens
            .filter((x) => !isBlockedToken(x))
            .sort((a, z) => {
                const aBalance = leftShift(fungibleTokensBalance[a.address] ?? '0', a.decimals)
                const zBalance = leftShift(fungibleTokensBalance[z.address] ?? '0', z.decimals)

                const aUSD = getTokenValue(a.address)
                const zUSD = getTokenValue(z.address)

                const isNativeTokenA = isSameAddress(a.address, Others?.getNativeTokenAddress(a.chainId))
                const isNativeTokenZ = isSameAddress(z.address, Others?.getNativeTokenAddress(z.chainId))

                const isMaskTokenA = isSameAddress(a.address, Others?.getMaskTokenAddress(a.chainId))
                const isMaskTokenZ = isSameAddress(z.address, Others?.getMaskTokenAddress(z.chainId))

                // the currently selected chain id
                if (a.chainId !== z.chainId) {
                    if (a.chainId === chainId) return -1
                    if (z.chainId === chainId) return 1
                }

                // native token
                if (isNativeTokenA) return -1
                if (isNativeTokenZ) return 1

                // mask token with position value
                if (aUSD.isPositive() && isMaskTokenA) return -1
                if (zUSD.isPositive() && isMaskTokenZ) return 1

                // token value
                if (!aUSD.isEqualTo(zUSD)) return minus(zUSD, aUSD).isPositive() ? 1 : -1

                // token balance
                if (!aBalance.isEqualTo(zBalance)) return minus(zBalance, aBalance).isPositive() ? 1 : -1

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
            .map((x) => ({
                ...x,
                // To avoid reduce re-render, merge balance into token, when value is `undefined` to represent loading
                balance: fungibleTokensBalance[x.address],
            }))
    }, [
        chainId,
        fungibleAssets,
        trustedFungibleTokens,
        blockedFungibleTokens,
        filteredFungibleTokens,
        fungibleTokensBalance,
        Others,
    ])

    // #region add token by address
    const [keyword, setKeyword] = useState('')
    const [searchError, setSearchError] = useState<string>()

    const searchedTokenAddress = useMemo(() => {
        if (!keyword) {
            setSearchError(undefined)
            return
        }

        if (
            (keyword.startsWith('0x') || keyword.startsWith('0X')) &&
            keyword.length > 3 &&
            !Others?.isValidAddress(keyword)
        ) {
            setSearchError(t.erc20_search_wrong_address())
            return
        }

        if (mode === TokenListMode.Manage) return ''

        return Others?.isValidAddress(keyword) &&
            !sortedFungibleTokensForList.some((x) => isSameAddress(x.address, keyword))
            ? keyword
            : ''
    }, [keyword, sortedFungibleTokensForList, Others, mode])

    const { value: searchedToken } = useFungibleToken(pluginID, searchedTokenAddress, undefined, {
        chainId,
    })
    const { value: tokenBalance = '' } = useFungibleTokenBalance(pluginID, searchedToken?.address, {
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
                if (strategy === 'add') Token?.addToken?.(account, token)
                if (strategy === 'remove') Token?.removeToken?.(account, token)
            },
            async (
                token: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>,
                strategy: 'trust' | 'block',
            ) => {
                if (strategy === 'trust') Token?.trustToken?.(account, token)
                if (strategy === 'block') Token?.blockToken?.(account, token)
            },
        )
    }, [nativeToken?.address, selectedTokens, mode, trustedFungibleTokens, fungibleTokens])

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
                }
            >
                onSelect={handleSelect}
                onSearch={setKeyword}
                data={
                    searchedToken && isSameAddress(searchedToken.address, searchedTokenAddress)
                        ? // balance field work for case: user search someone token by contract and whitelist is empty.
                          [{ ...searchedToken, balance: tokenBalance }]
                        : mode === TokenListMode.List
                        ? sortedFungibleTokensForList
                        : sortedFungibleTokensForManage
                }
                searchKey={SEARCH_KEYS}
                disableSearch={!!props.disableSearch}
                itemKey="address"
                classes={{ listBox: classes.listBox }}
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
