import { useCallback, useEffect, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { DialogContent, alpha } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useCurrentPersonaConnectStatus, InjectedDialog, PersonaAction } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_OBJECT, MaskMessages, currentPersonaIdentifier } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import type { CompositionType } from '@masknet/plugin-infra/content-script'
import Services from '../../extension/service.js'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import { useCurrentIdentity, useLastRecognizedIdentity } from '../DataSource/useActivatedUI.js'
import { CompositionDialogUI, type CompositionRef, E2EUnavailableReason } from './CompositionUI.js'
import { useCompositionClipboardRequest } from './useCompositionClipboardRequest.js'
import { useRecipientsList } from './useRecipientsList.js'
import { useSubmit } from './useSubmit.js'
import { usePersonasFromDB } from '../DataSource/usePersonasFromDB.js'
import { useCurrentPersona } from '../DataSource/usePersonaConnectStatus.js'
import { EncryptionMethodType } from './EncryptionMethodSelector.js'
import { useI18N } from '../../utils/index.js'

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
export interface PostDialogProps {
    type?: CompositionType
    requireClipboardPermission?: boolean
}
let openOnInitAnswered = false
export function Composition({ type = 'timeline', requireClipboardPermission }: PostDialogProps) {
    const { t } = useI18N()
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
    const [initialMetas, setInitialMetas] = useState<Record<string, unknown>>(EMPTY_OBJECT)
    // #region Open
    const [open, setOpen] = useState(false)
    const [isOpenFromApplicationBoard, setIsOpenFromApplicationBoard] = useState(false)

    const onClose = useCallback(() => {
        setOpen(false)
        setInitialMetas(EMPTY_OBJECT)

        UI.current?.reset()
    }, [])

    useEffect(() => {
        if (openOnInitAnswered) return
        openOnInitAnswered = true
        Services.SocialNetwork.getDesignatedAutoStartPluginID().then((plugin) => {
            if (!plugin) return
            setOpen(true)
            UI.current?.startPlugin(plugin)
        })
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
            setInitialMetas(options?.initialMetas ?? EMPTY_OBJECT)
            if (content) UI.current?.setMessage(content)
            if (options?.target) UI.current?.setEncryptionKind(options.target)
            if (options?.startupPlugin) UI.current?.startPlugin(options.startupPlugin, options.startupPluginProps)
        })
    }, [type])
    useEffect(() => {
        if (!open) return

        return MaskMessages.events.replaceComposition.on((message) => {
            const ui = UI.current
            if (!ui) return
            UI.current.setMessage(message)
        })
    }, [open])
    // #endregion

    // #region submit
    const onSubmit_ = useSubmit(onClose, reason)
    // #endregion

    const UI = useRef<CompositionRef>(null)
    const networkSupport = activatedSocialNetworkUI.injection.newPostComposition?.supportedOutputTypes
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
            title={t('post_dialog__title')}
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
                    initialMetas={initialMetas}
                    personaAction={
                        persona ? (
                            <PersonaAction currentPersona={persona} classes={{ bottomFixed: classes.persona }} />
                        ) : null
                    }
                />
            </DialogContent>
        </InjectedDialog>
    )
}
