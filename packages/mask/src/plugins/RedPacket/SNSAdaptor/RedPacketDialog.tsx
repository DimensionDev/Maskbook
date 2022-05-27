import { useCompositionContext } from '@masknet/plugin-infra/content-script'
import { InjectedDialog } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { useAccount, useChainId } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
import { useCallback, useState } from 'react'
import Web3Utils from 'web3-utils'
import {
    useCurrentIdentity,
    useCurrentLinkedPersona,
    useLastRecognizedIdentity,
} from '../../../components/DataSource/useActivatedUI'
import Services from '../../../extension/service'
import { useI18N } from '../../../utils'
import { WalletMessages } from '../../Wallet/messages'
import { RedPacketMetaKey } from '../constants'
import { DialogTabs, RedPacketJSONPayload, RpTypeTabs } from '../types'
import type { RedPacketSettings } from './hooks/useCreateCallback'
import { RedPacketCreateNew } from './RedPacketCreateNew'

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
        height: 370,
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
    test: {
        backgroundColor: 'blue',
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
    const chainId = useChainId()
    const account = useAccount()
    const { classes } = useStyles()
    const { attachMetadata, dropMetadata } = useCompositionContext()
    const state = useState(DialogTabs.create)

    const [settings, setSettings] = useState<RedPacketSettings>()

    const onClose = useCallback(() => {
        if (step === CreateRedPacketPageStep.ConfirmPage) {
            setStep(CreateRedPacketPageStep.NewRedPacketPage)
            return
        }
        setStep(CreateRedPacketPageStep.NewRedPacketPage)
        setSettings(undefined)
        const [, setValue] = state
        setValue(DialogTabs.create)
        props.onClose()
    }, [props, state])

    const currentIdentity = useCurrentIdentity()

    const { value: linkedPersona } = useCurrentLinkedPersona()
    const lastRecognized = useLastRecognizedIdentity()
    const senderName =
        lastRecognized.identifier?.userId ?? currentIdentity?.identifier.userId ?? linkedPersona?.nickname
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
                    payload.password = await Services.Ethereum.personalSign(
                        Web3Utils.sha3(payload.sender.message) ?? '',
                        account,
                    )
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

    const handleCreated = useCallback(
        (payload: RedPacketJSONPayload) => {
            onCreateOrSelect(payload)
            setSettings(undefined)
        },
        [onCreateOrSelect],
    )

    const isCreateStep = step === CreateRedPacketPageStep.NewRedPacketPage
    const title = isCreateStep ? t('plugin_red_packet_display_name') : t('plugin_red_packet_details')

    return (
        <InjectedDialog open={props.open} title={title} onClose={onClose} disableTitleBorder>
            <DialogContent className={classes.dialogContent}>
                <RedPacketCreateNew
                    origin={settings}
                    onNext={onNext}
                    state={tokenState}
                    onClose={onClose}
                    onChange={onChange}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
