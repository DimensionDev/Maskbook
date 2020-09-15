import { createTransaction } from '../../../database/helpers/openDB'
import { createWalletDBAccess } from './Wallet.db'
export async function migratePluginDatabase() {
    const db = createTransaction(await createWalletDBAccess(), 'readonly')('PluginStore')
    for await (const i of db.objectStore('PluginStore')) {
        if (i.value.plugin_id === 'com.maskbook.provide.co.gitcoin') {
            // GitCoin data is dropped
            // i.delete()
        }
        console.log(i)
    }
}
