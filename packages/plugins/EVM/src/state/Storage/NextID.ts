import type { Storage } from '@masknet/web3-shared-base'
import { ECKeyIdentifier, fromHex, NextIDPlatform, toBase64 } from '@masknet/shared-base'
import { NextIDStorage as NextIDStorageProvider } from '@masknet/web3-providers'
import { SharedContextSettings } from '../../settings'

type KV<T> = {
    persona: string
    proofs: {
        platform: NextIDPlatform
        identity: string
        content?: Record<string, T>
    }
}
class NextIDStorage extends Storage {
    constructor(private namespace: string, private personaIdentifier: ECKeyIdentifier) {
        super()
    }

    get publicKey() {
        return this.personaIdentifier.publicKeyAsHex
    }

    async get<T>() {
        const response = await NextIDStorageProvider.get<KV<T>>(this.publicKey)
        if (!response.ok) return
        return response?.val
    }

    async set<T>(key: string, value: T) {
        const payload = await NextIDStorageProvider.getPayload(
            this.publicKey,
            NextIDPlatform.NextID,
            this.publicKey,
            value,
            this.namespace,
        )

        if (!payload?.ok) throw new Error('Invalid payload Error')

        const signResult = await SharedContextSettings.value.generateSignResult(
            this.personaIdentifier,
            payload.val.signPayload,
        )

        if (!signResult) throw new Error('Failed to sign payload.')

        await NextIDStorageProvider.set(
            payload.val.uuid,
            this.publicKey,
            toBase64(fromHex(signResult.signature.signature)),
            NextIDPlatform.NextID,
            this.publicKey,
            payload.val.createdAt,
            value,
            this.namespace,
        )
    }
}
