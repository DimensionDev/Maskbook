import { useChainId, useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { isSameAddress, NonFungibleToken } from '@masknet/web3-shared-base'
import { Checkbox, Link, List, ListItem, Radio } from '@mui/material'
import classnames from 'classnames'
import { noop } from 'lodash-unified'
import { FC, useCallback } from 'react'
import type { TipNFTKeyPair } from '../../types'

interface Props {
    selectedPairs: TipNFTKeyPair[]
    tokens: Array<NonFungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    onChange?: (id: string | null, contractAddress: string) => void
    limit?: number
    className: string
}

const useStyles = makeStyles()((theme) => ({
    checkbox: {
        position: 'absolute',
        right: 0,
        top: 0,
    },
    list: {
        gridGap: 13,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
    },
    nftItem: {
        position: 'relative',
        cursor: 'pointer',
        background: theme.palette.mode === 'light' ? '#EDEFEF' : '#2F3336',
        display: 'flex',
        overflow: 'hidden',
        padding: 0,
        flexDirection: 'column',
        borderRadius: 12,
        height: 100,
        userSelect: 'none',
        width: 100,
        justifyContent: 'center',
    },
    disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    selected: {
        position: 'relative',
        '&::after': {
            position: 'absolute',
            border: `2px solid ${theme.palette.primary.main}`,
            content: '""',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            boxSizing: 'border-box',
            width: '100%',
            height: '100%',
            borderRadius: 12,
        },
    },
    unselected: {
        opacity: 0.5,
    },
    loadingFailImage: {
        width: 64,
        height: 64,
    },
    assetPlayerIframe: {
        height: 100,
        width: 100,
    },
    imgWrapper: {
        height: '100px !important',
        width: '100px !important',
        img: {
            height: '100%',
            width: '100%',
        },
    },
    tooltip: {
        marginBottom: `${theme.spacing(0.5)} !important`,
    },
}))

interface NFTItemProps {
    token: NonFungibleToken<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export const NFTItem: FC<NFTItemProps> = ({ token }) => {
    const { classes } = useStyles()
    const chainId = useChainId()
    return (
        <NFTCardStyledAssetPlayer
            chainId={chainId}
            contractAddress={token.contract?.address}
            url={token.metadata?.imageURL ?? token.metadata?.imageURL}
            tokenId={token.tokenId}
            classes={{
                loadingFailImage: classes.loadingFailImage,
                iframe: classes.assetPlayerIframe,
                imgWrapper: classes.imgWrapper,
            }}
        />
    )
}

const includes = (pairs: TipNFTKeyPair[], pair: TipNFTKeyPair): boolean => {
    return !!pairs.find(([address, tokenId]) => isSameAddress(address, pair[0]) && tokenId === pair[1])
}

export const NFTList: FC<Props> = ({ selectedPairs, tokens, onChange, limit = 1, className }) => {
    const { classes } = useStyles()

    const isRadio = limit === 1
    const reachedLimit = selectedPairs.length >= limit

    const toggleItem = useCallback(
        (currentId: string | null, contractAddress: string) => {
            onChange?.(currentId, contractAddress)
        },
        [onChange, isRadio, reachedLimit],
    )

    const SelectComponent = isRadio ? Radio : Checkbox
    const { Others } = useWeb3State() as Web3Helper.Web3StateAll

    return (
        <List className={classnames(classes.list, className)}>
            {tokens.map((token) => {
                const selected = includes(selectedPairs, [token.contract?.address!, token.tokenId])
                const disabled = !isRadio && reachedLimit && !selected
                const link = token.contract
                    ? Others?.explorerResolver?.nonFungibleTokenLink(
                          token.contract.chainId,
                          token.contract.address,
                          token.tokenId,
                      )
                    : undefined
                return (
                    <ShadowRootTooltip
                        classes={{ tooltip: classes.tooltip }}
                        key={token.tokenId}
                        title={`${token.contract?.name} ${Others?.formatTokenId(token.tokenId, 2)}`}
                        placement="top"
                        arrow>
                        <ListItem
                            key={token.tokenId}
                            className={classnames(classes.nftItem, {
                                [classes.disabled]: disabled,
                                [classes.selected]: selected,
                                [classes.unselected]: selectedPairs.length > 0 && !selected,
                            })}>
                            <Link target={link ? '_blank' : 'self'} rel="noreferrer noopener" href={link}>
                                <NFTItem token={token} />
                            </Link>
                            <SelectComponent
                                size="small"
                                onChange={noop}
                                disabled={disabled}
                                onClick={() => {
                                    if (disabled || !token.contract?.address) return
                                    if (selected) {
                                        toggleItem(null, '')
                                    } else {
                                        toggleItem(token.tokenId, token.contract.address)
                                    }
                                }}
                                className={classes.checkbox}
                                checked={selected}
                            />
                        </ListItem>
                    </ShadowRootTooltip>
                )
            })}
        </List>
    )
}
