declare module 'idb/with-async-ittr-cjs' {
    export * from 'idb'
}
/**
 * IDBFactory v3
 */
interface IDBFactory {
    databases?(): Promise<Array<{ name: string; version: number }>>
}
type IF<Condition, True, False> = Condition extends true ? True : False
