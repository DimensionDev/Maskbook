import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { ERC721TokenDetailed, useChainId } from '@masknet/web3-shared-evm'
import { Checkbox, List, ListItem } from '@mui/material'
import classnames from 'classnames'
import { noop } from 'lodash-unified'
import { FC, useCallback } from 'react'

interface Props {
    selectedIds: string[]
    tokens: ERC721TokenDetailed[]
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
}))

export function arrayRemove<T>(arr: T[], item: T): T[] {
    const idx = arr.indexOf(item)
    return arr.splice(idx, 1)
}

export const NFTList: FC<Props> = ({ selectedIds, onChange, limit = 1, tokens, className }) => {
    const chainId = useChainId()
    const { classes } = useStyles()

    const reachedLimit = selectedIds.length >= limit

    const toggleItem = useCallback(
        (currentId: string) => {
            const disabled = !selectedIds.includes(currentId) && reachedLimit
            if (!onChange || disabled) return
            let newIds = [...selectedIds]
            if (selectedIds.includes(currentId)) {
                arrayRemove(newIds, currentId)
            } else if (!reachedLimit) {
                newIds = [...selectedIds, currentId]
            }
            onChange(newIds)
        },
        [selectedIds, onChange, reachedLimit],
    )

    return (
        <List className={className}>
            {tokens.map((token) => (
                <ListItem
                    key={token.tokenId}
                    className={classnames({
                        [classes.nftItem]: true,
                        [classes.disabled]: reachedLimit && !selectedIds.includes(token.tokenId),
                    })}
                    onClick={() => {
                        toggleItem(token.tokenId)
                    }}>
                    <NFTCardStyledAssetPlayer
                        chainId={chainId}
                        contractAddress={token.contractDetailed.address}
                        url={token.info.mediaUrl}
                        tokenId={token.tokenId}
                    />
                    <Checkbox
                        onChange={noop}
                        onClick={() => {
                            toggleItem(token.tokenId)
                        }}
                        className={classes.checkbox}
                        checked={selectedIds.includes(token.tokenId)}
                    />
                </ListItem>
            ))}
        </List>
    )
}
