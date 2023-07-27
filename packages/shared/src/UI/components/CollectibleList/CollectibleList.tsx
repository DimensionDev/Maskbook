import { useCallback, useMemo, useRef, memo } from 'react'
import { useWeb3Others } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
import { SourceType } from '@masknet/web3-shared-base'
import { Box } from '@mui/material'
import { ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { type ChangeEventOptions, CollectibleItem, type SelectableProps } from './CollectibleItem.js'
import { LoadingSkeleton } from './LoadingSkeleton.js'
import type { CollectibleGridProps } from './type.js'
import { ReloadStatus } from '../index.js'
import { useSharedI18N } from '../../../index.js'

const useStyles = makeStyles<CollectibleGridProps>()((theme, { columns = 3, gap = 2 }) => {
    const gapIsNumber = typeof gap === 'number'
    return {
        root: {
            width: '100%',
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridGap: gapIsNumber ? theme.spacing(gap) : gap,
            padding: gapIsNumber ? theme.spacing(0, gap, 0) : `0 ${gap} 0`,
            boxSizing: 'border-box',
        },
        collectibleItem: {
            overflowX: 'hidden',
        },
        text: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 260,
        },
        list: {
            overflow: 'auto',
            position: 'relative',
        },
    }
})

export interface CollectibleListProps
    extends withClasses<'empty' | 'button' | 'root'>,
        CollectibleGridProps,
        Omit<SelectableProps, 'value' | 'checked' | 'onChange'> {
    pluginID?: NetworkPluginID
    collectibles: Web3Helper.NonFungibleAssetAll[]
    error?: string
    loading: boolean
    disableLink?: boolean
    showNetworkIcon?: boolean
    /** Collectible key, in format of `${contractAddress}_${tokenId}` */
    value?: string | string[]
    getCollectibleKey?(collectible: Web3Helper.NonFungibleAssetAll): string
    retry(): void
    onChange?(value: string | string[] | null): void
}

const getKey = (collectible: Web3Helper.NonFungibleAssetAll) => {
    return `${collectible.address}_${collectible.tokenId}`
}

export const CollectibleList = memo(function CollectibleList(props: CollectibleListProps) {
    const {
        pluginID,
        collectibles,
        columns,
        gap,
        loading,
        error,
        selectable,
        multiple,
        disableLink,
        showNetworkIcon,
        value,
        retry,
        getCollectibleKey = getKey,
        onChange,
    } = props
    const t = useSharedI18N()
    const { classes } = useStyles({ columns, gap }, { props: { classes: props.classes } })
    const Others = useWeb3Others()

    const availableKeys = useMemo(() => collectibles.map(getCollectibleKey), [collectibles])
    const handleItemChange = useCallback(
        (event: ChangeEventOptions) => {
            if (multiple) {
                const newValue = availableKeys.filter((x) => {
                    return x === event.value ? event.checked : value?.includes(x)
                })
                onChange?.(newValue)
            } else {
                onChange?.(event.checked ? event.value : null)
            }
        },
        [multiple, availableKeys, value],
    )

    const listRef = useRef<typeof Box>(null)

    return (
        <Box className={classes.list} ref={listRef}>
            {loading && collectibles.length === 0 ? <LoadingSkeleton className={classes.root} /> : null}
            {error || (collectibles.length === 0 && !loading) ? (
                <ReloadStatus className={classes.text} message={t.no_collectible_found()} onRetry={retry} />
            ) : (
                <Box className={classes.root}>
                    {collectibles.map((token, index) => {
                        const name = token.metadata?.name
                        const uiTokenId = Others.formatTokenId(token.tokenId, 4) ?? `#${token.tokenId}`
                        const title = `${name || token.collection?.name || token.contract?.name} ${uiTokenId}`
                        const collectibleKey = getCollectibleKey(token)
                        const checked = selectable ? value?.includes(collectibleKey) : false
                        const inactive = value ? !!value?.length && !checked : false
                        return (
                            <ShadowRootTooltip
                                key={index}
                                title={title}
                                placement="top"
                                disableInteractive
                                PopperProps={{
                                    placement: 'top',
                                    popperOptions: {
                                        strategy: 'absolute',
                                    },
                                    modifiers: [
                                        {
                                            name: 'preventOverflow',
                                            options: {
                                                rootBoundary: listRef.current,
                                                boundary: listRef.current,
                                            },
                                        },
                                    ],
                                }}
                                arrow>
                                <CollectibleItem
                                    className={classes.collectibleItem}
                                    asset={token}
                                    provider={SourceType.OpenSea}
                                    pluginID={pluginID}
                                    selectable={selectable}
                                    multiple={multiple}
                                    disableLink={disableLink}
                                    showNetworkIcon={showNetworkIcon}
                                    checked={checked}
                                    inactive={inactive}
                                    value={collectibleKey}
                                    onChange={handleItemChange}
                                />
                            </ShadowRootTooltip>
                        )
                    })}
                </Box>
            )}
        </Box>
    )
})
