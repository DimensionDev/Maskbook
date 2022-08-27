import urlcat from 'urlcat'
import { isEmpty, times, sample } from 'lodash-unified'
import { Attachment } from '@dimensiondev/common-protocols'
import { encodeText } from '@dimensiondev/kit'
import { Bee, CollectionEntry } from '@ethersphere/bee-js'
import { landing } from '../constants.js'
import type { ProviderAgent, LandingPageMetadata, AttachmentOptions } from '../types.js'
import { makeFileKeySigned } from '../helpers.js'

const POSTAGE_STAMP = '0'.repeat(64)
const BEE_HOSTS = times(10, (n) => `https://gateway-proxy-bee-${n}-0.gateway.ethswarm.org`)
const BEE_HOST = sample(BEE_HOSTS) ?? BEE_HOSTS[0]

class SwarmAgent implements ProviderAgent {
    static providerName = 'Swarm'

    private bee = new Bee(BEE_HOST)

    async makePayload(data: Uint8Array, type: string, name: string) {
        const isHTML = type === 'text/html'
        if (isHTML) {
            const file: CollectionEntry<Uint8Array> = {
                path: name,
                data,
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

    // currently not native support progress track
    async *upload(id: string) {
        yield 100
    }

    async uploadLandingPage(metadata: LandingPageMetadata) {
        const encodedMetadata = JSON.stringify({
            name: metadata.name,
            size: metadata.size,
            provider: 'swarm',
            link: urlcat(`${BEE_HOST}/bzz`, '/:txId', { txId: metadata.txId }),
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
