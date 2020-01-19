import React from 'react'
import { TypedMessageText, withMetadata } from '../../../extension/background-script/CryptoServices/utils'
import StructuredPluginWrapper from '../StructuredMessage/StructuredPluginWrapper'
import { RedPacketWithState, RedPacketState } from '../../../extension/options-page/DashboardComponents/RedPacket'
import { RedPacketRecord } from '../../../database/Plugins/Wallet/types'
import Services from '../../../extension/service'

export default function WithRedPacket(props: { renderItem?: TypedMessageText | null }) {
    const { renderItem } = props
    const [loading, setLoading] = React.useState(false)
    const onClick = async (state: RedPacketState, rpid: RedPacketRecord['red_packet_id']) => {
        if (state === 'pending' && rpid) {
            setLoading(true)
            Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets')
                .then(wallets => wallets[0]?.id || '')
                .then(wallet =>
                    Services.Plugin.invokePlugin(
                        'maskbook.red_packet',
                        'claimRedPacket',
                        { redPacketID: rpid },
                        wallet,
                    ),
                )
                .finally(() => setLoading(false))
        }
    }
    const Component = renderItem
        ? withMetadata(renderItem.meta, 'com.maskbook.red_packet:1', r => (
              <StructuredPluginWrapper width={400} pluginName="Red Packet">
                  <RedPacketWithState loading={loading} onClick={onClick} unknownRedPacket={r} />
              </StructuredPluginWrapper>
          ))
        : null
    return <>{Component}</>
}
