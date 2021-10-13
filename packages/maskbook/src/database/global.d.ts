declare module 'idb/with-async-ittr-cjs' {
    export * from 'idb'
}

type IF<Condition, True, False> = Condition extends true ? True : False
/**
 * Magic variable, used to debug
 */
declare const __line: number
