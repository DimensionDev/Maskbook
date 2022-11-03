import type { Web3Helper } from '@masknet/web3-helpers'
import type { NonFungibleAsset } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { Box, Button, Typography } from '@mui/material'
import { CollectibleItem } from './CollectibleItem.js'
import { LoadingSkeleton } from './LoadingSkeleton.js'
import { useI18N } from '../../../../../utils/index.js'
import { makeStyles } from '@masknet/theme'
import type { CollectibleGridProps } from '../../../../../extension/options-page/types.js'

export const useStyles = makeStyles<CollectibleGridProps>()((theme, { columns = 3, gap = 2 }) => {
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
            height: 'calc(100% - 52px)',
            overflow: 'auto',
        },
    }
})

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

    return (
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
                    {collectibles.map((token, index) => (
                        <CollectibleItem
                            key={index}
                            className={classes.collectibleItem}
                            pluginID={pluginID}
                            asset={token}
                        />
                    ))}
                </Box>
            )}
        </Box>
    )
}
