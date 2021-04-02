import { useCallback, useEffect, useState } from 'react'
import Web3Utils from 'web3-utils'
import { DialogContent, DialogProps } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { ITO_CONSTANTS, ITO_MetaKey } from '../constants'
import { DialogTabs, JSON_PayloadInMask } from '../types'
import { useI18N } from '../../../utils/i18n-next-ui'
import { CreateForm } from './CreateForm'
import AbstractTab, { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import { editActivatedPostMetadata } from '../../../protocols/typed-message/global-state'
import { payloadOutMask } from '../helpers'
import { PoolList } from './PoolList'
import { PluginITO_RPC } from '../messages'
import Services from '../../../extension/service'
import { useChainId } from '../../../web3/hooks/useChainState'
import { useAccount } from '../../../web3/hooks/useAccount'
import { PoolSettings, useFillCallback } from '../hooks/useFillCallback'
import { ConfirmDialog } from './ConfirmDialog'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { EthereumMessages } from '../../Ethereum/messages'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { formatBalance } from '../../Wallet/formatter'
import BigNumber from 'bignumber.js'
import { useConstant } from '../../../web3/hooks/useConstant'

export enum ITOCreateFormPageStep {
    NewItoPage = 'new-ito',
    ConfirmItoPage = 'confirm-item',
}

export interface CompositionDialogProps extends withClasses<'root'> {
    open: boolean
    onConfirm(payload: JSON_PayloadInMask): void
    onClose: () => void
    DialogProps?: Partial<DialogProps>
}

export function CompositionDialog(props: CompositionDialogProps) {
    const { t } = useI18N()

    const account = useAccount()
    const chainId = useChainId()

    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    const MASK_ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'MASK_ITO_CONTRACT_ADDRESS')

    //#region step
    const [step, setStep] = useState(ITOCreateFormPageStep.NewItoPage)

    const onNext = useCallback(() => {
        if (step === ITOCreateFormPageStep.NewItoPage) setStep(ITOCreateFormPageStep.ConfirmItoPage)
    }, [step])

    const onBack = useCallback(() => {
        if (step === ITOCreateFormPageStep.ConfirmItoPage) setStep(ITOCreateFormPageStep.NewItoPage)
    }, [step])
    //#endregion

    const [poolSettings, setPoolSettings] = useState<PoolSettings>()

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
            onCreateOrSelect(payload)
        },
    )

    //#region tabs
    const state = useState<DialogTabs>(DialogTabs.create)

    const onCreateOrSelect = useCallback(
        async (payload: JSON_PayloadInMask) => {
            if (!payload.password)
                payload.password = await Services.Ethereum.sign(Web3Utils.sha3(payload.message) ?? '', account, chainId)
            if (!payload.password) {
                alert('Failed to sign the password.')
                return
            }
            editActivatedPostMetadata((next) =>
                payload ? next.set(ITO_MetaKey, payloadOutMask(payload)) : next.delete(ITO_MetaKey),
            )
            props.onConfirm(payload)
            // storing the created pool in DB, it helps retrieve the pool password later
            PluginITO_RPC.discoverPool('', payload)

            const [, setValue] = state
            setValue(DialogTabs.create)
        },
        [account, chainId, props.onConfirm, state],
    )

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_ito_create_new'),
                children: <CreateForm onNext={onNext} origin={poolSettings} onChangePoolSettings={setPoolSettings} />,
                sx: { p: 0 },
            },
            {
                label: t('plugin_ito_select_existing'),
                children: <PoolList onSend={onCreateOrSelect} />,
                sx: { p: 0 },
            },
        ],
        state,
    }
    //#endregion

    const onClose = useCallback(() => {
        const [, setValue] = state
        setValue(DialogTabs.create)
        props.onClose()
    }, [props, state])

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

    return (
        <>
            <InjectedDialog
                disableBackdropClick
                open={props.open}
                title={t('plugin_ito_display_name')}
                onClose={onClose}>
                <DialogContent>
                    {step === ITOCreateFormPageStep.NewItoPage ? <AbstractTab height={540} {...tabProps} /> : null}
                    {step === ITOCreateFormPageStep.ConfirmItoPage ? (
                        <ConfirmDialog poolSettings={poolSettings} onBack={onBack} onDone={fillCallback} />
                    ) : null}
                </DialogContent>
            </InjectedDialog>
        </>
    )
}
