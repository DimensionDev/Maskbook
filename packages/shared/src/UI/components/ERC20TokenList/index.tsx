import React, { memo, useMemo, useState } from 'react'
import { getERC20TokenListItem } from './ERC20TokenListItem'
import { uniqBy } from 'lodash-es'
import {
    Asset,
    currySameAddress,
    FungibleTokenDetailed,
    isValidAddress,
    makeSortAssertFn,
    makeSortTokenFn,
    useAssetsByTokenList,
    useERC20TokenDetailed,
    useERC20TokensDetailedFromTokenLists,
    useEthereumConstants,
    useTrustedERC20Tokens,
    useWeb3State,
} from '@masknet/web3-shared'
import { SearchableList } from '@masknet/theme'
import { Stack, Typography } from '@material-ui/core'

export interface ERC20TokenListProps extends withClasses<'list' | 'placeholder'> {
    whitelist?: string[]
    blacklist?: string[]
    tokens?: FungibleTokenDetailed[]
    selectedTokens?: string[]
    onSelect?(token: FungibleTokenDetailed | null): void
}

const Placeholder = memo(({ message }: { message: string }) => (
    <Stack minHeight={300} justifyContent="center" alignContent="center">
        <Typography color="textSecondary" textAlign="center">
            {message}
        </Typography>
    </Stack>
))

export const ERC20TokenList = memo<ERC20TokenListProps>((props) => {
    const { account, chainId } = useWeb3State()
    const trustedERC20Tokens = useTrustedERC20Tokens()
    const [keyword, setKeyword] = useState('')

    const {
        whitelist: includeTokens = [],
        blacklist: excludeTokens = [],
        selectedTokens = [],
        tokens = [],
        onSelect,
    } = props

    // todo: set
    const [address, setAddress] = useState('')
    const { ERC20_TOKEN_LISTS } = useEthereumConstants()

    const { value: erc20TokensDetailed = [], loading: erc20TokensDetailedLoading } =
        useERC20TokensDetailedFromTokenLists(ERC20_TOKEN_LISTS, keyword, trustedERC20Tokens)

    //#region add token by address
    const matchedTokenAddress = useMemo(() => {
        if (!keyword || !isValidAddress(keyword) || erc20TokensDetailed.length) return
        return keyword
    }, [keyword, erc20TokensDetailed.length])

    const { value: searchedToken, loading: searchedTokenLoading } = useERC20TokenDetailed(matchedTokenAddress ?? '')
    //#endregion

    const filteredTokens = erc20TokensDetailed.filter(
        (token) =>
            (!includeTokens.length || includeTokens.some(currySameAddress(token.address))) &&
            (!excludeTokens.length || !excludeTokens.some(currySameAddress(token.address))),
    )

    const renderTokens = uniqBy([...tokens, ...filteredTokens, ...(searchedToken ? [searchedToken] : [])], (x) =>
        x.address.toLowerCase(),
    )

    const {
        value: assets,
        loading: assetsLoading,
        error: assetsError,
    } = useAssetsByTokenList(renderTokens.filter((x) => isValidAddress(x.address)))

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
        if (assetsLoading) return <Placeholder message="Loading token assets..." />
        if (!renderAssets.length) return <Placeholder message="No token found" />
        return null
    }

    return (
        <SearchableList<Asset>
            onSelect={(asset) => onSelect?.(asset.token)}
            onSearch={setKeyword}
            data={renderAssets as Asset[]}
            searchKey={['token.address', 'token.symbol', 'token.name']}
            itemRender={getERC20TokenListItem(trustedERC20Tokens, searchedToken ? [searchedToken] : [], account)}
            placeholder={getPlaceHolder()}
        />
    )
})
