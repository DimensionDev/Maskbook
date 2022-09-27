import { Card } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { AssetPreviewer } from '@masknet/shared'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NonFungibleAsset } from '@masknet/web3-shared-base'
import { CrossIsolationMessages } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        display: 'block',
    },
    card: {
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
}))

export interface CollectibleCardProps {
    className?: string
    asset: NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function CollectibleCard({ className, asset }: CollectibleCardProps) {
    const { classes, cx } = useStyles()
    const pluginID = useCurrentWeb3NetworkPluginID()

    return (
        <div
            className={cx(classes.root, className)}
            onClick={() => {
                CrossIsolationMessages.events.nonFungibleTokenDialogEvent.sendToLocal({
                    open: true,
                    pluginID,
                    chainId: asset.chainId,
                    tokenId: asset.tokenId,
                    tokenAddress: asset.address,
                })
            }}>
            <div className={classes.blocker} />
            <Card className={classes.card}>
                <AssetPreviewer
                    classes={{
                        fallbackImage: classes.fallbackImage,
                    }}
                    pluginID={pluginID}
                    chainId={asset.chainId}
                    url={asset.metadata?.mediaURL || asset.metadata?.imageURL}
                />
            </Card>
        </div>
    )
}
