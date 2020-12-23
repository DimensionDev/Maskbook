import { useCallback } from 'react'
import { useState } from 'react'
import { PoolSettings, useFillCallback } from '../hooks/useFillCallback'
import type { JSON_PayloadInMask } from '../types'
import { ConfirmDialog } from './ConfirmDialog'
import { CreateForm } from './CreateForm'
import { WalletMessages } from '../../Wallet/messages'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId } from '../../../web3/hooks/useChainState'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ITO_CONSTANTS } from '../constants'
import { formatBalance } from '../../Wallet/formatter'
import BigNumber from 'bignumber.js'
import { useEffect } from 'react'
import { useI18N } from '../../../utils/i18n-next-ui'

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
    const account = useAccount()
    const chainId = useChainId()
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')

    const [step, setStep] = useState(ITOCreateFormPageStep.NewItoPage)

    const [poolSettings, setPoolSettings] = useState<PoolSettings>()
    const onNext = useCallback(() => {
        if (step === ITOCreateFormPageStep.NewItoPage) setStep(ITOCreateFormPageStep.ConfirmItoPage)
    }, [step])

    const onBack = useCallback(() => {
        if (step === ITOCreateFormPageStep.ConfirmItoPage) setStep(ITOCreateFormPageStep.NewItoPage)
    }, [step])
    //#region blocking
    const [fillSettings, fillState, fillCallback, resetFillCallback] = useFillCallback(poolSettings!)
    //#endregion

    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return

            // reset state
            resetFillCallback()

            // the settings is not available
            if (!fillSettings?.token) return

            // TODO:
            // earily return happended
            // we should guide user to select the red packet in the existing list
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
                contract_address: ITO_CONTRACT_ADDRESS,
                pid: FillSuccess.id,
                password: fillSettings.password,
                limit: fillSettings.limit,
                total: FillSuccess.total,
                total_remaining: FillSuccess.total,
                sender: {
                    address: FillSuccess.creator,
                    name: FillSuccess.name,
                    message: FillSuccess.message,
                },
                chain_id: chainId,
                start_time: fillSettings.startTime.getTime(),
                end_time: fillSettings.endTime.getTime(),
                creation_time: Number.parseInt(FillSuccess.creation_time, 10) * 1000,
                token: fillSettings.token,
                exchange_tokens: fillSettings.exchangeTokens,
                exchange_amounts: fillSettings.exchangeAmounts,
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
    }, [fillState, poolSettings, setTransactionDialogOpen, t])

    //#region connect wallet
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    switch (step) {
        case ITOCreateFormPageStep.NewItoPage:
            return <CreateForm onNext={onNext} onConnectWallet={onConnect} onChangePoolSettings={setPoolSettings} />
        case ITOCreateFormPageStep.ConfirmItoPage:
            return <ConfirmDialog poolSettings={poolSettings} onBack={onBack} onDone={fillCallback} />
        default:
            return null
    }
}
