export type ToolIconTypes = 'encryptedmsg' | 'files' | 'markets' | 'redpacket' | 'swap' | 'token' | 'claim' | 'allblue'
type T = {
    image: string
    label: string
    priority: number
}

export const ToolIconURLs: Readonly<Record<ToolIconTypes, T>> = {
    encryptedmsg: {
        image: new URL('./encryptedmsg.png', import.meta.url).toString(),
        label: 'Encrypted message',
        priority: 1000,
    },
    redpacket: { image: new URL('./redpacket.png', import.meta.url).toString(), label: 'Lucky Drop', priority: 990 },
    files: { image: new URL('./files.png', import.meta.url).toString(), label: 'File Service', priority: 980 },
    markets: { image: new URL('./markets.png', import.meta.url).toString(), label: 'Markets', priority: 970 },
    token: { image: new URL('./token.png', import.meta.url).toString(), label: 'Buy Cryptocurrency', priority: 960 },
    swap: { image: new URL('./swap.png', import.meta.url).toString(), label: 'Swap', priority: 950 },
    claim: { image: new URL('./claim.png', import.meta.url).toString(), label: 'Claim', priority: 940 },
    allblue: { image: new URL('./allblue.png', import.meta.url).toString(), label: 'All Blue', priority: 930 },
    // airdrop: { image: new URL('./airdrop.png', import.meta.url).toString(), text: 'Airdrop' },
}
