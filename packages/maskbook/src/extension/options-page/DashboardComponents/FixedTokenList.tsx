import { createStyles, makeStyles, Typography } from '@material-ui/core'
import { uniqBy } from 'lodash-es'
import { useMemo, useState } from 'react'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { CONSTANTS } from '../../../web3/constants'
import { isSameAddress } from '../../../web3/helpers'
import { useConstant } from '../../../web3/hooks/useConstant'
import {
    TokenListsState,
    useERC20TokensDetailedFromTokenLists,
} from '../../../web3/hooks/useERC20TokensDetailedFromTokenLists'
import { useTokensBalanceMap } from '../../../web3/hooks/useTokensBalance'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { TokenInList } from './TokenInList'

const useStyles = makeStyles((theme) =>
    createStyles({
        list: {},
        placeholder: {},
    }),
)

export interface FixedTokenListProps extends withClasses<never> {
    keyword?: string
    whitelist?: string[]
    blacklist?: string[]
    tokens?: (ERC20TokenDetailed | EtherTokenDetailed)[]
    selectedTokens?: string[]
    onSubmit?(token: EtherTokenDetailed | ERC20TokenDetailed): void
    FixedSizeListProps?: Partial<FixedSizeListProps>
}

export function FixedTokenList(props: FixedTokenListProps) {
    const classes = useStylesExtends(useStyles(), props)
    const {
        keyword,
        whitelist: includeTokens = [],
        blacklist: excludeTokens = [],
        selectedTokens = [],
        tokens = [],
        onSubmit,
        FixedSizeListProps,
    } = props

    //#region search tokens
    const ERC20_TOKEN_LISTS = useConstant(CONSTANTS, 'ERC20_TOKEN_LISTS')
    const [address, setAddress] = useState('')
    const { state, tokensDetailed: erc20TokensDetailed, allTokens } = useERC20TokensDetailedFromTokenLists(
        ERC20_TOKEN_LISTS,
        keyword,
    )
    //#endregion

    //#region mask token
    const MASK_ADDRESS = useConstant(CONSTANTS, 'MASK_ADDRESS')
    //#endregion

    //#region UI helpers
    const renderPlaceholder = (message: string) => (
        <Typography className={classes.placeholder} color="textSecondary">
            {message}
        </Typography>
    )
    //#endregion

    const filteredTokens = erc20TokensDetailed.filter(
        (x) =>
            (!includeTokens.length || includeTokens.some((y) => isSameAddress(y, x.address))) &&
            (!excludeTokens.length || !excludeTokens.some((y) => isSameAddress(y, x.address))),
    )
    const renderTokens = uniqBy([...tokens, ...filteredTokens], (x) => x.address.toLowerCase()).sort((a, z) => {
        if (a.type === EthereumTokenType.Ether) return -1
        if (z.type === EthereumTokenType.Ether) return 1
        if (isSameAddress(a.address, MASK_ADDRESS)) return -1
        if (isSameAddress(z.address, MASK_ADDRESS)) return 1
        return 0
    })

    const allAddress = useMemo(() => {
        return allTokens.map((t) => t.address)
    }, [allTokens])
    const balance = useTokensBalanceMap(allAddress)

    if (state === TokenListsState.LOADING_TOKEN_LISTS) return renderPlaceholder('Loading token lists...')
    if (state === TokenListsState.LOADING_SEARCHED_TOKEN) return renderPlaceholder('Loading token...')
    if (!erc20TokensDetailed.length) return renderPlaceholder('No token found')

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
                balance,
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
