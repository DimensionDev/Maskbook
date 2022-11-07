export namespace ScamWarningAPI {
    export interface Info {
        name: string
        url: string
        path?: string
        category?: number
        subcategory?: number
        description: string
    }

    export interface Provider {
        getScamWarning(key: string): Promise<Info | undefined>
    }
}
