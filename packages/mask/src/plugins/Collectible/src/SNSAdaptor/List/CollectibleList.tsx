import { useWeb3State } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NonFungibleAsset } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { Box, Button, Tooltip, Typography } from '@mui/material'
import { CollectibleGridProps, useStyles } from './hooks/useStyles.js'
import { CollectibleItem } from './CollectibleItem.js'
import { CollectibleListContext } from './CollectibleListContext.js'
import { LoadingSkeleton } from './LoadingSkeleton.js'
import { useI18N } from '../../../../../utils/index.js'

export interface CollectibleListProps extends withClasses<'empty' | 'button'>, CollectibleGridProps {
    pluginID: NetworkPluginID
    collectibles: Array<NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
    error?: string
    loading: boolean
    retry(): void
    hasRetry?: boolean
}

export function CollectibleList(props: CollectibleListProps) {
    const { pluginID, collectibles, columns, gap, loading, retry, error, hasRetry = true } = props
    const { t } = useI18N()
    const { classes } = useStyles({ columns, gap }, { props: { classes: props.classes } })
    const { Others } = useWeb3State()

    return (
        <CollectibleListContext.Provider value={{ collectiblesRetry: retry }}>
            <Box className={classes.list}>
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
                            return (
                                <Tooltip
                                    key={index}
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
                                    <CollectibleItem
                                        className={classes.collectibleItem}
                                        pluginID={pluginID}
                                        asset={token}
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
