/// <reference types="web-ext-types" />
/// <reference types="react/next" />
/// <reference types="react-dom/next" />
/// <reference path="./components/custom-ui.d.ts" />

declare module NodeJS {
    interface ProcessEnv {
        /** test means Jest. Puppeteer test does not use "test".  */
        readonly NODE_ENV: 'development' | 'production' | 'test'
        readonly STORYBOOK?: boolean
        readonly target: 'chromium' | 'firefox' | 'safari' | 'E2E'
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

declare module 'eth-contract-metadata' {
    export interface TokenMetadata {
        decimals: number
        erc20?: boolean
        erc721?: boolean
        logo: string
        name: string
        symbol: string
    }
    const metadata: {
        [address: string]: TokenMetadata
    }
    export default metadata
}

declare module 'react-middle-ellipsis' {
    import React from 'react'
    interface ComponentProps {
        children?: React.ReactNode
    }
    const component: (props: ComponentProps) => JSX.Element
    export default component
}

declare module 'react-tilt' {
    import React from 'react'
    interface Options {
        reverse: boolean
        max: number
        perspective: number
        scale: number
        speed: number
        transition: boolean
        axis: 'X' | 'Y' | null
        glare: boolean
        'max-glare': number
        reset: boolean
        easing: string
    }
    interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
        options?: Partial<Options>
    }
    const component: (props: ComponentProps) => JSX.Element
    export default component
}

declare module 'ethereum-blockies' {
    export interface BlockieOptions {
        seed?: string // seed used to generate icon data, default: random
        color?: string // to manually specify the icon color, default: random
        bgcolor?: string // choose a different background color, default: white
        size?: number // width/height of the icon in blocks, default: 10
        scale?: number // width/height of each block in pixels, default: 5
    }

    export function create(options?: BlockieOptions): HTMLCanvasElement
}

declare module '*.png' {
    const content: string
    export default content
}

declare module '*.jpg' {
    const content: string
    export default content
}
