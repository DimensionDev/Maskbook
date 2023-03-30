import urlcat from 'urlcat'

export function getLensterLink(handle: string) {
    return urlcat('https://lenster.xyz/u/:handle', { handle })
}
