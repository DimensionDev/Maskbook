import type { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Box, Button, Typography } from '@mui/material'
import type { CollectibleGridProps } from '../../types.js'
import { CollectibleItem } from './CollectibleItem.js'
import { LoadingSkeleton } from './LoadingSkeleton.js'
import { useI18N } from '../../locales/i18n_generated.js'

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
        },
    }
})

export interface CollectibleListProps extends withClasses<'empty' | 'button'>, CollectibleGridProps {
    pluginID: NetworkPluginID
    collectibles: Web3Helper.NonFungibleAssetAll[]
    error?: string
    loading: boolean
    retry(): void
    hasRetry?: boolean
}

export function CollectibleList(props: CollectibleListProps) {
    const { pluginID, collectibles, columns, gap, loading, retry, error, hasRetry = true } = props
    const t = useI18N()
    const { classes } = useStyles({ columns, gap }, { props: { classes: props.classes } })

    return (
        <Box className={classes.list}>
            {loading && <LoadingSkeleton className={classes.root} />}
            {error || (collectibles.length === 0 && !loading) ? (
                <Box className={classes.text}>
                    <Typography color="textSecondary">{t.dashboard_no_collectible_found()}</Typography>
                    {hasRetry ? (
                        <Button className={classes.button} variant="text" onClick={retry}>
                            {t.plugin_collectible_retry()}
                        </Button>
                    ) : null}
                </Box>
            ) : (
                <Box className={classes.root}>
                    {collectibles.map((token) => (
                        <CollectibleItem
                            key={`${token.contract?.address.toLowerCase()}${token.tokenId}`}
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
