import { isEmpty } from 'lodash-es'
import { Attachment } from '@dimensiondev/common-protocols'
import { encodeText } from '@masknet/kit'
import { BundlerSDK } from 'bundler-upload-sdk'
import { LANDING_PAGE, Provider } from '../constants.js'
import type { ProviderAgent, LandingPageMetadata, AttachmentOptions } from '../types.js'
import { makeFileKeySigned } from '../helpers.js'

// WeaveVM configuration
const WEAVEVM_UPLOAD_ENDPOINT = 'https://mechanism-gi3c.shuttle.app/'
const WEAVEVM_GATEWAY_URL = 'https://gateway.wvm.network/bundle'
const API_KEY = process.env.WEAVEVM_API_KEY || 'd025e132382aea412f4256049c13d0e92d5c64095d1c88e1f5de7652966b69af'

class WeaveVMAgent implements ProviderAgent {
    static providerName = 'WeaveVM'
    bundlerSDK!: BundlerSDK

    init() {
        if (this.bundlerSDK) return
        this.bundlerSDK = new BundlerSDK(WEAVEVM_UPLOAD_ENDPOINT, API_KEY)
    }

    async makeAttachment(options: AttachmentOptions) {
        this.init()
        const passphrase = options.key ? encodeText(options.key) : undefined
        const encoded = await Attachment.encode(passphrase, {
            block: options.block,
            mime: isEmpty(options.type) ? 'application/octet-stream' : options.type,
            metadata: null,
        })
        const txId = await this.makePayload(encoded, isEmpty(options.type) ? 'application/octet-stream' : options.type)

        return txId
    }

    async *upload(id: string) {
        yield 100
    }

    async uploadLandingPage(metadata: LandingPageMetadata) {
        this.init()
        const linkPrefix = WEAVEVM_GATEWAY_URL
        const encodedMetadata = JSON.stringify({
            name: metadata.name,
            size: metadata.size,
            provider: Provider.WeaveVM, // Ensure this constant is updated in Mask's constants.js
            link: `${linkPrefix}/${metadata.txId}/0`,
            signed: await makeFileKeySigned(metadata.key),
            createdAt: new Date().toISOString(),
        })
        const response = await fetch(LANDING_PAGE)
        const text = await response.text()
        const replaced = text
            .replace('Arweave', WeaveVMAgent.providerName)
            .replace('Over Arweave', `Over ${WeaveVMAgent.providerName}`)
            .replace('__METADATA__', encodedMetadata)
        const data = encodeText(replaced)
        return this.makePayload(data, 'text/html')
    }

    async makePayload(data: Uint8Array, type: string) {
        this.init()

        try {
            // Prepare tags - set the MIME type as required
            const tags = {
                'Content-Type': type,
                'App-Name': 'Mask-Network',
            }

            // Upload file with tags
            const txHash = await this.bundlerSDK.upload([
                {
                    file: Buffer.from(data),
                    tags,
                },
            ])

            return txHash
        } catch (error) {
            const enhancedError = new Error(
                `WeaveVM upload failed: ${error instanceof Error ? error.message : String(error)}`,
            )
            if (error instanceof Error && error.stack) {
                enhancedError.stack = error.stack
            }

            throw enhancedError
        }
    }
}

export default new WeaveVMAgent()
