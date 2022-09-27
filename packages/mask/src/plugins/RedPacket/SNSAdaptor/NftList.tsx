import type { FC, HTMLProps } from 'react'
import classnames from 'classnames'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { List, ListItem, ListProps, Typography } from '@mui/material'
import { AssetPreviewer } from '@masknet/shared'
import { NetworkPluginID, NonFungibleAsset, NonFungibleTokenContract } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
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
        loading: {
            boxShadow: 'none',
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
        media: {
            width: 120,
            height: 160,
            objectFit: 'cover',
            [smallQuery]: {
                width: 90,
                height: 120,
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

export interface NFTItemProps extends HTMLProps<HTMLDivElement> {
    asset: NonFungibleAsset<ChainId, SchemaType>
    claimed?: boolean
}

export const NFTItem: FC<NFTItemProps> = ({ className, asset, claimed, ...rest }) => {
    const t = useI18N()
    const { classes } = useStyles()

    return (
        <div className={classnames(className, classes.nft)} {...rest}>
            <AssetPreviewer
                classes={{
                    fallbackImage: classes.fallbackImage,
                }}
                pluginID={NetworkPluginID.PLUGIN_EVM}
                chainId={asset.chainId}
                url={asset.metadata?.imageURL}
            />
            <Typography className={classes.name}>{asset.metadata?.name}</Typography>
            {claimed && <Typography className={classes.claimedBadge}>{t.claimed()}</Typography>}
        </div>
    )
}

export interface NFTListProps extends ListProps {
    contract: NonFungibleTokenContract<ChainId, SchemaType>
    statusList: boolean[]
    tokenIds: string[]
}

export const NFTList: FC<NFTListProps> = ({ contract, statusList, tokenIds, className, ...rest }) => {
    const { classes } = useStyles()
    return (
        <List className={classnames(className, classes.list)} {...rest}>
            {tokenIds.map((tokenId, index) => (
                <ListItem className={classes.listItem} key={tokenId}>
                    <NFTItem claimed={statusList[index]} />
                </ListItem>
            ))}
        </List>
    )
}
