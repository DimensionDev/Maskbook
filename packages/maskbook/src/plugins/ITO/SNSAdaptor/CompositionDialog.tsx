import { useCallback, useEffect, useState } from 'react'
import Web3Utils from 'web3-utils'
import { DialogContent } from '@material-ui/core'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { InjectedDialog, InjectedDialogProps } from '../../../components/shared/InjectedDialog'
import { ITO_MetaKey_2, MSG_DELIMITER } from '../constants'
import { DialogTabs, JSON_PayloadInMask } from '../types'
import { CreateForm } from './CreateForm'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { payloadOutMask } from './helpers'
import { PoolList } from './PoolList'
import { PluginITO_RPC } from '../messages'
import Services from '../../../extension/service'
import { formatBalance, useChainId, useAccount, TransactionStateType, useITOConstants } from '@masknet/web3-shared'
import { PoolSettings, useFillCallback } from './hooks/useFill'
import { ConfirmDialog } from './ConfirmDialog'
import { WalletMessages } from '../../Wallet/messages'
import { omit, set } from 'lodash-es'
import { useCompositionContext } from '../../../components/CompositionDialog/CompositionContext'
import { MINDS_ID } from '../../../social-network-adaptor/minds.com/base'
import { activatedSocialNetworkUI } from '../../../social-network'

interface StyleProps {
    snsId: string
}

const useStyles = makeStyles<StyleProps>()((theme, { snsId }) => ({
    content: {
        ...(snsId === MINDS_ID ? { minWidth: 600 } : {}),
        position: 'relative',
        paddingTop: 50,
    },
    tabs: {
        top: 0,
        left: 0,
        right: 0,
        position: 'absolute',
    },
}))

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
    const { classes } = useStyles({ snsId: activatedSocialNetworkUI.networkIdentifier })
    const { attachMetadata, dropMetadata } = useCompositionContext()

    const { ITO2_CONTRACT_ADDRESS } = useITOConstants()

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
    const onDone = useCallback(() => {
        fillCallback()
    }, [fillCallback])
    //#endregion

    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return

            // reset state
            resetFillCallback()

            // no contract is available
            if (!ITO2_CONTRACT_ADDRESS) return

            // the settings is not available
            if (!fillSettings?.token) return

            // early return happened
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

            // To meet the max allowance of the data size of image steganography, we need to
            //  cut off and simplify some properties, such as save the token address string only.
            const payloadDetail = omit(
                set(
                    set(payloadOutMask(payload), 'token', payload.token.address),
                    'exchange_tokens',
                    payload.exchange_tokens.map(({ address }) => ({ address })),
                ),
                [
                    'creation_time',
                    'unlock_time',
                    'total_remaining',
                    'regions',
                    'start_time',
                    'end_time',
                    'qualification_address',
                ],
            )
            if (payload) attachMetadata(ITO_MetaKey_2, payloadDetail)
            else dropMetadata(ITO_MetaKey_2)

            props.onConfirm(payload)
            // storing the created pool in DB, it helps retrieve the pool password later
            PluginITO_RPC.discoverPool('', payload)

            const [, setValue] = state
            setValue(DialogTabs.create)
        },
        [account, chainId, props.onConfirm, state],
    )

    const onClose = useCallback(() => {
        const [, setValue] = state
        setStep(ITOCreateFormPageStep.NewItoPage)
        setPoolSettings(undefined)
        setValue(DialogTabs.create)
        props.onClose()
    }, [props, state])

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_ito_create_new'),
                children: usePortalShadowRoot(() => (
                    <CreateForm
                        onNext={onNext}
                        onClose={onClose}
                        origin={poolSettings}
                        onChangePoolSettings={setPoolSettings}
                    />
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
    //#endregion

    useEffect(() => {
        if (!ITO2_CONTRACT_ADDRESS) onClose()
    }, [ITO2_CONTRACT_ADDRESS, onClose])

    return (
        <InjectedDialog disableBackdropClick open={props.open} title={t('plugin_ito_display_name')} onClose={onClose}>
            <DialogContent className={classes.content}>
                {step === ITOCreateFormPageStep.NewItoPage ? (
                    <AbstractTab classes={{ tabs: classes.tabs }} height={540} {...tabProps} />
                ) : null}
                {step === ITOCreateFormPageStep.ConfirmItoPage ? (
                    <ConfirmDialog poolSettings={poolSettings} onBack={onBack} onDone={onDone} onClose={onClose} />
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
