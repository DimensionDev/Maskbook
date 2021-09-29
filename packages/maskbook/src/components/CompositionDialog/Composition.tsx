import { DialogContent } from '@material-ui/core'
import { useRef } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network'
import { MaskMessages, useI18N } from '../../utils'
import { useFriendsList as useRecipientsList } from '../DataSource/useActivatedUI'
import { InjectedDialog } from '../shared/InjectedDialog'
import { CompositionDialogUI, CompositionRef } from './CompositionUI'
import { useCompositionClipboardRequest } from './useCompositionClipboardRequest'
import { useSubmit } from './useSubmit'
import { DialogStackingProvider } from '@masknet/theme'

export interface PostDialogProps {
    type?: 'popup' | 'timeline'
    requireClipboardPermission?: boolean
}
export function Composition({ type = 'timeline', requireClipboardPermission }: PostDialogProps) {
    const { t } = useI18N()

    //#region Open
    const [open, setOpen] = useState(false)
    const onClose = useCallback(() => {
        setOpen(false)
        UI.current?.reset()
    }, [])
    useEffect(() => {
        return MaskMessages.events.requestComposition.on(({ reason, open, content, options }) => {
            if (reason !== type || globalUIState.profiles.value.length <= 0) return
            setOpen(open)
            if (content) UI.current?.setMessage(content)
            if (options?.target) UI.current?.setEncryptionKind(options.target)
            if (options?.startupPlugin) {
                setTimeout(() => {
                    // HACK: Because of we're using DialogStackingProvider,
                    // we need to avoid opening multiple dialogs in the same time to make them
                    // stacked in the right order.
                    UI.current?.startPlugin(options.startupPlugin!)
                }, 200)
            }
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
    //#endregion

    const UI = useRef<CompositionRef>(null)

    const networkSupport = activatedSocialNetworkUI.injection.newPostComposition?.supportedOutputTypes
    return (
        <DialogStackingProvider>
            <InjectedDialog keepMounted open={open} onClose={onClose} title={t('post_dialog__title')}>
                <DialogContent>
                    <CompositionDialogUI
                        ref={UI}
                        {...useCompositionClipboardRequest(requireClipboardPermission || false)}
                        recipients={useRecipientsList()}
                        maxLength={560}
                        onSubmit={useSubmit(onClose)}
                        supportImageEncoding={networkSupport?.text ?? false}
                        supportTextEncoding={networkSupport?.image ?? false}
                    />
                </DialogContent>
            </InjectedDialog>
        </DialogStackingProvider>
    )
}
