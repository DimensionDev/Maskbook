import { parseVersion } from './parseVersion.js'

export function isNewerThan(version: string, otherVersion: string) {
    const versionParsed = parseVersion(version)
    const otherVersionParsed = parseVersion(otherVersion)

    return versionParsed.reduce((newer, n, i) => {
        if (newer) return newer
        return n > otherVersionParsed[i]
    }, false)
}
