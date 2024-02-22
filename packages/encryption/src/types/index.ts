export * from './Exception.js'
export type Readwrite<T> = {
    -readonly [key in keyof T]: T[key]
}
