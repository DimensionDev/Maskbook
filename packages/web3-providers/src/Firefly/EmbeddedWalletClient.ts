import { getFireflyAccessToken, PersistentStorages } from '@masknet/shared-base'
import { isHex } from 'viem'
import urlcat from 'urlcat'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { FIREFLY_BASE_URL } from './constants.js'
import type {
    CreatedEmbeddedUser,
    EmbeddedLinkedAccount,
    EmbeddedUser,
    EvmTransaction,
    FireflyResponse,
    PersonalSignResult,
    SendTransactionResult,
    SignEncoding,
    SignTransactionResult,
    SignTypedDataResult,
} from '../types/FireflyEmbedded.js'

function getAccessToken(): string | undefined {
    return getFireflyAccessToken(PersistentStorages.Settings.storage.firefly_account.value)
}

async function fireflyRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
    const accessToken = getAccessToken()
    if (!accessToken) throw new Error('Not signed in to Firefly.')

    const headers: { [headerName: string]: string } = {
        Authorization: `Bearer ${accessToken}`,
        ...(init.headers as { [property: string]: string } | undefined),
    }
    if (init.body && !headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json'
    }

    const response = await fetchJSON<FireflyResponse<T>>(urlcat(FIREFLY_BASE_URL, path), { ...init, headers })
    if (response.error) {
        const raw = response.error
        const message =
            Array.isArray(raw) ? raw[0]
            : typeof raw === 'string' ? raw
            : 'Firefly request failed.'
        throw new Error(message)
    }
    return response.data as T
}

/**
 * REST client for the Firefly embedded wallet backend. Replaces the former
 * `@privy-io/react-auth` SDK + Privy auth proxy. Every call is authenticated
 * with the Firefly access token stored in settings.
 */
class EmbeddedWalletClient {
    /** Idempotently creates / retrieves the embedded wallet, returns the EVM address. */
    async ensureEmbeddedWallet(): Promise<string | undefined> {
        const created = await fireflyRequest<CreatedEmbeddedUser>('/v1/user/create/privy/user', { method: 'POST' })
        const evm = created.wallets.find((w) => w.chain !== 'solana')
        return evm?.publicAddress
    }

    /** Lists embedded accounts (does not auto-create). */
    async getEmbeddedWallets(): Promise<EmbeddedLinkedAccount[]> {
        const user = await fireflyRequest<EmbeddedUser>('/v1/privy-api/user')
        return user.linked_accounts.filter((x) => x.chain_type === 'ethereum')
    }

    /** `POST /v1/privy/eth/personal-sign`. */
    async personalSign(message: string, encoding?: SignEncoding): Promise<string> {
        // eslint-disable-next-line unicorn/text-encoding-identifier-case
        const resolved: SignEncoding = encoding ?? (isHex(message) ? 'hex' : 'utf-8')
        const result = await fireflyRequest<PersonalSignResult>('/v1/privy/eth/personal-sign', {
            method: 'POST',
            body: JSON.stringify({ message, encoding: resolved }),
        })
        return result.signature
    }

    /** `POST /v1/privy/eth/sign-typed-data-v4`. */
    async signTypedDataV4(jsonStr: string): Promise<string> {
        const result = await fireflyRequest<SignTypedDataResult>('/v1/privy/eth/sign-typed-data-v4', {
            method: 'POST',
            body: JSON.stringify({ json_str: jsonStr }),
        })
        return result.signature
    }

    /** `POST /v1/privy/eth/sign-transaction`. */
    async signTransaction(transaction: EvmTransaction): Promise<string> {
        const result = await fireflyRequest<SignTransactionResult>('/v1/privy/eth/sign-transaction', {
            method: 'POST',
            body: JSON.stringify({ transaction }),
        })
        return result.signedTransaction
    }

    /** `POST /v1/privy/eth/send-transaction`. */
    async sendTransaction(transaction: EvmTransaction): Promise<string> {
        const result = await fireflyRequest<SendTransactionResult>('/v1/privy/eth/send-transaction', {
            method: 'POST',
            body: JSON.stringify({ transaction }),
        })
        return result.hash
    }
}

export const FireflyEmbeddedWalletClient = new EmbeddedWalletClient()
