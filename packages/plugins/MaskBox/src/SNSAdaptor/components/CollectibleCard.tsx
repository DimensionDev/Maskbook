import { memo } from 'react'
import { Card, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useWeb3State } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import type { SourceType, Wallet } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px 8px 0 0',
        position: 'absolute',
        zIndex: 1,
        backgroundColor: theme.palette.mode === 'light' ? '#F7F9FA' : '#2F3336',
        width: '100%',
        height: '100%',
    },
    fallbackImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        width: 30,
        height: 30,
    },
    blocker: {
        position: 'absolute',
        zIndex: 2,
        width: '100%',
        height: '100%',
    },
    linkWrapper: {
        position: 'relative',
        display: 'block',
    },
}))

export interface CollectibleCardProps {
    className?: string
    provider: SourceType
    wallet?: Wallet
    asset: Web3Helper.NonFungibleAssetAll
    link?: string
    readonly?: boolean
    pluginID?: NetworkPluginID
    disableLink?: boolean
    showNetworkIcon?: boolean
}

export const CollectibleCard = memo(function CollectibleCard({
    className,
    wallet,
    asset,
    readonly,
    pluginID,
    disableLink,
    showNetworkIcon,
    ...rest
}: CollectibleCardProps) {
    const { classes, cx } = useStyles()
    const { Others } = useWeb3State()

    const content = (
        <>
            <div className={classes.blocker} />
            <Card className={classes.root}>
                <NFTCardStyledAssetPlayer
                    contractAddress={asset.address}
                    chainId={asset.chainId}
                    isImageOnly
                    url={asset.metadata?.mediaURL || asset.metadata?.imageURL}
                    tokenId={asset.tokenId}
                    pluginID={pluginID}
                    classes={{
                        fallbackImage: classes.fallbackImage,
                        imgWrapper: classes.wrapper,
                    }}
                    showNetwork={showNetworkIcon}
                />
            </Card>
        </>
    )

    if (disableLink) return <div className={cx(classes.linkWrapper, className)}>{content}</div>

    return (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            href={
                asset.link ??
                Others?.explorerResolver.nonFungibleTokenLink?.(asset.chainId, asset.address, asset.tokenId)
            }
            className={cx(classes.linkWrapper, className)}
            {...rest}>
            {content}
        </Link>
    )
})
