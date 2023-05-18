type Dimension = {
    height: number
    width: number
}
interface Options {
    anchorBounding: DOMRect
    targetDimension: Dimension
    containerDimension: Dimension
    margin?: number
}

/**
 * Calculate the position of the attaching rectangle.
 * TODO add unit tests.
 */
export function attachRectangle({ anchorBounding, targetDimension, containerDimension, margin = 0 }: Options) {
    const bounding = anchorBounding
    const { height: targetHeight, width: targetWidth } = targetDimension
    const { height: containerHeight, width: containerWidth } = containerDimension
    const reachedBottom = bounding.bottom + targetHeight > containerHeight
    let x = Math.max(bounding.left + bounding.width / 2 - targetWidth / 2, 0)
    let y = bounding.top + bounding.height
    const reachedTop = bounding.top < targetHeight
    if (reachedBottom) {
        if (reachedTop) {
            x = bounding.left + bounding.width
            y = Math.min(containerHeight - targetHeight, Math.max(bounding.top - targetHeight / 2))
        } else {
            y = bounding.top - targetHeight
        }
    }
    // reached right boundary
    if (x + targetWidth > containerWidth) {
        x = reachedTop && reachedBottom ? bounding.left - targetWidth : containerWidth - targetWidth - margin
    }
    // Prefer to show top left corner of the target.
    x = Math.max(0, x)
    y = Math.max(0, y)
    return { x, y }
}
