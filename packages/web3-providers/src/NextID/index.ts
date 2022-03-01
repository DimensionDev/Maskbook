import { fromHex, toBase64, NextIDBindings, NextIDPlatform, NextIDPayload, NextIDAction } from '@masknet/shared-base'
import urlcat from 'urlcat'
import { first } from 'lodash-unified'

const BASE_URL =
    process.env.channel === 'stable' && process.env.NODE_ENV === 'production'
        ? 'https://proof-service.next.id/'
        : 'https://js43x8ol17.execute-api.ap-east-1.amazonaws.com/api/'

interface CreatePayloadBody {
    action: string
    platform: string
    identity: string
    public_key: string
}

export async function bindProof(
    personaPublicKey: string,
    action: NextIDAction,
    platform: string,
    identity: string,
    walletSignature?: string,
    signature?: string,
    proofLocation?: string,
) {
    const requestBody = {
        action,
        platform,
        identity,
        public_key: personaPublicKey,
        ...(proofLocation ? { proof_location: proofLocation } : {}),
        extra: {
            ...(walletSignature ? { wallet_signature: toBase64(fromHex(walletSignature)) } : {}),
            ...(signature ? { signature: toBase64(fromHex(signature)) } : {}),
        },
    }

    const response = await fetch(urlcat(BASE_URL, '/v1/proof'), {
        body: JSON.stringify(requestBody),
        method: 'POST',
        mode: 'cors',
    })

    const result = (await response.json()) as { message: string }

    if (!response.ok) throw new Error(result.message)
    return response
}

export async function queryExistedBindingByPersona(personaPublicKey: string) {
    const response = await fetch(urlcat(BASE_URL, '/v1/proof', { platform: 'nextid', identity: personaPublicKey }), {
        mode: 'cors',
    })

    const result = (await response.json()) as NextIDBindings
    // Will have only one item when query by personaPublicKey
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

export async function queryExistedBinding(platform: NextIDPlatform, identity: string): Promise<NextIDBindings> {
    throw new Error('To be implemented.')
}

export async function queryIsBound(personaPublicKey: string, platform: NextIDPlatform, identity: string) {
    if (!platform && !identity) return false

    const ids = await queryExistedBindingByPlatform(platform, identity)
    return ids.some((x) => x.persona.toLowerCase() === personaPublicKey.toLowerCase())
}

export async function createPersonaPayload(
    personaPublicKey: string,
    action: NextIDAction,
    identity: string,
    platform: NextIDPlatform,
): Promise<NextIDPayload | null> {
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
