import { unreachable, concatArrayBuffer } from '@masknet/kit'
import { BackupErrors } from '../BackupErrors.js'

const MAGIC_HEADER_Version0 = new TextEncoder().encode('MASK-BACKUP-V000')
const MAGIC_HEADER_Version1 = new TextEncoder().encode('MASK-BACKUP-V001')
const CHECKSUM_LENGTH = 32

/** @internal */
export enum SupportedVersions {
    Version0 = 0,
    Version1 = 1,
}
function getMagicHeader(version: SupportedVersions) {
    if (version === 0) return MAGIC_HEADER_Version0
    if (version === 1) return MAGIC_HEADER_Version1
    unreachable(version)
}

/** @internal */
export async function createContainer(data: ArrayBuffer | Uint8Array<ArrayBuffer>) {
    const checksum = await crypto.subtle.digest({ name: 'SHA-256' }, data)
    return concatArrayBuffer(getMagicHeader(SupportedVersions.Version1), data, checksum)
}

/** @internal */
export async function parseEncryptedJSONContainer(_container: ArrayBuffer | ArrayLike<number>) {
    const container = new Uint8Array(_container)
    const version = detectContainerVersion(container)
    const header = getMagicHeader(version)

    if (container.length < header.length + CHECKSUM_LENGTH) throw new TypeError(BackupErrors.UnknownFormat)

    const data = container.slice(header.length, -CHECKSUM_LENGTH)
    const sum = new Uint8Array(await crypto.subtle.digest({ name: 'SHA-256' }, data))

    for (const [index, value] of container.slice(-CHECKSUM_LENGTH).entries()) {
        if (sum[index] !== value) throw new TypeError(BackupErrors.WrongCheckSum)
    }

    return { data, version }
}

function detectContainerVersion(container: Uint8Array): SupportedVersions {
    for (const version of [SupportedVersions.Version0, SupportedVersions.Version1]) {
        const header = getMagicHeader(version)
        if (header.every((value, index) => container[index] === value)) return version
    }
    throw new TypeError(BackupErrors.UnknownFormat)
}
