import { memo, useMemo, useState } from 'react'
import { getERC20TokenListItem } from './ERC20TokenListItem'
import { uniqBy } from 'lodash-unified'
import type { ChainId, isValidAddress, useTokenListConstants, SchemaType } from '@masknet/web3-shared-evm'
import {
    useAccount,
    useChainId,
    useFungibleToken,
    useTrustedFungibleTokens,
    useFungibleTokensFromTokenList,
} from '@masknet/plugin-infra/web3'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { MaskFixedSizeListProps, MaskTextFieldProps, SearchableList } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { useSharedI18N } from '../../../locales'
import type {
    currySameAddress,
    FungibleAsset,
    FungibleToken,
    isSameAddress,
    NetworkPluginID,
} from '@masknet/web3-shared-base'

const DEFAULT_LIST_HEIGHT = 300
const SEARCH_KEYS = ['token.address', 'token.symbol', 'token.name']

export interface ERC20TokenListProps extends withClasses<'list' | 'placeholder'> {
    targetChainId?: ChainId
    whitelist?: string[]
    blacklist?: string[]
    tokens?: FungibleToken<ChainId, SchemaType>[]
    selectedTokens?: string[]
    disableSearch?: boolean
    onSelect?(token: FungibleToken<ChainId, SchemaType> | null): void
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

export const ERC20TokenList = memo<ERC20TokenListProps>((props) => {
    return null
    // const t = useSharedI18N()
    // const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    // const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    // const chainId = props.targetChainId ?? currentChainId
    // const trustedERC20Tokens = useFungibleTokens(NetworkPluginID.PLUGIN_EVM, SchemaType.ERC20)
    // const { value: nativeToken } = useFungibleToken(NetworkPluginID.PLUGIN_EVM)
    // const [keyword, setKeyword] = useState('')

    // const {
    //     whitelist: includeTokens,
    //     blacklist: excludeTokens = [],
    //     tokens = [],
    //     onSelect,
    //     FixedSizeListProps,
    //     selectedTokens = [],
    // } = props

    // const { FUNGIBLE_TOKEN_LISTS = EMPTY_LIST } = useTokenListConstants(chainId)
    // const { value: erc20TokensDetailed = EMPTY_LIST, loading: erc20TokensDetailedLoading } =
    //     useFungibleTokensFromTokenList(
    //         NetworkPluginID.PLUGIN_EVM,
    //         // FUNGIBLE_TOKEN_LISTS,
    //         // keyword,
    //         // nativeToken ? [...trustedERC20Tokens, nativeToken] : trustedERC20Tokens,
    //         // chainId,
    //     )

    // // #region add token by address
    // const matchedTokenAddress = useMemo(() => {
    //     if (!keyword || !isValidAddress(keyword) || erc20TokensDetailedLoading) return
    //     return keyword
    // }, [keyword, erc20TokensDetailedLoading])

    // const { value: searchedToken, loading: searchedTokenLoading } = useFungibleToken(
    //     NetworkPluginID.PLUGIN_EVM,
    //     matchedTokenAddress ?? '',
    // )
    // // #endregion

    // const filteredTokens = erc20TokensDetailed.filter(
    //     (token) =>
    //         (!includeTokens || includeTokens.some(currySameAddress(token.address))) &&
    //         (!excludeTokens.length || !excludeTokens.some(currySameAddress(token.address))),
    // )

    // const renderTokens = uniqBy(
    //     [...tokens, ...filteredTokens, ...(searchedToken ? [searchedToken] : EMPTY_LIST)],
    //     (x) => x.address.toLowerCase(),
    // )

    // const {
    //     value: assets,
    //     loading: assetsLoading,
    //     error: assetsError,
    //     retry: retryLoadAsset,
    // } = useAssetsByTokenList(
    //     renderTokens.filter((x) => isValidAddress(x.address)),
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
    //         // eslint-disable-next-line @dimensiondev/array/no-implicit-sort
    //         .sort()
    //         .join(),
    // ])

    // const getPlaceHolder = () => {
    //     if (erc20TokensDetailedLoading || assetsLoading)
    //         return <Placeholder height={FixedSizeListProps?.height} message={t.erc20_token_list_loading()} />
    //     if (searchedTokenLoading)
    //         return <Placeholder height={FixedSizeListProps?.height} message={t.erc20_search_token_loading()} />
    //     if (!renderAssets.length)
    //         return <Placeholder height={FixedSizeListProps?.height} message={t.erc20_search_not_token_found()} />
    //     return null
    // }

    // return (
    //     <SearchableList<FungibleAsset<ChainId, SchemaType>>
    //         SearchFieldProps={{
    //             placeholder: t.erc20_token_list_placeholder(),
    //             ...props.SearchTextFieldProps,
    //         }}
    //         onSelect={(asset) => onSelect?.(asset.token)}
    //         disableSearch={!!props.disableSearch}
    //         onSearch={setKeyword}
    //         data={renderAssets as FungibleAsset<ChainId, SchemaType>[]}
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
