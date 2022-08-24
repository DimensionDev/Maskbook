import { Card, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { ActionsBarNFT } from '../ActionsBarNFT'
import type { NetworkPluginID, NonFungibleAsset, SocialAddress, SourceType, Wallet } from '@masknet/web3-shared-base'
import type { Web3Helper } from '@masknet/plugin-infra/src/entry-web3'
import { resolveOpenSeaLink } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px 8px 0 0',
        position: 'absolute',
        zIndex: 1,
        backgroundColor: theme.palette.mode === 'light' ? '#F7F9FA' : '#2F3336',
        width: 172,
        height: 172,
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
        width: '172px !important',
        height: '172px !important',
        background:
            theme.palette.mode === 'light'
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)'
                : 'linear-gradient(180deg, #202020 0%, #181818 100%)',
    },
    blocker: {
        position: 'absolute',
        zIndex: 2,
        width: 172,
        height: 172,
    },
    linkWrapper: {
        position: 'relative',
        display: 'block',
        width: 172,
        height: 172,
    },
}))

export interface CollectibleCardProps {
    provider: SourceType
    wallet?: Wallet
    asset: NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    readonly?: boolean
    renderOrder: number
    address?: SocialAddress<NetworkPluginID>
}

export function CollectibleCard(props: CollectibleCardProps) {
    const { wallet, asset, readonly, renderOrder, address } = props
    const { classes } = useStyles()

    return (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            // TODO:
            // add useNonFungibleTokenLink()
            href={asset.link ?? resolveOpenSeaLink(asset.address, asset.tokenId)}
            className={classes.linkWrapper}>
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
