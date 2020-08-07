export interface BackupFormat {
    buildInfo: Record<string, string | undefined>
    instances: Instance[]
}

export interface Instance {
    name: string
    version: number
    stores: Record<string, ObjectStore>
}

export interface ObjectStore {
    indexes: Index[]
    keyPath: IDBObjectStoreParameters['keyPath']
    autoIncrement: IDBObjectStoreParameters['autoIncrement']
    records: [any, unknown][]
}

export interface Index {
    name: IDBIndex['name']
    unique: IDBIndex['unique']
    multiEntry: IDBIndex['multiEntry']
    keyPath: IDBIndex['keyPath']
}
