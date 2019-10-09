/// <reference types="web-ext-types" />

declare namespace NodeJS {
    interface ProcessEnv {
        readonly target: 'Chromium' | 'Firefox' | 'WKWebview' | undefined
        readonly firefoxVariant: 'android' | 'desktop' | 'GeckoView' | undefined
    }
}

interface Permissions {
    request(permission: { name: string }): Promise<PermissionStatus>
}
