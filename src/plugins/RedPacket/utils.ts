import { createTypedMessageMetadataReader, createRenderWithMetadata } from '../../protocols/typed-message/metadata'
import type { EthereumNetwork, EthereumTokenType, ERC20TokenRecord } from '../Wallet/database/types'

/** DON'T CHANGE IT. */
export const RedPacketMetaKey = 'com.maskbook.red_packet:1'
export const RedPacketMetadataReader = createTypedMessageMetadataReader<RedPacketJSONPayload>(RedPacketMetaKey)
export const renderWithRedPacketMetadata = createRenderWithMetadata(RedPacketMetadataReader)
export interface RedPacketJSONPayload {
    contract_version: number
    contract_address: string
    rpid: string
    password: string
    shares: number
    sender: {
        address: string
        name: string
        message: string
    }
    is_random: boolean
    total: string
    creation_time: number
    duration: number
    network?: EthereumNetwork
    token_type: EthereumTokenType
    token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
}
