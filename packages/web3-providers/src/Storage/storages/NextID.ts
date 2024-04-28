import { type ECKeyIdentifier, fromHex, type NextIDPlatform, SignType, toBase64 } from '@masknet/shared-base'
import { NextIDStorageProvider as Storage } from '../../NextID/kv.js'
import type { StorageAPI, WalletAPI } from '../../entry-types.js'

export class NextIDStorage implements StorageAPI.Storage {
    private publicKeyAsHex = ''
    private signer: ECKeyIdentifier | null = null

    constructor(
        private proofIdentity: string, // proof identity as key
        private platform: NextIDPlatform, // proof platform
        private signerOrPublicKey: string | ECKeyIdentifier, // publicKey, like SocialIdentity publicKey or PersonaIdentifier publicKeyAsHex
        private signWithPersona?: WalletAPI.SignWithPersona,
    ) {
        if (typeof this.signerOrPublicKey === 'string') {
            this.publicKeyAsHex = this.signerOrPublicKey
        } else {
            this.publicKeyAsHex = this.signerOrPublicKey.publicKeyAsHex
            this.signer = this.signerOrPublicKey
        }
    }

    async has(key: string) {
        return !!this.get(key)
    }

    async get<T>(key: string) {
        const response = await Storage.getByIdentity<T>(this.publicKeyAsHex, this.platform, this.proofIdentity, key)

        if (!response.isOk()) return

        return response.value
    }

    async getAll<T>(key: string) {
        const response = await Storage.getAllByIdentity<T>(this.platform, this.proofIdentity, key)

        if (!response.isOk()) return

        return response.value
    }

    async set<T>(key: string, value: T) {
        if (!this.signer) throw new Error('signer is requirement when set data to NextID Storage')

        const payload = await Storage.getPayload(
            this.publicKeyAsHex,
            this.platform,
            this.proofIdentity, // identity
            value,
            key,
        )

        if (!payload.isOk()) throw new Error('Invalid payload Error')

        const signature = await this.signWithPersona?.(SignType.Message, payload.value.signPayload, this.signer, true)
        if (!signature) throw new Error('Failed to sign payload.')

        await Storage.set(
            payload.value.uuid,
            this.publicKeyAsHex,
            toBase64(fromHex(signature)),
            this.platform,
            this.proofIdentity,
            payload.value.createdAt,
            value,
            key,
        )

        return
    }
}
