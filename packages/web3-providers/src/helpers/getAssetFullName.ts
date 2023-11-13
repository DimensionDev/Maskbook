import { isENSContractAddress, isLens } from '@masknet/web3-shared-evm'

export function getAssetFullName(contract_address: string, contractName: string, name?: string, tokenId?: string) {
    if (!name)
        return (
            tokenId && contractName ? `${contractName} #${tokenId}`
            : !contractName && tokenId ? `#${tokenId}`
            : contractName
        )
    if (isENSContractAddress(contract_address)) return `ENS #${name}`
    if (isLens(name)) return name

    const [first, next] = name.split('#').map((x) => x.trim())
    if (first && next) return `${first} #${next}`
    if (!first && next) return contractName ? `${contractName} #${next}` : `#${next}`

    if (contractName && tokenId)
        return contractName.toLowerCase() === first.toLowerCase() ?
                `${contractName} #${tokenId}`
            :   `${contractName} #${first}`
    if (!contractName && !tokenId) return first
    if (!contractName && tokenId) return `${first} #${tokenId}`

    return `${contractName} #${first}`
}
