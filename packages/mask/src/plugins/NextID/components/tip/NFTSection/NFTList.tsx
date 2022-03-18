import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { ERC721TokenDetailed, formatNFT_TokenId, useChainId } from '@masknet/web3-shared-evm'
import { Checkbox, List, ListItem, Radio, Typography } from '@mui/material'
import classnames from 'classnames'
import { noop } from 'lodash-unified'
import { FC, useCallback } from 'react'

interface Props {
    selectedIds: string[]
    tokens: ERC721TokenDetailed[]
    enableTokenIds?: string[]
    onChange?: (ids: string[]) => void
    limit?: number
    className: string
}

const useStyles = makeStyles()((theme) => ({
    checkbox: {
        position: 'absolute',
        right: 0,
        top: 0,
    },
    nftItem: {
        position: 'relative',
        cursor: 'pointer',
        background: theme.palette.mode === 'light' ? '#fff' : '#2F3336',
        display: 'flex',
        overflow: 'hidden',
        padding: 0,
        flexDirection: 'column',
        borderRadius: 8,
        height: 180,
        userSelect: 'none',
        width: 120,
        justifyContent: 'center',
    },
    disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    loadingFailImage: {
        width: 64,
        height: 64,
    },
}))

export function arrayRemove<T>(arr: T[], item: T): T[] {
    const idx = arr.indexOf(item)
    return arr.splice(idx, 1)
}

export const NFTList: FC<Props> = ({ selectedIds, tokens, enableTokenIds = [], onChange, limit = 1, className }) => {
    const chainId = useChainId()
    const { classes } = useStyles()

    const isRadio = limit === 1
    const reachedLimit = selectedIds.length >= limit

    const toggleItem = useCallback(
        (currentId: string) => {
            if (!onChange) return
            if (isRadio) return onChange([currentId])
            let newIds = [...selectedIds]
            if (selectedIds.includes(currentId)) {
                arrayRemove(newIds, currentId)
            } else if (!reachedLimit) {
                newIds = [...selectedIds, currentId]
            }
            onChange(newIds)
        },
        [selectedIds, onChange, isRadio, reachedLimit],
    )

    const SelectComponent = isRadio ? Radio : Checkbox

    return (
        <List className={className}>
            {tokens.map((token) => {
                const isNotOwned = !enableTokenIds.includes(token.tokenId)
                const disabled = (!isRadio && reachedLimit && !selectedIds.includes(token.tokenId)) || isNotOwned
                return (
                    <ListItem
                        key={token.tokenId}
                        className={classnames({
                            [classes.nftItem]: true,
                            [classes.disabled]: disabled,
                        })}
                        onClick={() => {
                            if (disabled) return
                            toggleItem(token.tokenId)
                        }}>
                        <NFTCardStyledAssetPlayer
                            chainId={chainId}
                            contractAddress={token.contractDetailed.address}
                            url={token.info.mediaUrl}
                            tokenId={token.tokenId}
                            classes={{
                                loadingFailImage: classes.loadingFailImage,
                            }}
                        />
                        <Typography variant="subtitle1" textAlign="center">
                            {formatNFT_TokenId(token.tokenId, 2)}
                        </Typography>
                        <SelectComponent
                            onChange={noop}
                            disabled={disabled}
                            onClick={() => {
                                if (disabled) return
                                toggleItem(token.tokenId)
                            }}
                            className={classes.checkbox}
                            checked={selectedIds.includes(token.tokenId)}
                        />
                    </ListItem>
                )
            })}
        </List>
    )
}
