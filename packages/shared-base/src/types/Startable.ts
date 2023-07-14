export interface Startable {
    ready: boolean
    readyPromise: Promise<void>
}
