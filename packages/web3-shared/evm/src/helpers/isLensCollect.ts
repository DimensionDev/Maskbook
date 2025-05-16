const NORMAL_COLLECT_RE = /\.lens-Collect-\d+$/u
const ADMIN_COLLECT_RE = /^lensprotocol-Collect-\d+$/u

export function isLensCollect(name: string) {
    return NORMAL_COLLECT_RE.test(name) || ADMIN_COLLECT_RE.test(name)
}
