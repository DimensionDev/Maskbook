import type { FC } from 'react'
import { isEIP1559Supported, useChainId } from '@masknet/web3-shared'
import { GasSetting1559 } from './GasSetting1559'
import { Prior1559GasSetting } from './Prior1559GasSetting'
import type { GasSettingProps } from './types'

export const GasSetting: FC<GasSettingProps> = (props) => {
    const chainId = useChainId()
    const is1559Supported = isEIP1559Supported(chainId)
    return is1559Supported ? <GasSetting1559 /> : <Prior1559GasSetting />
}
