import Services from '#services'
import { Trans } from '@lingui/react/macro'
import type { CompositionType } from '@masknet/plugin-infra/content-script'
import { InjectedDialog, PersonaAction, useCurrentPersonaConnectStatus } from '@masknet/shared'
import {
    CrossIsolationMessages,
    EMPTY_OBJECT,
    MaskMessages,
    RedPacketMetaKey,
    SolanaRedPacketMetaKey,
    currentPersonaIdentifier,
} from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { alpha, makeStyles } from '@masknet/theme'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { DialogContent } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { useCurrentPersona, usePersonasFromDB } from '../../../shared-ui/hooks/index.js'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'
import { useCurrentIdentity, useLastRecognizedIdentity } from '../DataSource/useActivatedUI.js'
import { CompositionDialogUI, type CompositionRef, E2EUnavailableReason } from './CompositionUI.js'
import { EncryptionMethodType } from './EncryptionMethodSelector.js'
import { useCompositionClipboardRequest } from './useCompositionClipboardRequest.js'
import { useRecipientsList } from './useRecipientsList.js'
import { useSubmit } from './useSubmit.js'

const useStyles = makeStyles()((theme) => ({
    dialogRoot: {
        minWidth: 400,
        width: 600,
        boxShadow: 'none',
        backgroundImage: 'none',
        maxWidth: 'none',
    },
    hideDialogRoot: {
        visibility: 'hidden',
    },
    dialogContent: {
        padding: 0,
    },
    persona: {
        padding: 0,
        background: alpha(theme.vars.palette.maskColor.bottom, 0.8),
        width: 'auto',
        boxShadow: 'none',
    },
}))

interface PostDialogProps {
    type?: CompositionType
    requireClipboardPermission?: boolean
}

export function Composition({ type = 'timeline', requireClipboardPermission }: PostDialogProps) {
    const { classes, cx } = useStyles()
    const currentIdentity = useCurrentIdentity()?.identifier
    const allPersonas = usePersonasFromDB()
    const lastRecognized = useLastRecognizedIdentity()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { value: connectStatus } = useCurrentPersonaConnectStatus(
        allPersonas,
        currentIdentifier,
        Services.Helper.openDashboard,
        lastRecognized,
    )
    /** @deprecated */
    const { value: hasLocalKey } = useAsync(
        async () => (currentIdentity ? Services.Identity.hasLocalKey(currentIdentity) : false),
        [currentIdentity, connectStatus],
    )

    const [reason, setReason] = useState<'timeline' | 'popup' | 'reply'>('timeline')
    const [initialMeta, setInitialMeta] = useState<{ [property: string]: unknown }>(EMPTY_OBJECT)

    const [open, setOpen] = useState(false)
    const [isOpenFromApplicationBoard, setIsOpenFromApplicationBoard] = useState(false)

    const onClose = useCallback(() => {
        setOpen(false)
        setInitialMeta(EMPTY_OBJECT)

        uiRef.current?.reset()
    }, [])

    const { onQueryClipboardPermission, hasClipboardPermission, onRequestClipboardPermission } =
        useCompositionClipboardRequest(requireClipboardPermission || false)

    useEffect(() => {
        return MaskMessages.events.requestExtensionPermission.on(() => onQueryClipboardPermission?.())
    }, [onQueryClipboardPermission])

    useEffect(() => {
        return CrossIsolationMessages.events.compositionDialogEvent.on(({ reason, open, content, options }) => {
            if ((reason !== 'reply' && reason !== type) || (reason === 'reply' && type === 'popup')) return

            setOpen(open)
            setReason(reason)
            setIsOpenFromApplicationBoard(!!options?.isOpenFromApplicationBoard)
            setInitialMeta(options?.initialMeta ?? EMPTY_OBJECT)
            if (content) uiRef.current?.setMessage(content)
            if (options?.target) uiRef.current?.setEncryptionKind(options.target)
            if (options?.startupPlugin) uiRef.current?.startPlugin(options.startupPlugin, options.startupPluginProps)
        })
    }, [type])

    useEffect(() => {
        if (!open) return

        Telemetry.captureEvent(EventType.Access, EventID.EntryMaskComposeOpen)
        Telemetry.captureEvent(EventType.Interact, EventID.EntryMaskComposeVisibleAll)

        return MaskMessages.events.replaceComposition.on((message) => {
            if (!uiRef.current) return
            uiRef.current.setMessage(message)
        })
    }, [open])

    const hasRedpacket = Object.keys(initialMeta).some((x) => [RedPacketMetaKey, SolanaRedPacketMetaKey].includes(x))
    const onSubmit_ = useSubmit(onClose, reason, hasRedpacket)

    const uiRef = useRef<CompositionRef>(null)
    const networkSupport = activatedSiteAdaptorUI!.injection.newPostComposition?.supportedOutputTypes
    const recipients = useRecipientsList()
    const isE2E_Disabled = (encode: EncryptionMethodType) => {
        if (!connectStatus.currentPersona && !connectStatus.hasPersona) return E2EUnavailableReason.NoPersona
        if (!connectStatus.connected && connectStatus.hasPersona) return E2EUnavailableReason.NoConnection
        if (!hasLocalKey && encode === EncryptionMethodType.Image) return E2EUnavailableReason.NoLocalKey
        return
    }
    const persona = useCurrentPersona()

    return (
        <InjectedDialog
            classes={{ paper: cx(classes.dialogRoot, open ? '' : classes.hideDialogRoot) }}
            open={open}
            onClose={onClose}
            title={<Trans>Encrypted Post</Trans>}
            independent>
            <DialogContent classes={{ root: classes.dialogContent }}>
                <CompositionDialogUI
                    type={type}
                    ref={uiRef}
                    hasClipboardPermission={hasClipboardPermission}
                    onRequestClipboardPermission={onRequestClipboardPermission}
                    requireClipboardPermission={requireClipboardPermission}
                    recipients={recipients}
                    maxLength={560}
                    onSubmit={onSubmit_}
                    supportImageEncoding={networkSupport?.text ?? false}
                    supportTextEncoding={networkSupport?.image ?? false}
                    e2eEncryptionDisabled={isE2E_Disabled}
                    isOpenFromApplicationBoard={isOpenFromApplicationBoard}
                    initialMeta={initialMeta}
                    personaAction={
                        persona ?
                            <PersonaAction currentPersona={persona} classes={{ bottomFixed: classes.persona }} />
                        :   null
                    }
                />
            </DialogContent>
        </InjectedDialog>
    )
}
