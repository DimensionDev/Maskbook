import urlcat from 'urlcat'

export function getLensterLink(handle: string) {
    return urlcat('https://hey.xyz/u/:handle', { handle })
}
