import { Attachment } from '@dimensiondev/common-protocols'
import { encodeText } from '@dimensiondev/kit'
import { create, IPFSHTTPClient } from 'ipfs-http-client'
import { isEmpty } from 'lodash-unified'
import { landing } from '../constants'
import urlcat from 'urlcat'
import type { ProviderAgent, LandingPageMetadata, AttachmentOptions } from '../types'
import { makeFileKeySigned } from '../helpers'

function creatClient(): IPFSHTTPClient {
    return create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
    })
}

export class IPFSAgent implements ProviderAgent {
    static providerName = 'IPFS'
    client: IPFSHTTPClient
    constructor() {
        this.client = creatClient()
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
        return 100
    }

    async uploadLandingPage(metadata: LandingPageMetadata) {
        const linkPrefix: string = 'https://ipfs.infura.io/ipfs'
        const encodedMetadata = JSON.stringify({
            name: metadata.name,
            size: metadata.size,
            link: urlcat(linkPrefix, '/:txId', { txId: metadata.txId }),
            signed: await makeFileKeySigned(metadata.key),
            createdAt: new Date().toISOString(),
        })
        const response = await fetch(landing)
        const text = await response.text()
        const replaced = text
            .replace('Arweave', IPFSAgent.providerName)
            .replace('Over Arweave', `Over ${IPFSAgent.providerName}`)
            .replace('__METADATA__', encodedMetadata)
        const data = encodeText(replaced)
        return this.makePayload(data, 'text/html')
    }

    async makePayload(data: Uint8Array, type: string) {
        const file = await this.client.add(data)
        return file.cid.toString()
    }
}

export default new IPFSAgent()
