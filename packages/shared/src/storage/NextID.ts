import type { Storage } from '@masknet/web3-shared-base'
import { ECKeyIdentifier, fromHex, NextIDPlatform, NextIDStorageInfo, toBase64 } from '@masknet/shared-base'
import { NextIDStorage as NextIDStorageProvider } from '@masknet/web3-providers'
import type { Plugin } from '@masknet/plugin-infra/content-script'

export class NextIDStorage implements Storage {
    constructor(
        private namespace: string, // identity key
        private platform: NextIDPlatform,
        private personaIdentifier: ECKeyIdentifier,
        private generateSignResult?: (
            signer: ECKeyIdentifier,
            message: string,
        ) => Promise<Plugin.SNSAdaptor.PersonaSignResult>,
    ) {}

    get publicKey() {
        return this.personaIdentifier.publicKeyAsHex
    }

    async get<T>(key: string) {
        const response = await NextIDStorageProvider.get<NextIDStorageInfo<T>>(this.publicKey)
        if (!response.ok) return
        const { proofs } = response.val
        if (!proofs.length) return
        return proofs.find(
            (x) =>
                x.platform === this.platform &&
                x.identity === this.namespace &&
                Object.hasOwnProperty.call(x.content, key),
        )?.content[key]
    }

    async set<T>(key: string, value: T) {
        if (!this.personaIdentifier) throw new Error('')
        const payload = await NextIDStorageProvider.getPayload(
            this.publicKey,
            NextIDPlatform.NextID,
            this.namespace, // identity
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
            NextIDPlatform.NextID,
            this.namespace,
            payload.val.createdAt,
            value,
            key,
        )
    }
}
