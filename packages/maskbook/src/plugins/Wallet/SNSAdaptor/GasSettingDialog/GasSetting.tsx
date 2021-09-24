import type { FC } from 'react'
import { isEIP1559Supported, useChainId } from '@masknet/web3-shared'
import { GasSetting1559 } from '../../../../extension/popups/pages/Wallet/GasSetting/GasSetting1559'
import { Prior1559GasSetting } from '../../../../extension/popups/pages/Wallet/GasSetting/Prior1559GasSetting'
import type { GasSettingProps } from '../../../../extension/popups/pages/Wallet/GasSetting/types'

export const GasSetting: FC<GasSettingProps> = (props) => {
    const chainId = useChainId()
    const is1559Supported = isEIP1559Supported(chainId)
    return is1559Supported ? <GasSetting1559 {...props} /> : <Prior1559GasSetting {...props} />
}
