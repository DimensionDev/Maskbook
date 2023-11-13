/**
 * Document url: https://github.com/nextdotid/kv_server/blob/develop/docs/api.apib
 */
import urlcat from 'urlcat'
import { compact } from 'lodash-es'
import { Err, Ok, type Result } from 'ts-results-es'
import type { NextIDPlatform, NextIDStoragePayload } from '@masknet/shared-base'
import { env } from '@masknet/flags'
import { KV_BASE_URL_DEV, KV_BASE_URL_PROD } from './constants.js'
import { staleNextIDCached } from './helpers.js'
import { fetchCachedJSON, fetchJSON, fetchSquashedJSON } from '../helpers/fetchJSON.js'

interface CreatePayloadResponse {
    uuid: string
    sign_payload: string
    created_at: string
}

const BASE_URL = env.channel === 'stable' && process.env.NODE_ENV === 'production' ? KV_BASE_URL_PROD : KV_BASE_URL_DEV

function formatPatchData(pluginID: string, data: unknown) {
    return {
        [pluginID]: data,
    }
}

export class NextIDStorageProvider {
    /**
     * Get current KV of a persona
     * @param personaPublicKey
     *
     */
    static async getByIdentity<T>(
        personaPublicKey: string,
        platform: NextIDPlatform,
        identity: string,
        pluginID: string,
    ): Promise<Result<T, string>> {
        interface Proof {
            platform: NextIDPlatform
            identity: string
            content: Record<string, T>
        }
        interface Response {
            persona: string
            proofs: Proof[]
        }
        const response = await fetchSquashedJSON<Response | undefined>(
            urlcat(BASE_URL, '/v1/kv', { persona: personaPublicKey }),
        )
        if (!response) return Err('User not found')

        const proofs = (response.proofs ?? [])
            .filter((x) => x.platform === platform)
            .filter((x) => x.identity === identity.toLowerCase())
        if (!proofs.length) return Err('Proof not found')
        return Ok(proofs[0].content[pluginID])
    }

    static async getAllByIdentity<T>(
        platform: NextIDPlatform,
        identity: string,
        pluginID: string,
    ): Promise<Result<T[], string>> {
        interface Proof {
            avatar: string
            content: Record<string, T>
        }

        interface Response {
            values: Proof[]
        }
        const response = await fetchCachedJSON<Response>(urlcat(BASE_URL, '/v1/kv/by_identity', { platform, identity }))
        if (!response) return Err('User not found')

        const result = compact(response.values.map((x) => x.content[pluginID]))
        return Ok(result)
    }
    static async get<T>(personaPublicKey: string): Promise<T> {
        return fetchCachedJSON<T>(urlcat(BASE_URL, '/v1/kv', { persona: personaPublicKey }))
    }
    /**
     * Get signature payload for updating
     * @param personaPublicKey
     * @param platform
     * @param identity
     * @param patchData
     * @param pluginID
     *
     * We choose [RFC 7396](https://www.rfc-editor.org/rfc/rfc7396) standard for KV modifying.
     */
    static async getPayload(
        personaPublicKey: string,
        platform: NextIDPlatform,
        identity: string,
        patchData: unknown,
        pluginID: string,
    ): Promise<Result<NextIDStoragePayload, null>> {
        const requestBody = {
            persona: personaPublicKey,
            platform,
            identity,
            patch: formatPatchData(pluginID, patchData),
        }

        const response = await fetchJSON<CreatePayloadResponse>(urlcat(BASE_URL, '/v1/kv/payload'), {
            body: JSON.stringify(requestBody),
            method: 'POST',
        })

        return response ?
                Ok({
                    signPayload: JSON.stringify(JSON.parse(response.sign_payload)),
                    createdAt: response.created_at,
                    uuid: response.uuid,
                })
            :   Err(null)
    }

    /**
     * Update a full set of key-value pairs
     * @param uuid
     * @param personaPublicKey
     * @param signature
     * @param platform
     * @param identity
     * @param createdAt
     * @param patchData
     * @param pluginID
     *
     * We choose [RFC 7396](https://www.rfc-editor.org/rfc/rfc7396) standard for KV modifying.
     */
    static async set<T>(
        uuid: string,
        personaPublicKey: string,
        signature: string,
        platform: NextIDPlatform,
        identity: string,
        createdAt: string,
        patchData: unknown,
        pluginID: string,
    ): Promise<Result<T, null>> {
        const requestBody = {
            uuid,
            persona: personaPublicKey,
            platform,
            identity,
            signature,
            patch: formatPatchData(pluginID, patchData),
            created_at: createdAt,
        }

        const result = await fetchJSON<T>(urlcat(BASE_URL, '/v1/kv'), {
            body: JSON.stringify(requestBody),
            method: 'POST',
        })

        if (result) {
            await staleNextIDCached(urlcat(BASE_URL, '/v1/kv', { persona: personaPublicKey }))
        }

        return result ? Ok(result) : Err(null)
    }
}
