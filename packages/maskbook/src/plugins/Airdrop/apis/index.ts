export interface AirdropPacket {
    address: string
    amount: string
    proof: string[]
}

export async function getAirdropPacket(address: string) {
    // prod: https://service.r2d2.to/airdrop-lookup
    const response = await fetch('https://service.r2d2.to/airdrop-lookup', {
        method: 'POST',
        body: JSON.stringify({
            address,
        }),
    })

    return (await response.json()) as AirdropPacket
}
