import urlcat from 'urlcat'
export function getIPFSImageUrl(cid: string, height?: number) {
    return urlcat('https://d16c97c2np8a2o.cloudfront.net/ipfs/:cid', { cid, height })
}
