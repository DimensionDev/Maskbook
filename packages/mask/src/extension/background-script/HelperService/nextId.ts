import {
    toHex,
    PersonaIdentifier,
    compressSecp256k1Point,
    fromHex,
    toBase64,
    decompressSecp256k1Key,
} from '@masknet/shared-base'
import urlcat from 'urlcat'
import { KeyValue } from '@masknet/web3-providers'

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

export const KV_SERVER_RUL = 'https://kv.r2d2.to/'
export const NEXT_ID_KV_PREFIX = 'nextid.persona'

const NextIDDBStorage = KeyValue.createJSON_Storage(NEXT_ID_KV_PREFIX)

export async function updateNextIDRelationFromKV(sns: string, username: string, value: string) {
    await NextIDDBStorage.set(`${sns}_${username}`, value)
}

export async function getNextIDRelationFromKV(sns: string, username: string) {
    return NextIDDBStorage.get<string>(`${sns}_${username}`)
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
    console.log(persona)
    const key256 = decompressSecp256k1Key(persona.compressedPoint)
    if (!key256.x || !key256.y) return null
    const arr = compressSecp256k1Point(key256.x, key256.y)

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
