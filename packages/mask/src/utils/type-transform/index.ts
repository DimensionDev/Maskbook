<<<<<<< HEAD
export * from './BackupFile'
export * from './BackupFormat'
export * from './Payload'
export * from './SECP256k1-ETH'
=======
export * from './asyncIteratorHelpers'

export function hasPayloadLike(text: string): boolean {
    return text.includes('\u{1F3BC}') && text.includes(':||')
}
>>>>>>> develop
