import { Card, Link } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useCurrentWeb3NetworkPluginID, useWeb3State } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import { AssetPreviewer } from '@masknet/shared'
import type { NonFungibleAsset, Wallet } from '@masknet/web3-shared-base'
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
    link: {
        position: 'relative',
        display: 'block',
    },
}))

export interface CollectibleCardProps {
    className?: string
    wallet?: Wallet
    asset: NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
    link?: string
    readonly?: boolean
}

export function CollectibleCard({ className, wallet, asset, readonly, ...rest }: CollectibleCardProps) {
    const { classes, cx } = useStyles()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const { Others } = useWeb3State()

    return (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            href={
                asset.link ??
                Others?.explorerResolver.nonFungibleTokenLink?.(asset.chainId, asset.address, asset.tokenId)
            }
            className={cx(classes.link, className)}
            {...rest}>
            <div className={classes.blocker} />
            <Card className={classes.root}>
                {readonly || !wallet ? null : (
                    <ActionsBarNFT classes={{ more: classes.icon }} wallet={wallet} asset={asset} />
                )}
                <AssetPreviewer
                    classes={{
                        fallbackImage: classes.fallbackImage,
                    }}
                    pluginID={pluginID}
                    chainId={asset.chainId}
                    url={asset.metadata?.mediaURL || asset.metadata?.imageURL}
                />
            </Card>
        </Link>
    )
}
