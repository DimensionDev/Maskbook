import { isEmpty } from 'lodash-es'
import { Attachment } from '@dimensiondev/common-protocols'
import { encodeText } from '@masknet/kit'
import { BundlerSDK } from 'bundler-upload-sdk/browser'
import { LANDING_PAGE, Provider } from '../constants.js'
import type { ProviderAgent, LandingPageMetadata, AttachmentOptions } from '../types.js'
import { makeFileKeySigned } from '../helpers.js'

const WEAVEVM_GATEWAY_URL = 'https://gateway.wvm.network/bundle'
const WEAVEVM_UPLOAD_ENDPOINT = 'https://mechanism-gi3c.shuttle.app/'
const API_KEY = 'd025e132382aea412f4256049c13d0e92d5c64095d1c88e1f5de7652966b69af' // move to env

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

        const effectiveType = isEmpty(options.type) ? 'application/octet-stream' : options.type
        const effectiveName = options.name || 'unnamed_file'
        const txId = await this.makePayload(encoded, effectiveType, effectiveName)

        return txId
    }

    // no native support for progress tracking with WeaveVM
    async *upload(id: string) {
        yield 100
    }

    async uploadLandingPage(metadata: LandingPageMetadata) {
        this.init()
        const linkPrefix = WEAVEVM_GATEWAY_URL
        const encodedMetadata = JSON.stringify({
            name: metadata.name,
            size: metadata.size,
            provider: Provider.WeaveVM,
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

        const landingPageTxId = await this.makePayload(data, 'text/html', `${metadata.name}-landing.html`)

        return landingPageTxId
    }

    async makePayload(data: Uint8Array, type: string, fileName: string = 'file.dat') {
        this.init()

        try {
            const tags = {
                'Content-Type': type,
                Filename: fileName,
                'App-Name': 'Mask-Network',
                'App-Version': '1.0.0',
            }

            const blob = new Blob([data], { type })
            const txHash = await this.bundlerSDK.upload([
                {
                    file: blob,
                    tags,
                },
            ])

            return txHash
        } catch (error) {
            const errorMessage = `WeaveVM upload failed: ${error instanceof Error ? error.message : String(error)}`
            console.error('WeaveVM detailed error:', errorMessage)

            const enhancedError = new Error(errorMessage)
            if (error instanceof Error && error.stack) {
                enhancedError.stack = error.stack
            }

            throw enhancedError
        }
    }
}

export default new WeaveVMAgent()
