import { useCallback, useEffect, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { DialogContent, alpha } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useCurrentPersonaConnectStatus, InjectedDialog, PersonaAction } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_OBJECT, MaskMessages, currentPersonaIdentifier } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import type { CompositionType } from '@masknet/plugin-infra/content-script'
import Services from '#services'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'
import { useCurrentIdentity, useLastRecognizedIdentity } from '../DataSource/useActivatedUI.js'
import { CompositionDialogUI, type CompositionRef, E2EUnavailableReason } from './CompositionUI.js'
import { useCompositionClipboardRequest } from './useCompositionClipboardRequest.js'
import { useRecipientsList } from './useRecipientsList.js'
import { useSubmit } from './useSubmit.js'
import { usePersonasFromDB, useCurrentPersona } from '../../../shared-ui/hooks/index.js'
import { EncryptionMethodType } from './EncryptionMethodSelector.js'
import { Trans } from '@lingui/macro'

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
        background: alpha(theme.palette.maskColor.bottom, 0.8),
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
    const [initialMeta, setInitialMeta] = useState<Record<string, unknown>>(EMPTY_OBJECT)

    const [open, setOpen] = useState(false)
    const [isOpenFromApplicationBoard, setIsOpenFromApplicationBoard] = useState(false)

    const onClose = useCallback(() => {
        setOpen(false)
        setInitialMeta(EMPTY_OBJECT)

        UI.current?.reset()
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
            if (content) UI.current?.setMessage(content)
            if (options?.target) UI.current?.setEncryptionKind(options.target)
            if (options?.startupPlugin) UI.current?.startPlugin(options.startupPlugin, options.startupPluginProps)
        })
    }, [type])

    useEffect(() => {
        if (!open) return

        Telemetry.captureEvent(EventType.Access, EventID.EntryMaskComposeOpen)
        Telemetry.captureEvent(EventType.Interact, EventID.EntryMaskComposeVisibleAll)

        return MaskMessages.events.replaceComposition.on((message) => {
            if (!UI.current) return
            UI.current.setMessage(message)
        })
    }, [open])

    const onSubmit_ = useSubmit(onClose, reason)

    const UI = useRef<CompositionRef>(null)
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
            classes={{ paper: cx(classes.dialogRoot, !open ? classes.hideDialogRoot : '') }}
            open={open}
            onClose={onClose}
            title={<Trans>Encrypted Post</Trans>}
            independent>
            <DialogContent classes={{ root: classes.dialogContent }}>
                <CompositionDialogUI
                    type={type}
                    ref={UI}
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
