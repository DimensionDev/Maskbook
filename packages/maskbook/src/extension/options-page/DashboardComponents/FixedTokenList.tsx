import {
    currySameAddress,
    EthereumTokenType,
    FungibleTokenDetailed,
    isSameAddress,
    TokenListsState,
    useAccount,
    useAssetsFromChain,
    useERC20TokensDetailedFromTokenLists,
    useEthereumConstants,
    useTokenConstants,
} from '@masknet/web3-shared'
import { makeStyles, Typography } from '@material-ui/core'
import { uniqBy } from 'lodash-es'
import { useState } from 'react'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import { useStylesExtends } from '../../../components/custom-ui-helper'
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
    onSubmit?(token: FungibleTokenDetailed): void
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
        onSubmit,
        FixedSizeListProps,
    } = props

    const { ERC20_TOKEN_LISTS } = useEthereumConstants()
    const [address, setAddress] = useState('')
    const { MASK_ADDRESS } = useTokenConstants()

    const { state, tokensDetailed: erc20TokensDetailed } = useERC20TokensDetailedFromTokenLists(
        ERC20_TOKEN_LISTS,
        keyword,
    )

    const filteredTokens = erc20TokensDetailed.filter(
        (token) =>
            (!includeTokens.length || includeTokens.some(currySameAddress(token.address))) &&
            (!excludeTokens.length || !excludeTokens.some(currySameAddress(token.address))),
    )

    const renderTokens = uniqBy([...tokens, ...filteredTokens], (x) => x.address.toLowerCase()).sort((a, z) => {
        if (a.type === EthereumTokenType.Native) return -1
        if (z.type === EthereumTokenType.Native) return 1
        if (isSameAddress(a.address, MASK_ADDRESS)) return -1
        if (isSameAddress(z.address, MASK_ADDRESS)) return 1
        return 0
    })

    const {
        loading: loadingAssets,
        value: assets,
        error,
    } = useAssetsFromChain(renderTokens.filter((x) => EthereumAddress.isValid(x.address)))

    const renderAssets =
        error || !account || loadingAssets
            ? renderTokens.map((token) => ({ token: token, balance: null }))
            : assets.sort((a, b) => {
                  if (a.balance > b.balance) return -1
                  if (a.balance < b.balance) return 1
                  return 0
              })

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
                    onSubmit?.(token)
                },
            }}
            itemCount={renderAssets.length}
            {...FixedSizeListProps}>
            {TokenInList}
        </FixedSizeList>
    )
}
