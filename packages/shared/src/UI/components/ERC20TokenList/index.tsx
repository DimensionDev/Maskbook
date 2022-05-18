import { memo, useMemo, useState } from 'react'
import { uniqBy } from 'lodash-unified'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { MaskFixedSizeListProps, MaskTextFieldProps, SearchableList } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { useSharedI18N } from '../../../locales'
import {
    useAccount,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useFungibleToken,
    useFungibleTokens,
    useFungibleTokensFromTokenList,
    useNativeToken,
    useTrustedFungibleTokens,
    useWeb3State,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import { currySameAddress, FungibleToken, isSameAddress } from '@masknet/web3-shared-base'

const DEFAULT_LIST_HEIGHT = 300
const SEARCH_KEYS = ['token.address', 'token.symbol', 'token.name']

export interface FungibleTokenListProps extends withClasses<'list' | 'placeholder'> {
    chainId?: Web3Helper.ChainIdAll
    whitelist?: string[]
    blacklist?: string[]
    tokens?: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>[]
    selectedTokens?: string[]
    disableSearch?: boolean
    onSelect?(token: FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll> | null): void
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

export const FungibleTokenList = memo<FungibleTokenListProps>((props) => {
    const {
        whitelist: includeTokens,
        blacklist: excludeTokens = [],
        tokens = [],
        onSelect,
        FixedSizeListProps,
        selectedTokens = [],
    } = props

    const t = useSharedI18N()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const { Others } = useWeb3State() as Web3Helper.Web3StateAll
    const account = useAccount()
    const chainId = useChainId(pluginID, props.chainId)
    const trustedERC20Tokens = useTrustedFungibleTokens()
    // const { value: nativeToken } = useNativeToken(pluginID, {
    //     chainId,
    // })

    const fungibleTokens = useFungibleTokensFromTokenList(
        pluginID,
        // ERC20,
        // keyword,
        // nativeToken ? [...trustedERC20Tokens, nativeToken] : trustedERC20Tokens,
        // chainId,
    )

    // #region add token by address
    const [keyword, setKeyword] = useState('')
    const matchedTokenAddress = useMemo(() => {
        if (!keyword || !Others?.isValidAddress(keyword)) return
        return keyword
    }, [keyword, fungibleTokens])

    const { value: searchedToken, loading: searchedTokenLoading } = useFungibleToken(
        pluginID,
        matchedTokenAddress ?? '',
    )
    // #endregion

    const filteredFungibleTokens = fungibleTokens.filter(
        (token) =>
            (!includeTokens || includeTokens.some(currySameAddress(token.address))) &&
            (!excludeTokens.length || !excludeTokens.some(currySameAddress(token.address))),
    )

    const renderTokens = uniqBy(
        [...tokens, ...filteredFungibleTokens, ...(searchedToken ? [searchedToken] : EMPTY_LIST)],
        (x) => x.address.toLowerCase(),
    )

    console.log({
        keyword,
        trustedERC20Tokens,
        filteredFungibleTokens,
        renderTokens,
        searchedToken,
        fungibleTokens,
        matchedTokenAddress,
    })

    // const {
    //     value: assets,
    //     loading: assetsLoading,
    //     error: assetsError,
    //     retry: retryLoadAsset,
    // } = useAssetsByTokenList(
    //     renderTokens.filter((x) => Others?.isValidAddress(x.address)),
    //     chainId,
    // )

    // const renderAssets = useMemo(() => {
    //     return assetsLoading
    //         ? EMPTY_LIST
    //         : keyword
    //         ? assets
    //         : [...assets].sort(makeSortAssertFn(chainId, { isMaskBoost: true }))
    // }, [
    //     chainId,
    //     keyword,
    //     assetsLoading,
    //     assets
    //         .map((x) => x.token.address)
    //         .sort((a, b) => a.localeCompare('en-US', b))
    //         .join(),
    // ])

    return null

    // const getPlaceHolder = () => {
    //     if (renderTokens.length === 0)
    //         return <Placeholder height={FixedSizeListProps?.height} message={t.erc20_token_list_loading()} />
    //     if (searchedTokenLoading)
    //         return <Placeholder height={FixedSizeListProps?.height} message={t.erc20_search_token_loading()} />
    //     if (!renderAssets.length)
    //         return <Placeholder height={FixedSizeListProps?.height} message={t.erc20_search_not_token_found()} />
    //     return null
    // }

    // return (
    //     <SearchableList<FungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    //         SearchFieldProps={{
    //             placeholder: t.erc20_token_list_placeholder(),
    //             ...props.SearchTextFieldProps,
    //         }}
    //         onSelect={(asset) => onSelect?.(asset.token)}
    //         disableSearch={!!props.disableSearch}
    //         onSearch={setKeyword}
    //         data={renderAssets as Asset[]}
    //         searchKey={SEARCH_KEYS}
    //         itemRender={getERC20TokenListItem(
    //             trustedERC20Tokens,
    //             searchedToken ? [searchedToken] : [],
    //             searchedToken
    //                 ? [...tokens, ...erc20TokensDetailed].find((x) => isSameAddress(x.address, searchedToken.address))
    //                     ? { from: 'search', inList: true }
    //                     : { from: 'search', inList: false }
    //                 : { from: 'defaultList', inList: true },
    //             selectedTokens,
    //             assetsLoading,
    //             account,
    //         )}
    //         placeholder={getPlaceHolder()}
    //         FixedSizeListProps={FixedSizeListProps}
    //     />
    // )
})
