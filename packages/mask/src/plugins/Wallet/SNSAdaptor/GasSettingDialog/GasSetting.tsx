import type { FC } from 'react'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { chainResolver } from '@masknet/web3-shared-evm'
import { useChainId } from '@masknet/plugin-infra/web3'
import { GasSetting1559 } from './GasSetting1559'
import { Prior1559GasSetting } from './Prior1559GasSetting'
import type { GasSettingProps } from './types'

export const GasSetting: FC<GasSettingProps> = (props) => {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const is1559Supported = chainResolver.isSupport(chainId, 'EIP1559')
    return is1559Supported ? <GasSetting1559 {...props} /> : <Prior1559GasSetting {...props} />
}
