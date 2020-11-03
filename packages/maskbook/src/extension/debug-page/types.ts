export interface BackupFormat {
    buildInfo: Record<string, string | boolean | undefined>
    instances: Instance[]
}

export interface Instance {
    name: string
    version: number
    stores: Map<string, ObjectStore>
}

export interface ObjectStore {
    indexes: Index[]
    keyPath: IDBObjectStoreParameters['keyPath']
    autoIncrement: IDBObjectStoreParameters['autoIncrement']
    records: Map<any, unknown>
}

export interface Index {
    name: IDBIndex['name']
    unique: IDBIndex['unique']
    multiEntry: IDBIndex['multiEntry']
    keyPath: IDBIndex['keyPath']
}
