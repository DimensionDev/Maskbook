import { unreachable } from '@dimensiondev/kit'
import {
    decrypt,
    DecryptProgressKind,
    parsePayload,
    socialNetworkDecoder,
    SocialNetworkEnum,
} from '@masknet/encryption'
import { isTypedMessageText } from '@masknet/typed-message'
export async function tryDecryptTwitterPublicEncryption(text: Record<string, string>): Promise<Record<string, string>> {
    const allPromises: Promise<void>[] = []
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(text)) {
        allPromises.push(decryptOnTwitter(value).then((text) => void (text ? (result[key] = text) : void 0)))
    }
    await Promise.allSettled(allPromises)
    console.log(result)
    return result
}

async function decryptOnTwitter(text: string): Promise<string | null> {
    const decoded = socialNetworkDecoder(SocialNetworkEnum.Twitter, text)[0]
    if (!decoded) return null
    const parsed = (await parsePayload(decoded)).unwrap()
    if (parsed.encryption.unwrap().type === 'E2E') return null

    const iter = decrypt({ message: parsed }, dumbIO)
    for await (const progress of iter) {
        if (progress.type === DecryptProgressKind.Success) {
            if (isTypedMessageText(progress.content) && (!progress.content.meta || progress.content.meta.size === 0)) {
                return progress.content.content
            }
            return null
        }
    }
    return null
}

const dumbIO = {
    decryptByLocalKey: unreachable,
    deriveAESKey: unreachable,
    hasLocalKeyOf: unreachable,
    queryAuthorPublicKey: unreachable,
    queryPostKey_version37: unreachable,
    queryPostKey_version38: unreachable,
    queryPostKey_version39: unreachable,
    queryPostKey_version40: unreachable,
    getPostKeyCache: async () => null,
    setPostKeyCache: async () => void 0,
}
