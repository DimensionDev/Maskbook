import { memo } from 'react'
import { Box, Tooltip } from '@mui/material'
import { Image } from '../../../../components/shared/Image'
import { makeStyles } from '@masknet/theme'
import { TokenIcon } from '@masknet/shared'
import classNames from 'classnames'
import { isSameAddress, NonFungibleTokenCollection } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

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
        color: theme.palette.primary.main,
    },
    tip: {
        padding: theme.spacing(1),
    },
    selected: {
        border: '2px solid #1D9BF0',
        borderRadius: '50%',
    },
}))

interface CollectionIconProps {
    selectedCollection?: string
    collection?: NonFungibleTokenCollection<ChainId>
    onClick?(): void
}

export const CollectionIcon = memo<CollectionIconProps>(({ collection, onClick, selectedCollection }) => {
    const { classes } = useStyles()
    if (!collection) {
        return <TokenIcon classes={{ icon: classes.collectionImg }} name="other" address="other" />
    }
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
                    isSameAddress(collection.address, selectedCollection) ? classes.selected : '',
                )}
                onClick={onClick}>
                {collection?.iconURL ? (
                    <Image
                        width={24}
                        height={24}
                        component="img"
                        className={classes.collectionImg}
                        src={collection?.iconURL}
                    />
                ) : (
                    <TokenIcon
                        classes={{ icon: classes.collectionImg }}
                        name={collection?.name}
                        address={collection.name}
                    />
                )}
            </Box>
        </Tooltip>
    )
})
