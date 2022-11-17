import { useWeb3State } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
import { NonFungibleAsset, SourceType } from '@masknet/web3-shared-base'
import { Box, Button, Tooltip, Typography } from '@mui/material'
import { useCallback, useMemo, useRef } from 'react'
import { useI18N } from '../../../../utils/index.js'
import { ChangeEventOptions, CollectibleItem, SelectableProps } from './CollectibleItem.js'
import { CollectibleListContext } from './CollectibleListContext.js'
import { LoadingSkeleton } from './LoadingSkeleton.js'
import { makeStyles } from '@masknet/theme'
import type { CollectibleGridProps } from '../../types.js'

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
            height: '100%',
        },
        button: {
            '&:hover': {
                border: 'solid 1px transparent',
            },
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
    collectibles: Array<NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    error?: string
    loading: boolean
    retry(): void
    readonly?: boolean
    hasRetry?: boolean
    disableLink?: boolean
    showNetworkIcon?: boolean
    /** Collectible key, in format of `${contractAddress}_${tokenId}` */
    value?: string | string[]
    onChange?(value: string | string[] | null): void
}

const getCollectibleKey = (collectible: NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>) => {
    return `${collectible.address}_${collectible.tokenId}`
}

export function CollectibleList(props: CollectibleListProps) {
    const {
        pluginID,
        collectibles,
        columns,
        gap,
        loading,
        retry,
        error,
        readonly,
        hasRetry = true,
        selectable,
        multiple,
        disableLink,
        showNetworkIcon,
        value,
        onChange,
    } = props
    const { t } = useI18N()
    const { classes } = useStyles({ columns, gap }, { props: { classes: props.classes } })
    const { Others } = useWeb3State()

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
        <CollectibleListContext.Provider value={{ collectiblesRetry: retry }}>
            <Box className={classes.list} ref={listRef}>
                {loading && <LoadingSkeleton className={classes.root} />}
                {error || (collectibles.length === 0 && !loading) ? (
                    <Box className={classes.text}>
                        <Typography color="textSecondary">{t('dashboard_no_collectible_found')}</Typography>
                        {hasRetry ? (
                            <Button className={classes.button} variant="text" onClick={retry}>
                                {t('plugin_collectible_retry')}
                            </Button>
                        ) : null}
                    </Box>
                ) : (
                    <Box className={classes.root}>
                        {collectibles.map((token, index) => {
                            const name = token.collection?.name || token.contract?.name
                            const uiTokenId = Others?.formatTokenId(token.tokenId, 4) ?? `#${token.tokenId}`
                            const title = name ? `${name} ${uiTokenId}` : token.metadata?.name ?? ''
                            const collectibleKey = getCollectibleKey(token)
                            const checked = selectable ? value?.includes(collectibleKey) : false
                            const inactive = value ? !!value?.length && !checked : false
                            return (
                                <Tooltip
                                    key={index}
                                    title={title}
                                    placement="top"
                                    disableInteractive
                                    PopperProps={{
                                        disablePortal: true,
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
                                        renderOrder={index}
                                        asset={token}
                                        provider={SourceType.OpenSea}
                                        readonly={readonly}
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
                                </Tooltip>
                            )
                        })}
                    </Box>
                )}
            </Box>
        </CollectibleListContext.Provider>
    )
}
