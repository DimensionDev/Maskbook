import urlcat from 'urlcat'
import { fetchJSON } from '../../extension/background-script/HelperService'

interface NameInfo {
    rnsName: string
    ensName: string | null
    address: string
}

export async function getRSS3AddressById(id: string) {
    if (!id) return ''
    const url = urlcat('https://rss3.domains/name/:id', { id })
    const rsp = await fetchJSON<NameInfo>(url)
    return rsp.address
}
