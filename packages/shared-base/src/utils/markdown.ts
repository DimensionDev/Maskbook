const IPFS_GATEWAY_HOST = 'https://gateway.ipfscdn.io'

export function markdownTransformIpfsURL(markdown: string): string {
    return markdown.replace(/(!\[.*?])\(ipfs:\/\/(.+?)\)/g, (_, $1, $2) => {
        return `${$1}(${IPFS_GATEWAY_HOST}/ipfs/${$2})`
    })
}
