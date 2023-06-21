import { useEffect } from 'react'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { RedPacket } from './RedPacket/index.js'
import { RedPacketRPC } from '../messages.js'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import type { RedPacketJSONPayload, RedPacketRecord } from '@masknet/web3-providers/types'
import { TransactionConfirmDialogProvider } from './context/TokenTransactionConfirmDialogContext.js'

export interface RedPacketInPostProps {
    payload: RedPacketJSONPayload
}

export function RedPacketInPost(props: RedPacketInPostProps) {
    const { payload } = props
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    // #region discover red packet
    const postIdentifier = usePostInfoDetails.identifier()
    const fromUrl = postIdentifier ? activatedSocialNetworkUI.utils.getPostURL?.(postIdentifier)?.toString() : undefined
    useEffect(() => {
        if (!fromUrl) return
        if (!payload.txid && payload.contract_version !== 1) return
        const record: RedPacketRecord = {
            id: payload.contract_version === 1 ? payload.rpid : payload.txid,
            from: fromUrl,
            password: payload.password,
            contract_version: payload.contract_version,
        }
        RedPacketRPC.addRedPacket(record, chainId)
    }, [fromUrl, chainId])
    // #endregion

    return (
        <TransactionConfirmDialogProvider>
            <RedPacket payload={payload} />
        </TransactionConfirmDialogProvider>
    )
}
