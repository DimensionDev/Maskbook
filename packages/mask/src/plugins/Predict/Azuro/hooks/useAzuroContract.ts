import { useAzuroConstants } from '@masknet/web3-shared-evm'
import { useContract } from '@masknet/plugin-infra/web3-evm'
import type { Azuro } from '@masknet/web3-contracts/types/Azuro'
import type { AzuroCore } from '@masknet/web3-contracts/types/AzuroCore'
import AzuroLPContractABI from '@masknet/web3-contracts/abis/Azuro.json'
import AzuroCoreContractABI from '@masknet/web3-contracts/abis/AzuroCore.json'
import type { AbiItem } from 'web3-utils'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useAzuroLPContract() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { AZURO_LP: AZURO_LP_ADDRESS } = useAzuroConstants(chainId)

    const azuroContract = useContract<Azuro>(chainId, AZURO_LP_ADDRESS, AzuroLPContractABI as AbiItem[])

    return azuroContract
}

export function useAzuroCoreContract() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { CORE } = useAzuroConstants(chainId)

    const azuroContract = useContract<AzuroCore>(chainId, CORE, AzuroCoreContractABI as AbiItem[])

    return azuroContract
}
