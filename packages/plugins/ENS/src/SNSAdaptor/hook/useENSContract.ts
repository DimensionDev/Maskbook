import { useContract } from '@masknet/web3-shared-evm'
import ENS_Registry_ABI from '@masknet/web3-contracts/abis/ENSRegistry.json'
import type { AbiItem } from 'web3-utils'

export function useENSContract() {
    return useContract('0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', ENS_Registry_ABI as AbiItem[])
}
