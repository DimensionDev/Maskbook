import { toHex, PersonaIdentifier, compressSecp256k1Point, fromHex, toBase64 } from '@masknet/shared-base'
import { queryPublicKey } from '../../../database'
import urlcat from 'urlcat'

const BASE_URL =
    process.env.channel === 'stable' && process.env.NODE_ENV === 'production'
        ? 'https://proof-service.next.id/'
        : 'https://js43x8ol17.execute-api.ap-east-1.amazonaws.com/api/'

interface QueryBinding {
    platform: string
    identity: string
}

interface QueryBindingIDResponse {
    persona: string
    proofs: {
        platform: string
        identity: string
    }[]
}

interface QueryBindingResponse {
    ids: QueryBindingIDResponse[]
}

interface CreatePayloadBody {
    action: string
    platform: string
    identity: string
    public_key: string
}

interface PayloadResponse {
    post_content: string
    sign_payload: string
}

export async function bindProof(
    persona: PersonaIdentifier,
    action: 'create' | 'delete',
    platform: string,
    identity: string,
    walletSignature?: string,
    signature?: string,
) {
    const publicKey = await queryPersonaHexPublicKey(persona)
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

async function queryPersonaHexPublicKey(persona: PersonaIdentifier) {
    const personaPublicKey = await queryPublicKey(persona)
    if (!personaPublicKey?.x || !personaPublicKey?.y) return null
    const arr = compressSecp256k1Point(personaPublicKey.x, personaPublicKey.y)

    return `0x${toHex(arr)}`
}

export async function queryExistedBinding(persona: PersonaIdentifier) {
    const publicKey = await queryPersonaHexPublicKey(persona)
    if (!publicKey) return

    const response = await fetch(urlcat(BASE_URL, '/v1/proof', { platform: 'nextid', identity: publicKey }), {
        mode: 'cors',
    })

    const result = (await response.json()) as QueryBindingResponse
    return result.ids[0]
}

export async function createPersonaPayload(
    persona: PersonaIdentifier,
    action: 'create' | 'delete',
    identity: string,
    platform: string,
) {
    const publicKey = await queryPersonaHexPublicKey(persona)
    if (!publicKey) return

    const requestBody: CreatePayloadBody = {
        action,
        platform,
        identity,
        public_key: publicKey,
    }

    const response = await fetch(urlcat(BASE_URL, '/v1/proof/payload'), {
        body: JSON.stringify(requestBody),
        method: 'POST',
        mode: 'cors',
    })

    const result: PayloadResponse = await response.json()
    return JSON.stringify(JSON.parse(result.sign_payload))
}
