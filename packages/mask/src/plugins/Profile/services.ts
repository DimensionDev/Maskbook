import urlcat from 'urlcat'

interface NameInfo {
    rnsName: string
    ensName: string | null
    address: string
}

export async function getRSS3AddressById(id: string) {
    if (!id) return ''
    const url = urlcat('https://rss3.domains/name/:id', { id })
    const rsp = (await (await fetch(url)).json()) as NameInfo
    return rsp.address
}
