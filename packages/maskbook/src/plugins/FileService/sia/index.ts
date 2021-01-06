import { Attachment } from '@dimensiondev/common-protocols'
import { encodeText } from '@dimensiondev/kit'
import { SkynetClient } from '@nebulous/skynet'
import { isEmpty, isNil } from 'lodash-es'
import { SIASKY_URL, LUXOR_URL, TUTEMWESI_URL, VAULT_URL, SIALOOP_URL, SIACDN_URL } from './portals'

const client = new SkynetClient()

export interface skynetFile {
    type: png | jpg | zip | rar
}

export interface skykeyName {
    length: 16
}

// export async function makeAttachment(options: any) {
//     const passphrase = options.key ? encodeText(options.key) : undefined
//     const encoded = await Attachment.encode(passphrase, {
//         block: options.block,
//         mime: isEmpty(options.type) ? 'application/octet-stream' : options.type,
//         metadata: null,
//     })
//     const transaction = await makePayload(encoded, 'application/octet-stream')
//     stage[transaction.id] = transaction
//     return transaction.id
// }

// async function signeduuid(base58key: string | undefined | null) {
//     if (isNil(base58key)) {
//         return null
//     }
// }

export async function uploadSia(file: skynetFile) {
    // Randon skynet portal service save
    const portalsUrls = [SIASKY_URL, LUXOR_URL, TUTEMWESI_URL, VAULT_URL, SIALOOP_URL, SIACDN_URL]
    const portalTouse = portalsUrls[Math.floor(Math.random() * portalsUrls.length)]
    const skylink = await client.uploadFile(file, portalTouse)

    return skylink
}

// NOTE: this feature has not yet been implemented for this SDK.
export async function uploadEncryption(file: skynetFile, skykeyName: skykeyName) {
    const portalsUrls = [SIASKY_URL, LUXOR_URL, TUTEMWESI_URL, VAULT_URL, SIALOOP_URL, SIACDN_URL]
    const portalTouse = portalsUrls[Math.floor(Math.random() * portalsUrls.length)]
    const skylink = await client.uploadFile(file, portalTouse, skykeyName)

    return skylink
}
