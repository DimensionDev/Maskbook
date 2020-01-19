import React from 'react'
import { TypedMessageText, withMetadata } from '../../../extension/background-script/CryptoServices/utils'
import StructuredPluginWrapper from '../StructuredMessage/StructuredPluginWrapper'
import { RedPacketWithState } from '../../../extension/options-page/DashboardComponents/RedPacket'
import { RedPacketRecord, RedPacketStatus } from '../../../database/Plugins/Wallet/types'
import Services from '../../../extension/service'
import { PostIdentifier, ProfileIdentifier } from '../../../database/type'
import { getPostUrl } from '../../../social-network-provider/twitter.com/utils/url'

interface WithRedPacketProps {
    renderItem?: TypedMessageText | null
    postIdentifier?: PostIdentifier<ProfileIdentifier>
}

export default function WithRedPacket(props: WithRedPacketProps) {
    const { renderItem, postIdentifier } = props
    const [loading, setLoading] = React.useState(false)
    const onClick = async (state: RedPacketStatus, rpid: RedPacketRecord['red_packet_id']) => {
        if ((state === 'incoming' || state === 'normal') && rpid) {
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
                  <RedPacketWithState
                      loading={loading}
                      onClick={onClick}
                      unknownRedPacket={r}
                      from={postIdentifier ? getPostUrl(postIdentifier) : ''}
                  />
              </StructuredPluginWrapper>
          ))
        : null
    return <>{Component}</>
}
