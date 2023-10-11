export namespace ScamWarningAPI {
    export interface Info {
        name: string
        url: string
        path?: string
        category?: string
        subcategory?: string
        description?: string
    }

    export interface Provider {
        getScamWarning(key: string): Promise<Info | undefined>
        getScamWarnings(keys: string[]): Promise<Info[] | undefined>
    }
}
