import { getAvatarId } from './user.js'

export function getInjectNodeInfo(element: HTMLImageElement) {
    const avatarId = getAvatarId(element.src)

    if (!avatarId) return

    // instagram bug, when page routing is switched, the avatar size on the timeline will initially be 150.
    return {
        element,
        width: element.width === 150 ? 32 : element.width,
        height: element.height === 150 ? 32 : element.height,
        avatarId,
    }
}
