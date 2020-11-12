import React, { useState, useCallback } from 'react'
import { DialogContent } from '@material-ui/core'
import AbstractTab, { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import type { RedPacketJSONPayload } from '../types'
import { editActivatedPostMetadata } from '../../../social-network/ui'
import { RedPacketMetaKey } from '../constants'
import { useI18N } from '../../../utils/i18n-next-ui'
import { RedPacketForm } from './RedPacketForm'
import { RedPacketBacklogList } from './RedPacketList'
import { PortalShadowRoot } from '../../../utils/shadow-root/ShadowRootPortal'
import { useAccount } from '../../../web3/hooks/useAccount'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { RedPacketRPC } from '../helpers'

interface RedPacketDialogProps extends withClasses<never> {
    open: boolean
    onConfirm: (opt?: RedPacketJSONPayload | null) => void
    onDecline: () => void
}

export default function RedPacketDialog(props: RedPacketDialogProps) {
    const { t } = useI18N()
    const { onConfirm } = props

    const account = useAccount()
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
                p: 0,
            },
            {
                label: t('plugin_red_packet_select_existing'),
                children: <RedPacketBacklogList from={account} onSelect={onCreateOrSelect} />,
                p: 0,
            },
        ],
        state,
    }

    return (
        <InjectedDialog open={props.open} title={t('plugin_red_packet_display_name')} onExit={props.onDecline}>
            <DialogContent>
                <AbstractTab height={362} {...tabProps} />
            </DialogContent>
        </InjectedDialog>
    )
}
