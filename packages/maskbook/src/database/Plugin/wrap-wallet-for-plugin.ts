import { createTransaction, IDBPSafeTransaction } from '../helpers/openDB'
import { createWalletDBAccess, WalletDB } from '../../plugins/Wallet/database/Wallet.db'
import { unwrap, IDBPTransaction, IndexKey } from 'idb/with-async-ittr-cjs'

type AllKeys = 0 | 1 | 2
/** @deprecated */
export type PluginReificatedWalletDB<
    Data,
    Index extends [IDBValidKey?, IDBValidKey?, IDBValidKey?],
    Mode extends 'readonly' | 'readwrite',
> = IDBPSafeTransaction<WalletDB<Data, Index>, ['ERC20Token', 'PluginStore', 'Wallet'], Mode>
/** @deprecated Because with exotic wallet, it is impossible to keep consistency state with the wallet. */
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
            return this.objectStore('PluginStore').add(_wrap(data))
        }
        function getByIndex<K extends keyof IndexMap>(
            this: ROT,
            index: K,
            key: IndexKey<T<'readonly'>, 'PluginStore', K extends string ? K : never>,
        ) {
            return this.objectStore('PluginStore')
                .index(indexMap[index]!)
                .getAll(key as any)
                .then((x) => x.filter((y) => y.plugin_id === pluginID))
                .then(unwrapArray)
                .then((x) => x[0])
        }
        function get(this: ROT, id: string) {
            return this.objectStore('PluginStore').get(`${pluginID}:${id}`).then(_unwrap)
        }
        function put(this: RWT, data: Data) {
            return this.objectStore('PluginStore').put(_wrap(data))
        }
        function getAll(this: ROT) {
            return this.objectStore('PluginStore').index('plugin_id').getAll().then(unwrapArray)
        }
        const extraMethods = { add, getByIndex, getAll, get, put }
        async function createPluginTransaction<Mode extends 'readonly' | 'readwrite'>(
            mode: Mode,
        ): Promise<T<Mode> & typeof extraMethods> {
            const t = createTransaction(await createWalletDBAccess(), mode)('ERC20Token', 'PluginStore', 'Wallet')
            const origT = unwrap(t as any as IDBPTransaction<any, any>)
            // @ts-ignore
            Object.entries(extraMethods).map(([k, v]) => (origT[k] = v.bind(t)))
            return t as any
        }
        return createPluginTransaction

        function _wrap(data: Data) {
            const obj = {
                plugin_id: pluginID,
                record_id: `${pluginID}:${data[keyOfUniqueIDInData]}`,
                value: data,
            }
            Object.entries(indexMap).forEach(([key, index]) => {
                // @ts-ignore
                obj['index' + index] = data[key]
            })
            return obj
        }
    }
}

function unwrapArray<Data>(x: { value: Data }[]) {
    return x.map((x) => x.value)
}
function _unwrap<Data>(x?: { value: Data }) {
    return x?.value
}
