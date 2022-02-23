import { getAvatarId } from './user'

export function getInjectNodeInfo(element: HTMLImageElement) {
    const avatarId = getAvatarId(element.src)

    if (!avatarId) return
    return { element, width: element.width, height: element.height, avatarId }
}
