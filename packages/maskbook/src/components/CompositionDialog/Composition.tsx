import { DialogContent } from '@material-ui/core'
import { useRef } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { RedPacketMetadataReader } from '../../plugins/RedPacket/SNSAdaptor/helpers'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network'
import { MaskMessage, useI18N } from '../../utils'
import { useFriendsList as useRecipientsList } from '../DataSource/useActivatedUI'
import { InjectedDialog } from '../shared/InjectedDialog'
import { CompositionDialogUI, CompositionRef } from './CompositionUI'
import { useCompositionClipboardRequest } from './useCompositionClipboardRequest'
import { useSubmit } from './useSubmit'

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
        return MaskMessage.events.requestComposition.on(({ reason, open, content, options }) => {
            if (reason !== type || globalUIState.profiles.value.length <= 0) return
            setOpen(open)
            if (content) UI.current?.setMessage(content)
            if (options?.target) UI.current?.setEncryptionKind(options.target)
            if (options?.startupPlugin) UI.current?.startPlugin(options.startupPlugin)
        })
    }, [type])
    //#endregion

    const [disableE2E, setDisableE2E] = useState(false)
    const UI = useRef<CompositionRef>(null)

    const networkSupport = activatedSocialNetworkUI.injection.newPostComposition?.supportedOutputTypes
    return (
        <InjectedDialog keepMounted open={open} onClose={onClose} title={t('post_dialog__title')}>
            <DialogContent>
                <CompositionDialogUI
                    ref={UI}
                    {...useCompositionClipboardRequest(requireClipboardPermission || false)}
                    disabledRecipients={disableE2E ? 'E2E' : undefined}
                    recipients={useRecipientsList()}
                    maxLength={560}
                    onSubmit={useSubmit(onClose)}
                    onChange={(message) => {
                        // TODO: move into the plugin system
                        const hasRedPacket = RedPacketMetadataReader(message.meta).ok
                        const shouldDisableE2E = hasRedPacket
                        setDisableE2E(shouldDisableE2E)
                    }}
                    supportImageEncoding={networkSupport?.text ?? false}
                    supportTextEncoding={networkSupport?.image ?? false}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
