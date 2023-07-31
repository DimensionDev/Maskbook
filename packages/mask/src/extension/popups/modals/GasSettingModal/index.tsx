import { forwardRef, useState } from 'react'
import { GasSettingDialog } from './GasSettingDialog.js'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import type { ChainId, GasConfig } from '@masknet/web3-shared-evm'
import type { GasSetting, ReplaceType } from '../../pages/Wallet/type.js'

export interface GasSettingModalOpenProps {
    chainId: ChainId
    config: GasSetting
    nonce?: string
    replaceType?: ReplaceType
}

export type GasSettingModalCloseProps = GasConfig | undefined

const initGasSetting = {
    gas: '',
}

export const GasSettingModal = forwardRef<
    SingletonModalRefCreator<GasSettingModalOpenProps, GasSettingModalCloseProps>
>((_, ref) => {
    const [chainId, setChainId] = useState<ChainId | undefined>()
    const [replaceType, setReplaceType] = useState<ReplaceType>()
    const [gasConfig, setGasConfig] = useState<GasSetting>(initGasSetting)
    const [nonce, setNonce] = useState('')
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setChainId(props.chainId)
            setReplaceType(props.replaceType)
            setGasConfig(props.config)
            setNonce(props.nonce ?? '')
        },
    })

    return (
        <GasSettingDialog
            nonce={nonce}
            onClose={(config) => dispatch?.close(config)}
            open={open}
            chainId={chainId}
            replaceType={replaceType}
            config={gasConfig}
        />
    )
})
