import { memo } from 'react'
import classNames from 'classnames'
import { Box, Tooltip } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Image, Icon } from '@masknet/shared'
import { isSameAddress, NonFungibleCollection } from '@masknet/web3-shared-base'
import type { Web3Helper} from '@masknet/web3-helpers'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    collectionWrap: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: 'rgba(229,232,235,1)',
        cursor: 'pointer',
    },
    collectionImg: {
        objectFit: 'cover',
        width: 24,
        height: 24,
        borderRadius: '50%',
        color: theme.palette.primary.main,
    },
    tip: {
        padding: theme.spacing(1),
    },
    selected: {
        border: '2px solid #1D9BF0',
        borderRadius: '50%',
    },
    imageLoading: {
        width: 24,
        height: 24,
    },
}))

export interface CollectionIconProps {
    selectedCollection?: string
    collection?: NonFungibleCollection<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    onClick?(): void
}

export const CollectionIcon = memo<CollectionIconProps>(({ collection, onClick, selectedCollection }) => {
    const { classes } = useStyles()

    return (
        <Tooltip
            placement="right-end"
            classes={{ tooltip: classes.tip }}
            PopperProps={{
                disablePortal: true,
            }}
            title={collection?.name ?? ''}
            arrow>
            <Box
                className={classNames(
                    classes.collectionWrap,
                    isSameAddress(collection?.address, selectedCollection) ? classes.selected : '',
                )}
                onClick={onClick}>
                {collection?.iconURL ? (
                    <Image
                        width={24}
                        height={24}
                        className={classes.collectionImg}
                        src={collection?.iconURL}
                        fallback={<Icons.MaskPlaceholder size={24} />}
                        disableSpinner
                    />
                ) : (
                    <Icon
                        classes={{ icon: classes.collectionImg }}
                        name={collection?.name ?? collection?.symbol ?? 'Unknown'}
                    />
                )}
            </Box>
        </Tooltip>
    )
})
