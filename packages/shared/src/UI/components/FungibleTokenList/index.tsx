import { memo, useMemo, useState } from 'react'
import { uniqBy } from 'lodash-unified'
import { EMPTY_LIST } from '@masknet/shared-base'
import { MaskFixedSizeListProps, MaskTextFieldProps, SearchableList } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { useSharedI18N } from '../../../locales'
import {
    useAccount,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useFungibleToken,
    useFungibleTokensBalance,
    useFungibleTokensFromTokenList,
    useTrustedFungibleTokens,
    useWeb3State,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import { currySameAddress, FungibleToken, isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { getFungibleTokenItem } from './FungibleTokenItem'

const DEFAULT_LIST_HEIGHT = 300
const SEARCH_KEYS = ['token.address', 'token.symbol', 'token.name']

export interface FungibleTokenListProps<T extends NetworkPluginID> extends withClasses<'list' | 'placeholder'> {
    pluginID?: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    whitelist?: string[]
    blacklist?: string[]
    tokens?: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>[]
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
    const pluginID = useCurrentWeb3NetworkPluginID(props.pluginID)
    const account = useAccount()
    const chainId = useChainId(pluginID, props.chainId)
    const { Others } = useWeb3State() as Web3Helper.Web3State<T>
    const fungibleTokens = useFungibleTokensFromTokenList()
    const trustedFungibleTokens = useTrustedFungibleTokens()

    // #region add token by address
    const [keyword, setKeyword] = useState('')
    const searchedTokenAddress = useMemo(() => {
        if (!keyword || !Others?.isValidAddress(keyword)) return
        return keyword
    }, [keyword])

    const { value: searchedToken, loading: searchedTokenLoading } = useFungibleToken(
        pluginID,
        searchedTokenAddress ?? '',
    )
    // #endregion

    const allFungibleTokens = uniqBy(
        [...tokens, ...fungibleTokens, ...trustedFungibleTokens, ...(searchedToken ? [searchedToken] : EMPTY_LIST)],
        (x) => x.address.toLowerCase(),
    )

    const filteredFungibleTokens = allFungibleTokens.filter(
        (token) =>
            (!includeTokens || includeTokens.some(currySameAddress(token.address))) &&
            (!excludeTokens.length || !excludeTokens.some(currySameAddress(token.address))),
    )

    const { value: fungibleTokensBalance = {}, loading: fungibleTokensBalanceLoading } = useFungibleTokensBalance(
        pluginID,
        filteredFungibleTokens.map((x) => x.address),
    )

    console.log({
        keyword,
        trustedFungibleTokens,
        filteredFungibleTokens,
        fungibleTokensBalance,
        searchedToken,
        fungibleTokens,
    })

    // const getPlaceHolder = () => {
    //     if (renderTokens.length === 0)
    //         return <Placeholder height={FixedSizeListProps?.height} message={t.erc20_token_list_loading()} />
    //     if (searchedTokenLoading)
    //         return <Placeholder height={FixedSizeListProps?.height} message={t.erc20_search_token_loading()} />
    //     if (!renderAssets.length)
    //         return <Placeholder height={FixedSizeListProps?.height} message={t.erc20_search_not_token_found()} />
    //     return null
    // }

    return (
        <SearchableList<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
            onSelect={(token) => onSelect?.(token)}
            onSearch={setKeyword}
            data={filteredFungibleTokens}
            searchKey={SEARCH_KEYS}
            disableSearch={!!props.disableSearch}
            itemRender={getFungibleTokenItem<T>(
                'personal',
                false,
                false,
                '1000',
                account,
                // trustedFungibleTokens,
                // searchedToken ? [searchedToken] : [],
                // searchedToken
                //     ? [...tokens, ...erc20TokensDetailed].find((x) => isSameAddress(x.address, searchedToken.address))
                //         ? { from: 'search', inList: true }
                //         : { from: 'search', inList: false }
                //     : { from: 'defaultList', inList: true },
                // selectedTokens,
                // assetsLoading,
                // account,
            )}
            // placeholder={getPlaceHolder()}
            // placeholder="Test"
            FixedSizeListProps={FixedSizeListProps}
            SearchFieldProps={{
                placeholder: t.erc20_token_list_placeholder(),
                ...props.SearchTextFieldProps,
            }}
        />
    )
}
