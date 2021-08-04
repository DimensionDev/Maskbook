export type ToolIconTypes = 'encryptedmsg' | 'files' | 'markets' | 'redpacket' | 'swap' | 'token' | 'claim'
type T = {
    image: string
    text: string
    priority: number
}

export const ToolIconURLs: Readonly<Record<ToolIconTypes, T>> = {
    encryptedmsg: {
        image: new URL('./encryptedmsg.png', import.meta.url).toString(),
        text: 'Encrypted message',
        priority: 1000,
    },
    redpacket: { image: new URL('./redpacket.png', import.meta.url).toString(), text: 'Red Packet', priority: 990 },
    files: { image: new URL('./files.png', import.meta.url).toString(), text: 'File Service', priority: 980 },
    markets: { image: new URL('./markets.png', import.meta.url).toString(), text: 'Markets', priority: 970 },
    token: { image: new URL('./token.png', import.meta.url).toString(), text: 'Buy Cryptocurrency', priority: 960 },
    swap: { image: new URL('./swap.png', import.meta.url).toString(), text: 'Swap', priority: 950 },
    claim: { image: new URL('./claim.png', import.meta.url).toString(), text: 'Claim', priority: 940 },
    // airdrop: { image: new URL('./airdrop.png', import.meta.url).toString(), text: 'Airdrop' },
}
