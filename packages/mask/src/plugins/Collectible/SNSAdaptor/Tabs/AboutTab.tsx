import { LoadingBase, makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { CollectibleTab } from '../CollectibleTab'
import { NFTBasicInfo } from '../../../../components/shared/NFTCard/NFTBasicInfo'
import { NFTPriceCard } from '../../../../components/shared/NFTCard/NFTPriceCard'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    body: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 300,
    },
    basic: {
        marginBottom: 16,
    },
    player: {
        maxWidth: '100%',
        maxHeight: '100%',
        border: 'none',
    },
    errorPlaceholder: {
        padding: '82px 0',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        width: '100%',
    },
    loadingPlaceholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: '74px 0',
    },
    loadingIcon: {
        width: 36,
        height: 52,
    },
    errorIcon: {
        width: 36,
        height: 36,
    },
    iframe: {
        minWidth: 300,
        minHeight: 300,
    },
    imgWrapper: {
        maxWidth: 300,
    },
}))

export interface AboutTabProps {
    asset: {
        loading?: boolean
        value?: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>
    }
}

export function AboutTab(props: AboutTabProps) {
    const { asset } = props
    const { classes } = useStyles()
    return useMemo(() => {
        return (
            <CollectibleTab>
                <div className={classes.body}>
                    {asset.loading ? (
                        <LoadingBase />
                    ) : (
                        <>
                            <div className={classes.basic}>
                                <NFTBasicInfo hideSubTitle asset={asset} />
                            </div>
                            <NFTPriceCard asset={asset} />
                        </>
                    )}
                </div>
            </CollectibleTab>
        )
    }, [asset.value?.metadata?.mediaURL, asset.value?.metadata?.imageURL, classes])
}
