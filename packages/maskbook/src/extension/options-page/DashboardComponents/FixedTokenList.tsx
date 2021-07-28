import {
    currySameAddress,
    FungibleTokenDetailed,
    makeSortTokenFn,
    TokenListsState,
    useAccount,
    useAssetsByTokenList,
    useERC20TokensDetailedFromTokenLists,
    useEthereumConstants,
} from '@masknet/web3-shared'
import { makeStyles, Typography } from '@material-ui/core'
import { uniqBy } from 'lodash-es'
import { useState } from 'react'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import { useStylesExtends } from '@masknet/shared'
import { TokenInList } from './TokenInList'
import { EthereumAddress } from 'wallet.ts'

const useStyles = makeStyles((theme) => ({
    list: {},
    placeholder: {},
}))

export interface FixedTokenListProps extends withClasses<never> {
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

    const { state, tokensDetailed: erc20TokensDetailed } = useERC20TokensDetailedFromTokenLists(
        ERC20_TOKEN_LISTS,
        keyword,
    )

    const filteredTokens = erc20TokensDetailed.filter(
        (token) =>
            (!includeTokens.length || includeTokens.some(currySameAddress(token.address))) &&
            (!excludeTokens.length || !excludeTokens.some(currySameAddress(token.address))),
    )

    const renderTokens = uniqBy([...tokens, ...filteredTokens], (x) => x.address.toLowerCase())

    const {
        loading: loadingAssets,
        value: assets,
        error: loadingAssetsError,
    } = useAssetsByTokenList(renderTokens.filter((x) => EthereumAddress.isValid(x.address)))

    const renderAssets =
        loadingAssetsError || !account || loadingAssets
            ? renderTokens
                  .sort(makeSortTokenFn({ isMaskBoost: true }))
                  .map((token) => ({ token: token, balance: null }))
            : assets

    //#region UI helpers
    const renderPlaceholder = (message: string) => (
        <Typography className={classes.placeholder} color="textSecondary">
            {message}
        </Typography>
    )
    //#endregion

    if (state === TokenListsState.LOADING_TOKEN_LISTS) return renderPlaceholder('Loading token lists...')
    if (state === TokenListsState.LOADING_SEARCHED_TOKEN) return renderPlaceholder('Loading token...')
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
