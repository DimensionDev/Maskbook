import { useState, useCallback } from 'react'
import { DialogContent } from '@material-ui/core'
import { usePortalShadowRoot } from '@masknet/shared'
import { useI18N } from '../../../utils'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { RedPacketJSONPayload, DialogTabs } from '../types'
import { editActivatedPostMetadata } from '../../../protocols/typed-message/global-state'
import { RedPacketMetaKey } from '../constants'
import { RedPacketForm } from './RedPacketForm'
import { RedPacketHistoryList } from './RedPacketHistoryList'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import Services from '../../../extension/service'
import Web3Utils from 'web3-utils'
import { useAccount, useChainId } from '@masknet/web3-shared'

interface RedPacketDialogProps extends withClasses<never> {
    open: boolean
    onClose: () => void
}

export default function RedPacketDialog(props: RedPacketDialogProps) {
    const { t } = useI18N()
    const chainId = useChainId()
    const account = useAccount()

    const state = useState(DialogTabs.create)

    const onClose = useCallback(() => {
        const [, setValue] = state
        setValue(DialogTabs.create)
        props.onClose()
    }, [props, state])

    const onCreateOrSelect = useCallback(
        async (payload: RedPacketJSONPayload) => {
            if (payload.password === '') {
                if (payload.contract_version === 1) {
                    alert('Unable to share a red packet without a password. But you can still withdraw the red packet.')
                    payload.password = prompt('Please enter the password of the red packet:', '') ?? ''
                }

                if (payload.contract_version > 1) {
                    // just sign out the password if it is lost.
                    payload.password = await Services.Ethereum.personalSign(
                        Web3Utils.sha3(payload.sender.message) ?? '',
                        account,
                    )
                    payload.password = payload.password!.slice(2)
                }
            }

            editActivatedPostMetadata((next) =>
                payload ? next.set(RedPacketMetaKey, payload) : next.delete(RedPacketMetaKey),
            )
            onClose()
        },
        [onClose, chainId],
    )

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
                children: <RedPacketHistoryList onSelect={onCreateOrSelect} onClose={onClose} />,
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
