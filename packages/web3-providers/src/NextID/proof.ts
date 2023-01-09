import urlcat from 'urlcat'
import { first, uniqWith } from 'lodash-es'
import {
    BindingProof,
    fromHex,
    NextIDAction,
    NextIDBindings,
    NextIDErrorBody,
    NextIDPayload,
    NextIDPersonaBindings,
    NextIDPlatform,
    toBase64,
} from '@masknet/shared-base'
import { PROOF_BASE_URL_PROD, RELATION_SERVICE_URL, PROOF_BASE_URL_DEV } from './constants.js'
import type { NextIDBaseAPI } from '../entry-types.js'
import { fetchJSON, fetchR2D2 } from '../entry-helpers.js'
import { staleNextIDCached } from './helpers.js'
import { fetchSquashed } from '../helpers/fetchSquashed.js'
import { fetch } from '../helpers/fetch.js'

const BASE_URL =
    process.env.channel === 'stable' && process.env.NODE_ENV === 'production' ? PROOF_BASE_URL_PROD : PROOF_BASE_URL_DEV
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

const getPersonaQueryURL = (platform: string, identity: string) =>
    urlcat(BASE_URL, '/v1/proof', {
        platform,
        identity,
    })

const getExistedBindingQueryURL = (platform: string, identity: string, personaPublicKey: string) =>
    urlcat(BASE_URL, '/v1/proof/exists', {
        platform,
        identity,
        public_key: personaPublicKey,
    })

export class NextIDProofAPI implements NextIDBaseAPI.Proof {
    async bindProof(
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

        const result = await fetch<NextIDErrorBody | void>(
            urlcat(BASE_URL, '/v1/proof'),
            {
                body: JSON.stringify(requestBody),
                method: 'POST',
            },
            [fetchR2D2, fetchJSON],
        )

        if (result?.message) throw new Error(result.message)

        // Should delete cache when proof status changed
        const cacheKeyOfQueryPersona = getPersonaQueryURL(NextIDPlatform.NextID, personaPublicKey)
        const cacheKeyOfQueryPlatform = getPersonaQueryURL(platform, identity)
        const cacheKeyOfExistedBinding = getExistedBindingQueryURL(platform, identity, personaPublicKey)

        await staleNextIDCached(cacheKeyOfExistedBinding)
        await staleNextIDCached(cacheKeyOfQueryPersona)
        await staleNextIDCached(cacheKeyOfQueryPlatform)
    }

    async queryExistedBindingByPersona(personaPublicKey: string, enableCache?: boolean) {
        const url = getPersonaQueryURL(NextIDPlatform.NextID, personaPublicKey)
        const response = await fetch<NextIDBindings>(url, undefined, [fetchSquashed, fetchR2D2, fetchJSON])
        // Will have only one item when query by personaPublicKey
        return first(response.ids)
    }

    async queryExistedBindingByPlatform(platform: NextIDPlatform, identity: string, page = 1) {
        if (!platform && !identity) return []

        const response = await fetch<NextIDBindings>(
            urlcat(BASE_URL, '/v1/proof', {
                platform,
                identity,
                page,
                exact: true,
                sort: 'activated_at',
                order: 'desc',
            }),
            undefined,
            [fetchSquashed, fetchR2D2, fetchJSON],
        )

        return response.ids
    }

    async queryLatestBindingByPlatform(
        platform: NextIDPlatform,
        identity: string,
    ): Promise<NextIDPersonaBindings | null> {
        if (!platform && !identity) return null

        const result = await this.queryExistedBindingByPlatform(platform, identity, 1)
        return first(result) ?? null
    }

    async queryAllExistedBindingsByPlatform(platform: NextIDPlatform, identity: string, exact?: boolean) {
        if (!platform && !identity) return []

        const nextIDPersonaBindings: NextIDPersonaBindings[] = []
        let page = 1
        do {
            const result = await fetch<NextIDBindings>(
                urlcat(BASE_URL, '/v1/proof', {
                    platform,
                    identity,
                    exact,
                    page,
                    order: 'desc',
                }),
                undefined,
                [fetchSquashed, fetchR2D2, fetchJSON],
            )

            const personaBindings = result.ids
            if (personaBindings.length === 0) return nextIDPersonaBindings
            nextIDPersonaBindings.push(...personaBindings)

            // next is `0` if current page is the last one.
            if (result.pagination.next === 0) return nextIDPersonaBindings

            page += 1
        } while (page > 1)
        return []
    }

    async queryIsBound(personaPublicKey: string, platform: NextIDPlatform, identity: string, enableCache?: boolean) {
        try {
            if (!platform && !identity) return false

            const url = getExistedBindingQueryURL(platform, identity, personaPublicKey)
            const result = await fetch<BindingProof>(url, undefined, [fetchSquashed, fetchR2D2, fetchJSON])

            return !!result?.is_valid
        } catch {
            return false
        }
    }

    async queryProfilesByRelationService(identity: string) {
        const response = await fetch(RELATION_SERVICE_URL, {
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify({
                operationName: 'GET_PROFILES_QUERY',
                variables: { identity: identity.toLowerCase(), platform: 'ethereum' },
                query: `
                    query GET_PROFILES_QUERY($platform: String, $identity: String) {
                        identity(platform: $platform, identity: $identity) {                     
                            neighborWithTraversal(depth: 7) {
                                source
                                to {
                                    platform
                                    displayName                                                                                                        
                                }        
                                from {
                                    platform
                                    displayName                                                                                                        
                                }                                                                                          
                            }
                        }
                    }
                `,
            }),
        })

        const res = (await response.json())?.data.identity.neighborWithTraversal as Array<{
            source: NextIDPlatform
            to: { platform: NextIDPlatform; displayName: string }
            from: { platform: NextIDPlatform; displayName: string }
        }>

        const rawData = res
            .map((x) => createBindingProofFromProfileQuery(x.to.platform, x.source, x.to.displayName))
            .concat(res.map((x) => createBindingProofFromProfileQuery(x.from.platform, x.source, x.from.displayName)))

        return uniqWith(rawData, (a, b) => a.identity === b.identity && a.platform === b.platform).filter(
            (x) => ![NextIDPlatform.Ethereum, NextIDPlatform.NextID].includes(x.platform),
        )
    }

    async createPersonaPayload(
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

        const response = await fetch<CreatePayloadResponse>(
            urlcat(BASE_URL, '/v1/proof/payload'),
            {
                body: JSON.stringify(requestBody),
                method: 'POST',
            },
            [fetchR2D2, fetchJSON],
        )

        return response
            ? {
                  postContent:
                      response.post_content[nextIDLanguageFormat ?? 'default'] ?? response.post_content.default,
                  signPayload: JSON.stringify(JSON.parse(response.sign_payload)),
                  createdAt: response.created_at,
                  uuid: response.uuid,
              }
            : null
    }
}

function createBindingProofFromProfileQuery(platform: NextIDPlatform, source: NextIDPlatform, identity: string) {
    return {
        platform,
        source,
        identity,
        created_at: '',
        invalid_reason: '',
        last_checked_at: '',
        is_valid: true,
    } as BindingProof
}
