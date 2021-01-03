// nftUrl can be of these forms:
//  - https://opensea.io/assets/<address>/<token_id>
//  - https://app.rarible.com/token/<address>:<token_id>
//
// TODO: discuss about the superrare url format

export function getRelevantUrl(textContent: string): URL {
    return new URL('https://opensea.io/assets/0x1986f4c2e3ad5fe9778da67b1b836cf53b9e20cd/380/')
}

export function parseNftUrl(nftUrl: URL): [string, string] | any {
    let address = null,
        tokenId = null

    if (nftUrl.hostname === 'opensea.io') {
        let tokens = nftUrl.pathname.split('/')
        address = tokens[tokens.length - 3]
        tokenId = tokens[tokens.length - 2]
    } else if (nftUrl.hostname === 'app.rarible.com') {
        let tokens = nftUrl.pathname.split('/')
        tokens = tokens[tokens.length - 2].split(':')
        address = tokens[0]
        tokenId = tokens[1]
    }

    return [address, tokenId]
}
