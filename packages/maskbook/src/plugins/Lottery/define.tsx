import type { PluginConfig } from '../plugin'
import LotteryInDecryptedPost from './UI/LotteryInPost'
import React from 'react'
import { formatBalance } from '../Wallet/formatter'
import BigNumber from 'bignumber.js'
import { LotteryMetadataReader } from '../Lottery/utils'
import { LotteryMetaKey, LotteryPluginID } from './constants'
import type { LotteryJSONPayload } from './types'
import LotteryDialog from './UI/LotteryDialog'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import Services from '../../extension/service'

const [LotteryCompositionEntry, LotteryCompositionUI] = createCompositionDialog(
    '🎉 Lottery',
    (props) => (
        <LotteryDialog
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
export const LotteryPluginDefine: PluginConfig = {
    pluginName: 'Lottery',
    identifier: LotteryPluginID,
    successDecryptionInspector: function Comp(props) {
        if (!LotteryMetadataReader(props.message.meta).ok) return null
        return <LotteryInDecryptedPost {...props} />
    },
    postDialogMetadataBadge: new Map([
        [
            LotteryMetaKey,
            (payload: LotteryJSONPayload) => {
                return `A Lottery with ${formatBalance(
                    new BigNumber(payload.total_token),
                    payload.token?.decimals ?? 18,
                )} $${payload.token?.name || 'ETH'} from ${payload.sender.name}`
            },
        ],
    ]),
    pageInspector: LotteryCompositionUI,
    postDialogEntries: [LotteryCompositionEntry],
}
