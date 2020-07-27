import type { RedPacketRecordInDatabase } from './database/types'
import { createPluginWalletAccess } from '../../database/Plugin/wrap-wallet-for-plugin'
import type { _UnboxPromise } from 'async-call-rpc/full'
export const createRedPacketTransaction = createPluginWalletAccess<RedPacketRecordInDatabase, [string]>(
    'com.maskbook.redpacket',
)({ red_packet_id: 0 }, 'id')
export type RedPacketPluginReificatedWalletDBReadOnly = _UnboxPromise<ReturnType<typeof ro>>
export type RedPacketPluginReificatedWalletDBReadWrite = _UnboxPromise<ReturnType<typeof rw>>
function ro() {
    return createRedPacketTransaction('readonly')
}
function rw() {
    return createRedPacketTransaction('readwrite')
}
