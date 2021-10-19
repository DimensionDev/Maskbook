/// <reference types="web-ext-types" />
/// <reference types="react/next" />
/// <reference types="react-dom/next" />
/// <reference path="./components/custom-ui.d.ts" />

declare module NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production'
        readonly engine: 'chromium' | 'firefox' | 'safari'
        readonly channel: 'stable' | 'beta' | 'insider'
        readonly architecture: 'web' | 'app'

        /**
         * Debug flags
         */
        BUILD_DATE: string
        VERSION: string
        TAG_NAME: string
        COMMIT_HASH: string
        COMMIT_DATE: string
        REMOTE_URL: string
        BRANCH_NAME: string
        DIRTY: boolean
        TAG_DIRTY: boolean
    }
}

interface Clipboard extends EventTarget {
    write(data: ClipboardItem[]): Promise<void>
}

declare class ClipboardItem {
    constructor(data: { [mimeType: string]: Blob })
}

interface Permissions {
    request(permission: { name: PermissionName }): Promise<PermissionStatus>
}

declare module 'react-middle-ellipsis' {
    import React from 'react'
    interface ComponentProps {
        children?: React.ReactNode
    }
    const component: (props: ComponentProps) => JSX.Element
    export default component
}
