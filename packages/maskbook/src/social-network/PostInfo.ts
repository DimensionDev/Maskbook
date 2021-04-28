import { PostInfo } from '@dimensiondev/mask-plugin-infra'
export { PostInfo }

export const emptyPostInfo: PostInfo = new (class extends PostInfo {
    commentBoxSelector = undefined
    commentsSelector = undefined
    rootNode = undefined!
    rootNodeProxy = undefined!
    postContentNode = undefined
})()
