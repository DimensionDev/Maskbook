import { configure, setContractAddresses, setSelectedChainId } from '@azuro-protocol/sdk'
import { ChainId, getRPCConstants } from '@masknet/web3-shared-evm'
import { contractAddresses } from '../../constants'

export async function configureAzuroSDK(chainId: ChainId) {
    const { RPC_URLS } = getRPCConstants(chainId)

    setSelectedChainId(chainId)
    configure({
        rpcUrl: RPC_URLS?.[0] ?? '',
        ipfsGateway: 'https://ipfs-gateway.azuro.org/ipfs/',
    })

    setContractAddresses(contractAddresses[chainId])
}
