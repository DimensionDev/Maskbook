/// <reference types="web-ext-types" />
/// <reference types="react/next" />
/// <reference types="react-dom/next" />
/// <reference path="./components/custom-ui.d.ts" />

declare module NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production'
        readonly STORYBOOK?: boolean
        readonly target: 'chromium' | 'firefox' | 'safari'
        readonly build: 'stable' | 'beta' | 'insider'
        readonly architecture: 'web' | 'app'
        /** fennec = stable firefox; geckoview = next generation firefox (used in Android App, in future it will become the default engine on Firefox for Android) */
        readonly firefoxVariant: 'fennec' | 'geckoview' | false
        /**
         * STRONGLY SUGGEST to make the app flexible as possible!
         * This value is the build time fallback for the screen size.
         * It DOESN't means the app MUST run in this size.
         */
        readonly resolution: 'desktop' | 'mobile'
        /**
         * Which version of Web Extension manifest
         */
        readonly manifest: 2 | 3

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

        /**
         * Web3 Constants
         */
        WEB3_CONSTANTS_RPC: string
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
