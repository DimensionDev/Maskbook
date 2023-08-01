export function isLens(name?: string) {
    if (!name) return false
    name = name.toLowerCase()
    return name.endsWith('.lens') || name === 'lensprotocol' || name === '@lensprotocol'
}
