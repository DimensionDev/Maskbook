export const formatPublicKey = (publicKey?: string) => {
    return `${publicKey?.slice(0, 6)}...${publicKey?.slice(-6)}`
}

export const formatAddress = (address: string, size = 4) => {
    return `${address?.slice(0, size)}...${address?.slice(-size)}`
}
