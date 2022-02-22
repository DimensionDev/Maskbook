import {
    toHex,
    PersonaIdentifier,
    compressSecp256k1Point,
    fromHex,
    toBase64,
    decompressSecp256k1Key,
    NextIDBindings,
    NextIDPlatform,
    NextIDPayload,
} from '@masknet/shared-base'
import urlcat from 'urlcat'
import { first } from 'lodash-unified'

const BASE_URL =
    process.env.channel === 'stable' && process.env.NODE_ENV === 'production'
        ? 'https://proof-service.next.id/'
        : 'https://js43x8ol17.execute-api.ap-east-1.amazonaws.com/api/'

interface BindingQueryRequest {
    platform: NextIDPlatform
    identity: string
}

interface CreatePayloadBody {
    action: string
    platform: string
    identity: string
    public_key: string
}

export async function bindProof(
    persona: PersonaIdentifier,
    action: 'create' | 'delete',
    platform: string,
    identity: string,
    walletSignature?: string,
    signature?: string,
) {
    const publicKey = await convertPersonaHexPublicKey(persona)
    if (!publicKey) return

    const requestBody = {
        action,
        platform,
        identity,
        public_key: publicKey,
        extra: {
            ...(walletSignature ? { wallet_signature: toBase64(fromHex(walletSignature)) } : {}),
            ...(signature ? { signature: toBase64(fromHex(signature)) } : {}),
        },
    }

    return fetch(urlcat(BASE_URL, '/v1/proof'), {
        body: JSON.stringify(requestBody),
        method: 'POST',
        mode: 'cors',
    })
}

async function convertPersonaHexPublicKey(persona: PersonaIdentifier) {
    const key256 = decompressSecp256k1Key(persona.compressedPoint.replace(/\|/g, '/'))
    if (!key256.x || !key256.y) return null
    const arr = compressSecp256k1Point(key256.x, key256.y)

    return `0x${toHex(arr)}`
}

export async function queryExistedBindingByPersona(persona: PersonaIdentifier) {
    const personaPublicKey = await convertPersonaHexPublicKey(persona)
    if (!personaPublicKey) return

    const response = await fetch(urlcat(BASE_URL, '/v1/proof', { platform: 'nextid', identity: personaPublicKey }), {
        mode: 'cors',
    })

    const result = (await response.json()) as NextIDBindings
    // Will have only one item when query by persona
    return first(result.ids)
}

export async function queryExistedBindingByPlatform(platform: NextIDPlatform, identity: string) {
    if (!platform && !identity) return []

    const response = await fetch(urlcat(BASE_URL, '/v1/proof', { platform: platform, identity: identity }), {
        mode: 'cors',
    })

    const result = (await response.json()) as NextIDBindings
    return result.ids
}

export async function queryIsBound(persona: PersonaIdentifier, platform: NextIDPlatform, identity: string) {
    if (!platform && !identity) return false

    const personaPublicKey = await convertPersonaHexPublicKey(persona)
    if (!personaPublicKey) return false

    const ids = await queryExistedBindingByPlatform(platform, identity)
    return ids.map((x) => x.persona.toLowerCase()).includes(personaPublicKey.toLowerCase())
}

export async function createPersonaPayload(
    persona: PersonaIdentifier,
    action: 'create' | 'delete',
    identity: string,
    platform: NextIDPlatform,
): Promise<NextIDPayload | null> {
    const personaPublicKey = await convertPersonaHexPublicKey(persona)
    if (!personaPublicKey) return null

    const requestBody: CreatePayloadBody = {
        action,
        platform,
        identity,
        public_key: personaPublicKey,
    }

    const response = await fetch(urlcat(BASE_URL, '/v1/proof/payload'), {
        body: JSON.stringify(requestBody),
        method: 'POST',
        mode: 'cors',
    })

    const result = await response.json()
    return {
        postContent: result.post_content,
        signPayload: JSON.stringify(JSON.parse(result.sign_payload)),
    }
}
