import { env } from '@masknet/flags'
import {
    type BindingProof,
    NextIDAction,
    type NextIDBindings,
    type NextIDErrorBody,
    type NextIDPayload,
    type NextIDPersonaBindings,
    NextIDPlatform,
    fromHex,
    toBase64,
} from '@masknet/shared-base'
import { first, sortBy } from 'lodash-es'
import urlcat from 'urlcat'
import { Expiration, stableSquashedCached } from '../entry-helpers.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { PROOF_BASE_URL_DEV, PROOF_BASE_URL_PROD } from './constants.js'
import { staleNextIDCached } from './helpers.js'

const BASE_URL =
    env.channel === 'stable' && process.env.NODE_ENV === 'production' ? PROOF_BASE_URL_PROD : PROOF_BASE_URL_DEV

interface CreatePayloadBody {
    action: string
    platform: string
    identity: string
    public_key: string
}

type PostContentLanguages = 'default' | 'zh_CN'

interface CreatePayloadResponse {
    post_content: {
        [key in PostContentLanguages]: string
    }
    sign_payload: string
    uuid: string
    created_at: string
}

interface RestorePubkeyResponse {
    /** hex public key */
    public_key: string
}

function getPersonaQueryURL(platform: string, identity: string) {
    return urlcat(BASE_URL, '/v1/proof', {
        platform,
        identity,
    })
}

function getExistedBindingQueryURL(platform: string, identity: string, personaPublicKey: string) {
    return urlcat(BASE_URL, '/v1/proof/exists', {
        platform,
        identity,
        public_key: personaPublicKey,
    })
}

function fetchFromProofService<T>(request: Request | RequestInfo, init?: RequestInit) {
    return fetchJSON<T>(request, init, {
        squashExpiration: Expiration.TEN_SECONDS,
    })
}

export class NextIDProof {
    static async clearPersonaQueryCache(personaPublicKey: string) {
        const url = getPersonaQueryURL(NextIDPlatform.NextID, personaPublicKey)
        await staleNextIDCached(url)
        await stableSquashedCached(url)
    }

    static async bindProof(
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

        const result = await fetchJSON<NextIDErrorBody | undefined>(urlcat(BASE_URL, '/v1/proof'), {
            body: JSON.stringify(requestBody),
            method: 'POST',
        })

        if (result?.message) throw new Error(result.message)

        // Should delete cache when proof status changed
        const cacheKeyOfQueryPersona = getPersonaQueryURL(NextIDPlatform.NextID, personaPublicKey)
        const cacheKeyOfQueryPlatform = getPersonaQueryURL(platform, identity)
        const cacheKeyOfExistedBinding = getExistedBindingQueryURL(platform, identity, personaPublicKey)

        await staleNextIDCached(cacheKeyOfExistedBinding)
        await staleNextIDCached(cacheKeyOfQueryPersona)
        await staleNextIDCached(cacheKeyOfQueryPlatform)

        await stableSquashedCached(cacheKeyOfQueryPersona)
        await stableSquashedCached(cacheKeyOfQueryPlatform)
        await stableSquashedCached(cacheKeyOfExistedBinding)
    }

    static async queryExistedBindingByPersona(personaPublicKey: string) {
        const { ids } = await fetchFromProofService<NextIDBindings>(
            getPersonaQueryURL(NextIDPlatform.NextID, personaPublicKey),
        )
        // Will have only one item when query by personaPublicKey
        return first(ids)
    }

    static async queryExistedBindingByPlatform(platform: NextIDPlatform, identity: string, page = 1, exact = true) {
        if (!platform && !identity) return []

        const bindings = await fetchFromProofService<NextIDBindings>(
            urlcat(BASE_URL, '/v1/proof', {
                platform,
                identity,
                page,
                exact,
                // TODO workaround for the API, and will sort the result manually
            }),
        )

        return sortBy(bindings.ids, (x) => -x.activated_at)
    }

    static async queryLatestBindingByPlatform(
        platform: NextIDPlatform,
        identity: string,
        publicKey?: string,
    ): Promise<NextIDPersonaBindings | null> {
        if (!platform && !identity) return null

        const bindings = await this.queryAllExistedBindingsByPlatform(platform, identity, true)
        if (publicKey) return bindings.find((x) => x.persona === publicKey) ?? null
        return first(bindings) ?? null
    }

    static async queryAllExistedBindingsByPlatform(platform: NextIDPlatform, identity: string, exact?: boolean) {
        if (!platform && !identity) return []

        const nextIDPersonaBindings: NextIDPersonaBindings[] = []
        let page = 1
        do {
            const bindings = await fetchFromProofService<NextIDBindings>(
                urlcat(BASE_URL, '/v1/proof', {
                    platform,
                    identity,
                    exact,
                    page,
                    order: 'desc',
                }),
            )
            const personaBindings = bindings.ids
            if (personaBindings.length === 0) return nextIDPersonaBindings
            nextIDPersonaBindings.push(...personaBindings)

            // next is `0` if current page is the last one.
            if (bindings.pagination.next === 0) return nextIDPersonaBindings

            page += 1
        } while (page > 1)
        return []
    }

    static async queryIsBound(personaPublicKey: string, platform: NextIDPlatform, identity: string) {
        try {
            if (!platform && !identity) return false

            const proof = await fetchFromProofService<BindingProof | undefined>(
                getExistedBindingQueryURL(platform, identity, personaPublicKey),
            )
            return !!proof?.is_valid
        } catch {
            return false
        }
    }

    static async createPersonaPayload(
        personaPublicKey: string,
        action: NextIDAction,
        identity: string,
        platform: NextIDPlatform,
        language: string = 'default',
    ): Promise<NextIDPayload | null> {
        const requestBody: CreatePayloadBody = {
            action,
            platform,
            identity,
            public_key: personaPublicKey,
        }

        const nextIDLanguageFormat = language.replace('-', '_') as PostContentLanguages

        const response = await fetchJSON<CreatePayloadResponse>(urlcat(BASE_URL, '/v1/proof/payload'), {
            body: JSON.stringify(requestBody),
            method: 'POST',
        })

        return response ?
                {
                    postContent: response.post_content[nextIDLanguageFormat] ?? response.post_content.default,
                    signPayload: JSON.stringify(JSON.parse(response.sign_payload)),
                    createdAt: response.created_at,
                    uuid: response.uuid,
                }
            :   null
    }

    static async restorePubkey(payload: string, platform: NextIDPlatform, identity: string) {
        const url = urlcat(BASE_URL, '/v1/proof/restore_pubkey')
        const response = await fetchJSON<RestorePubkeyResponse>(url, {
            method: 'POST',
            body: JSON.stringify({
                action: NextIDAction.Create,
                platform,
                identity,
                proof_post: payload,
            }),
        })
        return response.public_key
    }
}
