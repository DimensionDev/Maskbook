import { createTransaction, IDBPSafeTransaction } from '../database/helpers/openDB'
import { createWalletDBAccess, WalletDB } from './Wallet/database/Wallet.db'

type AllKeys = 0 | 1 | 2
export type PluginReificatedWalletDB<
    Data,
    Index extends [IDBValidKey?, IDBValidKey?, IDBValidKey?],
    Mode extends 'readonly' | 'readwrite'
> = IDBPSafeTransaction<WalletDB<Data, Index>, ['ERC20Token', 'PluginStore', 'Wallet'], Mode>
export function createPluginWalletAccess<Data, Index extends [IDBValidKey?, IDBValidKey?, IDBValidKey?]>(
    pluginID: string,
) {
    return <IndexMap extends { [key in keyof Data]?: AllKeys }>(
        indexMap: IndexMap,
        keyOfUniqueIDInData: keyof Data,
    ) => {
        type T<Mode extends 'readonly' | 'readwrite'> = PluginReificatedWalletDB<Data, Index, Mode>
        type ROT = T<'readonly'>
        type RWT = T<'readwrite'>
        function add(this: RWT, data: Data) {
            return this.objectStore('PluginStore').add(wrap(data))
        }
        function index<K extends keyof IndexMap>(this: ROT, index: K) {
            const finalIndex = indexMap[index]
            return this.objectStore('PluginStore').index(finalIndex!)
        }
        function get(this: ROT, id: string) {
            return this.objectStore('PluginStore').get(`${pluginID}:${id}`).then(unwrap)
        }
        function put(this: ROT, data: Data) {
            return this.objectStore('PluginStore').put(wrap(data))
        }
        function getAll(this: ROT) {
            return this.objectStore('PluginStore').index('plugin_id').getAll().then(unwrapArray)
        }
        const extraMethods = { add, index, getAll, get, put }
        async function createPluginTransaction<Mode extends 'readonly' | 'readwrite'>(
            mode: Mode,
        ): Promise<T<Mode> & typeof extraMethods> {
            const t = createTransaction(await createWalletDBAccess(), mode)('ERC20Token', 'PluginStore', 'Wallet')
            Object.assign(t, extraMethods)
            return t as any
        }
        return createPluginTransaction

        function wrap(data: Data) {
            const obj = {
                plugin_id: pluginID,
                record_id: `${pluginID}:${data[keyOfUniqueIDInData]}`,
                value: data,
            }
            Object.entries(indexMap).forEach(([key, index]) => {
                // @ts-ignore
                obj[index] = data[index]
            })
            return obj
        }
        function unwrap(x?: { value: Data }) {
            return x?.value
        }
        function unwrapArray(x: { value: Data }[]) {
            return x.map((x) => x.value)
        }
    }
}
