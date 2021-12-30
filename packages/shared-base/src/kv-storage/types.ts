import type { Option } from 'ts-results'
export interface KVStorageBackend {
    setValue(key: string, value: unknown): Promise<void>
    getValue(key: string): Promise<Option<unknown>>
    beforeAutoSync: Promise<void>
}
