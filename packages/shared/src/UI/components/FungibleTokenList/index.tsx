import { memo, useState } from 'react'
import { uniqBy } from 'lodash-unified'
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
    NetworkPluginID,
} from '@masknet/web3-shared-base'
import { getFungibleTokenItem } from './FungibleTokenItem'
import { EMPTY_LIST, EMPTY_OBJECT } from '@masknet/shared-base'

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
        tokens = [],
        whitelist: includeTokens,
        blacklist: excludeTokens = [],
        onSelect,
        FixedSizeListProps,
        selectedTokens = [],
    } = props

    const t = useSharedI18N()
    const pluginID = useCurrentWeb3NetworkPluginID(props.pluginID) as T
    const account = useAccount()
    const chainId = useChainId(pluginID, props.chainId)
    const { Token, Others } = useWeb3State<'all'>()
    const { value: fungibleTokens = EMPTY_LIST, loading: loadingFungibleTokens } = useFungibleTokensFromTokenList(
        props.pluginID,
    )
    const trustedFungibleTokens = useTrustedFungibleTokens()
    const blockedFungibleTokens = useBlockedFungibleTokens()

    const nativeToken = Others?.chainResolver.nativeCurrency(chainId)
    const allFungibleTokens = uniqBy(
        [...(nativeToken ? [nativeToken] : []), ...tokens, ...fungibleTokens, ...trustedFungibleTokens],
        (x) => x.address.toLowerCase(),
    )

    const filteredFungibleTokens = allFungibleTokens.filter(
        (token) =>
            (!includeTokens || includeTokens.some(currySameAddress(token.address))) &&
            (!excludeTokens.length || !excludeTokens.some(currySameAddress(token.address))),
    )

    const { value: fungibleTokensBalance = EMPTY_OBJECT, loading: loadingFungibleTokensBalance } =
        useFungibleTokensBalance<T>(
            pluginID,
            filteredFungibleTokens.map((x) => x.address),
            // @ts-ignore
            { account, chainId },
        )

    console.log('fungibleTokensBalance', fungibleTokensBalance)
    const { value: fungibleAssets = EMPTY_LIST, loading: loadingFungibleAssets } = useFungibleAssets(pluginID)
    const fungibleAssetsTable = Object.fromEntries(fungibleAssets.map((x) => [x.address, x]))
    const isTrustedToken = currySameAddress(trustedFungibleTokens.map((x) => x.address))
    const isBlockedToken = currySameAddress(blockedFungibleTokens.map((x) => x.address))

    const sortedFungibleTokens = filteredFungibleTokens
        .filter((x) => !isBlockedToken(x))
        .sort((a, z) => {
            const aUSD = Number.parseFloat(fungibleAssetsTable[a.address]?.value?.[CurrencyType.USD] ?? '0')
            const zUSD = Number.parseFloat(fungibleAssetsTable[z.address]?.value?.[CurrencyType.USD] ?? '0')

            const aBalance = Number.parseFloat(formatBalance(fungibleTokensBalance[a.address] ?? '0', a.decimals))
            const zBalance = Number.parseFloat(formatBalance(fungibleTokensBalance[z.address] ?? '0', z.decimals))

            // the currently selected chain id
            if (a.chainId !== z.chainId) {
                if (a.chainId === chainId) return -1
                if (z.chainId === chainId) return 1
            }

            // native token
            if (isSameAddress(a.address, Others?.getNativeTokenAddress(a.chainId))) return -1
            if (isSameAddress(z.address, Others?.getNativeTokenAddress(z.chainId))) return 1

            // mask token with position value
            if (aUSD && isSameAddress(a.address, Others?.getMaskTokenAddress(a.chainId))) return -1
            if (zUSD && isSameAddress(z.address, Others?.getMaskTokenAddress(z.chainId))) return 1

            // token value
            if (aUSD !== zUSD) zUSD - aUSD

            // trusted token
            if (isTrustedToken(a.address)) return -1
            if (isTrustedToken(z.address)) return 1

            // token balance
            if (aBalance !== zBalance) return zBalance - aBalance

            // alphabet
            if (a.name !== z.name) return a.name < z.name ? -1 : 1

            return 0
        })

    // #region add token by address
    const [keyword, setKeyword] = useState('')
    const searchedTokenAddress =
        Others?.isValidAddress(keyword) && !sortedFungibleTokens.some((x) => isSameAddress(x.address, keyword))
            ? keyword
            : ''

    const { value: searchedToken, loading: searchingToken } = useFungibleToken(pluginID, searchedTokenAddress)
    // #endregion

    const getPlaceholder = () => {
        if (loadingFungibleTokens || loadingFungibleTokensBalance)
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
                searchedToken && sortedFungibleTokens.some((x) => isSameAddress(x.address, searchedTokenAddress))
                    ? [searchedToken]
                    : sortedFungibleTokens
            }
            searchKey={SEARCH_KEYS}
            disableSearch={!!props.disableSearch}
            itemRender={getFungibleTokenItem<T>(
                account,
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
