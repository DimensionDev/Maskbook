import { forwardRef, useMemo, useState } from 'react'
import { GasSettingDialog } from './GasSettingDialog.js'
import { useSingletonModal } from '@masknet/shared-base-ui'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import type { ChainId, GasConfig } from '@masknet/web3-shared-evm'
import { ReplaceType, type GasSetting } from '../../pages/Wallet/type.js'
import { BottomDrawer } from '../../components/index.js'
import { useI18N } from '../../../../utils/index.js'

export type GasSettingModalOpenProps = {
    chainId: ChainId
    config: GasSetting
    nonce?: string | number
    replaceType?: ReplaceType
}

export type GasSettingModalCloseProps = GasConfig | undefined

const initGasSetting = {
    gas: '',
}

export const GasSettingModal = forwardRef<
    SingletonModalRefCreator<GasSettingModalOpenProps, GasSettingModalCloseProps>
>(function GasSettingModal(_, ref) {
    const { t } = useI18N()
    const [chainId, setChainId] = useState<ChainId | undefined>()
    const [replaceType, setReplaceType] = useState<ReplaceType>()
    const [gasConfig = initGasSetting, setGasConfig] = useState<GasSetting>()
    const [nonce, setNonce] = useState<string | number>('')
    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setChainId(props.chainId)
            setReplaceType(props.replaceType)
            setGasConfig(props.config)
            setNonce(props.nonce ?? '')
        },
    })
    const title = useMemo(() => {
        switch (replaceType) {
            case ReplaceType.CANCEL:
                return t('cancel')
            case ReplaceType.SPEED_UP:
                return t('speed_up')
            default:
                return t('popups_wallet_gas_fee')
        }
    }, [replaceType])

    return (
        <BottomDrawer open={open} title={title} onClose={() => dispatch?.close(undefined)}>
            <GasSettingDialog
                nonce={nonce}
                onClose={(config) => dispatch?.close(config)}
                open={open}
                chainId={chainId}
                replaceType={replaceType}
                config={gasConfig}
            />
        </BottomDrawer>
    )
})
