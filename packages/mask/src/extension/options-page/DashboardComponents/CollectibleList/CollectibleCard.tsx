import { Card, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useWeb3State, Web3Helper } from '@masknet/plugin-infra/web3'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import type { NetworkPluginID, NonFungibleAsset, SocialAddress, SourceType, Wallet } from '@masknet/web3-shared-base'
import { ActionsBarNFT } from '../ActionsBarNFT.js'

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
    icon: {
        top: theme.spacing(1),
        right: theme.spacing(1),
        position: 'absolute',
        zIndex: 1,
        backgroundColor: `${theme.palette.background.paper} !important`,
    },
    placeholderIcon: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        width: 64,
        height: 64,
        opacity: 0.1,
    },
    fallbackImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        width: 30,
        height: 30,
    },
    wrapper: {
        width: '100% !important',
        height: '100% !important',
        background:
            theme.palette.mode === 'light'
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)'
                : 'linear-gradient(180deg, #202020 0%, #181818 100%)',
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
    asset: NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    link?: string
    readonly?: boolean
    renderOrder: number
    address?: SocialAddress<NetworkPluginID>
}

export function CollectibleCard({
    className,
    wallet,
    asset,
    readonly,
    renderOrder,
    address,
    ...rest
}: CollectibleCardProps) {
    const { classes, cx } = useStyles()
    const { Others } = useWeb3State()

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
            <div className={classes.blocker} />
            <Card className={classes.root}>
                {readonly || !wallet ? null : (
                    <ActionsBarNFT classes={{ more: classes.icon }} wallet={wallet} asset={asset} />
                )}
                <NFTCardStyledAssetPlayer
                    contractAddress={asset.address}
                    chainId={asset.chainId}
                    isImageOnly
                    url={asset.metadata?.mediaURL || asset.metadata?.imageURL}
                    renderOrder={renderOrder}
                    tokenId={asset.tokenId}
                    address={address}
                    classes={{
                        fallbackImage: classes.fallbackImage,
                        wrapper: classes.wrapper,
                        imgWrapper: classes.wrapper,
                    }}
                    showNetwork
                />
            </Card>
        </Link>
    )
}
