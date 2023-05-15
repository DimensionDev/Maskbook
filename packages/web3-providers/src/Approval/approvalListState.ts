import { produce } from 'immer'
import { type ChainId } from '@masknet/web3-shared-evm'
import type { BigNumber } from 'bignumber.js'

export type TokenApprovalInfoAccountMap = Record<
    string,
    Record<
        ChainId,
        {
            spenderList: Record<string, BigNumber>
            fromBlock: number
        }
    >
>

export type NFTApprovalInfoAccountMap = Record<
    string,
    Record<
        ChainId,
        {
            spenderList: Record<string, boolean>
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

    public updateTokenState(account: string, spender: string, chainId: ChainId, fromBlock: number, amount: BigNumber) {
        return produce(this._token_state, (draft) => {
            draft[account][chainId].spenderList[spender] = amount
            draft[account][chainId].fromBlock = fromBlock
        })
    }

    public updateNFT_State(account: string, spender: string, chainId: ChainId, fromBlock: number, approved: boolean) {
        return produce(this._nft_state, (draft) => {
            draft[account][chainId].spenderList[spender] = approved
            draft[account][chainId].fromBlock = fromBlock
        })
    }
}

export const approvalListState = new ApprovalListState()
