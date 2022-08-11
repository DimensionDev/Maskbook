import { LoadingBase, makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { CollectibleTab } from '../CollectibleTab'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { NFTInfoCard } from '../../../../components/shared/NFTCard/NFTInfoCard'
import { NFTPropertiesCard } from '../../../../components/shared/NFTCard/NFTPropertiesCard'
import { CollectibleState } from '../../hooks/useCollectibleState'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

const useStyles = makeStyles()((theme) => ({
    body: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 300,
    },
    info: {
        width: '100%',
        marginBottom: 24,
    },
}))

export interface DetailTabProps {
    asset: AsyncState<Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>>
}

export function DetailTab(props: DetailTabProps) {
    const { asset } = props
    const { provider } = CollectibleState.useContainer()
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
                    <div className={classes.info}>
                        <NFTInfoCard sourceType={provider} asset={asset.value} />
                    </div>
                    <NFTPropertiesCard asset={asset.value} />
                </div>
            </CollectibleTab>
        )
    }, [asset, classes])
}
