import type { NetworkPluginID } from '@masknet/shared-base'
import { ChainResolver } from '@masknet/web3-providers'
import { useChainContext } from '@masknet/web3-hooks-base'
import { GasSetting1559 } from './GasSetting1559.js'
import { Prior1559GasSetting } from './Prior1559GasSetting.js'
import type { GasSettingProps } from './types.js'

export function GasSettingSupported(props: GasSettingProps) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    return ChainResolver.isFeatureSupported(chainId, 'EIP1559') ? (
        <GasSetting1559 {...props} />
    ) : (
        <Prior1559GasSetting {...props} />
    )
}
