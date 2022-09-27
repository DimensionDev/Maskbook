import { FC, useCallback } from 'react'
import classnames from 'classnames'
import { useCurrentWeb3NetworkPluginID, useWeb3State } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ElementAnchor, RetryHint } from '@masknet/shared'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { Checkbox, List, ListItem, Radio, Stack, Tooltip } from '@mui/material'
import type { NonFungibleToken } from '../../../types/index.js'
import { NFTItem } from './NFTItem.js'

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
        height: 96,
        userSelect: 'none',
        width: 96,
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
    tooltip: {
        marginBottom: `${theme.spacing(0.5)} !important`,
    },
}))

export interface NFTListProps {
    selectedPairs: NonFungibleToken[]
    assets: Array<Web3Helper.NonFungibleAssetScope<'all'>>
    onChange?: (id: string | null, contractAddress?: string) => void
    limit?: number
    className: string
    nextPage(): void
    loadFinish: boolean
    loadError?: boolean
}

export const NFTList: FC<NFTListProps> = ({
    selectedPairs,
    assets,
    onChange,
    limit = 1,
    className,
    nextPage,
    loadFinish,
    loadError,
}) => {
    const { classes } = useStyles()

    const isRadio = limit === 1
    const reachedLimit = selectedPairs.length >= limit

    const toggleItem = useCallback(
        (currentId: string | null, contractAddress?: string) => {
            onChange?.(currentId, contractAddress)
        },
        [onChange, isRadio, reachedLimit],
    )
    const pluginId = useCurrentWeb3NetworkPluginID()
    const includes =
        pluginId === NetworkPluginID.PLUGIN_EVM
            ? (pairs: NonFungibleToken[], pair: NonFungibleToken): boolean => {
                  return !!pairs.find(([address, tokenId]) => isSameAddress(address, pair[0]) && tokenId === pair[1])
              }
            : (pairs: NonFungibleToken[], pair: NonFungibleToken): boolean => {
                  return !!pairs.find(([, tokenId]) => tokenId === pair[1])
              }

    const SelectComponent = isRadio ? Radio : Checkbox
    const { Others } = useWeb3State()

    return (
        <List className={classnames(classes.list, className)}>
            {assets.map((asset) => {
                const selected = includes(selectedPairs, [asset.contract?.address!, asset.tokenId])
                const disabled = !isRadio && reachedLimit && !selected
                const name = asset.collection?.name || asset.contract?.name
                const title = `${name} ${Others?.formatTokenId(asset.tokenId, 2)}`
                return (
                    <Tooltip
                        classes={{ tooltip: classes.tooltip }}
                        key={`${asset.address}/${asset.tokenId}/${asset.id}`}
                        title={title}
                        placement="top"
                        disableInteractive
                        PopperProps={{
                            disablePortal: true,
                            popperOptions: {
                                strategy: 'absolute',
                            },
                        }}
                        arrow>
                        <ListItem
                            className={classnames(classes.nftItem, {
                                [classes.disabled]: disabled,
                                [classes.selected]: selected,
                                [classes.unselected]: selectedPairs.length > 0 && !selected,
                            })}
                            onClick={() => {
                                if (disabled) return
                                if (selected) {
                                    toggleItem(null, '')
                                } else {
                                    toggleItem(asset.tokenId, asset.contract?.address)
                                }
                            }}>
                            <NFTItem asset={asset} />
                            <SelectComponent
                                size="small"
                                disabled={disabled}
                                className={classes.checkbox}
                                checked={selected}
                            />
                        </ListItem>
                    </Tooltip>
                )
            })}
            {loadError && !loadFinish && assets.length && (
                <Stack py={1} style={{ gridColumnStart: 1, gridColumnEnd: 6 }}>
                    <RetryHint hint={false} retry={nextPage} />
                </Stack>
            )}
            <Stack py={1} style={{ gridColumnStart: 1, gridColumnEnd: 6 }}>
                <ElementAnchor
                    callback={() => {
                        if (nextPage) nextPage()
                    }}>
                    {!loadFinish && <LoadingBase />}
                </ElementAnchor>
            </Stack>
        </List>
    )
}
