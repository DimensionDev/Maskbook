interface Clipboard extends EventTarget {
    write(data: ClipboardItem[]): Promise<void>
}

interface Permissions {
    request(permission: { name: PermissionName }): Promise<PermissionStatus>
}

interface ImportMeta {
    /**
     * `import.meta.url` is the `file:` url of the current file (similar to `__filename` but as file url)
     */
    url: string
}

interface ShadowRoot {
    adoptedStyleSheets?: readonly CSSStyleSheet[]
}
interface CSSStyleSheet {
    replace(text: string): Promise<void>
    replaceSync(text: string): void
}
