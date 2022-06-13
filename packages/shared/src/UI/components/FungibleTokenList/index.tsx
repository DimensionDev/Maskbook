import { memo, useMemo, useState } from 'react'
import { uniqBy } from 'lodash-unified'
import { EMPTY_LIST, EMPTY_OBJECT } from '@masknet/shared-base'
import { MaskFixedSizeListProps, MaskTextFieldProps, SearchableList } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { useSharedI18N } from '../../../locales'
import {
    useAccount,
    useBlockedFungibleTokens,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useFungibleAssets,
    useFungibleToken,
    useFungibleTokensBalance,
    useFungibleTokensFromTokenList,
    useTrustedFungibleTokens,
    useWeb3State,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import {
    CurrencyType,
    currySameAddress,
    formatBalance,
    FungibleToken,
    isSameAddress,
    minus,
    NetworkPluginID,
    toZero,
} from '@masknet/web3-shared-base'
import { getFungibleTokenItem } from './FungibleTokenItem'

const DEFAULT_LIST_HEIGHT = 300
const SEARCH_KEYS = ['address', 'symbol', 'name']

export interface FungibleTokenListProps<T extends NetworkPluginID> extends withClasses<'list' | 'placeholder'> {
    pluginID?: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    whitelist?: string[]
    blacklist?: string[]
    tokens?: Array<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
    selectedTokens?: string[]
    disableSearch?: boolean
    onSelect?(
        token: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']> | null,
    ): void
    FixedSizeListProps?: Partial<MaskFixedSizeListProps>
    SearchTextFieldProps?: MaskTextFieldProps
}

const Placeholder = memo(({ message, height }: { message: string; height?: number | string }) => (
    <Stack minHeight={height ?? DEFAULT_LIST_HEIGHT} justifyContent="center" alignContent="center" marginTop="12px">
        <Typography color="textSecondary" textAlign="center">
            {message}
        </Typography>
    </Stack>
))

export function FungibleTokenList<T extends NetworkPluginID>(props: FungibleTokenListProps<T>) {
    const {
        tokens = EMPTY_LIST,
        whitelist: includeTokens,
        blacklist: excludeTokens = EMPTY_LIST,
        onSelect,
        FixedSizeListProps,
        selectedTokens = EMPTY_LIST,
    } = props

    const t = useSharedI18N()
    const pluginID = useCurrentWeb3NetworkPluginID(props.pluginID) as T
    const account = useAccount()
    const chainId = useChainId(pluginID, props.chainId)
    const { Token, Others } = useWeb3State<'all'>()
    const { value: fungibleTokens = EMPTY_LIST, loading: loadingFungibleTokens } = useFungibleTokensFromTokenList(
        props.pluginID,
        { chainId },
    )
    const trustedFungibleTokens = useTrustedFungibleTokens()
    const blockedFungibleTokens = useBlockedFungibleTokens()
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

    const { value: fungibleTokensBalance = EMPTY_OBJECT, loading: loadingFungibleTokensBalance } =
        useFungibleTokensBalance(
            pluginID,
            filteredFungibleTokens.map((x) => x.address),
            { account, chainId },
        )

    const { value: fungibleAssets = EMPTY_LIST, loading: loadingFungibleAssets } = useFungibleAssets(
        pluginID,
        undefined,
        {
            chainId,
        },
    )

    const sortedFungibleTokens = useMemo(() => {
        const fungibleAssetsTable = Object.fromEntries(
            fungibleAssets.filter((x) => x.chainId === chainId).map((x) => [x.address, x]),
        )
        const isTrustedToken = currySameAddress(trustedFungibleTokens.map((x) => x.address))
        const isBlockedToken = currySameAddress(blockedFungibleTokens.map((x) => x.address))

        return filteredFungibleTokens
            .filter((x) => !isBlockedToken(x))
            .sort((a, z) => {
                const aBalance = toZero(formatBalance(fungibleTokensBalance[a.address] ?? '0', a.decimals))
                const zBalance = toZero(formatBalance(fungibleTokensBalance[z.address] ?? '0', z.decimals))

                const aUSD = toZero(fungibleAssetsTable[a.address]?.value?.[CurrencyType.USD] ?? '0')
                const zUSD = toZero(fungibleAssetsTable[z.address]?.value?.[CurrencyType.USD] ?? '0')

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

                // alphabet
                if (a.name !== z.name) return a.name < z.name ? -1 : 1

                return 0
            })
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

    const searchedTokenAddress = useMemo(() => {
        return Others?.isValidAddress(keyword) && !sortedFungibleTokens.some((x) => isSameAddress(x.address, keyword))
            ? keyword
            : ''
    }, [keyword, sortedFungibleTokens, Others])

    const { value: searchedToken, loading: searchingToken } = useFungibleToken(pluginID, searchedTokenAddress)
    // #endregion

    const getPlaceholder = () => {
        if (Object.keys(fungibleTokensBalance).length === 0 && includeTokens?.length === 0 && !searchedToken)
            return null
        if ((Object.keys(fungibleTokensBalance).length === 0 || loadingFungibleTokensBalance) && !searchedToken)
            return <Placeholder height={FixedSizeListProps?.height} message={t.erc20_token_list_loading()} />
        if (searchingToken)
            return <Placeholder height={FixedSizeListProps?.height} message={t.erc20_search_token_loading()} />
        if (searchedTokenAddress && !searchedToken)
            return <Placeholder height={FixedSizeListProps?.height} message={t.erc20_search_not_token_found()} />
        return null
    }

    return (
        <SearchableList<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
            onSelect={(token) => onSelect?.(token)}
            onSearch={setKeyword}
            data={
                searchedToken && isSameAddress(searchedToken.address, searchedTokenAddress)
                    ? [searchedToken]
                    : sortedFungibleTokens
            }
            searchKey={SEARCH_KEYS}
            disableSearch={!!props.disableSearch}
            itemRender={getFungibleTokenItem<T>(
                (address) => {
                    if (isSameAddress(nativeToken?.address, address)) return 'official'

                    const inOfficialList = fungibleTokens.some((x) => isSameAddress(x.address, address))
                    if (inOfficialList) return 'official'

                    const inPersonaList = trustedFungibleTokens.some((x) => isSameAddress(x.address, address))
                    if (inPersonaList) return 'personal'

                    return 'external'
                },
                (address) => fungibleTokensBalance[address] ?? '0',
                (address) => selectedTokens.some((x) => isSameAddress(x, address)),
                () => loadingFungibleTokensBalance || loadingFungibleAssets,
                async (
                    token: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
                ) => {
                    await Token?.addToken?.(token)
                    await Token?.trustToken?.(account, token)
                },
            )}
            placeholder={getPlaceholder()}
            FixedSizeListProps={FixedSizeListProps}
            SearchFieldProps={{
                placeholder: t.erc20_token_list_placeholder(),
                ...props.SearchTextFieldProps,
            }}
        />
    )
}
