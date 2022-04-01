import { fetchJSON } from './helper'
import urlcat from 'urlcat'
import { first } from 'lodash-unified'
import {
    BindingProof,
    fromHex,
    NextIDAction,
    NextIDBindings,
    NextIDPayload,
    NextIDPlatform,
    toBase64,
} from '@masknet/shared-base'
import type { NextIDBaseAPI } from '../types'
import { PROOF_BASE_URL_DEV, PROOF_BASE_URL_PROD } from './constants'

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
    post_content: { [key in PostContentLanguages]: string }
    sign_payload: string
    uuid: string
    created_at: string
}

export class NextIDProofAPI implements NextIDBaseAPI.Proof {
    // TODO: remove 'bind' in project for business context.
    bindProof(
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

    async queryExistedBindingByPersona(personaPublicKey: string, enableCache?: boolean) {
        const response = await fetchJSON<NextIDBindings>(
            urlcat(BASE_URL, '/v1/proof', { platform: NextIDPlatform.NextId, identity: personaPublicKey }),
            {},
            enableCache,
        )
        // Will have only one item when query by personaPublicKey
        return first(response.unwrap().ids)
    }

    async queryExistedBindingByPlatform(platform: NextIDPlatform, identity: string, page?: number) {
        if (!platform && !identity) return []

        const response = await fetchJSON<NextIDBindings>(
            urlcat(BASE_URL, '/v1/proof', { platform: platform, identity: identity }),
        )

        // TODO: merge Pagination into this
        return response.unwrap().ids
    }

    async queryIsBound(personaPublicKey: string, platform: NextIDPlatform, identity: string, enableCache?: boolean) {
        if (!platform && !identity) return false

        const result = await fetchJSON<BindingProof>(
            urlcat(BASE_URL, '/v1/proof/exists', {
                platform: platform,
                identity: identity,
                public_key: personaPublicKey,
            }),
            {},
            enableCache,
        )

        return result.map(() => true).unwrapOr(false)
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
            .map((x) => ({
                postContent: x.post_content[nextIDLanguageFormat ?? 'default'] ?? x.post_content.default,
                signPayload: JSON.stringify(JSON.parse(x.sign_payload)),
                createdAt: x.created_at,
                uuid: x.uuid,
            }))
            .unwrapOr(null)
    }
}
