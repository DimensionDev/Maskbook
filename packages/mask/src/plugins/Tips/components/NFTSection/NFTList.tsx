import { useChainId, useCurrentWeb3NetworkPluginID, useWeb3State } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ElementAnchor, NFTCardStyledAssetPlayer, RetryHint } from '@masknet/shared'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { isSameAddress, NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import { Checkbox, List, ListItem, Radio, Stack, Tooltip } from '@mui/material'
import classnames from 'classnames'
import { FC, useCallback } from 'react'
import type { TipNFTKeyPair } from '../../types/index.js'

interface Props {
    selectedPairs: TipNFTKeyPair[]
    tokens: Array<Web3Helper.NonFungibleAssetScope<'all'>>
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
    assetPlayerIframe: {
        height: 96,
        width: 96,
    },
    wrapper: {
        height: '96px !important',
        width: '96px !important',
    },
    imgWrapper: {
        height: '96px !important',
        width: '96px !important',
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
            url={token.metadata?.imageURL ?? token.metadata?.mediaURL}
            tokenId={token.tokenId}
            classes={{
                fallbackImage: classes.fallbackImage,
                iframe: classes.assetPlayerIframe,
                wrapper: classes.wrapper,
                imgWrapper: classes.imgWrapper,
            }}
        />
    )
}

export const NFTList: FC<Props> = ({
    selectedPairs,
    tokens,
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
            ? (pairs: TipNFTKeyPair[], pair: TipNFTKeyPair): boolean => {
                  return !!pairs.find(([address, tokenId]) => isSameAddress(address, pair[0]) && tokenId === pair[1])
              }
            : (pairs: TipNFTKeyPair[], pair: TipNFTKeyPair): boolean => {
                  return !!pairs.find(([, tokenId]) => tokenId === pair[1])
              }

    const SelectComponent = isRadio ? Radio : Checkbox
    const { Others } = useWeb3State()

    return (
        <List className={classnames(classes.list, className)}>
            {tokens.map((token) => {
                const selected = includes(selectedPairs, [token.contract?.address!, token.tokenId])
                const disabled = !isRadio && reachedLimit && !selected
                const name = token.collection?.name || token.contract?.name
                const title = `${name} ${Others?.formatTokenId(token.tokenId, 2)}`
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
            {loadError && !loadFinish && tokens.length && (
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
