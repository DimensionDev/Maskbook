import { Icons } from '@masknet/icons'
import { Image, NFTSpamBadge, useReportSpam } from '@masknet/shared'
import { LoadingBase, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { memo, type HTMLProps } from 'react'
import { useUserAssets } from './AssetsProvider.js'
import { CollectionsContext } from './CollectionsProvider.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    return {
        collectionHeader: {
            display: 'flex',
            color: theme.palette.maskColor.main,
        },
        info: {
            display: 'flex',
            alignItems: 'center',
            marginRight: 'auto',
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
            marginLeft: theme.spacing(1),
        },
    }
})

interface Props extends HTMLProps<HTMLDivElement> {
    onResetCollection?: (id: undefined) => void
}

export const CollectionHeader = memo(function CollectionHeader({ className, onResetCollection, ...rest }: Props) {
    const { classes, cx } = useStyles()
    const { getVerifiedBy } = useUserAssets()
    const { currentCollectionId, currentCollection } = CollectionsContext.useContainer()
    const { isReporting, isSpam, promptReport } = useReportSpam({
        address: currentCollection?.address,
        chainId: currentCollection?.chainId,
        collectionId: currentCollection?.id,
    })

    if (!currentCollection) return null
    const currentVerifiedBy = currentCollectionId ? getVerifiedBy(currentCollectionId) : []

    return (
        <div className={cx(classes.collectionHeader, className)} {...rest}>
            <Box className={classes.info}>
                {currentCollection.iconURL ?
                    <Image className={classes.icon} size={24} src={currentCollection.iconURL} />
                :   null}
                <Typography mx={1}>{currentCollection.name}</Typography>
                {currentVerifiedBy.length ?
                    <ShadowRootTooltip title={<Trans>Verified by {currentVerifiedBy.join(', ')}</Trans>}>
                        <Icons.Verification size={16} />
                    </ShadowRootTooltip>
                :   null}
                {isSpam ?
                    <NFTSpamBadge />
                :   null}
            </Box>
            <Button variant="text" className={classes.backButton} onClick={() => onResetCollection?.(undefined)}>
                <Icons.Undo size={16} />
            </Button>
            {!isSpam ?
                <Button variant="text" className={classes.backButton} onClick={promptReport}>
                    {isReporting ?
                        <LoadingBase size={16} />
                    :   <Icons.Flag size={16} />}
                </Button>
            :   null}
        </div>
    )
})
