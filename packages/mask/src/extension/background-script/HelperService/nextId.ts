import { toHex, PersonaIdentifier, compressSecp256k1Point } from '@masknet/shared-base'
import { queryPublicKey } from '../../../database'
import urlcat from 'urlcat'

const BASE_URL = 'https://js43x8ol17.execute-api.ap-east-1.amazonaws.com/api/'

interface CreatePayloadBody {
    action: string
    platform: string
    identity: string
    public_key: string
}

interface PayloadResponse {
    post_content: string
    sign_payload: string
}

export async function createPersonaPayload(persona: PersonaIdentifier, identity: string, platform: string) {
    const personaPublicKey = await queryPublicKey(persona)
    if (!personaPublicKey?.x || !personaPublicKey?.y) return null
    const arr = compressSecp256k1Point(personaPublicKey.x, personaPublicKey.y)

    const publicKey = toHex(arr)
    const requestBody: CreatePayloadBody = {
        action: 'create',
        platform,
        identity,
        public_key: publicKey,
    }

    const response = await fetch(urlcat(BASE_URL, '/v1/proof/payload'), {
        body: JSON.stringify(requestBody),
        method: 'POST',
        mode: 'cors',
    })

    const result = (await response.json()) as PayloadResponse
    return JSON.stringify(JSON.parse(result.sign_payload))
}
