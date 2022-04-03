import { useWeb3State, Web3Plugin } from '@masknet/plugin-infra'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import { formatNFT_TokenId, useChainId } from '@masknet/web3-shared-evm'
import { Checkbox, Link, List, ListItem, Radio } from '@mui/material'
import classnames from 'classnames'
import { noop } from 'lodash-unified'
import { FC, useCallback } from 'react'

interface Props {
    selectedIds: string[]
    tokens: Web3Plugin.NonFungibleToken[]
    onChange?: (id: string, contractAddress: string) => void
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
        height: 100,
        width: 100,
        img: {
            height: '100%',
            width: '100%',
        },
    },
}))

interface NFTItemProps {
    token: Web3Plugin.NonFungibleToken
}

export const NFTItem: FC<NFTItemProps> = ({ token }) => {
    const { classes } = useStyles()
    const chainId = useChainId()
    return (
        <NFTCardStyledAssetPlayer
            chainId={chainId}
            contractAddress={token.contract?.address}
            url={token.info?.imageURL ?? token.metadata?.assetURL}
            tokenId={token.tokenId}
            classes={{
                loadingFailImage: classes.loadingFailImage,
                iframe: classes.assetPlayerIframe,
                imgWrapper: classes.imgWrapper,
            }}
        />
    )
}

export const NFTList: FC<Props> = ({ selectedIds, tokens, onChange, limit = 1, className }) => {
    const { classes } = useStyles()

    const isRadio = limit === 1
    const reachedLimit = selectedIds.length >= limit

    const toggleItem = useCallback(
        (currentId: string, contractAddress: string) => {
            onChange?.(currentId, contractAddress)
        },
        [selectedIds, onChange, isRadio, reachedLimit],
    )

    const SelectComponent = isRadio ? Radio : Checkbox
    const { Utils } = useWeb3State()

    return (
        <List className={classnames(classes.list, className)}>
            {tokens.map((token) => {
                const disabled = !isRadio && reachedLimit && !selectedIds.includes(token.tokenId)
                const link =
                    Utils?.resolveNonFungibleTokenLink && token.contract
                        ? Utils.resolveNonFungibleTokenLink(
                              token.contract?.chainId,
                              token.contract?.address,
                              token.tokenId,
                          )
                        : undefined
                return (
                    <ShadowRootTooltip
                        key={token.tokenId}
                        title={`${token.contract?.name} ${formatNFT_TokenId(token.tokenId, 2)}`}
                        placement="top"
                        arrow>
                        <ListItem
                            key={token.tokenId}
                            className={classnames(classes.nftItem, {
                                [classes.disabled]: disabled,
                                [classes.selected]: selectedIds.includes(token.tokenId),
                                [classes.unselected]: selectedIds.length > 0 && !selectedIds.includes(token.tokenId),
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
                                    toggleItem(token.tokenId, token.contract.address)
                                }}
                                className={classes.checkbox}
                                checked={selectedIds.includes(token.tokenId)}
                            />
                        </ListItem>
                    </ShadowRootTooltip>
                )
            })}
        </List>
    )
}
