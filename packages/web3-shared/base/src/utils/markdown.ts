import { IPFS_GATEWAY_HOST } from './resolver.js'

export function markdownTransformIpfsURL(markdown: string) {
    return markdown.replace(/(!\[.*?])\(ipfs:\/\/(.+?)\)/g, (_, $1, $2) => {
        return `${$1}(${IPFS_GATEWAY_HOST}/ipfs/${$2})`
    })
}
