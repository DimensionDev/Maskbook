export type ToolIconTypes = 'airdrop' | 'encryptedmsg' | 'files' | 'markets' | 'redpacket' | 'swap' | 'token'
export const ToolIconURLs: Readonly<Record<ToolIconTypes, { image: string; text: string }>> = {
    airdrop: { image: new URL('./airdrop.png', import.meta.url).toString(), text: 'Airdrop' },
    encryptedmsg: { image: new URL('./encryptedmsg.png', import.meta.url).toString(), text: 'Encrypted message' },
    files: { image: new URL('./files.png', import.meta.url).toString(), text: 'File Service' },
    markets: { image: new URL('./markets.png', import.meta.url).toString(), text: 'Markets' },
    redpacket: { image: new URL('./redpacket.png', import.meta.url).toString(), text: 'Red Packet' },
    swap: { image: new URL('./swap.png', import.meta.url).toString(), text: 'Swap' },
    token: { image: new URL('./token.png', import.meta.url).toString(), text: 'Buy Digital currency' },
}
