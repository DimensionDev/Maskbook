import { parseVersion } from './parseVersion.js'

export function isSameVersion(version: string, otherVersion: string) {
    const versionParsed = parseVersion(version)
    const otherVersionParsed = parseVersion(otherVersion)

    return (
        versionParsed.length === otherVersionParsed.length && versionParsed.every((n, i) => n === otherVersionParsed[i])
    )
}
