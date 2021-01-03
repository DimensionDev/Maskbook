// nftUrl can be of these forms:
//  - https://opensea.io/assets/<address>/<token_id>
//  - https://app.rarible.com/token/<address>:<token_id>
//  
// TODO: discuss about the superrare url format

export function getRelevantUrl(textContent: string): string {
    return "url"
}

export function parseNftUrl(nftUrl: string): [string, string] {
    return ["0x797ce6d5a2e4ba7ed007b01a42f797a050a3cbd8", "110278847780101343869399231375393952728601320591123168197704568786056038621800"]
}
