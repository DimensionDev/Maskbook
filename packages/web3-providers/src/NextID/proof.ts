import urlcat from 'urlcat'
import { first, uniqBy, uniqWith } from 'lodash-es'
import {
    NextIDPlatform,
    fromHex,
    toBase64,
    type BindingProof,
    type NextIDAction,
    type NextIDBindings,
    type NextIDErrorBody,
    type NextIDIdentity,
    type NextIDPayload,
    type NextIDPersonaBindings,
    type NextIDEnsRecord,
} from '@masknet/shared-base'
import { fetchJSON, createFetchSquashed } from '../entry-helpers.js'
import type { NextIDBaseAPI } from '../entry-types.js'
import {
    PROOF_BASE_URL_DEV,
    PROOF_BASE_URL_PROD,
    RELATION_SERVICE_URL,
    TWITTER_HANDLER_VERIFY_URL,
} from './constants.js'
import { staleNextIDCached } from './helpers.js'
import PRESET_LENS from './preset-lens.json'

type PresetLensTwitter = keyof typeof PRESET_LENS

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

/**
 * Lens account queried from next id
 */
export interface LensAccount {
    handle: string
    displayName: string
    address: string
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
    private fetchSquashedFromNextID = createFetchSquashed()

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
    }

    async queryExistedBindingByPersona(personaPublicKey: string) {
        const url = getPersonaQueryURL(NextIDPlatform.NextID, personaPublicKey)
        const { ids } = await fetchJSON<NextIDBindings>(url, undefined, { enableSquash: true })
        // Will have only one item when query by personaPublicKey
        return first(ids)
    }

    async queryExistedBindingByPlatform(platform: NextIDPlatform, identity: string, page = 1) {
        if (!platform && !identity) return []

        const response = await fetchJSON<NextIDBindings>(
            urlcat(BASE_URL, '/v1/proof', {
                platform,
                identity,
                page,
                exact: true,
                sort: 'activated_at',
                order: 'desc',
            }),
            undefined,
            { enableSquash: true },
        )

        return response.ids
    }

    async queryLatestBindingByPlatform(
        platform: NextIDPlatform,
        identity: string,
        publicKey?: string,
    ): Promise<NextIDPersonaBindings | null> {
        if (!platform && !identity) return null

        const result = await this.queryExistedBindingByPlatform(platform, identity, 1)
        if (publicKey) return result.find((x) => x.persona === publicKey) ?? null
        return first(result) ?? null
    }

    async queryAllExistedBindingsByPlatform(platform: NextIDPlatform, identity: string, exact?: boolean) {
        if (!platform && !identity) return []

        const nextIDPersonaBindings: NextIDPersonaBindings[] = []
        let page = 1
        do {
            const result = await fetchJSON<NextIDBindings>(
                urlcat(BASE_URL, '/v1/proof', {
                    platform,
                    identity,
                    exact,
                    page,
                    order: 'desc',
                }),
                undefined,
                { enableSquash: true },
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

    async queryIsBound(personaPublicKey: string, platform: NextIDPlatform, identity: string) {
        try {
            if (!platform && !identity) return false

            const url = getExistedBindingQueryURL(platform, identity, personaPublicKey)
            const result = await fetchJSON<BindingProof | undefined>(url, undefined, { enableSquash: true })
            return !!result?.is_valid
        } catch {
            return false
        }
    }

    async queryProfilesByRelationService(address: string) {
        const { data } = await fetchJSON<{
            data: {
                identity: {
                    nft: NextIDEnsRecord[]
                    neighborWithTraversal: Array<{
                        source: NextIDPlatform
                        to: NextIDIdentity
                        from: NextIDIdentity
                    }>
                }
            }
        }>(
            RELATION_SERVICE_URL,
            {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({
                    operationName: 'GET_PROFILES_QUERY',
                    variables: { platform: 'ethereum', identity: address.toLowerCase() },
                    query: `
                    query GET_PROFILES_QUERY($platform: String, $identity: String) {
                        identity(platform: $platform, identity: $identity) {
                            nft(category: ["ENS"]) {
                              uuid
                              category
                              chain
                              address
                              id
                            }
                            neighborWithTraversal(depth: 5) {
                                source
                                to {
                                    platform
                                    identity
                                    displayName
                                }
                                from {
                                    platform
                                    identity
                                    displayName
                                }
                            }
                        }
                    }
                `,
                }),
            },
            { enableSquash: true },
        )

        const bindings = data.identity.neighborWithTraversal
            .map((x) => createBindingProofFromProfileQuery(x.to.platform, x.source, x.to.identity, x.to.displayName))
            .concat(
                data.identity.neighborWithTraversal.map((x) =>
                    createBindingProofFromProfileQuery(x.from.platform, x.source, x.from.identity, x.to.displayName),
                ),
            )
        const ensList = data.identity.nft
        if (ensList?.length) {
            bindings.unshift(groupEnsBinding(ensList))
        }

        return uniqWith(bindings, (a, b) => a.identity === b.identity && a.platform === b.platform).filter(
            (x) => ![NextIDPlatform.Ethereum, NextIDPlatform.NextID].includes(x.platform) && x.identity,
        )
    }

    async queryProfilesByTwitterId(twitterId: string) {
        const { data } = await fetchJSON<{
            data: {
                identity: {
                    nft: NextIDEnsRecord[]
                    neighborWithTraversal: Array<{
                        source: NextIDPlatform
                        to: NextIDIdentity
                        from: NextIDIdentity
                    }>
                }
            }
        }>(
            RELATION_SERVICE_URL,
            {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({
                    operationName: 'GET_PROFILES_BY_TWITTER_ID',
                    variables: { platform: 'twitter', identity: twitterId.toLowerCase() },
                    query: `
                    query GET_PROFILES_BY_TWITTER_ID($platform: String, $identity: String) {
                        identity(platform: $platform, identity: $identity) {
                            nft(category: ["ENS"]) {
                              uuid
                              category
                              chain
                              address
                              id
                            }
                            neighborWithTraversal(depth: 5) {
                                source
                                from {
                                    platform
                                    identity
                                    displayName
                                    nft(category: ["ENS"]) {
                                      uuid
                                      category
                                      chain
                                      address
                                      id
                                    }
                                }
                                to {
                                    platform
                                    identity
                                    displayName
                                    nft(category: ["ENS"]) {
                                      uuid
                                      category
                                      chain
                                      address
                                      id
                                    }
                                }
                            }
                        }
                    }
                `,
                }),
            },
            { enableSquash: true },
        )

        const bindings = data.identity.neighborWithTraversal
            .map((x) => createBindingProofFromProfileQuery(x.to.platform, x.source, x.to.identity, x.to.displayName))
            .concat(
                data.identity.neighborWithTraversal.map((x) =>
                    createBindingProofFromProfileQuery(x.from.platform, x.source, x.from.identity, x.to.displayName),
                ),
            )
        const ensList: NextIDEnsRecord[] = data.identity.neighborWithTraversal.reduce((list: NextIDEnsRecord[], x) => {
            const result = [...x.from.nft, ...x.to.nft]
            const endNodes = [x.from, x.to]
            endNodes
                .filter((node) => node.platform === NextIDPlatform.Ethereum && node.displayName.endsWith('.eth'))
                .forEach((node) => {
                    // Prepend the parent ens
                    result.unshift({
                        category: 'ENS',
                        chain: 'ethereum',
                        id: node.displayName,
                    } as NextIDEnsRecord)
                })
            return [...list, ...result]
        }, [])

        if (ensList.length) {
            bindings.unshift(groupEnsBinding(uniqBy(ensList, (x) => x.id)))
        }

        return uniqWith(bindings, (a, b) => a.identity === b.identity && a.platform === b.platform).filter(
            (x) => ![NextIDPlatform.Ethereum, NextIDPlatform.NextID].includes(x.platform) && x.identity,
        )
    }

    async queryAllLens(twitterId: string): Promise<LensAccount[]> {
        const lowerCaseId = twitterId.toLowerCase()
        const { data } = await fetchJSON<{
            data: {
                identity: {
                    uuid: string
                    platform: 'twitter'
                    identity: string
                    displayName: string
                    neighborWithTraversal: Array<{
                        source: NextIDPlatform
                        from: NextIDIdentity
                        to: NextIDIdentity
                    }>
                } | null
            }
        }>(
            RELATION_SERVICE_URL,
            {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({
                    operationName: 'GET_LENS_PROFILES',
                    variables: { platform: 'twitter', identity: lowerCaseId },
                    query: `
                    query GET_LENS_PROFILES($platform: String, $identity: String) {
                      identity(platform: $platform, identity: $identity) {
                        uuid
                        platform
                        identity
                        displayName
                        neighborWithTraversal(depth: 5) {
                          source
                          from {
                            uuid
                            platform
                            identity
                            displayName
                          }
                          to {
                            uuid
                            platform
                            identity
                            displayName
                          }
                        }
                      }
                    }
                `,
                }),
            },
            { enableSquash: true },
        )

        const connections =
            data.identity?.neighborWithTraversal.filter((x) => {
                return (
                    x.source === NextIDPlatform.LENS &&
                    x.from.platform === NextIDPlatform.Ethereum &&
                    x.to.platform === NextIDPlatform.LENS
                )
            }) || []

        if (connections.length === 0 && PRESET_LENS[lowerCaseId as PresetLensTwitter]) {
            return PRESET_LENS[lowerCaseId as PresetLensTwitter]
        }

        return connections.map((x) => ({
            handle: x.to.identity,
            displayName: x.to.displayName,
            address: x.from.identity,
        }))
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

        const response = await fetchJSON<CreatePayloadResponse>(urlcat(BASE_URL, '/v1/proof/payload'), {
            body: JSON.stringify(requestBody),
            method: 'POST',
        })

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

    async verifyTwitterHandlerByAddress(address: string, handler: string): Promise<boolean> {
        const response = await fetchJSON<{
            statusCode: number
            data?: string[]
            error?: string
        }>(
            urlcat(TWITTER_HANDLER_VERIFY_URL, '/v1/relation/handles', {
                wallet: address.toLowerCase(),
                isVerified: true,
            }),
        )

        if (response.error || !handler || !address) return false

        return response.data?.includes(handler) || response.data?.length === 0
    }
}

function createBindingProofFromProfileQuery(
    platform: NextIDPlatform,
    source: NextIDPlatform,
    identity: string,
    name: string,
    relatedList?: BindingProof[],
): BindingProof {
    return {
        platform,
        source,
        identity,
        name,
        created_at: '',
        invalid_reason: '',
        last_checked_at: '',
        is_valid: true,
        relatedList,
    }
}

// Group all ens
function groupEnsBinding(ensList: NextIDEnsRecord[]) {
    const first = ensList[0]
    return createBindingProofFromProfileQuery(
        NextIDPlatform.ENS,
        NextIDPlatform.ENS,
        first.id,
        first.id,
        ensList
            .slice(1)
            .map((x) => createBindingProofFromProfileQuery(NextIDPlatform.NextID, NextIDPlatform.ENS, x.id, x.id)),
    )
}
