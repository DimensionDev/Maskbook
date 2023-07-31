import { Icons } from '@masknet/icons'
import { Image } from '@masknet/shared'
import { ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { memo, type HTMLProps } from 'react'
import { useSharedI18N } from '../../../locales/index.js'
import { useUserAssets } from './AssetsProvider.js'
import { CollectionsContext } from './CollectionsProvider.js'

const useStyles = makeStyles()((theme) => {
    return {
        collectionHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            color: theme.palette.maskColor.main,
        },
        info: {
            display: 'flex',
            alignItems: 'center',
        },
        icon: {
            width: 24,
            height: 24,
            borderRadius: '100%',
            objectFit: 'cover',
        },
        backButton: {
            padding: theme.spacing(1, 0),
            width: 40,
            minWidth: 40,
            textAlign: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 32,
            color: theme.palette.maskColor.main,
            backgroundColor: theme.palette.maskColor.thirdMain,
        },
    }
})

interface Props extends HTMLProps<HTMLDivElement> {
    onResetCollection?: (id: undefined) => void
}

export const CollectionHeader = memo(function CollectionHeader({ className, onResetCollection, ...rest }: Props) {
    const t = useSharedI18N()
    const { classes, cx } = useStyles()
    const { getVerifiedBy } = useUserAssets()
    const { currentCollectionId, currentCollection } = CollectionsContext.useContainer()

    if (!currentCollection) return null
    const currentVerifiedBy = currentCollectionId ? getVerifiedBy(currentCollectionId) : []

    return (
        <div className={cx(classes.collectionHeader, className)} {...rest}>
            <Box className={classes.info}>
                {currentCollection.iconURL ? (
                    <Image className={classes.icon} size={24} src={currentCollection.iconURL} />
                ) : null}
                <Typography mx={1}>{currentCollection.name}</Typography>
                {currentVerifiedBy.length ? (
                    <ShadowRootTooltip title={t.verified_by({ marketplace: currentVerifiedBy.join(', ') })}>
                        <Icons.Verification size={16} />
                    </ShadowRootTooltip>
                ) : null}
            </Box>
            <Button variant="text" className={classes.backButton} onClick={() => onResetCollection?.(undefined)}>
                <Icons.Undo size={16} />
            </Button>
        </div>
    )
})
