import {
    currySameAddress,
    FungibleTokenDetailed,
    makeSortTokenFn,
    useAccount,
    useAssetsByTokenList,
    useChainId,
    useERC20TokenDetailed,
    useERC20TokensDetailedFromTokenLists,
    useEthereumConstants,
} from '@masknet/web3-shared'
import { makeStyles, Typography } from '@material-ui/core'
import { uniqBy } from 'lodash-es'
import { useState, useMemo } from 'react'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import { useStylesExtends } from '@masknet/shared'
import { TokenInList } from './TokenInList'
import { EthereumAddress } from 'wallet.ts'

const useStyles = makeStyles((theme) => ({
    list: {},
    placeholder: {},
}))

export interface FixedTokenListProps extends withClasses<'list' | 'placeholder'> {
    keyword?: string
    whitelist?: string[]
    blacklist?: string[]
    tokens?: FungibleTokenDetailed[]
    selectedTokens?: string[]
    onSelect?(token: FungibleTokenDetailed | null): void
    FixedSizeListProps?: Partial<FixedSizeListProps>
}

export function FixedTokenList(props: FixedTokenListProps) {
    const classes = useStylesExtends(useStyles(), props)
    const account = useAccount()
    const chainId = useChainId()

    const {
        keyword,
        whitelist: includeTokens = [],
        blacklist: excludeTokens = [],
        selectedTokens = [],
        tokens = [],
        onSelect,
        FixedSizeListProps,
    } = props

    const [address, setAddress] = useState('')
    const { ERC20_TOKEN_LISTS } = useEthereumConstants()

    const { value: erc20TokensDetailed = [], loading: erc20TokensDetailedLoading } =
        useERC20TokensDetailedFromTokenLists(ERC20_TOKEN_LISTS, keyword)

    //#region add token by address
    const matchedTokenAddress = useMemo(() => {
        if (!keyword || !EthereumAddress.isValid(keyword) || erc20TokensDetailed.length) return
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
    } = useAssetsByTokenList(renderTokens.filter((x) => EthereumAddress.isValid(x.address)))

    const renderAssets =
        !account || assetsError || assetsLoading
            ? renderTokens
                  .sort(makeSortTokenFn(chainId, { isMaskBoost: true }))
                  .map((token) => ({ token: token, balance: null }))
            : assets

    //#region UI helpers
    const renderPlaceholder = (message: string) => (
        <Typography className={classes.placeholder} color="textSecondary">
            {message}
        </Typography>
    )
    //#endregion

    if (erc20TokensDetailedLoading) return renderPlaceholder('Loading token lists...')
    if (searchedTokenLoading) return renderPlaceholder('Loading token...')
    if (assetsLoading) return renderPlaceholder('Loading token assets...')
    if (!renderAssets.length) return renderPlaceholder('No token found')

    return (
        <FixedSizeList
            className={classes.list}
            width="100%"
            height={100}
            overscanCount={8}
            itemSize={50}
            itemData={{
                assets: renderAssets,
                selected: [address, ...selectedTokens],
                onSelect(token: FungibleTokenDetailed) {
                    setAddress(token.address)
                    onSelect?.(token)
                },
            }}
            itemCount={renderAssets.length}
            {...FixedSizeListProps}>
            {TokenInList}
        </FixedSizeList>
    )
}
