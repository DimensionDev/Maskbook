import type { Storage } from '@masknet/web3-shared-base'
import { ECKeyIdentifier, fromHex, NextIDPlatform, NextIDStorageInfo, toBase64 } from '@masknet/shared-base'
import { NextIDStorage as NextIDStorageProvider } from '@masknet/web3-providers'
import type { Plugin } from '@masknet/plugin-infra/content-script'

export class NextIDStorage implements Storage {
    constructor(
        private namespace: string,
        private personaIdentifier?: ECKeyIdentifier,
        private generateSignResult?: (
            signer: ECKeyIdentifier,
            message: string,
        ) => Promise<Plugin.SNSAdaptor.PersonaSignResult>,
    ) {}

    async get<T>(publicKey: string) {
        const response = await NextIDStorageProvider.get<NextIDStorageInfo<T>>(publicKey)
        if (!response.ok) return
        return response?.val
    }

    async set<T>(key: string, value: T) {
        if (!this.personaIdentifier) throw new Error('')
        const payload = await NextIDStorageProvider.getPayload(
            this.personaIdentifier.publicKeyAsHex,
            NextIDPlatform.NextID,
            key,
            value,
            this.namespace,
        )

        if (!payload?.ok) throw new Error('Invalid payload Error')

        const signResult = await this.generateSignResult?.(this.personaIdentifier, payload.val.signPayload)

        if (!signResult) throw new Error('Failed to sign payload.')

        await NextIDStorageProvider.set(
            payload.val.uuid,
            this.personaIdentifier.publicKeyAsHex,
            toBase64(fromHex(signResult.signature.signature)),
            NextIDPlatform.NextID,
            key,
            payload.val.createdAt,
            value,
            this.namespace,
        )
    }
}
