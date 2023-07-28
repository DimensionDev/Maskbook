import { forwardRef, useState } from 'react'
import { GasSettingDialog } from './GasSettingDialog.js'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import type { ChainId, GasConfig } from '@masknet/web3-shared-evm'

export interface GasSettingModalOpenProps {
    chainId: ChainId
    gas: string
}

export type GasSettingModalCloseProps = GasConfig | undefined

export const GasSettingModal = forwardRef<
    SingletonModalRefCreator<GasSettingModalOpenProps, GasSettingModalCloseProps>
>((_, ref) => {
    const [chainId, setChainId] = useState<ChainId | undefined>()
    const [gas, setGas] = useState('0')
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setChainId(props.chainId)
            setGas(props.gas)
        },
    })

    return <GasSettingDialog onClose={(config) => dispatch?.close(config)} open={open} chainId={chainId} gas={gas} />
})
