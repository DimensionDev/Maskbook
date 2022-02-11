import type { ERC721TokenCollectionInfo } from '@masknet/web3-shared-evm'
import { memo } from 'react'
import { Box, Tooltip } from '@mui/material'
import { Image } from '../../../../components/shared/Image'
import { makeStyles } from '@masknet/theme'
import { TokenIcon } from '@masknet/shared'
import classNames from 'classnames'

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
        width: '100%',
        height: '100%',
        borderRadius: '50%',
    },
    tip: {
        padding: theme.spacing(1),
        color: '#ffffff',
    },
    selected: {
        border: '2px solid #1D9BF0',
        borderRadius: '50%',
    },
}))

interface CollectionIconProps {
    selectedCollection?: string
    collection: ERC721TokenCollectionInfo
    onClick?(): void
}

export const CollectionIcon = memo<CollectionIconProps>(({ collection, onClick, selectedCollection }) => {
    const { classes } = useStyles()
    return (
        <Tooltip
            classes={{ tooltip: classes.tip }}
            PopperProps={{
                disablePortal: true,
            }}
            title={collection.name}
            arrow>
            <Box
                className={classNames(
                    classes.collectionWrap,
                    collection.address === selectedCollection ? classes.selected : '',
                )}
                onClick={onClick}>
                {collection.iconURL ? (
                    <Image component="img" className={classes.collectionImg} src={collection.iconURL} />
                ) : (
                    <TokenIcon
                        classes={{ icon: classes.collectionImg }}
                        name={collection.name}
                        address={collection.address}
                    />
                )}
            </Box>
        </Tooltip>
    )
})
