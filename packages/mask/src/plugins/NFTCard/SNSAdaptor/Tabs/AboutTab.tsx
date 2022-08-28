import { makeStyles } from '@masknet/theme'
import { NFTDescription } from '../../../../components/shared/NFTCard/NFTDescription'
import { NFTPropertiesCard } from '../../../../components/shared/NFTCard/NFTPropertiesCard'
import { NFTPriceCard } from '../../../../components/shared/NFTCard/NFTPriceCard'
import { NFTInfoCard } from '../../../../components/shared/NFTCard/NFTInfoCard'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        maxHeight: 'calc( 100% - 72px)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
    },
}))

export interface AboutTabProps {
    asset: AsyncState<Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>>
}

export function AboutTab(props: AboutTabProps) {
    const { asset } = props
    const { classes } = useStyles()
    const _asset = asset.value
    if (!_asset) return null
    return (
        <div className={classes.wrapper}>
            <NFTPriceCard asset={_asset} />
            <NFTInfoCard asset={_asset} />
            <NFTDescription asset={_asset} />
            <NFTPropertiesCard asset={_asset} />
        </div>
    )
}
