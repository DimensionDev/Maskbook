import { useState, useEffect, useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { PoolSettings, useFillCallback } from '../hooks/useFillCallback'
import type { JSON_PayloadInMask } from '../types'
import { ConfirmDialog } from './ConfirmDialog'
import { CreateForm } from './CreateForm'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { useChainId } from '../../../web3/hooks/useChainState'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ITO_CONSTANTS } from '../constants'
import { formatBalance } from '../../Wallet/formatter'
import { useI18N } from '../../../utils/i18n-next-ui'
import { EthereumMessages } from '../../Ethereum/messages'

export enum ITOCreateFormPageStep {
    NewItoPage = 'new-ito',
    ConfirmItoPage = 'confirm-item',
}

export interface CreateGuideProps {
    onCreate?(payload: JSON_PayloadInMask): void
}

export function CreateGuide(props: CreateGuideProps) {
    const { onCreate } = props

    const { t } = useI18N()
    const chainId = useChainId()
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    const MASK_ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'MASK_ITO_CONTRACT_ADDRESS')

    const [step, setStep] = useState(ITOCreateFormPageStep.NewItoPage)

    const [poolSettings, setPoolSettings] = useState<PoolSettings>()
    const onNext = useCallback(() => {
        if (step === ITOCreateFormPageStep.NewItoPage) setStep(ITOCreateFormPageStep.ConfirmItoPage)
    }, [step])

    const onBack = useCallback(() => {
        if (step === ITOCreateFormPageStep.ConfirmItoPage) setStep(ITOCreateFormPageStep.NewItoPage)
    }, [step])

    //#region blocking
    const [fillSettings, fillState, fillCallback, resetFillCallback] = useFillCallback(poolSettings)
    //#endregion

    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return

            // reset state
            resetFillCallback()

            // the settings is not available
            if (!fillSettings?.token) return

            // earily return happended
            if (fillState.type !== TransactionStateType.CONFIRMED) return

            const { receipt } = fillState
            const FillSuccess = (receipt.events?.FillSuccess.returnValues ?? {}) as {
                total: string
                id: string
                creator: string
                creation_time: string
                token_address: string
                name: string
                message: string
            }

            // assemble JSON payload
            const payload: JSON_PayloadInMask = {
                contract_address: fillSettings.isMask ? MASK_ITO_CONTRACT_ADDRESS : ITO_CONTRACT_ADDRESS,
                pid: FillSuccess.id,
                password: fillSettings.password,
                message: FillSuccess.message,
                limit: fillSettings.limit,
                total: FillSuccess.total,
                total_remaining: FillSuccess.total,
                seller: {
                    address: FillSuccess.creator,
                    name: FillSuccess.name,
                },
                buyers: [],
                chain_id: chainId,
                start_time: fillSettings.startTime.getTime(),
                end_time: fillSettings.endTime.getTime(),
                creation_time: Number.parseInt(FillSuccess.creation_time, 10) * 1000,
                token: fillSettings.token,
                exchange_amounts: fillSettings.exchangeAmounts,
                exchange_tokens: fillSettings.exchangeTokens,
                is_mask: fillSettings.isMask,
                test_nums: fillSettings.testNums,
            }

            // output the redpacket as JSON payload
            onCreate?.(payload)
        },
    )

    // open the transaction dialog
    useEffect(() => {
        if (!poolSettings?.token || fillState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            state: fillState,
            summary: t('plugin_ito_transaction_dialog_summary', {
                amount: formatBalance(
                    new BigNumber(poolSettings?.total),
                    poolSettings?.token.decimals ?? 0,
                    poolSettings?.token.decimals ?? 0,
                ),
                symbol: poolSettings.token.symbol,
            }),
        })
    }, [fillState, poolSettings, setTransactionDialogOpen])

    switch (step) {
        case ITOCreateFormPageStep.NewItoPage:
            return <CreateForm onNext={onNext} origin={poolSettings} onChangePoolSettings={setPoolSettings} />
        case ITOCreateFormPageStep.ConfirmItoPage:
            return <ConfirmDialog poolSettings={poolSettings} onBack={onBack} onDone={fillCallback} />
        default:
            return null
    }
}
