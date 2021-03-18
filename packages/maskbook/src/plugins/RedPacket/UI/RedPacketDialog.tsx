import { useState, useCallback } from 'react'
import { DialogContent } from '@material-ui/core'
import AbstractTab, { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import type { RedPacketJSONPayload } from '../types'
import { editActivatedPostMetadata } from '../../../protocols/typed-message/global-state'
import { RedPacketMetaKey } from '../constants'
import { useI18N } from '../../../utils/i18n-next-ui'
import { RedPacketForm } from './RedPacketForm'
import { RedPacketBacklogList } from './RedPacketList'
import { PortalShadowRoot } from '../../../utils/shadow-root/ShadowRootPortal'
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
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_red_packet_create_new'),
                children: (
                    <RedPacketForm onCreate={onCreateOrSelect} SelectMenuProps={{ container: PortalShadowRoot }} />
                ),
                sx: { p: 0 },
            },
            {
                label: t('plugin_red_packet_select_existing'),
                children: <RedPacketBacklogList onSelect={onCreateOrSelect} />,
                sx: { p: 0 },
            },
        ],
        state,
    }

    return (
        <InjectedDialog open={props.open} title={t('plugin_red_packet_display_name')} onClose={props.onClose}>
            <DialogContent>
                <AbstractTab height={300} {...tabProps} />
            </DialogContent>
        </InjectedDialog>
    )
}
