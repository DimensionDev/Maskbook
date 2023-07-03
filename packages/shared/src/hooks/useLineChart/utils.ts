export function fixOverPosition(
    containerWidth: number,
    containerHeight: number,
    x: number,
    y: number,
    offsetX = 0,
    offsetY = 0,
) {
    let fixed = { x, y }

    if (x - offsetX < 0) fixed = { ...fixed, x: offsetX }
    if (x > containerWidth - offsetX) fixed = { ...fixed, x: x - offsetX }
    if (y - offsetY < 0) fixed = { ...fixed, y: offsetY }
    if (y > containerHeight - offsetY) fixed = { ...fixed, y: y - offsetY }
    return fixed
}
