import { produce, enableMapSet } from 'immer'
import type { BigNumber } from 'bignumber.js'
import { type ChainId } from '@masknet/web3-shared-evm'

export type TokenApprovalInfoAccountMap = Record<
    string,
    Map<
        ChainId,
        {
            spenderList: Map<string, Map<string, { amount: BigNumber; transactionBlockNumber: number }>>
            fromBlock: number
        }
    >
>

export type NFTApprovalInfoAccountMap = Record<
    string,
    Map<
        ChainId,
        {
            spenderList: Map<string, Map<string, { approved: boolean; transactionBlockNumber: number }>>
            fromBlock: number
        }
    >
>

export class ApprovalListState {
    private _token_state: TokenApprovalInfoAccountMap = {}
    private _nft_state: NFTApprovalInfoAccountMap = {}

    constructor() {
        enableMapSet()
    }

    public get tokenState() {
        return this._token_state
    }

    public get nftState() {
        return this._nft_state
    }

    public updateTokenState(
        account_: string,
        spender_: string,
        address_: string,
        chainId: ChainId,
        fromBlock: number,
        transactionBlockNumber: number,
        amount: BigNumber,
    ) {
        const account = account_.toLowerCase()
        const spender = spender_.toLowerCase()
        const address = address_.toLowerCase()

        this._token_state = produce(this._token_state, (draft) => {
            if (!draft[account]) draft[account] = new Map()

            const addressMap = new Map()
            addressMap.set(address, { amount, transactionBlockNumber })

            if (!draft[account].get(chainId)?.spenderList) {
                const spenderListMap = new Map()
                spenderListMap.set(spender, addressMap)
                draft[account].set(chainId, {
                    spenderList: spenderListMap,
                    fromBlock,
                })
            }

            if (!draft[account].get(chainId)!.spenderList!.get(spender)) {
                draft[account].get(chainId)!.spenderList!.set(spender, addressMap)
            }

            draft[account].get(chainId)!.spenderList.get(spender)?.set(address, { amount, transactionBlockNumber })
            draft[account].get(chainId)!.fromBlock = fromBlock
        })
    }

    public updateNFT_State(
        account_: string,
        spender_: string,
        address_: string,
        chainId: ChainId,
        fromBlock: number,
        transactionBlockNumber: number,
        approved: boolean,
    ) {
        const account = account_.toLowerCase()
        const spender = spender_.toLowerCase()
        const address = address_.toLowerCase()

        this._nft_state = produce(this._nft_state, (draft) => {
            if (!draft[account]) draft[account] = new Map()

            const addressMap = new Map()
            addressMap.set(address, { approved, transactionBlockNumber })

            if (!draft[account].get(chainId)?.spenderList) {
                const spenderListMap = new Map()
                spenderListMap.set(spender, addressMap)
                draft[account].set(chainId, {
                    spenderList: spenderListMap,
                    fromBlock,
                })
            }

            if (!draft[account].get(chainId)!.spenderList!.get(spender)) {
                draft[account].get(chainId)!.spenderList!.set(spender, addressMap)
            }

            draft[account].get(chainId)!.spenderList.get(spender)?.set(address, { approved, transactionBlockNumber })
            draft[account].get(chainId)!.fromBlock = fromBlock
        })
    }
}

export const approvalListState = new ApprovalListState()
