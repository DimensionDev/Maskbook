import {
    BindingProof,
    fromHex,
    NextIDAction,
    NextIDBindings,
    NextIDPayload,
    NextIDPlatform,
    toBase64,
} from '@masknet/shared-base'
import urlcat from 'urlcat'
import { first } from 'lodash-unified'

const BASE_URL =
    process.env.channel === 'stable' && process.env.NODE_ENV === 'production'
        ? 'https://proof-service.next.id/'
        : 'https://proof-service.nextnext.id/'

interface CreatePayloadBody {
    action: string
    platform: string
    identity: string
    public_key: string
}

interface CreatePayloadResponse {
    post_content: string
    sign_payload: string
}

export async function fetchJSON<T = unknown>(requestInfo: RequestInfo, requestInit?: RequestInit): Promise<T> {
    const res = await globalThis.fetch(requestInfo, { mode: 'cors', ...requestInit })
    const result = await res.json()

    if (result.message || !res.ok) throw new Error(result.message)
    return result
}

// TODO: remove 'bind' in project for business context.
export async function bindProof(
    personaPublicKey: string,
    action: NextIDAction,
    platform: string,
    identity: string,
    options?: {
        walletSignature?: string
        signature?: string
        proofLocation?: string
    },
) {
    const requestBody = {
        action,
        platform,
        identity,
        public_key: personaPublicKey,
        proof_location: options?.proofLocation,
        extra: {
            wallet_signature: options?.walletSignature ? toBase64(fromHex(options.walletSignature)) : undefined,
            signature: options?.signature ? toBase64(fromHex(options.signature)) : undefined,
        },
    }

    return fetchJSON(urlcat(BASE_URL, '/v1/proof'), {
        body: JSON.stringify(requestBody),
        method: 'POST',
    })
}

export async function queryExistedBindingByPersona(personaPublicKey: string) {
    const response = await fetchJSON<NextIDBindings>(
        urlcat(BASE_URL, '/v1/proof', { platform: NextIDPlatform.NextId, identity: personaPublicKey }),
    )
    // Will have only one item when query by personaPublicKey
    return first(response.ids)
}

export async function queryExistedBindingByPlatform(platform: NextIDPlatform, identity: string, page?: number) {
    if (!platform && !identity) return []

    const response = await fetchJSON<NextIDBindings>(
        urlcat(BASE_URL, '/v1/proof', { platform: platform, identity: identity }),
    )

    // TODO: merge Pagination into this
    return response.ids
}

export async function queryIsBound(personaPublicKey: string, platform: NextIDPlatform, identity: string) {
    if (!platform && !identity) return false

    try {
        await fetchJSON<BindingProof>(
            urlcat(BASE_URL, '/v1/proof/exists', {
                platform: platform,
                identity: identity,
                public_key: personaPublicKey,
            }),
        )
        return true
    } catch {
        return false
    }
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

    const response = await fetchJSON<CreatePayloadResponse>(urlcat(BASE_URL, '/v1/proof/payload'), {
        body: JSON.stringify(requestBody),
        method: 'POST',
    })

    return {
        postContent: response.post_content,
        signPayload: JSON.stringify(JSON.parse(response.sign_payload)),
    }
}
