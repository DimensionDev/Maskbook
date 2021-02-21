export interface AirdropPacket {
    address: string
    index: string
    amount: string
    proof: string[]
}

export async function getMaskAirdropPacket(address: string) {
    try {
        const response = await fetch('https://service.r2d2.to/airdrop-lookup', {
            method: 'POST',
            body: JSON.stringify({
                address,
            }),
        })

        return (await response.json()) as AirdropPacket
    } catch (e) {
        return
    }
}
