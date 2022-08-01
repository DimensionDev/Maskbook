declare module 'web-ext' {
    export default { cmd, main }
    export const cmd: {
        build: (
            params: BuildParams,
            options?: BuildOptions,
        ) => Promise<{
            extensionPath: string
        }>
    }
    export const main: any

    export interface BuildParams {
        sourceDir: string
        artifactsDir: string
        asNeeded?: boolean | undefined
        overwriteDest?: boolean | undefined
        ignoreFiles?: string[] | undefined
        filename?: string | undefined
    }
    export interface BuildOptions {
        manifestData
        createFileFilter
        fileFilter
        onSourceChange
        packageCreator
        showReadyMessage
    }
}
