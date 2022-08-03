import { LoadingBase, makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { CollectibleTab } from '../CollectibleTab'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { NFTInfoCard } from '../../../../components/shared/NFTCard/NFTInfoCard'
import { NFTPropertiesCard } from '../../../../components/shared/NFTCard/NFTPropertiesCard'

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
    asset: {
        loading?: boolean
        value?: Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>
    }
}

export function DetailTab(props: DetailTabProps) {
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
                            <div className={classes.info}>
                                <NFTInfoCard asset={asset} />
                            </div>
                            <NFTPropertiesCard asset={asset} />
                        </>
                    )}
                </div>
            </CollectibleTab>
        )
    }, [asset, classes])
}
