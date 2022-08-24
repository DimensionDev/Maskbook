import type { Storage } from '@masknet/web3-shared-base'
import { ECKeyIdentifier, fromHex, NextIDPlatform, toBase64 } from '@masknet/shared-base'
import { NextIDStorage as NextIDStorageProvider } from '@masknet/web3-providers'
import type { Plugin } from '@masknet/plugin-infra/content-script'

export class NextIDStorage implements Storage {
    constructor(
        private proofIdentity: string, // proof identity as key
        private platform: NextIDPlatform, // proof platform
        private publicKeyAsHex: string, // publicKey, like SocialIdentity publicKey or PersonaIdentifier publicKeyAsHex
        private signer?: ECKeyIdentifier, // persona identifier
        private generateSignResult?: (
            signer: ECKeyIdentifier,
            message: string,
        ) => Promise<Plugin.SNSAdaptor.PersonaSignResult>,
    ) {}

    async has(key: string) {
        return !!this.get(key)
    }

    async get<T>(key: string) {
        const response = await NextIDStorageProvider.getByIdentity<T>(
            this.publicKeyAsHex,
            this.platform,
            this.proofIdentity,
            key,
        )

        if (!response.ok) return

        return response.val
    }

    async getAll<T>(key: string) {
        const response = await NextIDStorageProvider.getAllByIdentity<T>(this.platform, this.proofIdentity, key)

        if (!response.ok) return

        return response.val
    }

    async set<T>(key: string, value: T) {
        if (!this.signer) throw new Error('signer is requirement when set data to NextID Storage')

        const payload = await NextIDStorageProvider.getPayload(
            this.publicKeyAsHex,
            this.platform,
            this.proofIdentity, // identity
            value,
            key,
        )

        if (!payload?.ok) throw new Error('Invalid payload Error')

        const signResult = await this.generateSignResult?.(this.signer, payload.val.signPayload)

        if (!signResult) throw new Error('Failed to sign payload.')

        await NextIDStorageProvider.set(
            payload.val.uuid,
            this.publicKeyAsHex,
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
