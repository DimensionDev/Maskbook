const IPFS_GATEWAY_HOST = 'https://gateway.ipfscdn.io'

export function markdownTransformIpfsURL(markdown: string): string {
    return markdown.replaceAll(/(!\[.*?])\(ipfs:\/\/(.+?)\)/g, (_, head, cid) => {
        return `${head}(${IPFS_GATEWAY_HOST}/ipfs/${cid})`
    })
}
