import { isEmpty } from 'lodash-es'
import Arweave from 'arweave/web'
import { Attachment } from '@dimensiondev/common-protocols'
import { encodeText } from '@masknet/kit'
import type Transaction from 'arweave/web/lib/transaction.js'
import type { JWKInterface } from 'arweave/web/lib/wallet.js'
import { fetchText } from '@masknet/web3-providers/helpers'
import { LANDING_PAGE, MESON_PREFIX, Provider } from '../constants.js'
import { sign } from './remote-signing.js'
import TOKEN from './arweave-token.json' with { type: 'json' }
import type { ProviderAgent, LandingPageMetadata, AttachmentOptions } from '../types.js'
import { makeFileKeySigned } from '../helpers.js'

class ArweaveAgent implements ProviderAgent {
    instance!: Arweave.default
    static stage: Record<Transaction.default['id'], Transaction.default> = {}

    init() {
        if (this.instance) return
        // Note: ESM interop
        this.instance = (Arweave.default || Arweave).init({
            host: 'arweave.net',
            port: 443,
            protocol: 'https',
        })
    }

    async makeAttachment(options: AttachmentOptions) {
        this.init()
        const passphrase = options.key ? encodeText(options.key) : undefined
        const encoded = await Attachment.encode(passphrase, {
            block: options.block,
            mime: isEmpty(options.type) ? 'application/octet-stream' : options.type,
            metadata: null,
        })
        const transaction = await this.makePayload(encoded, 'application/octet-stream')
        ArweaveAgent.stage[transaction.id] = transaction
        await this.instance.transactions.post(transaction)
        return transaction.id
    }

    async uploadLandingPage(metadata: LandingPageMetadata) {
        this.init()
        let linkPrefix = 'https://arweave.net'
        if (metadata.useCDN) {
            linkPrefix = MESON_PREFIX
        }
        const encodedMetadata = JSON.stringify({
            name: metadata.name,
            size: metadata.size,
            provider: Provider.Arweave,
            link: `${linkPrefix}/${metadata.txId}`,
            signed: await makeFileKeySigned(metadata.key),
            createdAt: new Date().toISOString(),
        })
        const text = await fetchText(LANDING_PAGE)
        const replaced = text.replace('__METADATA__', encodedMetadata)
        const data = encodeText(replaced)
        const transaction = await this.makePayload(data, 'text/html')
        await this.instance.transactions.post(transaction)
        return transaction.id
    }

    async *upload(id: Transaction.default['id']) {
        this.init()
        for await (const uploader of this.instance.transactions.upload(ArweaveAgent.stage[id], new Uint8Array())) {
            yield uploader.pctComplete
        }
    }

    async makePayload(data: Uint8Array, type: string) {
        this.init()
        const transaction = await this.instance.createTransaction({ data }, TOKEN as JWKInterface)
        transaction.addTag('Content-Type', type)
        await sign(transaction)
        return transaction
    }
}

export default new ArweaveAgent()
