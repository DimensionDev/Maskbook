declare module 'idb/with-async-ittr' {
    export * from 'idb'
}
/**
 * IDBFactory v3
 */
interface IDBFactory {
    databases?(): Promise<Array<{ name: string; version: number }>>
}
