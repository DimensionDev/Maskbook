import React, { useCallback, useState } from 'react'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import { TokenListsState, useTokensFromLists } from '../../../web3/hooks/useTokensFromLists'
import { makeStyles, Theme, createStyles, Typography } from '@material-ui/core'
import { useConstant } from '../../../web3/hooks/useConstant'
import { CONSTANTS } from '../../../web3/constants'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { isSameAddress } from '../../../web3/helpers'
import { TokenInList } from './TokenInList'
import type { Token } from '../../../web3/types'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        list: {},
        placeholder: {},
    }),
)

export interface FixedTokenListProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    useEther?: boolean
    keyword?: string
    excludeTokens?: string[]
    onSubmit?(token: Token): void
    FixedSizeListProps?: Partial<FixedSizeListProps>
}

export function FixedTokenList(props: FixedTokenListProps) {
    const classes = useStylesExtends(useStyles(), props)
    const { keyword, excludeTokens, useEther = false, onSubmit, FixedSizeListProps } = props

    //#region search tokens
    const TOKEN_LISTS = useConstant(CONSTANTS, 'TOKEN_LISTS')
    const [address, setAddress] = useState('')
    const searchedTokens = useTokensFromLists(TOKEN_LISTS, {
        keyword,
        useEther,
    })
    //#endregion

    //#region UI helpers
    const renderList = useCallback(
        (tokens: Token[]) => {
            return (
                <FixedSizeList
                    className={classes.list}
                    width="100%"
                    height={100}
                    overscanCount={4}
                    itemSize={50}
                    itemData={{
                        tokens,
                        excludeTokens,
                        selected: address,
                        onSelect(address: string) {
                            const token = tokens.find((token) => isSameAddress(token.address, address))
                            if (!token) return
                            setAddress(token.address)
                            onSubmit?.(token)
                        },
                    }}
                    itemCount={tokens.length}
                    {...FixedSizeListProps}>
                    {TokenInList}
                </FixedSizeList>
            )
        },
        [address, excludeTokens, TokenInList, onSubmit],
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
    if (searchedTokens.state === TokenListsState.LOADING_TOKEN_LISTS) return renderPlaceholder('Loading token lists...')
    if (searchedTokens.state === TokenListsState.LOADING_SEARCHED_TOKEN) return renderPlaceholder('Loading token...')
    if (searchedTokens.tokens.length) return renderList(searchedTokens.tokens)
    return renderPlaceholder('No token found')
}
