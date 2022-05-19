import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCompositionContext } from '@masknet/plugin-infra/content-script'
import { useAccount, useChainId, useNetworkType, useWeb3 } from '@masknet/plugin-infra/web3'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { NetworkPluginID, formatBalance } from '@masknet/web3-shared-base'
import { chainResolver, TransactionStateType, useRedPacketConstants } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
import Web3Utils from 'web3-utils'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { useI18N } from '../../../utils'
import { WalletMessages } from '../../Wallet/messages'
import { RedPacketMetaKey } from '../constants'
import { RedPacketRPC } from '../messages'
import { DialogTabs, RedPacketJSONPayload, RedPacketRecord, RpTypeTabs } from '../types'
import { RedPacketSettings, useCreateCallback } from './hooks/useCreateCallback'
import { RedPacketConfirmDialog } from './RedPacketConfirmDialog'
import { RedPacketCreateNew } from './RedPacketCreateNew'
import { RedPacketPast } from './RedPacketPast'

const useStyles = makeStyles()((theme) => ({
    content: {
        position: 'relative',
        paddingTop: 50,
    },
    tabs: {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    dialogContent: {
        padding: 0,
    },
    tabPaper: {
        position: 'sticky',
        top: 0,
        zIndex: 5000,
    },
    indicator: {
        display: 'none',
    },
    tab: {
        maxWidth: 120,
    },
    focusTab: {
        borderBottom: `2px solid ${theme.palette.primary.main}`,
    },
    flexContainer: {
        justifyContent: 'space-around',
    },
}))

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
    const { classes } = useStyles()
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = useRedPacketConstants()
    const { attachMetadata, dropMetadata } = useCompositionContext()
    const state = useState(DialogTabs.create)

    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const networkType = useNetworkType(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const contract_version = 4
    const [settings, setSettings] = useState<RedPacketSettings>()

    const onClose = useCallback(() => {
        setStep(CreateRedPacketPageStep.NewRedPacketPage)
        setSettings(undefined)
        const [, setValue] = state
        setValue(DialogTabs.create)
        props.onClose()
    }, [props, state])

    const { address: publicKey, privateKey } = useMemo(() => web3?.eth.accounts.create(), [web3])

    const currentIdentity = useCurrentIdentity()

    const { value: linkedPersona } = useCurrentLinkedPersona()

    const senderName = currentIdentity?.identifier.userId ?? linkedPersona?.nickname
    const { closeDialog: closeApplicationBoardDialog } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
    )
    const onCreateOrSelect = useCallback(
        async (payload: RedPacketJSONPayload) => {
            if (payload.password === '') {
                if (payload.contract_version === 1) {
                    alert('Unable to share a lucky drop without a password. But you can still withdraw the lucky drop.')
                    payload.password = prompt('Please enter the password of the lucky drop:', '') ?? ''
                } else if (payload.contract_version > 1 && payload.contract_version < 4) {
                    // just sign out the password if it is lost.
                    payload.password = await EVM_RPC.personalSign(Web3Utils.sha3(payload.sender.message) ?? '', account)
                    payload.password = payload.password!.slice(2)
                }
            }

            if (payload) {
                senderName && (payload.sender.name = senderName)
                attachMetadata(RedPacketMetaKey, payload)
            } else dropMetadata(RedPacketMetaKey)
            onClose()
            closeApplicationBoardDialog()
        },
        [onClose, chainId, senderName],
    )

    // #region blocking
    // password should remain the same rather than change each time when createState change,
    //  otherwise password in database would be different from creating red-packet.
    const [createSettings, createState, createCallback, resetCreateCallback] = useCreateCallback(
        settings!,
        contract_version,
        publicKey,
    )
    // #endregion

    // assemble JSON payload
    const payload = useRef<RedPacketJSONPayload>({
        network: chainResolver.chainName(chainId),
    } as RedPacketJSONPayload)

    useEffect(() => {
        if (createState.type !== TransactionStateType.UNKNOWN) return
        const contractAddress = HAPPY_RED_PACKET_ADDRESS_V4
        if (!contractAddress) {
            onClose()
            return
        }
        payload.current.contract_address = contractAddress
        payload.current.contract_version = contract_version
        payload.current.network = chainResolver.chainName(chainId)
    }, [chainId, networkType, contract_version, createState])

    // #region remote controlled transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return

            // reset state
            resetCreateCallback()

            // the settings is not available
            if (!createSettings?.token) return

            // TODO:
            // early return happened
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
            payload.current.password = privateKey
            payload.current.rpid = CreationSuccess.id
            payload.current.total = CreationSuccess.total
            payload.current.duration = createSettings.duration
            payload.current.creation_time = Number.parseInt(CreationSuccess.creation_time, 10) * 1000
            payload.current.token = createSettings.token

            setSettings(undefined)
            // output the redpacket as JSON payload
            onCreateOrSelect(payload.current)
        },
    )

    // open the transaction dialog
    useEffect(() => {
        if (!createSettings?.token || createState.type === TransactionStateType.UNKNOWN) return

        // storing the created red packet in DB, it helps retrieve red packet password later
        // save to the database early, otherwise red-packet would lose when close the tx dialog or
        //  web page before create successfully.
        if (createState.type === TransactionStateType.HASH && createState.hash) {
            payload.current.txid = createState.hash
            const record: RedPacketRecord = {
                id: createState.hash!,
                from: '',
                password: privateKey,
                contract_version,
            }
            RedPacketRPC.discoverRedPacket(record)
        }

        setTransactionDialog({
            open: true,
            state: createState,
            summary: t('plugin_red_packet_create_with_token', {
                amount: formatBalance(createSettings?.total, createSettings?.token?.decimals),
                symbol: createSettings?.token.symbol,
            }),
        })
    }, [createState /* update tx dialog only if state changed */])
    // #endregion

    const [step, setStep] = useState(CreateRedPacketPageStep.NewRedPacketPage)
    const onBack = useCallback(() => {
        if (step === CreateRedPacketPageStep.ConfirmPage) setStep(CreateRedPacketPageStep.NewRedPacketPage)
    }, [step])
    const onNext = useCallback(() => {
        if (step === CreateRedPacketPageStep.NewRedPacketPage) setStep(CreateRedPacketPageStep.ConfirmPage)
    }, [step])

    const onChange = useCallback((val: Omit<RedPacketSettings, 'password'>) => {
        setSettings(val)
    }, [])

    const tokenState = useState(RpTypeTabs.ERC20)

    const dialogContentHeight = state[0] === DialogTabs.past ? 600 : tokenState[0] === RpTypeTabs.ERC20 ? 350 : 670

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_red_packet_create_new'),
                children: (
                    <RedPacketCreateNew
                        origin={settings}
                        onNext={onNext}
                        state={tokenState}
                        onClose={onClose}
                        onChange={onChange}
                    />
                ),
                sx: { p: 0 },
            },
            {
                label: t('plugin_red_packet_select_existing'),
                children: <RedPacketPast onSelect={onCreateOrSelect} onClose={onClose} />,
                sx: { p: 0 },
            },
        ],
        state,
        classes: {
            focusTab: classes.focusTab,
            tabPaper: classes.tabPaper,
            tab: classes.tab,
            flexContainer: classes.flexContainer,
            indicator: classes.indicator,
            tabs: classes.tabs,
        },
    }

    const isCreating = step === CreateRedPacketPageStep.NewRedPacketPage
    const title = isCreating ? t('plugin_red_packet_display_name') : t('plugin_red_packet_details')

    return (
        <InjectedDialog open={props.open} title={title} onClose={onClose} disableTitleBorder>
            <DialogContent className={classes.dialogContent}>
                {step === CreateRedPacketPageStep.NewRedPacketPage ? (
                    <AbstractTab height={dialogContentHeight} {...tabProps} />
                ) : null}
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
