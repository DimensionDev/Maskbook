import { useState, useCallback } from 'react'
import { DialogContent } from '@material-ui/core'
import { usePortalShadowRoot } from '@dimensiondev/maskbook-shared'
import { useI18N } from '../../../utils'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import type { RedPacketJSONPayload } from '../types'
import { editActivatedPostMetadata } from '../../../protocols/typed-message/global-state'
import { RedPacketMetaKey } from '../constants'
import { RedPacketForm } from './RedPacketForm'
import { RedPacketBacklogList } from './RedPacketList'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { RedPacketRPC } from '../messages'

interface RedPacketDialogProps extends withClasses<never> {
    open: boolean
    onConfirm: (opt?: RedPacketJSONPayload | null) => void
    onClose: () => void
}

export default function RedPacketDialog(props: RedPacketDialogProps) {
    const { t } = useI18N()
    const { onConfirm } = props

    const onCreateOrSelect = useCallback(
        (payload: RedPacketJSONPayload) => {
            editActivatedPostMetadata((next) =>
                payload ? next.set(RedPacketMetaKey, payload) : next.delete(RedPacketMetaKey),
            )
            onConfirm(payload)
            // storing the created red packet in DB, it helps retrieve red packet password later
            RedPacketRPC.discoverRedPacket('', payload)
        },
        [onConfirm],
    )

    const state = useState(0)

    const onClose = useCallback(() => {
        const [, setValue] = state
        setValue(0)
        props.onClose()
    }, [props, state])

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_red_packet_create_new'),
                children: usePortalShadowRoot((container) => (
                    <RedPacketForm onCreate={onCreateOrSelect} SelectMenuProps={{ container }} />
                )),
                sx: { p: 0 },
            },
            {
                label: t('plugin_red_packet_select_existing'),
                children: <RedPacketBacklogList onSelect={onCreateOrSelect} onClose={onClose} />,
                sx: { p: 0 },
            },
        ],
        state,
    }

    return (
        <InjectedDialog open={props.open} title={t('plugin_red_packet_display_name')} onClose={onClose}>
            <DialogContent>
                <AbstractTab height={320} {...tabProps} />
            </DialogContent>
        </InjectedDialog>
    )
}
