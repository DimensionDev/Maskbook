import type { PluginConfig } from '../plugin'
import { RedPacketInspector } from './UI/RedPacketInspector'
import React from 'react'
import { formatBalance } from '../Wallet/formatter'
import BigNumber from 'bignumber.js'
import { RedPacketMetadataReader } from './helpers'
import { RedPacketMetaKey, RedPacketPluginID } from './constants'
import type { RedPacketJSONPayload } from './types'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import RedPacketDialog from './UI/RedPacketDialog'
import Services from '../../extension/service'

const [RedPacketCompositionEntry, RedPacketCompositionUI] = createCompositionDialog(
    '💰 Red Packet',
    (props) => (
        <RedPacketDialog
            // classes={classes}
            // DialogProps={props.DialogProps}
            open={props.open}
            onConfirm={props.onClose}
            onDecline={props.onClose}
        />
    ),
    async () => {
        const wallets = await Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets')
        if (wallets.length) return true
        else {
            Services.Provider.requestConnectWallet()
            return false
        }
    },
)
export const RedPacketPluginDefine: PluginConfig = {
    pluginName: 'Red Packet',
    identifier: RedPacketPluginID,
    successDecryptionInspector: function Comp(props) {
        if (!RedPacketMetadataReader(props.message.meta).ok) return null
        return <RedPacketInspector {...props} />
    },
    postDialogMetadataBadge: new Map([
        [
            RedPacketMetaKey,
            (payload: RedPacketJSONPayload) => {
                return `A Red Packet with ${formatBalance(
                    new BigNumber(payload.total),
                    payload.token?.decimals ?? 18,
                )} $${payload.token?.name || 'ETH'} from ${payload.sender.name}`
            },
        ],
    ]),
    pageInspector: RedPacketCompositionUI,
    postDialogEntries: [RedPacketCompositionEntry],
}
