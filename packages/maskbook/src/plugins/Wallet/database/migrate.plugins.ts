import { createTransaction } from '../../../database/helpers/openDB'
import { RedPacketPluginID } from '../../RedPacket/constants'
import { RedPacketDatabase } from '../../RedPacket/Worker/database'
import type { RedPacketRecordInDatabase } from '../../RedPacket/types'
import { createWalletDBAccess } from './Wallet.db'

export async function migratePluginDatabase() {
    const ro_db = createTransaction(await createWalletDBAccess(), 'readonly')('PluginStore')
    const data = await ro_db.objectStore('PluginStore').getAll()
    // Don't mix two transactions
    for (const i of data) {
        if (i.plugin_id === RedPacketPluginID) {
            const rec = i.value as RedPacketRecordInDatabase
            await RedPacketDatabase.add({ ...rec, type: 'red-packet' })
        }
    }
    const rw_db = createTransaction(await createWalletDBAccess(), 'readwrite')('PluginStore')
    rw_db.objectStore('PluginStore').clear()
}
