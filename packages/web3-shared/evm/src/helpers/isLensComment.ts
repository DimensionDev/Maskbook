const NORMAL_COMMENT_RE = /^Comment by @.*\.lens$/u
const ADMIN_COMMENT_RE = /^Comment by @lensprotocol$/u
// May be not `quoted` comment but something else
const QUOTED_COMMENT_RE = /^Comment by @\w+$/u

export function isLensComment(name: string) {
    return NORMAL_COMMENT_RE.test(name) || ADMIN_COMMENT_RE.test(name) || QUOTED_COMMENT_RE.test(name)
}
