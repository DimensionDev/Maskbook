import { useCallback, useEffect, useState } from 'react'
import Web3Utils from 'web3-utils'
import { DialogContent } from '@material-ui/core'
import { usePortalShadowRoot } from '@masknet/shared'
import { useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { InjectedDialog, InjectedDialogProps } from '../../../components/shared/InjectedDialog'
import { ITO_MetaKey_2, MSG_DELIMITER } from '../constants'
import { DialogTabs, JSON_PayloadInMask } from '../types'
import { CreateForm } from './CreateForm'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { editActivatedPostMetadata } from '../../../protocols/typed-message/global-state'
import { payloadOutMask } from './helpers'
import { PoolList } from './PoolList'
import { PluginITO_RPC } from '../messages'
import Services from '../../../extension/service'
import { formatBalance, useChainId, useAccount, TransactionStateType, useITOConstants } from '@masknet/web3-shared'
import { PoolSettings, useFillCallback } from './hooks/useFill'
import { ConfirmDialog } from './ConfirmDialog'
import { currentGasPriceSettings, currentGasNowSettings } from '../../Wallet/settings'
import { WalletMessages } from '../../Wallet/messages'
import { omit, set } from 'lodash-es'

export enum ITOCreateFormPageStep {
    NewItoPage = 'new-ito',
    ConfirmItoPage = 'confirm-item',
}

export interface CompositionDialogProps extends withClasses<'root'>, Omit<InjectedDialogProps, 'classes' | 'onClose'> {
    onConfirm(payload: JSON_PayloadInMask): void
    onClose: () => void
}

export function CompositionDialog(props: CompositionDialogProps) {
    const { t } = useI18N()

    const account = useAccount()
    const chainId = useChainId()

    const { ITO2_CONTRACT_ADDRESS } = useITOConstants()

    //#region step
    const [step, setStep] = useState(ITOCreateFormPageStep.NewItoPage)

    const onNext = useCallback(() => {
        if (step === ITOCreateFormPageStep.NewItoPage) setStep(ITOCreateFormPageStep.ConfirmItoPage)
    }, [step])

    const onBack = useCallback(() => {
        if (step === ITOCreateFormPageStep.ConfirmItoPage) setStep(ITOCreateFormPageStep.NewItoPage)
        currentGasPriceSettings.value = currentGasNowSettings.value?.fast ?? 0
    }, [step, currentGasPriceSettings])
    //#endregion

    const [poolSettings, setPoolSettings] = useState<PoolSettings>()

    //#region blocking
    const [fillSettings, fillState, fillCallback, resetFillCallback] = useFillCallback(poolSettings)
    const onDone = useCallback(() => {
        fillCallback()
        currentGasPriceSettings.value = currentGasNowSettings.value?.fast ?? 0
    }, [fillCallback, currentGasPriceSettings])
    //#endregion

    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
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
                contract_address: ITO2_CONTRACT_ADDRESS,
                pid: FillSuccess.id,
                password: fillSettings.password,
                message: FillSuccess.message,
                limit: fillSettings.limit,
                total: FillSuccess.total,
                total_remaining: FillSuccess.total,
                seller: {
                    address: FillSuccess.creator,
                },
                buyers: [],
                chain_id: chainId,
                start_time: fillSettings.startTime.getTime(),
                end_time: fillSettings.endTime.getTime(),
                unlock_time: fillSettings.unlockTime?.getTime() ?? 0,
                qualification_address: fillSettings.qualificationAddress,
                creation_time: Number.parseInt(FillSuccess.creation_time, 10) * 1000,
                token: fillSettings.token,
                exchange_amounts: fillSettings.exchangeAmounts,
                exchange_tokens: fillSettings.exchangeTokens,
                regions: fillSettings.regions,
            }

            setPoolSettings(undefined)
            onCreateOrSelect(payload)
            onBack()
        },
    )

    //#region tabs
    const state = useState<DialogTabs>(DialogTabs.create)

    const onCreateOrSelect = useCallback(
        async (payload: JSON_PayloadInMask) => {
            if (!payload.password) {
                const [, title] = payload.message.split(MSG_DELIMITER)
                payload.password = await Services.Ethereum.personalSign(Web3Utils.sha3(title) ?? '', account)
            }
            if (!payload.password) {
                alert('Failed to sign the password.')
                return
            }
            editActivatedPostMetadata((next) => {
                // To meet the max allowance of the data size of image steganography, we need to
                //  cut off and simplify some properties, such as save the token address string only.
                const r = omit(
                    set(
                        set(payloadOutMask(payload), 'token', payload.token.address),
                        'exchange_tokens',
                        payload.exchange_tokens.map(({ address }) => ({ address })),
                    ),
                    [
                        'creation_time',
                        'unlock_time',
                        'total_remaining',
                        'buyers',
                        'regions',
                        'start_time',
                        'end_time',
                        'qualification_address',
                    ],
                )
                return payload ? next.set(ITO_MetaKey_2, r) : next.delete(ITO_MetaKey_2)
            })

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
                children: usePortalShadowRoot(() => (
                    <CreateForm onNext={onNext} origin={poolSettings} onChangePoolSettings={setPoolSettings} />
                )),
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
        setStep(ITOCreateFormPageStep.NewItoPage)
        // After close this tx dialog, it should set the gas price to zero
        //  to let Metamask to determine the gas price for the further tx.
        currentGasPriceSettings.value = 0
        setPoolSettings(undefined)
        props.onClose()
    }, [props, state, currentGasPriceSettings])

    // open the transaction dialog
    useEffect(() => {
        if (!poolSettings?.token || fillState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            state: fillState,
            summary: t('plugin_ito_transaction_dialog_summary', {
                amount: formatBalance(poolSettings?.total, poolSettings?.token.decimals),
                symbol: poolSettings.token.symbol,
            }),
        })
    }, [fillState, poolSettings, setTransactionDialog])

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
                        <ConfirmDialog poolSettings={poolSettings} onBack={onBack} onDone={onDone} />
                    ) : null}
                </DialogContent>
            </InjectedDialog>
        </>
    )
}
