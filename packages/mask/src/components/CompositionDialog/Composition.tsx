import { useCallback, useEffect, useState, useRef } from 'react'
import { DialogActions, DialogContent } from '@mui/material'
import { DialogStackingProvider, makeStyles } from '@masknet/theme'
import { activatedSocialNetworkUI } from '../../social-network'
import { MaskMessages, useI18N } from '../../utils'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useRecipientsList } from './useRecipientsList'
import { InjectedDialog } from '@masknet/shared'
import { CompositionDialogUI, CompositionRef, DisabledReason as E2EUnavailableReason } from './CompositionUI'
import { useCompositionClipboardRequest } from './useCompositionClipboardRequest'
import Services from '../../extension/service'
import { useSubmit } from './useSubmit'
import { useAsync } from 'react-use'
import { useCurrentIdentity } from '../DataSource/useActivatedUI'
import { useMyPersonas } from '../DataSource/useMyPersonas'
import { usePersonaConnectStatus } from '../DataSource/usePersonaConnectStatus'

const useStyles = makeStyles()((theme) => ({
    dialogRoot: {
        minWidth: 400,
        width: 600,
        boxShadow: 'none',
        backgroundImage: 'none',
        maxWidth: 'none',
    },
}))
export interface PostDialogProps {
    type?: 'popup' | 'timeline'
    requireClipboardPermission?: boolean
}
let openOnInitAnswered = false
export function Composition({ type = 'timeline', requireClipboardPermission }: PostDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const currentIdentity = useCurrentIdentity()?.identifier
    const connectStatus = usePersonaConnectStatus()
    const hasPersona = !!useMyPersonas().find((x) =>
        x.linkedProfiles.some((y) => y.identifier.network === currentIdentity?.network),
    )

    /** @deprecated */
    const { value: hasLocalKey } = useAsync(
        async () => (currentIdentity ? Services.Identity.hasLocalKey(currentIdentity) : false),
        [currentIdentity],
    )
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
            if ((reason !== 'reply' && reason !== type) || (reason === 'reply' && type === 'popup')) return
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
    const getE2eEncryptionDisabled = () => {
        if (!hasPersona) return E2EUnavailableReason.NoPersona
        if (!connectStatus.connected) return E2EUnavailableReason.NoConnect
        if (!hasLocalKey) return E2EUnavailableReason.NoLocalKey
        return undefined
    }

    return (
        <DialogStackingProvider>
            <InjectedDialog
                classes={{
                    paper: classes.dialogRoot,
                }}
                keepMounted
                open={open}
                onClose={onClose}
                title={t('post_dialog__title')}>
                <DialogContent>
                    <CompositionDialogUI
                        onConnect={connectStatus.action as any}
                        ref={UI}
                        hasClipboardPermission={hasClipboardPermission}
                        onRequestClipboardPermission={onRequestClipboardPermission}
                        requireClipboardPermission={requireClipboardPermission}
                        recipients={recipients}
                        maxLength={560}
                        onSubmit={onSubmit_}
                        supportImageEncoding={networkSupport?.text ?? false}
                        supportTextEncoding={networkSupport?.image ?? false}
                        e2eEncryptionDisabled={getE2eEncryptionDisabled()}
                    />
                </DialogContent>
                <DialogActions sx={{ height: 68 }} />
            </InjectedDialog>
        </DialogStackingProvider>
    )
}
