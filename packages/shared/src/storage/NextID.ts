import type { Storage } from '@masknet/web3-shared-base'
import { ECKeyIdentifier, fromHex, NextIDPlatform, toBase64 } from '@masknet/shared-base'
import { NextIDStorage as NextIDStorageProvider } from '@masknet/web3-providers'
import type { Plugin } from '@masknet/plugin-infra/content-script'

export class NextIDStorage implements Storage {
    constructor(
        private proofIdentity: string, // proof identity as key
        private platform: NextIDPlatform, // proof platform
        private personaIdentifier: ECKeyIdentifier,
        private generateSignResult?: (
            signer: ECKeyIdentifier,
            message: string,
        ) => Promise<Plugin.SNSAdaptor.PersonaSignResult>,
    ) {}

    get publicKey() {
        return this.personaIdentifier.publicKeyAsHex
    }

    async has(key: string) {
        return !!this.get(key)
    }

    async get<T>(key: string) {
        const response = await NextIDStorageProvider.getByIdentity<T>(
            this.publicKey,
            this.platform,
            this.proofIdentity,
            key,
        )

        if (!response.ok) return

        return response.val
    }

    async set<T>(key: string, value: T) {
        const payload = await NextIDStorageProvider.getPayload(
            this.publicKey,
            this.platform,
            this.proofIdentity, // identity
            value,
            key,
        )

        if (!payload?.ok) throw new Error('Invalid payload Error')

        const signResult = await this.generateSignResult?.(this.personaIdentifier, payload.val.signPayload)

        if (!signResult) throw new Error('Failed to sign payload.')

        await NextIDStorageProvider.set(
            payload.val.uuid,
            this.publicKey,
            toBase64(fromHex(signResult.signature.signature)),
            this.platform,
            this.proofIdentity,
            payload.val.createdAt,
            value,
            key,
        )

        return
    }
}
