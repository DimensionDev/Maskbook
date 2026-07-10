export interface DetectorOptions {
    onlyBuiltIn?: boolean
    databaseUrl?: string
}

export declare class Detector {
    constructor(options?: DetectorOptions)
    checkUrlInBlacklist(url: string): Promise<boolean>
    checkAddressInBlacklist(address: string): Promise<boolean>
}
