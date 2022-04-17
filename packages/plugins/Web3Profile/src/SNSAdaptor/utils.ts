export const formatPublicKey = (publicKey?: string) => {
    return `${publicKey?.slice(0, 6)}...${publicKey?.slice(-6)}`
}
