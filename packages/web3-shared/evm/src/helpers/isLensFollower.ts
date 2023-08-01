export function isLensFollower(name: string) {
    // vitalik.lens-Follower, lensprotocol-Follower V2
    return name.includes('.lens-Follower') || name.includes('lensprotocol-Follower') || name.endsWith("'s follower NFT")
}
