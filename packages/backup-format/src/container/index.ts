import { unreachable, concatArrayBuffer } from '@masknet/kit'
import { BackupErrors } from '../BackupErrors.js'

const MAGIC_HEADER_Version0 = new TextEncoder().encode('MASK-BACKUP-V000')
const CHECKSUM_LENGTH = 32

/** @internal */
export enum SupportedVersions {
    Version0 = 0,
}
function getMagicHeader(version: SupportedVersions) {
    if (version === 0) return MAGIC_HEADER_Version0
    unreachable(version)
}

/** @internal */
export async function createContainer(version: SupportedVersions, data: ArrayBuffer | Uint8Array<ArrayBuffer>) {
    const checksum = await crypto.subtle.digest({ name: 'SHA-256' }, data)
    return concatArrayBuffer(getMagicHeader(version), data, checksum)
}

/** @internal */
export async function parseEncryptedJSONContainer(
    version: SupportedVersions,
    _container: ArrayBuffer | ArrayLike<number>,
) {
    const container = new Uint8Array(_container)

    for (const [index, value] of getMagicHeader(version).entries()) {
        if (container[index] !== value) throw new TypeError(BackupErrors.UnknownFormat)
    }

    const data = container.slice(MAGIC_HEADER_Version0.length, -CHECKSUM_LENGTH)
    const sum = new Uint8Array(await crypto.subtle.digest({ name: 'SHA-256' }, data))

    for (const [index, value] of container.slice(-CHECKSUM_LENGTH).entries()) {
        if (sum[index] !== value) throw new TypeError(BackupErrors.WrongCheckSum)
    }

    return data
}
