import { useCallback, useState } from 'react'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import { makeStyles, createStyles, Typography } from '@material-ui/core'
import {
    TokenListsState,
    useERC20TokensDetailedFromTokenLists,
} from '../../../web3/hooks/useERC20TokensDetailedFromTokenLists'
import { useConstant } from '../../../web3/hooks/useConstant'
import { CONSTANTS } from '../../../web3/constants'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { isSameAddress } from '../../../web3/helpers'
import { TokenInList } from './TokenInList'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { useEtherTokenDetailed } from '../../../web3/hooks/useEtherTokenDetailed'

const useStyles = makeStyles((theme) =>
    createStyles({
        list: {},
        placeholder: {},
    }),
)

export interface FixedTokenListProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    useEther?: boolean
    keyword?: string
    includeTokens?: string[]
    excludeTokens?: string[]
    selectedTokens?: string[]
    onSubmit?(token: EtherTokenDetailed | ERC20TokenDetailed): void
    FixedSizeListProps?: Partial<FixedSizeListProps>
}

export function FixedTokenList(props: FixedTokenListProps) {
    const classes = useStylesExtends(useStyles(), props)
    const {
        keyword,
        includeTokens = [],
        excludeTokens = [],
        selectedTokens = [],
        useEther = false,
        onSubmit,
        FixedSizeListProps,
    } = props

    //#region search tokens
    const ERC20_TOKEN_LISTS = useConstant(CONSTANTS, 'ERC20_TOKEN_LISTS')
    const [address, setAddress] = useState('')
    const { value: etherTokenDetailed } = useEtherTokenDetailed()
    const { state, tokensDetailed: erc20TokensDetailed } = useERC20TokensDetailedFromTokenLists(
        ERC20_TOKEN_LISTS,
        keyword,
    )
    //#endregion

    //#region UI helpers
    const renderList = useCallback(
        (tokens: (EtherTokenDetailed | ERC20TokenDetailed)[]) => {
            let tokens_ = tokens
            tokens_ = includeTokens.length
                ? tokens_.filter((x) => includeTokens.some((y) => isSameAddress(y, x.address)))
                : tokens_
            tokens_ = excludeTokens.length
                ? tokens_.filter((x) => !excludeTokens.some((y) => isSameAddress(y, x.address)))
                : tokens_

            return (
                <FixedSizeList
                    className={classes.list}
                    width="100%"
                    height={100}
                    overscanCount={4}
                    itemSize={50}
                    itemData={{
                        tokens: tokens_,
                        selected: [address, ...selectedTokens],
                        onSelect(address: string) {
                            const token = tokens_.find((token) => isSameAddress(token.address, address))
                            if (!token) return
                            setAddress(token.address)
                            onSubmit?.(token)
                        },
                    }}
                    itemCount={tokens_.length}
                    {...FixedSizeListProps}>
                    {TokenInList}
                </FixedSizeList>
            )
        },
        [address, includeTokens, excludeTokens, selectedTokens, TokenInList, onSubmit],
    )
    const renderPlaceholder = useCallback(
        (message: string) => (
            <Typography className={classes.placeholder} color="textSecondary">
                {message}
            </Typography>
        ),
        [],
    )
    //#endregion

    if (state === TokenListsState.LOADING_TOKEN_LISTS) return renderPlaceholder('Loading token lists...')
    if (state === TokenListsState.LOADING_SEARCHED_TOKEN) return renderPlaceholder('Loading token...')
    if (useEther && etherTokenDetailed) return renderList([etherTokenDetailed, ...erc20TokensDetailed])
    if (erc20TokensDetailed.length) return renderList(erc20TokensDetailed)
    return renderPlaceholder('No token found')
}
