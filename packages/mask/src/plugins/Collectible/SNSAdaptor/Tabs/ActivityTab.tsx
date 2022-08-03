import { LoadingBase, makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { CollectibleTab } from '../CollectibleTab'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { EMPTY_LIST } from '@masknet/shared-base'
import { ActivityType, NFTActivityCard } from '../../../../components/shared/NFTCard/NFTActivityCard'

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

export interface ActivityTabProps {
    asset: {
        loading?: boolean
        value?: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>
    }
}

export function ActivityTab(props: ActivityTabProps) {
    const { asset } = props
    const { classes } = useStyles()
    const events = asset.value?.events ?? EMPTY_LIST
    return useMemo(() => {
        if (asset.loading) return <LoadingBase />
        if (!events.length)
            return (
                <div className={classes.body}>
                    <Icons.EmptySimple className={classes.emptyIcon} />
                    <Typography className={classes.emptyText}>This NFT didn't have any activity</Typography>
                </div>
            )
        return (
            <CollectibleTab>
                <div className={classes.body} style={{ justifyContent: 'unset' }}>
                    <>
                        {events.map((x, idx) => (
                            <NFTActivityCard type={ActivityType.Mint} key={idx} activity={x} />
                        ))}
                    </>
                </div>
            </CollectibleTab>
        )
    }, [asset, classes])
}
