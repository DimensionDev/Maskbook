import type { FC } from 'react'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { chainResolver } from '@masknet/web3-shared-evm'
import { useChainId } from '@masknet/web3-hooks-base'
import { GasSetting1559 } from './GasSetting1559.js'
import { Prior1559GasSetting } from './Prior1559GasSetting.js'
import type { GasSettingProps } from './types.js'

export const GasSetting: FC<GasSettingProps> = (props) => {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const is1559Supported = chainResolver.isSupport(chainId, 'EIP1559')
    return is1559Supported ? <GasSetting1559 {...props} /> : <Prior1559GasSetting {...props} />
}
