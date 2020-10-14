import type { PluginConfig } from '../plugin'
import LotteryInDecryptedPost from './UI/LotteryInPost'
import React from 'react'
import { formatBalance } from '../Wallet/formatter'
import BigNumber from 'bignumber.js'
import { LotteryMetadataReader } from '../Lottery/utils'
import { LotteryMetaKey, LotteryPluginID } from './constants'
import type { LotteryJSONPayload } from './types'

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
}
