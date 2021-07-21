import { useState, useCallback, useRef, useEffect } from 'react'
import { DialogContent } from '@material-ui/core'
import { usePortalShadowRoot, useRemoteControlledDialog } from '@masknet/shared'
import { useI18N } from '../../../utils'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { RedPacketJSONPayload, DialogTabs, RedPacketRecord } from '../types'
import { editActivatedPostMetadata } from '../../../protocols/typed-message/global-state'
import { RedPacketMetaKey } from '../constants'
import { RedPacketForm } from './RedPacketForm'
import { RedPacketHistoryList } from './RedPacketHistoryList'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import Services from '../../../extension/service'
import Web3Utils from 'web3-utils'
import {
    EthereumTokenType,
    formatBalance,
    getChainName,
    NetworkType,
    TransactionStateType,
    useAccount,
    useChainId,
    useNetworkType,
    useRedPacketConstants,
} from '@masknet/web3-shared'
import { RedPacketSettings, useCreateCallback } from './hooks/useCreateCallback'
import { currentGasPriceSettings, currentGasNowSettings } from '../../Wallet/settings'
import { WalletMessages } from '../../Wallet/messages'
import { omit } from 'lodash-es'
import { RedPacketRPC } from '../messages'
import { RedPacketConfirmDialog } from './RedPacketConfirmDialog'

enum CreateRedPacketPageStep {
    NewRedPacketPage = 'new',
    ConfirmPage = 'confirm',
}

interface RedPacketDialogProps extends withClasses<never> {
    open: boolean
    onClose: () => void
}

export default function RedPacketDialog(props: RedPacketDialogProps) {
    const { t } = useI18N()
    const chainId = useChainId()
    const account = useAccount()

    const { HAPPY_RED_PACKET_ADDRESS_V2, HAPPY_RED_PACKET_ADDRESS_V3 } = useRedPacketConstants()

    const state = useState(DialogTabs.create)

    const networkType = useNetworkType()
    const contract_version = networkType === NetworkType.Ethereum ? 2 : 3
    const [settings, setSettings] = useState<Omit<RedPacketSettings, 'password'>>()

    const onClose = useCallback(() => {
        setStep(CreateRedPacketPageStep.NewRedPacketPage)
        setSettings(undefined)
        const [, setValue] = state
        setValue(DialogTabs.create)
        currentGasPriceSettings.value = 0
        props.onClose()
    }, [props, state])

    const onCreateOrSelect = useCallback(
        async (payload: RedPacketJSONPayload) => {
            if (payload.password === '') {
                if (payload.contract_version === 1) {
                    alert('Unable to share a red packet without a password. But you can still withdraw the red packet.')
                    payload.password = prompt('Please enter the password of the red packet:', '') ?? ''
                }

                if (payload.contract_version > 1) {
                    // just sign out the password if it is lost.
                    payload.password = await Services.Ethereum.personalSign(
                        Web3Utils.sha3(payload.sender.message) ?? '',
                        account,
                    )
                    payload.password = payload.password!.slice(2)
                }
            }

            editActivatedPostMetadata((next) =>
                payload ? next.set(RedPacketMetaKey, payload) : next.delete(RedPacketMetaKey),
            )
            onClose()
        },
        [onClose, chainId],
    )

    //#region blocking
    // password should remain the same rather than change each time when createState change,
    //  otherwise password in database would be different from creating red-packet.
    const [createSettings, createState, createCallback, resetCreateCallback] = useCreateCallback(
        settings!,
        contract_version,
    )
    //#endregion

    // assemble JSON payload
    const payload = useRef<RedPacketJSONPayload>({
        network: getChainName(chainId),
    } as RedPacketJSONPayload)

    useEffect(() => {
        if (createState.type !== TransactionStateType.UNKNOWN) return
        const contractAddress =
            networkType === NetworkType.Ethereum ? HAPPY_RED_PACKET_ADDRESS_V2 : HAPPY_RED_PACKET_ADDRESS_V3
        if (!contractAddress) {
            onClose()
            return
        }
        payload.current.contract_address = contractAddress
        payload.current.contract_version = networkType === NetworkType.Ethereum ? 2 : 3
        payload.current.network = getChainName(chainId)
    }, [chainId, networkType, createState])

    //#region remote controlled transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
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
            payload.current.sender = {
                address: account,
                name: createSettings.name,
                message: createSettings.message,
            }
            payload.current.is_random = createSettings.isRandom
            payload.current.shares = createSettings.shares
            payload.current.password = createSettings.password
            payload.current.token_type = createSettings.token.type
            payload.current.rpid = CreationSuccess.id
            payload.current.total = CreationSuccess.total
            payload.current.duration = createSettings.duration
            payload.current.creation_time = Number.parseInt(CreationSuccess.creation_time, 10) * 1000

            if (createSettings.token.type === EthereumTokenType.ERC20)
                payload.current.token = {
                    name: '',
                    symbol: '',
                    ...omit(createSettings.token, ['type', 'chainId']),
                }

            setSettings(undefined)
            // output the redpacket as JSON payload
            onCreateOrSelect(payload.current)
        },
    )

    // open the transaction dialog
    useEffect(() => {
        // storing the created red packet in DB, it helps retrieve red packet password later
        // save to the database early, otherwise red-packet would lose when close the tx dialog or
        //  web page before create successfully.
        if (createState.type === TransactionStateType.WAIT_FOR_CONFIRMING) {
            payload.current.txid = createState.hash
            const record: RedPacketRecord = {
                id: createState.hash!,
                from: '',
                password: createSettings!.password,
                contract_version,
            }
            RedPacketRPC.discoverRedPacket(record)
        }

        if (!createSettings?.token || createState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            state: createState,
            summary: t('plugin_red_packet_create_with_token', {
                symbol: `${formatBalance(createSettings?.total, createSettings?.token?.decimals)} ${
                    createSettings?.token.symbol
                }`,
            }),
        })
    }, [createState /* update tx dialog only if state changed */])
    //#endregion

    const [step, setStep] = useState(CreateRedPacketPageStep.NewRedPacketPage)
    const onBack = useCallback(() => {
        if (step === CreateRedPacketPageStep.ConfirmPage) setStep(CreateRedPacketPageStep.NewRedPacketPage)
        currentGasPriceSettings.value = currentGasNowSettings.value?.fast ?? 0
    }, [step])
    const onNext = useCallback(() => {
        if (step === CreateRedPacketPageStep.NewRedPacketPage) setStep(CreateRedPacketPageStep.ConfirmPage)
        currentGasPriceSettings.value = currentGasNowSettings.value?.fast ?? 0
    }, [step])

    const onChange = useCallback((val: Omit<RedPacketSettings, 'password'>) => {
        setSettings(val)
    }, [])

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_red_packet_create_new'),
                children: usePortalShadowRoot((container) => (
                    <RedPacketForm
                        origin={settings}
                        onNext={onNext}
                        onChange={onChange}
                        SelectMenuProps={{ container }}
                    />
                )),
                sx: { p: 0 },
            },
            {
                label: t('plugin_red_packet_select_existing'),
                children: <RedPacketHistoryList onSelect={onCreateOrSelect} onClose={onClose} />,
                sx: { p: 0 },
            },
        ],
        state,
    }

    return (
        <InjectedDialog open={props.open} title={t('plugin_red_packet_display_name')} onClose={onClose}>
            <DialogContent>
                {step === CreateRedPacketPageStep.NewRedPacketPage ? <AbstractTab height={320} {...tabProps} /> : null}
                {step === CreateRedPacketPageStep.ConfirmPage ? (
                    <RedPacketConfirmDialog
                        onClose={onClose}
                        onBack={onBack}
                        onCreate={createCallback}
                        settings={settings}
                    />
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
