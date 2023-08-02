const NORMAL_COLLECT_RE = /\.lens-Collect-\d+$/
const ADMIN_COLLECT_RE = /^lensprotocol-Collect-\d+$/

export function isLensCollect(name: string) {
    return NORMAL_COLLECT_RE.test(name) || ADMIN_COLLECT_RE.test(name)
}
