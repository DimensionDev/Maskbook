/// <reference types="web-ext-types" />

declare const webpackEnv: {
    readonly target: 'Chromium' | 'Firefox' | 'WKWebview' | undefined
    readonly firefoxVariant: 'android' | 'desktop' | 'GeckoView' | undefined
}

interface Permissions {
    request(permission: { name: string }): Promise<PermissionStatus>
}
