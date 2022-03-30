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
import { fetchJSON } from './helper'

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
    return first(response.unwrap().ids)
}

export async function queryExistedBindingByPlatform(platform: NextIDPlatform, identity: string, page?: number) {
    if (!platform && !identity) return []

    const response = await fetchJSON<NextIDBindings>(
        urlcat(BASE_URL, '/v1/proof', { platform: platform, identity: identity }),
    )

    // TODO: merge Pagination into this
    return response.unwrap().ids
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

    const result = response.unwrap()

    return {
        postContent: result.post_content[nextIDLanguageFormat ?? 'default'] ?? result.post_content.default,
        signPayload: JSON.stringify(JSON.parse(result.sign_payload)),
        createdAt: result.created_at,
        uuid: result.uuid,
    }
}

// #region kv server
export * from './kv'
// #endregion
