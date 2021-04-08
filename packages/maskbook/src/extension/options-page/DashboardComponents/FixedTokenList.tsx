import { uniqBy } from 'lodash-es'
import { useState, useMemo } from 'react'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import { makeStyles, createStyles, Typography } from '@material-ui/core'
import { TokenListsState, useTokensDetailedFromTokenLists } from '../../../web3/hooks/useTokensDetailedFromTokenLists'
import { useConstant } from '../../../web3/hooks/useConstant'
import { CONSTANTS } from '../../../web3/constants'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { isSameAddress } from '../../../web3/helpers'
import { TokenInList } from './TokenInList'
import { EthereumTokenType, TokenDetailedType } from '../../../web3/types'
import { unreachable } from '../../../utils/utils'

const useStyles = makeStyles((theme) =>
    createStyles({
        list: {},
        placeholder: {},
    }),
)

export interface FixedTokenListProps extends withClasses<never> {
    type?: EthereumTokenType
    keyword?: string
    whitelist?: string[]
    blacklist?: string[]
    tokens?: TokenDetailedType<EthereumTokenType>[]
    selectedTokens?: string[]
    FixedSizeListProps?: Partial<FixedSizeListProps>
    onSubmit?(token: TokenDetailedType<EthereumTokenType>): void
}

export function FixedTokenList(props: FixedTokenListProps) {
    const {
        type = EthereumTokenType.Ether,
        keyword,
        whitelist: includeTokens = [],
        blacklist: excludeTokens = [],
        selectedTokens = [],
        tokens = [],
        FixedSizeListProps,
        onSubmit,
    } = props

    const classes = useStylesExtends(useStyles(), props)
    const [address, setAddress] = useState('')

    //#region search tokens
    const ERC20_TOKEN_LISTS = useConstant(CONSTANTS, 'ERC20_TOKEN_LISTS')
    const ERC721_TOKEN_LISTS = useConstant(CONSTANTS, 'ERC721_TOKEN_LISTS')
    const tokenLists = useMemo(() => {
        switch (type) {
            case EthereumTokenType.Ether:
                return []
            case EthereumTokenType.ERC20:
                return ERC20_TOKEN_LISTS
            case EthereumTokenType.ERC721:
                return ERC721_TOKEN_LISTS
            case EthereumTokenType.ERC1155:
                return []
            default:
                unreachable(type)
        }
    }, [type, ERC20_TOKEN_LISTS, ERC721_TOKEN_LISTS])
    const { state, tokensDetailed } = useTokensDetailedFromTokenLists(type, tokenLists, keyword)
    //#endregion

    //#region UI helpers
    const renderPlaceholder = (message: string) => (
        <Typography className={classes.placeholder} color="textSecondary">
            {message}
        </Typography>
    )
    //#endregion

    if (state === TokenListsState.LOADING_TOKEN_LISTS) return renderPlaceholder('Loading token lists…')
    if (state === TokenListsState.LOADING_SEARCHED_TOKEN) return renderPlaceholder('Loading token…')
    if (!tokensDetailed.length) return renderPlaceholder('No token found.')

    const filteredTokens = tokensDetailed.filter(
        (x) =>
            (!includeTokens.length || includeTokens.some((y) => isSameAddress(y, x.address))) &&
            (!excludeTokens.length || !excludeTokens.some((y) => isSameAddress(y, x.address))),
    )
    const renderTokens = uniqBy([...tokens, ...filteredTokens], (x) => x.address.toLowerCase())

    return (
        <FixedSizeList
            className={classes.list}
            width="100%"
            height={100}
            overscanCount={4}
            itemSize={50}
            itemData={{
                tokens: renderTokens,
                selected: [address, ...selectedTokens],
                onSelect(address: string) {
                    const token = renderTokens.find((token) => isSameAddress(token.address, address))
                    if (!token) return
                    setAddress(token.address)
                    onSubmit?.(token)
                },
            }}
            itemCount={renderTokens.length}
            {...FixedSizeListProps}>
            {TokenInList}
        </FixedSizeList>
    )
}
