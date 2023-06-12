import { useCallback } from 'react'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ElementAnchor, AssetPreviewer, RetryHint } from '@masknet/shared'
import { useWeb3Others, useNetworkContext } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { Checkbox, List, ListItem, Radio, Stack, Tooltip } from '@mui/material'
import type { TipNFTKeyPair } from '../../types/index.js'

interface Props {
    selectedPairs: TipNFTKeyPair[]
    tokens: Web3Helper.NonFungibleAssetAll[]
    onChange?: (id: string | null, contractAddress?: string) => void
    limit?: number
    className: string
    nextPage(): void
    loadFinish: boolean
    loadError?: boolean
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
    fallbackImage: {
        width: 64,
        height: 64,
    },
    tooltip: {
        marginBottom: `${theme.spacing(0.5)} !important`,
    },
}))

interface NFTItemProps {
    token: Web3Helper.NonFungibleTokenAll
}

export const NFTItem = ({ token }: NFTItemProps) => {
    const { classes } = useStyles()
    return (
        <AssetPreviewer
            url={token.metadata?.imageURL ?? token.metadata?.mediaURL}
            classes={{
                fallbackImage: classes.fallbackImage,
            }}
        />
    )
}

export const NFTList = ({
    selectedPairs,
    tokens,
    onChange,
    limit = 1,
    className,
    nextPage,
    loadFinish,
    loadError,
}: Props) => {
    const { classes, cx } = useStyles()
    const { pluginID } = useNetworkContext()

    const isRadio = limit === 1
    const reachedLimit = selectedPairs.length >= limit

    const toggleItem = useCallback(
        (currentId: string | null, contractAddress?: string) => {
            onChange?.(currentId, contractAddress)
        },
        [onChange, isRadio, reachedLimit],
    )
    const includes =
        pluginID === NetworkPluginID.PLUGIN_EVM
            ? (pairs: TipNFTKeyPair[], pair: TipNFTKeyPair): boolean => {
                  return !!pairs.find(([address, tokenId]) => isSameAddress(address, pair[0]) && tokenId === pair[1])
              }
            : (pairs: TipNFTKeyPair[], pair: TipNFTKeyPair): boolean => {
                  return !!pairs.find(([, tokenId]) => tokenId === pair[1])
              }

    const SelectComponent = isRadio ? Radio : Checkbox
    const Others = useWeb3Others()

    return (
        <List className={cx(classes.list, className)}>
            {tokens.map((token) => {
                const selected = includes(selectedPairs, [token.contract?.address!, token.tokenId])
                const disabled = !isRadio && reachedLimit && !selected
                const name = token.collection?.name || token.contract?.name
                const title = `${name} ${Others.formatTokenId(token.tokenId, 2)}`
                return (
                    <Tooltip
                        classes={{ tooltip: classes.tooltip }}
                        key={`${token.address}/${token.tokenId}/${token.id}`}
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
                            className={cx(classes.nftItem, {
                                [classes.disabled]: disabled,
                                [classes.selected]: selected,
                                [classes.unselected]: selectedPairs.length > 0 && !selected,
                            })}
                            onClick={() => {
                                if (disabled) return
                                if (selected) {
                                    toggleItem(null, '')
                                } else {
                                    toggleItem(token.tokenId, token.contract?.address)
                                }
                            }}>
                            <NFTItem token={token} />
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
            {loadError && !loadFinish && tokens.length ? (
                <Stack py={1} style={{ gridColumnStart: 1, gridColumnEnd: 6 }}>
                    <RetryHint hint={false} retry={nextPage} />
                </Stack>
            ) : null}
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
