import { Attachment } from '@dimensiondev/common-protocols'
import { encodeText } from '@dimensiondev/kit'
import { Bee, CollectionEntry } from '@ethersphere/bee-js'
import urlcat from 'urlcat'
import { isEmpty } from 'lodash-unified'
import { landing } from '../constants'
import type { ProviderAgent, LandingPageMetadata, AttachmentOptions } from '../types'
import { makeFileKeySigned } from '../helpers'

const POSTAGE_STAMP = '0000000000000000000000000000000000000000000000000000000000000000'
const BEE_HOSTS: string[] = [
    'https://bee-0.gateway.ethswarm.org',
    'https://bee-1.gateway.ethswarm.org',
    'https://bee-2.gateway.ethswarm.org',
    'https://bee-3.gateway.ethswarm.org',
    'https://bee-4.gateway.ethswarm.org',
    'https://bee-5.gateway.ethswarm.org',
    'https://bee-6.gateway.ethswarm.org',
    'https://bee-7.gateway.ethswarm.org',
    'https://bee-8.gateway.ethswarm.org',
    'https://bee-9.gateway.ethswarm.org',
]

function createBee(): Bee {
    const randomIndex = Math.floor(Math.random() * BEE_HOSTS.length)
    return new Bee(BEE_HOSTS[randomIndex])
}

export class SwarmAgent implements ProviderAgent {
    static providerName = 'Swarm'
    bee: Bee

    constructor() {
        this.bee = createBee()
    }

    async makePayload(data: Uint8Array, type: string, name: string) {
        const isHTML = type === 'text/html'
        if (isHTML) {
            const file: CollectionEntry<Uint8Array> = {
                path: name,
                data: data,
            }
            const { reference } = await this.bee.uploadCollection(POSTAGE_STAMP, [file], {
                encrypt: false,
                indexDocument: name,
            })
            return reference
        }
        const { reference } = await this.bee.uploadFile(POSTAGE_STAMP, data, name, {
            encrypt: false,
            size: data.length,
            contentType: type,
        })
        return reference
    }

    async makeAttachment(options: AttachmentOptions) {
        const passphrase = options.key ? encodeText(options.key) : undefined
        const encoded = await Attachment.encode(passphrase, {
            block: options.block,
            mime: isEmpty(options.type) ? 'application/octet-stream' : options.type,
            metadata: null,
        })
        return this.makePayload(encoded, 'application/octet-stream', options.name)
    }

    async *upload(id: string) {
        return 100
    }

    async uploadLandingPage(metadata: LandingPageMetadata) {
        const linkPrefix: string = 'https://bee-2.gateway.ethswarm.org/bzz'
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
            .replace('Arweave', SwarmAgent.providerName)
            .replace('Over Arweave', `Over ${SwarmAgent.providerName}`)
            .replace('__METADATA__', encodedMetadata)
        const data = encodeText(replaced)
        return this.makePayload(data, 'text/html', 'landing.html')
    }
}

export default new SwarmAgent()
