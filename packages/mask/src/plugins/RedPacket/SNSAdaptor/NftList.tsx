import type { FC, HTMLProps } from 'react'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { type ChainId, formatTokenId, type SchemaType } from '@masknet/web3-shared-evm'
import { List, ListItem, type ListProps, Typography } from '@mui/material'
import { AssetPreviewer } from '@masknet/shared'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import { useI18N } from '../locales/index.js'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        list: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gridGap: theme.spacing(1),
            [smallQuery]: {
                gridTemplateColumns: '1fr 1fr',
                gridGap: 0,
                padding: 0,
            },
        },
        listItem: {
            padding: theme.spacing(1),
        },
        nft: {
            position: 'relative',
            display: 'flex',
            width: 120,
            height: 185,
            flexDirection: 'column',
            backgroundColor: theme.palette.background.paper,
            margin: '0 auto',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.04)',
            [smallQuery]: {
                width: 90,
                height: 140,
            },
        },
        claimedBadge: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 36,
            margin: 'auto',
            height: 70,
            width: 70,
            borderRadius: '100%',
            backgroundColor: 'rgba(255, 95, 95, 0.4)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            pointerEvents: 'none',
            [smallQuery]: {
                height: 60,
                width: 60,
            },
        },
        name: {
            fontSize: 12,
            height: 18,
            textOverflow: 'ellipsis',
            textAlign: 'center',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            padding: '2px 2px 6px',
            color: MaskColorVar.textSecondary,
        },
        fallbackImage: {
            minHeight: '0 !important',
            maxWidth: 'none',
            transform: 'translateY(-10px)',
            width: 64,
            height: 64,
        },
    }
})

interface NftItemProps extends HTMLProps<HTMLDivElement> {
    collection?: NonFungibleCollection<ChainId, SchemaType>
    tokenId: string
    claimed?: boolean
}

export const NftItem: FC<NftItemProps> = ({ collection, tokenId, className, claimed, ...rest }) => {
    const t = useI18N()
    const { classes, cx } = useStyles()
    const asset = collection?.assets?.find((x) => x.tokenId === tokenId)

    return (
        <div className={cx(className, classes.nft)} {...rest}>
            <AssetPreviewer
                classes={{
                    fallbackImage: classes.fallbackImage,
                }}
                url={asset?.metadata?.imageURL || asset?.metadata?.mediaURL}
            />
            <Typography className={classes.name}>{formatTokenId(tokenId, 2)}</Typography>
            {claimed && <Typography className={classes.claimedBadge}>{t.claimed({ amount: '' })}</Typography>}
        </div>
    )
}

interface NftListProps extends ListProps {
    collection?: NonFungibleCollection<ChainId, SchemaType>
    statusList: boolean[]
    tokenIds: string[]
}

export const NftList: FC<NftListProps> = ({ collection, statusList, tokenIds, className, ...rest }) => {
    const { classes, cx } = useStyles()
    return (
        <List className={cx(className, classes.list)} {...rest}>
            {tokenIds.map((tokenId, index) => (
                <ListItem className={classes.listItem} key={tokenId}>
                    <NftItem collection={collection} claimed={statusList[index]} tokenId={tokenId} />
                </ListItem>
            ))}
        </List>
    )
}
