import { produce } from 'immer'
import { type ChainId } from '@masknet/web3-shared-evm'
import type { BigNumber } from 'bignumber.js'

export type TokenApprovalInfoAccountMap = Record<
    string,
    {
        [key in ChainId]?: {
            spenderList: Record<
                string,
                Record<string, { amount: BigNumber; transactionBlockNumber: number; transactionIndex: number }>
            >
            fromBlock: number
        }
    }
>

export type NFTApprovalInfoAccountMap = Record<
    string,
    {
        [key in ChainId]?: {
            spenderList: Record<
                string,
                Record<string, { approved: boolean; transactionBlockNumber: number; transactionIndex: number }>
            >
            fromBlock: number
        }
    }
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
        account_: string,
        spender: string,
        address: string,
        chainId: ChainId,
        fromBlock: number,
        transactionBlockNumber: number,
        transactionIndex: number,
        amount: BigNumber,
    ) {
        const account = account_.toLowerCase()
        this._token_state = produce(this._token_state, (draft) => {
            if (!draft[account]) draft[account] = {}
            if (!draft[account][chainId]) {
                draft[account][chainId] = {
                    spenderList: { [spender]: { [address]: { amount, transactionBlockNumber, transactionIndex } } },
                    fromBlock,
                }
            }
            if (!draft[account][chainId]!.spenderList) {
                draft[account][chainId]!.spenderList = {
                    [spender]: { [address]: { amount, transactionBlockNumber, transactionIndex } },
                }
            }
            if (!draft[account][chainId]!.spenderList[spender]) {
                draft[account][chainId]!.spenderList[spender] = {
                    [address]: { amount, transactionBlockNumber, transactionIndex },
                }
            }

            draft[account][chainId]!.spenderList[spender][address] = {
                amount,
                transactionBlockNumber,
                transactionIndex,
            }
            draft[account][chainId]!.fromBlock = fromBlock
        })
    }

    public updateNFT_State(
        account_: string,
        spender: string,
        address: string,
        chainId: ChainId,
        fromBlock: number,
        transactionBlockNumber: number,
        transactionIndex: number,
        approved: boolean,
    ) {
        const account = account_.toLowerCase()
        this._nft_state = produce(this._nft_state, (draft) => {
            if (!draft[account]) draft[account] = {}
            if (!draft[account][chainId]) {
                draft[account][chainId] = {
                    spenderList: { [spender]: { [address]: { approved, transactionBlockNumber, transactionIndex } } },
                    fromBlock,
                }
            }
            if (!draft[account][chainId]!.spenderList) {
                draft[account][chainId]!.spenderList = {
                    [spender]: { [address]: { approved, transactionBlockNumber, transactionIndex } },
                }
            }
            if (!draft[account][chainId]!.spenderList[spender]) {
                draft[account][chainId]!.spenderList[spender] = {
                    [address]: { approved, transactionBlockNumber, transactionIndex },
                }
            }

            draft[account][chainId]!.spenderList[spender][address] = {
                approved,
                transactionBlockNumber,
                transactionIndex,
            }
            draft[account][chainId]!.fromBlock = fromBlock
        })
    }
}

export const approvalListState = new ApprovalListState()
