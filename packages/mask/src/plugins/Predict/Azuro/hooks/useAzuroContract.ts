import { useAzuroConstants } from '@masknet/web3-shared-evm'
import { useContract } from '@masknet/plugin-infra/web3-evm'
import type { Azuro } from '@masknet/web3-contracts/types/Azuro'
import AzuroContractABI from '@masknet/web3-contracts/abis/Azuro.json'
import type { AbiItem } from 'web3-utils'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useAzuroContract() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { AZURO_LP: AZURO_LP_ADDRESS } = useAzuroConstants(chainId)

    const azuroContract = useContract<Azuro>(chainId, AZURO_LP_ADDRESS, AzuroContractABI as AbiItem[])

    return azuroContract
}
