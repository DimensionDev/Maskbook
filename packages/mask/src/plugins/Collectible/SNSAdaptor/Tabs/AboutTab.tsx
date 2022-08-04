import { LoadingBase, makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { CollectibleTab } from '../CollectibleTab'
import { NFTBasicInfo } from '../../../../components/shared/NFTCard/NFTBasicInfo'
import { NFTPriceCard } from '../../../../components/shared/NFTCard/NFTPriceCard'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    body: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 300,
    },
    basic: {
        width: '100%',
        marginBottom: 16,
    },
}))

export interface AboutTabProps {
    asset: {
        loading?: boolean
        value?: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>
    }
    onChangeProvider: (v: SourceType) => void
}

export function AboutTab(props: AboutTabProps) {
    const { asset, onChangeProvider } = props
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
                                <NFTBasicInfo onChangeProvider={onChangeProvider} hideSubTitle asset={asset} />
                            </div>
                            <NFTPriceCard asset={asset} />
                        </>
                    )}
                </div>
            </CollectibleTab>
        )
    }, [asset, classes])
}
