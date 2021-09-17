import React, { memo, useEffect, useMemo, useState } from 'react'
import { getERC20TokenListItem } from './ERC20TokenListItem'
import { uniqBy } from 'lodash-es'
import {
    Asset,
    currySameAddress,
    FungibleTokenDetailed,
    isValidAddress,
    makeSortAssertFn,
    makeSortTokenFn,
    useAccount,
    useAssetsByTokenList,
    useChainId,
    useERC20TokenDetailed,
    useERC20TokensDetailedFromTokenLists,
    useEthereumConstants,
    useNativeTokenDetailed,
    useTrustedERC20Tokens,
} from '@masknet/web3-shared'
import { MaskFixedSizeListProps, SearchableList } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { useSharedI18N } from '../../../locales'

export interface ERC20TokenListProps extends withClasses<'list' | 'placeholder'> {
    whitelist?: string[]
    blacklist?: string[]
    tokens?: FungibleTokenDetailed[]
    selectedTokens?: string[]
    onSelect?(token: FungibleTokenDetailed | null): void
    FixedSizeListProps?: Partial<MaskFixedSizeListProps>
}

const Placeholder = memo(({ message }: { message: string }) => (
    <Stack minHeight={300} justifyContent="center" alignContent="center">
        <Typography color="textSecondary" textAlign="center">
            {message}
        </Typography>
    </Stack>
))

export const ERC20TokenList = memo<ERC20TokenListProps>((props) => {
    const t = useSharedI18N()
    const account = useAccount()
    const chainId = useChainId()
    const trustedERC20Tokens = useTrustedERC20Tokens()
    const { value: nativeToken } = useNativeTokenDetailed()
    const [keyword, setKeyword] = useState('')

    const {
        whitelist: includeTokens,
        blacklist: excludeTokens = [],
        selectedTokens = [],
        tokens = [],
        onSelect,
        FixedSizeListProps,
    } = props

    const { ERC20_TOKEN_LISTS } = useEthereumConstants()

    const { value: erc20TokensDetailed = [], loading: erc20TokensDetailedLoading } =
        useERC20TokensDetailedFromTokenLists(
            ERC20_TOKEN_LISTS,
            keyword,
            nativeToken ? [...trustedERC20Tokens, nativeToken] : trustedERC20Tokens,
        )

    //#region add token by address
    const matchedTokenAddress = useMemo(() => {
        if (!keyword || !isValidAddress(keyword) || erc20TokensDetailed.length) return
        return keyword
    }, [keyword, erc20TokensDetailed.length])

    const { value: searchedToken, loading: searchedTokenLoading } = useERC20TokenDetailed(matchedTokenAddress ?? '')
    //#endregion

    const filteredTokens = erc20TokensDetailed.filter(
        (token) =>
            (!includeTokens || includeTokens.some(currySameAddress(token.address))) &&
            (!excludeTokens.length || !excludeTokens.some(currySameAddress(token.address))),
    )

    const renderTokens = uniqBy([...tokens, ...filteredTokens, ...(searchedToken ? [searchedToken] : [])], (x) =>
        x.address.toLowerCase(),
    )

    const {
        value: assets,
        loading: assetsLoading,
        error: assetsError,
        retry: retryLoadAsset,
    } = useAssetsByTokenList(renderTokens.filter((x) => isValidAddress(x.address)))

    useEffect(() => {
        if (assetsError) retryLoadAsset()
    }, [assetsError])

    const renderAssets =
        !account || assetsError || assetsLoading
            ? [...renderTokens]
                  .sort(makeSortTokenFn(chainId, { isMaskBoost: true }))
                  .map((token) => ({ token: token, balance: null }))
            : !!keyword
            ? assets
            : [...assets].sort(makeSortAssertFn(chainId, { isMaskBoost: true }))

    const getPlaceHolder = () => {
        if (erc20TokensDetailedLoading) return <Placeholder message="Loading token lists..." />
        if (searchedTokenLoading) return <Placeholder message="Loading token..." />
        // if (assetsLoading) return <Placeholder message="Loading token assets..." />
        if (!renderAssets.length) return <Placeholder message="No token found" />
        return null
    }

    return (
        <SearchableList<Asset>
            textFieldProps={{
                placeholder: t.erc20_token_list_placeholder(),
            }}
            onSelect={(asset) => onSelect?.(asset.token)}
            onSearch={setKeyword}
            data={renderAssets as Asset[]}
            searchKey={['token.address', 'token.symbol', 'token.name']}
            itemRender={getERC20TokenListItem(trustedERC20Tokens, searchedToken ? [searchedToken] : [], account)}
            placeholder={getPlaceHolder()}
            FixedSizeListProps={FixedSizeListProps}
        />
    )
})
