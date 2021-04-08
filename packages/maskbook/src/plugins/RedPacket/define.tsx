import { PluginConfig, PluginStage, PluginScope } from '../types'
import { RedPacketInspector } from './UI/RedPacketInspector'
import { formatBalance } from '../Wallet/formatter'
import BigNumber from 'bignumber.js'
import { RedPacketMetadataReader } from './helpers'
import { RedPacketMetaKey, RedPacketPluginID } from './constants'
import type { RedPacketJSONPayload } from './types'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import RedPacketDialog from './UI/RedPacketDialog'
import Services from '../../extension/service'
import { WalletRPC } from '../Wallet/messages'

export const [RedPacketCompositionEntry, RedPacketCompositionUI] = createCompositionDialog(
    '💰 Red Packet',
    (props) => (
        <RedPacketDialog
            // classes={classes}
            // DialogProps={props.DialogProps}
            open={props.open}
            onConfirm={props.onClose}
            onClose={props.onClose}
        />
    ),
    async () => {
        const wallets = await WalletRPC.getWallets()
        if (wallets.length) return true
        else {
            Services.Provider.requestConnectWallet()
            return false
        }
    },
)
export const RedPacketPluginDefine: PluginConfig = {
    ID: RedPacketPluginID,
    pluginName: 'Red Packet',
    identifier: RedPacketPluginID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
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
                    payload.token?.decimals ?? 0,
                    payload.token?.decimals ?? 0,
                )} $${payload.token?.name || 'ETH'} from ${payload.sender.name}`
            },
        ],
    ]),
    PageComponent: RedPacketCompositionUI,
    postDialogEntries: [RedPacketCompositionEntry],
}
