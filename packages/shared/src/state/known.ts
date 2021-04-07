/**
 * All known state. Note clients should handle unknown state gracefully.
 */
export interface PersistentStateStore {
    debugMode: boolean
}
export interface NamespacedBinding {
    currentImagePayloadStatus: 'test'
}
