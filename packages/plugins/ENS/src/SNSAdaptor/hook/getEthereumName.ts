export function getEthereumName(twitterId: string, nickname: string, bio: string) {
    const ENS_RE = /\S{1,256}\.(eth|kred|xyz|luxe)\b/
    const [matched] = nickname.match(ENS_RE) ?? bio.match(ENS_RE) ?? []
    if (matched) return matched
    return twitterId && !twitterId.endsWith('.eth') ? `${twitterId}.eth` : twitterId
}
