const NORMAL_POST_RE = /^Post by @.*\.lens$/
const ADMIN_POST_RE = /^Post by @lensprotocol$/
const GENESIS_POST_RE = /Genesis post - \w+.lens/
// May be not `quoted` post but something else
const QUOTED_POST_RE = /^Post by @\w+$/

export function isLensPost(name: string) {
    return (
        NORMAL_POST_RE.test(name) || ADMIN_POST_RE.test(name) || GENESIS_POST_RE.test(name) || QUOTED_POST_RE.test(name)
    )
}
