import urlcat from 'urlcat'
import { isEmpty } from 'lodash-es'
import { Attachment } from '@dimensiondev/common-protocols'
import { encodeText } from '@masknet/kit'
import { create, type IPFSHTTPClient } from 'ipfs-http-client'
import { LANDING_PAGE, Provider } from '../constants.js'
import type { ProviderAgent, LandingPageMetadata, AttachmentOptions } from '../types.js'
import { makeFileKeySigned } from '../helpers.js'

function createClient(): IPFSHTTPClient {
    return create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            authorization: 'Basic MkRZaG10eThyM21DOWl5dE5tdG9ZdkdmWkxiOmM5YjVlOTRmNjM1OTdiMGEyNmJhY2RlNmI3NTgxOTgx',
        },
    })
}

class IPFSAgent implements ProviderAgent {
    static providerName = 'IPFS'
    client!: IPFSHTTPClient

    init() {
        if (this.client) return
        this.client = createClient()
    }

    async makeAttachment(options: AttachmentOptions) {
        const passphrase = options.key ? encodeText(options.key) : undefined
        const encoded = await Attachment.encode(passphrase, {
            block: options.block,
            mime: isEmpty(options.type) ? 'application/octet-stream' : options.type,
            metadata: null,
        })
        return this.makePayload(encoded, 'application/octet-stream')
    }

    // currently not native support progress track
    async *upload(id: string) {
        yield 100
    }

    async uploadLandingPage(metadata: LandingPageMetadata) {
        const linkPrefix = 'https://mask.infura-ipfs.io/ipfs'
        const encodedMetadata = JSON.stringify({
            name: metadata.name,
            size: metadata.size,
            provider: Provider.IPFS,
            link: urlcat(linkPrefix, '/:txId', { txId: metadata.txId }),
            signed: await makeFileKeySigned(metadata.key),
            createdAt: new Date().toISOString(),
        })
        const response = await fetch(LANDING_PAGE)
        const text = await response.text()
        const replaced = text
            .replace('Arweave', IPFSAgent.providerName)
            .replace('Over Arweave', `Over ${IPFSAgent.providerName}`)
            .replace('__METADATA__', encodedMetadata)
        const data = encodeText(replaced)
        return this.makePayload(data, 'text/html')
    }

    async makePayload(data: Uint8Array, type: string) {
        this.init()
        const file = await this.client.add(data)
        return file.cid.toString()
    }
}

export default new IPFSAgent()
