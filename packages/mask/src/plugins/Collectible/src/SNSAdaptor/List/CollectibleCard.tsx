import { useCallback } from 'react'
import { Box, Card } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { AssetPreviewer } from '@masknet/shared'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID, NonFungibleAsset } from '@masknet/web3-shared-base'
import { CrossIsolationMessages } from '@masknet/shared-base'

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
    pluginID?: NetworkPluginID
    asset: NonFungibleAsset<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
}

export function CollectibleCard({ className, pluginID, asset }: CollectibleCardProps) {
    const { classes, cx } = useStyles()
    const onClick = useCallback(() => {
        if (!asset.chainId || !pluginID) return
        CrossIsolationMessages.events.nonFungibleTokenDialogEvent.sendToLocal({
            open: true,
            chainId: asset.chainId,
            pluginID,
            tokenId: asset.tokenId,
            tokenAddress: asset.address,
        })
    }, [pluginID, asset.chainId, asset.tokenId, asset.address])

    return (
        <Box className={cx(classes.linkWrapper, className)} onClick={onClick}>
            <div className={classes.blocker} />
            <Card className={classes.root}>
                <AssetPreviewer
                    classes={{
                        fallbackImage: classes.fallbackImage,
                    }}
                    url={asset.metadata?.imageURL}
                    NetworkIconProps={{
                        pluginID,
                        chainId: asset.chainId,
                    }}
                />
            </Card>
        </Box>
    )
}
