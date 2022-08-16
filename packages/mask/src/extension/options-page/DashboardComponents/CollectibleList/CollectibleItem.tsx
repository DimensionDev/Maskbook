import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import type { NetworkPluginID, NonFungibleAsset, SocialAddress, SourceType, Wallet } from '@masknet/web3-shared-base'
import { Skeleton, Typography } from '@mui/material'
import type { HTMLProps } from 'react'
import { CollectibleCard } from './CollectibleCard'

const useStyles = makeStyles()((theme) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        padding: theme.spacing(1, 0),
    },
    collectibleCard: {
        width: '100%',
        height: '100%',
        aspectRatio: '1/1',
    },
    description: {
        background: theme.palette.mode === 'light' ? '#F7F9FA' : '#2F3336',
        alignSelf: 'stretch',
        borderRadius: '0 0 8px 8px',
    },
    name: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        lineHeight: '36px',
        minHeight: '1em',
        textIndent: '8px',
    },
}))

interface CollectibleItemProps extends HTMLProps<HTMLDivElement> {
    provider: SourceType
    wallet?: Wallet
    token: NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    readonly?: boolean
    renderOrder: number
    address?: SocialAddress<NetworkPluginID>
}
export function CollectibleItem(props: CollectibleItemProps) {
    const { provider, wallet, token, readonly, renderOrder, address, className, ...rest } = props
    const { classes, cx } = useStyles()
    return (
        <div className={cx(classes.card, className)} {...rest}>
            <CollectibleCard
                className={classes.collectibleCard}
                token={token}
                provider={provider}
                wallet={wallet}
                readonly={readonly}
                renderOrder={renderOrder}
                address={address}
            />
            <div className={classes.description}>
                <Typography className={classes.name} color="textPrimary" variant="body2">
                    {token.metadata?.name}
                </Typography>
            </div>
        </div>
    )
}

interface SkeletonProps extends HTMLProps<HTMLDivElement> {}
export function CollectibleItemSkeleton({ className, ...rest }: SkeletonProps) {
    const { classes, cx } = useStyles()
    return (
        <div className={cx(classes.card, className)} {...rest}>
            <div className={classes.collectibleCard}>
                <Skeleton animation="wave" variant="rectangular" height="100%" />
            </div>
            <div className={classes.description}>
                <Typography className={classes.name} color="textPrimary" variant="body2">
                    <Skeleton animation="wave" variant="text" height="100%" />
                </Typography>
            </div>
        </div>
    )
}
