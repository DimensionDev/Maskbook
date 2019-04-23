export interface PayloadAlpha40 {
    version: -40
    ownersAESKeyEncrypted: string
    iv: string
    encryptedText: string
    signature?: string
}
/**
 * Detect if there is version -40 payload
 */
function deconstructAlpha40(str: string, throws = false): PayloadAlpha40 | null {
    // 🎼2/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    const [_, payloadStart] = str.split('🎼2/4|')
    if (!payloadStart)
        if (throws) throw new Error("Doesn't find payload")
        else return null
    const [payload, rest] = payloadStart.split(':||')
    if (rest === undefined)
        if (throws) throw new Error('This post is not complete, you need to view the full post.')
        else return null
    const [ownersAESKeyEncrypted, iv, encryptedText, signature, ...extra] = payload.split('|')
    if (!(ownersAESKeyEncrypted && iv && encryptedText))
        if (throws) throw new Error('This post seemed to be corrupted. Maskbook cannot decrypt it')
        else return null
    if (extra.length) console.warn('Found extra payload', extra)
    return {
        ownersAESKeyEncrypted,
        iv,
        encryptedText,
        signature,
        version: -40,
    }
}
function deconstructAlpha41(str: string, throws = false): null | never {
    // 🎼1/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    if (str.match('🎼1/4') && str.match(':||'))
        if (throws) throw new Error('Support for Alpha41 is dropped. Tell your friends to upgrade Maskbook!')
        else return null
    return null
}

const versions = new Set([deconstructAlpha40, deconstructAlpha41])
export function deconstructPayload(str: string, throws = false) {
    for (const ver of versions) {
        const result = ver(str, false)
        if (throws === false) return result
        if (result) return result
        return ver(str, true)
    }
    if (str.match('🎼') && str.match(':||'))
        if (throws) throw new TypeError('Unknown post version, maybe you should update Maskbook?')
        else return null
    if (throws) throw new TypeError('Payload not found')
    else return null
}

export function constructAlpha40(data: PayloadAlpha40) {
    return `🎼2/4|${data.ownersAESKeyEncrypted}|${data.iv}|${data.encryptedText}|${data.signature}:||`
}
