import { FriendshipCertificatePackedV1 } from './friendship-cert'

/**
 * Publish new certificate
 *      POST endpoint/friendship-cert
 * Get all certificates after a time
 *      GET endpoint/friendship-cert?after={timestamp}
 */
const endpoint = '?'
export async function publishCertificate(cert: FriendshipCertificatePackedV1) {
    const response = await fetch(endpoint + '/friendship-cert', { method: 'POST', body: JSON.stringify(cert) })
    return response.ok
}

export async function pullCertificates(after: number = 0) {
    const response = await fetch(endpoint + '/friendship-cert?after=' + after)
    const result: FriendshipCertificatePackedV1[] = await response.json()
    if (!Array.isArray(result)) {
        console.warn('Bad output from server')
        return []
    }
    return result.filter(x => x.cryptoKey && x.iv && x.payload && x.timestamp && x.version === 1)
}
