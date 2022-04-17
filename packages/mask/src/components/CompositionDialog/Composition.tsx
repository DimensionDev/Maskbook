import { useCallback, useEffect, useState, useRef } from 'react'
import { DialogContent } from '@mui/material'
import { DialogStackingProvider } from '@masknet/theme'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network'
import { MaskMessages, useI18N } from '../../utils'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useFriendsList as useRecipientsList } from '../DataSource/useActivatedUI'
import { InjectedDialog } from '@masknet/shared'
import { CompositionDialogUI, CompositionRef } from './CompositionUI'
import { useCompositionClipboardRequest } from './useCompositionClipboardRequest'
import Services from '../../extension/service'
import { useSubmit } from './useSubmit'

export interface PostDialogProps {
    type?: 'popup' | 'timeline'
    requireClipboardPermission?: boolean
}
let openOnInitAnswered = false
export function Composition({ type = 'timeline', requireClipboardPermission }: PostDialogProps) {
    const { t } = useI18N()

    const [reason, setReason] = useState<'timeline' | 'popup' | 'reply'>('timeline')
    // #region Open
    const [open, setOpen] = useState(false)
    const onClose = useCallback(() => {
        setOpen(false)
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
        return CrossIsolationMessages.events.requestComposition.on(({ reason, open, content, options }) => {
            if (
                (reason !== 'reply' && reason !== type) ||
                (reason === 'reply' && type === 'popup') ||
                globalUIState.profiles.value.length <= 0
            )
                return
            setOpen(open)
            setReason(reason)
            if (content) UI.current?.setMessage(content)
            if (options?.target) UI.current?.setEncryptionKind(options.target)
            if (options?.startupPlugin) UI.current?.startPlugin(options.startupPlugin)
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
    return (
        <DialogStackingProvider>
            <InjectedDialog keepMounted open={open} onClose={onClose} title={t('post_dialog__title')}>
                <DialogContent>
                    <CompositionDialogUI
                        ref={UI}
                        hasClipboardPermission={hasClipboardPermission}
                        onRequestClipboardPermission={onRequestClipboardPermission}
                        requireClipboardPermission={requireClipboardPermission}
                        recipients={recipients}
                        maxLength={560}
                        onSubmit={onSubmit_}
                        supportImageEncoding={networkSupport?.text ?? false}
                        supportTextEncoding={networkSupport?.image ?? false}
                    />
                </DialogContent>
            </InjectedDialog>
        </DialogStackingProvider>
    )
}
