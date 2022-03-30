import {
    BindingProof,
    fromHex,
    NextIDAction,
    NextIDBindings,
    NextIDPayload,
    NextIDPlatform,
    toBase64,
} from '@masknet/shared-base'
import LRU from 'lru-cache'
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

type PostContentLanguages = 'default' | 'zh_CN'

interface CreatePayloadResponse {
    post_content: { [key in PostContentLanguages]: string }
    sign_payload: string
    uuid: string
    created_at: string
}

const fetchCache = new LRU<string, any>({
    max: 100,
    ttl: 20000,
})

export async function fetchJSON<T = unknown>(
    url: string,
    requestInit?: RequestInit,
    enableCache?: boolean,
): Promise<T> {
    type FetchCache = LRU<string, Promise<Response> | T>

    const cached = enableCache ? (fetchCache as FetchCache).get(url) : undefined
    const isPending = cached instanceof Promise
    if (cached && !isPending) {
        return cached
    }
    let pendingResponse: Promise<Response>
    if (isPending) {
        pendingResponse = cached
    } else {
        pendingResponse = globalThis.fetch(url, { mode: 'cors', ...requestInit })
        if (enableCache) {
            fetchCache.set(url, pendingResponse)
        }
    }
    const response = await pendingResponse

    const result = await response.clone().json()

    if (result.message || !response.ok) {
        throw new Error(result.message)
    }
    fetchCache.set(url, result)
    return result
}

// TODO: remove 'bind' in project for business context.
export async function bindProof(
    uuid: string,
    personaPublicKey: string,
    action: NextIDAction,
    platform: string,
    identity: string,
    createdAt: string,
    options?: {
        walletSignature?: string
        signature?: string
        proofLocation?: string
    },
) {
    const requestBody = {
        uuid,
        action,
        platform,
        identity,
        public_key: personaPublicKey,
        proof_location: options?.proofLocation,
        extra: {
            wallet_signature: options?.walletSignature ? toBase64(fromHex(options.walletSignature)) : undefined,
            signature: options?.signature ? toBase64(fromHex(options.signature)) : undefined,
        },
        created_at: createdAt,
    }

    return fetchJSON(urlcat(BASE_URL, '/v1/proof'), {
        body: JSON.stringify(requestBody),
        method: 'POST',
    })
}

export async function queryExistedBindingByPersona(personaPublicKey: string, enableCache?: boolean) {
    const response = await fetchJSON<NextIDBindings>(
        urlcat(BASE_URL, '/v1/proof', { platform: NextIDPlatform.NextId, identity: personaPublicKey }),
        {},
        enableCache,
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

export async function queryIsBound(
    personaPublicKey: string,
    platform: NextIDPlatform,
    identity: string,
    enableCache?: boolean,
) {
    if (!platform && !identity) return false

    try {
        await fetchJSON<BindingProof>(
            urlcat(BASE_URL, '/v1/proof/exists', {
                platform: platform,
                identity: identity,
                public_key: personaPublicKey,
            }),
            {},
            enableCache,
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
    language?: string,
): Promise<NextIDPayload | null> {
    const requestBody: CreatePayloadBody = {
        action,
        platform,
        identity,
        public_key: personaPublicKey,
    }

    const nextIDLanguageFormat = language?.replace('-', '_') as PostContentLanguages

    const response = await fetchJSON<CreatePayloadResponse>(urlcat(BASE_URL, '/v1/proof/payload'), {
        body: JSON.stringify(requestBody),
        method: 'POST',
    })

    return {
        postContent: response.post_content[nextIDLanguageFormat ?? 'default'] ?? response.post_content.default,
        signPayload: JSON.stringify(JSON.parse(response.sign_payload)),
        createdAt: response.created_at,
        uuid: response.uuid,
    }
}
