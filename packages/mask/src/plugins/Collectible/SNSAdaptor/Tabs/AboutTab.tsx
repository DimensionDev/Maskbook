import { LoadingBase, makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { CollectibleTab } from '../CollectibleTab'
import { NFTBasicInfo } from '../../../../components/shared/NFTCard/NFTBasicInfo'
import { NFTPriceCard } from '../../../../components/shared/NFTCard/NFTPriceCard'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

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
    asset: AsyncState<Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>>
    onChangeProvider: (v: SourceType) => void
    providers: SourceType[]
    currentProvider: SourceType
}

export function AboutTab(props: AboutTabProps) {
    const { asset, providers, currentProvider, onChangeProvider } = props
    const { classes } = useStyles()
    return useMemo(() => {
        if (asset.loading || !asset.value)
            return (
                <CollectibleTab>
                    <div className={classes.body}>
                        <LoadingBase />
                    </div>
                </CollectibleTab>
            )
        return (
            <CollectibleTab>
                <div className={classes.body}>
                    <div className={classes.basic}>
                        <NFTBasicInfo
                            currentProvider={currentProvider}
                            providers={providers}
                            onChangeProvider={onChangeProvider}
                            hideSubTitle
                            asset={asset.value}
                        />
                    </div>
                    <NFTPriceCard asset={asset.value} />
                </div>
            </CollectibleTab>
        )
    }, [asset, classes])
}
