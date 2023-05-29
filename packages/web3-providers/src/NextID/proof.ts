import urlcat from 'urlcat'
import { first, sortBy, uniqBy, uniqWith } from 'lodash-es'
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
    createBindingProofFromProfileQuery,
    EMPTY_LIST,
} from '@masknet/shared-base'
import {
    PROOF_BASE_URL_DEV,
    PROOF_BASE_URL_PROD,
    RELATION_SERVICE_URL_DEV,
    RELATION_SERVICE_URL_PROD,
} from './constants.js'
import { staleNextIDCached } from './helpers.js'
import PRESET_LENS from './preset-lens.json'
import { fetchJSON } from '../entry-helpers.js'
import type { NextIDBaseAPI } from '../entry-types.js'

const BASE_URL =
    process.env.channel === 'stable' && process.env.NODE_ENV === 'production' ? PROOF_BASE_URL_PROD : PROOF_BASE_URL_DEV

const RELATION_SERVICE_URL =
    process.env.channel === 'stable' && process.env.NODE_ENV === 'production'
        ? RELATION_SERVICE_URL_PROD
        : RELATION_SERVICE_URL_DEV

const relationServiceQuery = `  domain(domainSystem: "ENS", name: $domain) {
        source
        system
        name
        fetcher
        resolved {
          identity
          platform
          displayName
        }
        owner {
          identity
          platform
          displayName
          neighborWithTraversal(depth: 5) {
            ... on ProofRecord {
              __typename
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
    }`
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

type NeighborList = Array<{
    source: NextIDPlatform
    to: NextIDIdentity
    from: NextIDIdentity
}>

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
    fetchFromProofService<T>(request: Request | RequestInfo, init?: RequestInit) {
        return fetchJSON<T>(request, init, { enableSquash: true, enableCache: true })
    }

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
        const { ids } = await this.fetchFromProofService<NextIDBindings>(
            getPersonaQueryURL(NextIDPlatform.NextID, personaPublicKey),
        )
        // Will have only one item when query by personaPublicKey
        return first(ids)
    }

    async queryExistedBindingByPlatform(platform: NextIDPlatform, identity: string, page = 1) {
        if (!platform && !identity) return []

        const response = await this.fetchFromProofService<NextIDBindings>(
            urlcat(BASE_URL, '/v1/proof', {
                platform,
                identity,
                page,
                exact: true,
                // TODO workaround for the API, and will sort the result manually
                // sort: 'activated_at',
                // order: 'desc',
            }),
        )

        return sortBy(response.ids, (x) => -x.activated_at)
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
            const result = await this.fetchFromProofService<NextIDBindings>(
                urlcat(BASE_URL, '/v1/proof', {
                    platform,
                    identity,
                    exact,
                    page,
                    order: 'desc',
                }),
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

            const result = await this.fetchFromProofService<BindingProof | undefined>(
                getExistedBindingQueryURL(platform, identity, personaPublicKey),
            )
            return !!result?.is_valid
        } catch {
            return false
        }
    }

    async queryProfilesByDomain(domain: string) {
        const { data } = await fetchJSON<{
            data: {
                domain: {
                    owner: {
                        neighborWithTraversal: NeighborList
                    }
                } | null
            }
        }>(
            RELATION_SERVICE_URL,
            {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({
                    operationName: 'GET_PROFILES_QUERY',
                    variables: { domain: domain.toLowerCase() },
                    query: `
                    query GET_PROFILES_QUERY($domain: String) {
                      ${relationServiceQuery}
                    }
                `,
                }),
            },
            { enableSquash: true },
        )

        if (!data.domain) return EMPTY_LIST
        const bindings = createBindProofsFromNeighbor(data.domain.owner.neighborWithTraversal, [])

        return uniqWith(bindings, (a, b) => a.identity === b.identity && a.platform === b.platform).filter(
            (x) => ![NextIDPlatform.Ethereum, NextIDPlatform.NextID].includes(x.platform) && x.identity,
        )
    }

    async queryProfilesByTwitterId(twitterId: string) {
        const { data } = await fetchJSON<{
            data: {
                domain: {
                    owner: {
                        neighborWithTraversal: NeighborList
                    }
                } | null
            }
        }>(
            RELATION_SERVICE_URL,
            {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({
                    operationName: 'GET_PROFILES_BY_TWITTER_ID',
                    variables: { identity: twitterId.toLowerCase() },
                    query: `
                        query GET_PROFILES_BY_TWITTER_ID($identity: String) {
                          ${relationServiceQuery}
                        }
                `,
                }),
            },
            { enableSquash: true },
        )

        if (!data.domain) return EMPTY_LIST
        const bindings = createBindProofsFromNeighbor(data.domain.owner.neighborWithTraversal, [])

        return uniqWith(bindings, (a, b) => a.identity === b.identity && a.platform === b.platform).filter(
            (x) => ![NextIDPlatform.Ethereum, NextIDPlatform.NextID].includes(x.platform) && x.identity,
        )
    }

    async queryAllLens(twitterId: string): Promise<NextIDBaseAPI.LensAccount[]> {
        const lowerCaseId = twitterId.toLowerCase()
        const { data } = await fetchJSON<{
            data: {
                domain: {
                    owner: {
                        neighborWithTraversal: NeighborList
                    }
                } | null
            }
        }>(
            RELATION_SERVICE_URL,
            {
                method: 'POST',
                mode: 'cors',
                body: JSON.stringify({
                    operationName: 'GET_LENS_PROFILES',
                    variables: { identity: lowerCaseId },
                    query: `
                        query GET_LENS_PROFILES($identity: String) {
                            ${relationServiceQuery}
                        }
                `,
                }),
            },
            { enableSquash: true },
        )

        const connectionsTo =
            data.domain?.owner.neighborWithTraversal.filter((x) => x.to.platform === NextIDPlatform.LENS) || []

        const connectionsFrom =
            data.domain?.owner.neighborWithTraversal.filter((x) => x.from.platform === NextIDPlatform.LENS) || []

        const id = lowerCaseId as keyof typeof PRESET_LENS
        if (connectionsTo.length === 0 && connectionsFrom.length === 0 && PRESET_LENS[id]) {
            return PRESET_LENS[id]
        }

        return uniqBy(
            connectionsTo
                .map((x) => ({
                    handle: x.to.identity,
                    displayName: x.to.displayName,
                    address: x.to.identity,
                }))
                .concat(
                    connectionsFrom.map((x) => ({
                        handle: x.from.identity,
                        displayName: x.from.displayName,
                        address: x.from.identity,
                    })),
                ),
            (x) => x.handle,
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
}

// Group all ens
function groupEnsBinding(ensList: NextIDEnsRecord[]) {
    const first = ensList[0]
    return createBindingProofFromProfileQuery(
        NextIDPlatform.ENS,
        first.id,
        first.id,
        undefined,
        NextIDPlatform.ENS,
        ensList
            .slice(1)
            .map((x) =>
                createBindingProofFromProfileQuery(NextIDPlatform.NextID, x.id, x.id, undefined, NextIDPlatform.ENS),
            ),
    )
}

function createBindProofsFromNeighbor(neighborList: NeighborList, ensList: NextIDEnsRecord[]): BindingProof[] {
    const bindings = neighborList
        .map((x) =>
            createBindingProofFromProfileQuery(x.to.platform, x.to.identity, x.to.displayName, undefined, x.source),
        )
        .concat(
            neighborList.map((x) =>
                createBindingProofFromProfileQuery(
                    x.from.platform,
                    x.from.identity,
                    x.from.displayName,
                    undefined,
                    x.source,
                ),
            ),
        )

    if (ensList.length) {
        bindings.unshift(groupEnsBinding(uniqBy(ensList, (x) => x.id)))
    }

    return bindings
}
