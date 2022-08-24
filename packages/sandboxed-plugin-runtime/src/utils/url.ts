export function getURL(id: string, path: string, isLocal: boolean) {
    const pluginOrigin = (isLocal ? 'local-plugin-' : 'plugin-') + id
    const u = new URL(path, 'https://' + pluginOrigin)
    u.protocol = 'mask-modules:'
    return u.toString()
}
