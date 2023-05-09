import { type FC, useCallback } from 'react'
import { noop } from 'lodash-es'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ElementAnchor, AssetPreviewer, RetryHint } from '@masknet/shared'
import { LoadingBase, makeStyles, ShadowRootTooltip, TextOverflowTooltip } from '@masknet/theme'
import { CrossIsolationMessages, NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { Checkbox, List, ListItem, Radio, Stack, Typography } from '@mui/material'
import { isLens, resolveImageURL } from '@masknet/web3-shared-evm'

interface NFTItemProps {
    token: Web3Helper.NonFungibleTokenAll
    pluginID: NetworkPluginID
}

export type NFTKeyPair = [address: string, tokenId: string]

interface Props {
    selectable?: boolean
    tokens: Web3Helper.NonFungibleAssetScope[]
    selectedPairs?: NFTKeyPair[]
    onChange?: (id: string | null, contractAddress?: string) => void
    limit?: number
    columns?: number
    gap?: number
    className?: string
    onNextPage(): void
    finished: boolean
    hasError?: boolean
    pluginID: NetworkPluginID
}

const useStyles = makeStyles<{ columns?: number; gap?: number }>()((theme, { columns = 4, gap = 12 }) => {
    const isLight = theme.palette.mode === 'light'
    return {
        checkbox: {
            position: 'absolute',
            right: 0,
            top: 0,
        },
        list: {
            gridGap: gap,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
        },
        nftContainer: {
            background: theme.palette.maskColor.bg,
            borderRadius: 8,
            width: 126,
            height: 154,
            transition: 'all 0.2s ease',
            overflow: 'hidden',
            '&:hover': {
                backgroundColor: isLight ? theme.palette.background.paper : undefined,
                boxShadow: isLight ? '0px 4px 30px rgba(0, 0, 0, 0.1)' : undefined,
            },
        },
        nftItem: {
            position: 'relative',
            cursor: 'pointer',
            display: 'flex',
            padding: 0,
            flexDirection: 'column',
            userSelect: 'none',
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
        inactive: {
            opacity: 0.5,
        },
        fallbackImage: {
            width: 30,
            height: 30,
        },
        fallbackENSImage: {
            width: '100%',
            height: '100%',
        },
        image: {
            background: 'transparent !important',
            width: 126,
            height: 126,
        },
        caption: {
            padding: theme.spacing(0.5),
            color: theme.palette.text.primary,
            fontWeight: 700,
            fontSize: 12,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
        },
        root: {
            width: 'auto',
            height: 'auto',
        },
    }
})

export const NFTItem: FC<NFTItemProps> = ({ token, pluginID }) => {
    const { classes } = useStyles({})
    const { Others } = useWeb3State(pluginID)
    const caption = isLens(token.metadata?.name) ? token.metadata?.name : Others?.formatTokenId(token.tokenId, 4)

    const onClick = useCallback(() => {
        if (!token.chainId || !pluginID) return
        CrossIsolationMessages.events.nonFungibleTokenDialogEvent.sendToLocal({
            open: true,
            chainId: token.chainId,
            pluginID,
            tokenId: token.tokenId,
            tokenAddress: token.address,
        })
    }, [pluginID, token.chainId, token.tokenId, token.address])

    const fallbackImageURL = resolveImageURL(
        undefined,
        token.metadata?.name,
        token.collection?.name,
        token.contract?.address,
    )
    return (
        <div className={classes.nftContainer} onClick={onClick}>
            <AssetPreviewer
                url={token.metadata?.imageURL ?? token.metadata?.imageURL}
                classes={{
                    fallbackImage: fallbackImageURL ? classes.fallbackENSImage : classes.fallbackImage,
                    container: classes.image,
                    root: classes.root,
                }}
                fallbackImage={fallbackImageURL}
            />
            <TextOverflowTooltip as={ShadowRootTooltip} title={caption} disableInteractive arrow placement="bottom">
                <Typography className={classes.caption}>
                    {Others?.isValidDomain(token.metadata?.name) || pluginID === NetworkPluginID.PLUGIN_SOLANA
                        ? token.metadata?.name
                        : caption}
                </Typography>
            </TextOverflowTooltip>
        </div>
    )
}

export const NFTList: FC<Props> = ({
    selectable,
    selectedPairs,
    tokens,
    onChange,
    limit = 1,
    columns = 4,
    gap = 12,
    className,
    onNextPage,
    finished,
    pluginID,
    hasError,
}) => {
    const { classes, cx } = useStyles({ columns, gap })

    const isRadio = limit === 1
    const reachedLimit = selectedPairs && selectedPairs.length >= limit

    const toggleItem = useCallback(
        (currentId: string | null, contractAddress?: string) => {
            onChange?.(currentId, contractAddress)
        },
        [onChange],
    )
    const includes: (pairs: NFTKeyPair[], pair: NFTKeyPair) => boolean =
        pluginID === NetworkPluginID.PLUGIN_EVM
            ? (pairs, pair) => {
                  return !!pairs.find(([address, tokenId]) => isSameAddress(address, pair[0]) && tokenId === pair[1])
              }
            : (pairs, pair) => {
                  return !!pairs.find(([, tokenId]) => tokenId === pair[1])
              }

    const SelectComponent = isRadio ? Radio : Checkbox

    return (
        <>
            <List className={cx(classes.list, className)}>
                {tokens.map((token) => {
                    const selected = selectedPairs
                        ? includes(selectedPairs, [token.contract?.address!, token.tokenId])
                        : false
                    const inactive = selectedPairs ? selectedPairs.length > 0 && !selected : false
                    const disabled = selectable ? !isRadio && reachedLimit && !selected : false
                    return (
                        <ListItem
                            key={token.tokenId + token.id}
                            className={cx(classes.nftItem, {
                                [classes.disabled]: disabled,
                                [classes.selected]: selected,
                                [classes.inactive]: inactive,
                            })}>
                            <NFTItem token={token} pluginID={pluginID} />
                            {selectable ? (
                                <SelectComponent
                                    size="small"
                                    onChange={noop}
                                    disabled={disabled}
                                    onClick={() => {
                                        if (disabled) return
                                        if (selected) {
                                            toggleItem(null, '')
                                        } else {
                                            toggleItem(token.tokenId, token.contract?.address)
                                        }
                                    }}
                                    className={classes.checkbox}
                                    checked={selected}
                                />
                            ) : null}
                        </ListItem>
                    )
                })}
            </List>
            {hasError && finished && tokens.length ? (
                <Stack py={1}>
                    <RetryHint hint={false} retry={onNextPage} />
                </Stack>
            ) : null}
            <Stack py={1}>
                <ElementAnchor callback={onNextPage}>{!finished && <LoadingBase />}</ElementAnchor>
            </Stack>
        </>
    )
}
