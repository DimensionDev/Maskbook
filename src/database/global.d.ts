import Web3 from 'web3'

declare module 'idb/with-async-ittr' {
    export * from 'idb'
}
/**
 * IDBFactory v3
 */
interface IDBFactory {
    databases?(): Promise<Array<{ name: string; version: number }>>
}
type IF<Condition, True, False> = Condition extends true ? True : False

declare global {
    interface Window {
        web3?: Web3
    }
}
