import { LoadingBase, makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { CollectibleTab } from '../CollectibleTab'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { NFTOfferCard } from '../../../../components/shared/NFTCard/NFTOfferCard'
import { Typography } from '@mui/material'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    body: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 300,
        gap: 12,
        justifyContent: 'center',
    },
    emptyIcon: {
        width: 36,
        height: 36,
    },
    emptyText: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
    },
}))

export interface OffersTabProps {
    asset: {
        loading?: boolean
        value?: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>
    }
}

export function OffersTab(props: OffersTabProps) {
    const { asset } = props
    const { classes } = useStyles()
    const _asset = asset.value
    return useMemo(() => {
        if (asset.loading) return <LoadingBase />
        if (!_asset?.orders)
            return (
                <div className={classes.body}>
                    <Icons.EmptySimple className={classes.emptyIcon} />
                    <Typography className={classes.emptyText}>This NFT didn't get any offer</Typography>
                </div>
            )
        return (
            <CollectibleTab>
                <div className={classes.body} style={{ justifyContent: 'unset' }}>
                    <>
                        {_asset?.orders?.map((x, idx) => (
                            <NFTOfferCard key={idx} offer={x} />
                        ))}
                    </>
                </div>
            </CollectibleTab>
        )
    }, [asset, classes])
}
