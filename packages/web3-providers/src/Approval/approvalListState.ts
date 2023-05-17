import { produce } from 'immer'
import { type ChainId } from '@masknet/web3-shared-evm'
import type { BigNumber } from 'bignumber.js'

export type TokenApprovalInfoAccountMap = Record<
    string,
    {
        [key in ChainId]?: {
            spenderList: Record<string, Record<string, { amount: BigNumber; transactionBlockNumber: number }>>
            fromBlock: number
        }
    }
>

export type NFTApprovalInfoAccountMap = Record<
    string,
    Record<
        ChainId,
        {
            spenderList: Record<string, Record<string, boolean>>
            fromBlock: number
        }
    >
>

export class ApprovalListState {
    private _token_state: TokenApprovalInfoAccountMap = {}
    private _nft_state: NFTApprovalInfoAccountMap = {}

    public get tokenState() {
        return this._token_state
    }

    public get nftState() {
        return this._nft_state
    }

    public updateTokenState(
        account: string,
        spender: string,
        address: string,
        chainId: ChainId,
        fromBlock: number,
        transactionBlockNumber: number,
        amount: BigNumber,
    ) {
        this._token_state = produce(this._token_state, (draft) => {
            if (!draft[account]) draft[account] = {}
            if (!draft[account][chainId]) {
                draft[account][chainId] = {
                    spenderList: { [spender]: { [address]: { amount, transactionBlockNumber } } },
                    fromBlock,
                }
            }
            if (!draft[account][chainId]!.spenderList) {
                draft[account][chainId]!.spenderList = { [spender]: { [address]: { amount, transactionBlockNumber } } }
            }
            if (!draft[account][chainId]!.spenderList[spender]) {
                draft[account][chainId]!.spenderList[spender] = { [address]: { amount, transactionBlockNumber } }
            }

            draft[account][chainId]!.spenderList[spender][address] = { amount, transactionBlockNumber }
            draft[account][chainId]!.fromBlock = fromBlock
        })
    }

    public updateNFT_State(
        account: string,
        spender: string,
        address: string,
        chainId: ChainId,
        fromBlock: number,
        approved: boolean,
    ) {
        this._nft_state = produce(this._nft_state, (draft) => {
            draft[account][chainId].spenderList[spender][address] = approved
            draft[account][chainId].fromBlock = fromBlock
        })
    }
}

export const approvalListState = new ApprovalListState()
