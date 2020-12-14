import { useCallback } from 'react'
import { useState } from 'react'
import { PoolSettings, useFillCallback } from '../hooks/useFillCallback'
import type { ITO_JSONPayload } from '../types'
import { ConfirmDialog } from './ConfirmDialog'
import { CreateForm } from './CreateForm'
import { WalletMessages } from '../../Wallet/messages'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId } from '../../../web3/hooks/useChainState'
import { EthereumTokenType } from '../../../web3/types'
import { omit } from 'lodash-es'
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

export interface CreateItoGuideProps {
    onCreate?(payload: ITO_JSONPayload): void
}

export function CreateItoGuide(props: CreateItoGuideProps) {
    const { onCreate } = props
    const { t } = useI18N()
    const account = useAccount()
    const chainId = useChainId()
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')

    const [step, setStep] = useState(ITOCreateFormPageStep.NewItoPage)

    const [poolSettings, setPoolSettings] = useState<PoolSettings>()
    const onNext = useCallback(() => {
        if (step === ITOCreateFormPageStep.NewItoPage) {
            setStep(ITOCreateFormPageStep.ConfirmItoPage)
        }
    }, [step])

    const onBack = useCallback(() => {
        if (step === ITOCreateFormPageStep.ConfirmItoPage) {
            setStep(ITOCreateFormPageStep.NewItoPage)
        }
    }, [step])
    const [createSettings, createState, createCallback, resetCreateCallback] = useFillCallback(poolSettings)

    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return

            // reset state
            resetCreateCallback()

            // the settings is not available
            if (!createSettings?.token) return

            // TODO:
            // earily return happended
            // we should guide user to select the red packet in the existing list
            if (createState.type !== TransactionStateType.CONFIRMED) return

            const { receipt } = createState
            const CreationSuccess = (receipt.events?.CreationSuccess.returnValues ?? {}) as {
                creation_time: string
                creator: string
                id: string
                token_address: string
                total: string
            }

            // assemble JSON payload
            const payload: ITO_JSONPayload = {
                chainId: chainId,
                contract_address: ITO_CONTRACT_ADDRESS,
                pid: CreationSuccess.id,
                password: createSettings.password,
                total: createSettings.total,
                sender: {
                    address: account,
                    name: createSettings.name,
                    message: createSettings.title,
                },
                limit: createSettings.limit,
                creation_time: Number.parseInt(CreationSuccess.creation_time, 10) * 1000,
                token: createSettings.token,
                start_time: createSettings.startTime.getTime(),
                end_time: createSettings.endTime.getTime(),
                exchange_amounts: createSettings.exchangeAmounts,
                exchange_tokens: createSettings.exchangeTokens,
            }
            if (createSettings.token.type === EthereumTokenType.ERC20)
                payload.token = {
                    name: '',
                    symbol: '',
                    decimals: 0,
                    ...omit(createSettings.token, ['type', 'chainId']),
                }

            // output the redpacket as JSON payload
            props.onCreate?.(payload)
        },
    )

    // open the transaction dialog
    useEffect(() => {
        if (!poolSettings?.token || createState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            state: createState,
            summary: t('plugin_ito_transaction_dialog_summary', {
                amount: formatBalance(
                    new BigNumber(poolSettings?.total),
                    poolSettings?.token.decimals ?? 0,
                    poolSettings?.token.decimals ?? 0,
                ),
                symbol: poolSettings.token.symbol,
            }),
        })
    }, [createState, poolSettings, setTransactionDialogOpen, t])
    //#region connect wallet
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    switch (step) {
        case ITOCreateFormPageStep.NewItoPage: {
            return (
                <CreateForm
                    onNext={onNext}
                    onConnectWallet={onConnect}
                    onChangePoolSettings={(poolSettings) => setPoolSettings(poolSettings)}
                />
            )
        }
        case ITOCreateFormPageStep.ConfirmItoPage: {
            return <ConfirmDialog poolSettings={poolSettings} onBack={onBack} onDone={createCallback} />
        }
        default:
            return null
    }
}
