import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export namespace OwnerAPI {
    export interface AbstractAccount<T extends NetworkPluginID, ChainId = Web3Helper.Definition[T]['ChainId']> {
        pluginID: T
        chainId: ChainId
        id: string
        address: string
        owner: string
        creator: string
        /** Has deployed as a smart contract */
        deployed: boolean
        /** Has funded by sponsor */
        funded: boolean
    }

    /**
     *  select *
     *  from polygon.transaction_logs
     *  where block_number>36808978 -- the deployment block height of the logic wallet contract
     *  -- AND address="0x1778fcc4a26091d66e29dbb9aaa198cc652e73e1" -- the address of the WalletProxy contract (unknown)
     *  AND topics_count=3 -- the topics count of ChangeOwner event
     *  AND topic0="0xb532073b38c83145e3e5135377a08bf9aab55bc0fd7c1179cd4fb995d2a5159c" -- topic signature of ChangeOwner event
     *  -- AND topic1="..." The previousOwner address
     *  AND topic2="0x00000000000000000000000033a7209f653727a2ff688c81e661d61bcfffd809" -- the newOwner address (from FE)
     *  -- example tx: https://polygonscan.com/tx/0x7d381e3585d9b384e7ce6c910cccced02de0e29c02805a9286504f3067e09f4a
     */
    export interface Log {
        transaction_hash: string
        /** the address of contract account */
        address: string
        /** topic signature */
        topic0: string
        /** the previous owner address */
        topic1: string
    }
}
