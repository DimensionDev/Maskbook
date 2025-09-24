import { isEmpty } from 'lodash-es'
import { Attachment } from '@dimensiondev/common-protocols'
import { encodeText } from '@masknet/kit'
import { LANDING_PAGE, Provider } from '../constants.js'
import type { ProviderAgent, LandingPageMetadata, AttachmentOptions } from '../types.js'
import { LOAD_LEGACY_GATEWAY_URL, LOAD_LEGACY_ID_REGEX, makeFileKeySigned } from '../helpers.js'

const LOAD_GATEWAY_URL = 'https://load-s3-agent.load.network'
const LOAD_UPLOAD_ENDPOINT = 'https://load-s3-agent.load.network/upload'

class LoadAgent implements ProviderAgent {
    static providerName = 'Load Network'
    private uploadController?: AbortController

    init() {
        this.uploadController = new AbortController()
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
        const payloadTxID = await this.makePayload(encoded, effectiveType, effectiveName)
        return payloadTxID
    }

    async *upload(id: string) {
        try {
            // Since we're using optimistic upload, we can yield progress immediately
            // The actual upload to Load Network happens in the background
            yield 50
            yield 100
        } catch (error) {
            console.error('Upload progress tracking failed:', error)
            throw error
        } finally {
            if (this.uploadController) {
                this.uploadController.abort()
                this.uploadController = undefined
            }
        }
    }

    async uploadLandingPage(metadata: LandingPageMetadata) {
        this.init()
        // decide which gateway URL to use based on ID
        const linkPrefix = LOAD_LEGACY_ID_REGEX.test(metadata.txId) ? LOAD_LEGACY_GATEWAY_URL : LOAD_GATEWAY_URL

        const encodedMetadata = JSON.stringify({
            name: metadata.name,
            size: metadata.size,
            provider: Provider.Load,
            link: `${linkPrefix}/${metadata.txId}`,
            signed: await makeFileKeySigned(metadata.key),
            createdAt: new Date().toISOString(),
        })

        const response = await fetch(LANDING_PAGE)
        const text = await response.text()
        const replaced = text
            .replace('Arweave', LoadAgent.providerName)
            .replace('Over Arweave', `Over ${LoadAgent.providerName}`)
            .replace('__METADATA__', encodedMetadata)

        const data = encodeText(replaced)
        const landingPageTxId = await this.makePayload(data, 'text/html', `${metadata.name}-landing.html`)
        return landingPageTxId
    }

    async makePayload(data: Uint8Array, type: string, fileName: string = 'file.dat') {
        this.init()

        const blob = new Blob([data], { type })
        const formData = new FormData()
        formData.append('file', blob)
        formData.append('content_type', type)
        formData.append('app_name', 'Maskbook')

        const response = await fetch(LOAD_UPLOAD_ENDPOINT, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer maskMASKhbs3',
            },
            body: formData,
            signal: this.uploadController?.signal,
        })

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`)
        }

        const result = await response.json()
        if (!result.success || !result.dataitem_id) {
            throw new Error('Invalid response from upload service')
        }

        return result.dataitem_id
    }
}

export default new LoadAgent()
