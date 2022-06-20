import { useEffect } from 'react'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { RedPacket } from './RedPacket'
import { RedPacketRPC } from '../messages'
import { activatedSocialNetworkUI } from '../../../social-network'
import type { RedPacketJSONPayload, RedPacketRecord } from '../types'

export interface RedPacketInPostProps {
    payload: RedPacketJSONPayload
}

export function RedPacketInPost(props: RedPacketInPostProps) {
    const { payload } = props
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    // #region discover red packet
    const postIdentifier = usePostInfoDetails.identifier()
    const fromUrl = postIdentifier ? activatedSocialNetworkUI.utils.getPostURL?.(postIdentifier)?.toString() : undefined
    useEffect(() => {
        if (!fromUrl) return
        if (!payload.txid && payload.contract_version !== 1) return
        const record: RedPacketRecord = {
            id: payload.contract_version === 1 ? payload.rpid : payload.txid!,
            from: fromUrl,
            password: payload.password,
            contract_version: payload.contract_version,
        }
        RedPacketRPC.discoverRedPacket(record, chainId)
    }, [fromUrl, chainId])
    // #endregion

    return <RedPacket payload={payload} />
}
