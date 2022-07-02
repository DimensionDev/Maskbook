import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { ZERO } from '@masknet/web3-shared-base'
import { ChainId, createContract, TransactionEventType } from '@masknet/web3-shared-evm'
import { ProtocolType, PairToken, SavingsProtocol } from '../../types'
import type { AlpacaVault } from '@masknet/web3-contracts/types/AlpacaVault'
import AlpacaVaultABI from '@masknet/web3-contracts/abis/AlpacaVault.json'
import type { AlpacaVaultConfig } from '@masknet/web3-contracts/types/AlpacaVaultConfig'
import AlpacaVaultConfigABI from '@masknet/web3-contracts/abis/AlpacaVaultConfig.json'
import { SUMMARY_API } from './pairs'

export const TIMESTAMPS_PER_DAY = 60 * 60 * 24
export const DAYS_PER_YEAR = 365

export function createAlpacaContract(address: string, web3: Web3) {
    return createContract<AlpacaVault>(web3, address, AlpacaVaultABI as AbiItem[])
}

export function createAlpacaConfigContract(address: string, web3: Web3) {
    return createContract<AlpacaVaultConfig>(web3, address, AlpacaVaultConfigABI as AbiItem[])
}

export class AlpacaProtocol implements SavingsProtocol {
    static DEFAULT_APR = '0.00'

    private _apr = '0.00'
    private _balance = ZERO
    static nativeToken = 'ibBNB'

    constructor(readonly pair: PairToken) {}

    get type() {
        return ProtocolType.Alpaca
    }

    get apr() {
        return this._apr
    }

    get balance() {
        return this._balance
    }

    get bareToken() {
        return this.pair[0]
    }

    get stakeToken() {
        return this.pair[1]
    }

    get approveAddress() {
        return this.stakeToken.address
    }

    get isNativeToken() {
        return this.stakeToken.symbol === AlpacaProtocol.nativeToken
    }

    public getPoolContract(web3: Web3) {
        return createAlpacaContract(this.stakeToken.address, web3)
    }

    public async updateApr(chainId: ChainId, web3: Web3) {
        try {
            if (!SUMMARY_API) {
                this._apr = AlpacaProtocol.DEFAULT_APR
                return
            }
            const req = await fetch(SUMMARY_API)
            const response = await req.json()
            const { lendingPools } = response.data
            const summary = lendingPools.find((_: any) => _.ibToken.address === this.stakeToken.address)
            this._apr = new BigNumber(summary.lendingApr).toFixed(2)
        } catch (error) {
            this._apr = AlpacaProtocol.DEFAULT_APR
        }
    }

    public async updateBalance(chainId: ChainId, web3: Web3, account: string) {
        try {
            const contract = this.getPoolContract(web3)
            if (contract === null) {
                this._balance = ZERO
                return
            }
            const [shares, sharePrice] = await Promise.all([
                contract.methods.balanceOf(account).call(),
                this.getSharePrice(web3),
            ])
            // balance = shares * sharePrice
            this._balance = new BigNumber(shares).multipliedBy(new BigNumber(sharePrice)).shiftedBy(-18)
        } catch (error) {
            this._balance = ZERO
        }
    }

    private async getSharePrice(web3: Web3): Promise<BigNumber.Value> {
        try {
            const contract = this.getPoolContract(web3)
            if (contract === null) {
                return ZERO
            }
            const [totalToken, totalSupply] = await Promise.all([
                contract.methods.totalToken().call(),
                contract.methods.totalSupply().call(),
            ])
            // sharePrice = totalToken / totalSupply
            return new BigNumber(totalToken).shiftedBy(18).dividedBy(new BigNumber(totalSupply))
        } catch (error) {
            return ZERO
        }
    }

    private async amountToShares(web3: Web3, value: BigNumber.Value) {
        const sharePrice = await this.getSharePrice(web3)
        // shares = amount / sharePrice
        const shares = new BigNumber(value).shiftedBy(18).div(new BigNumber(sharePrice))
        return shares.toFixed(0)
    }

    public async depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const operation = await this.createDepositTokenOperation(web3, value)
            const gasEstimate = await operation?.estimateGas(
                this.isNativeToken
                    ? {
                          value: value.toString(),
                          from: account,
                      }
                    : {
                          from: account,
                      },
            )
            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            return ZERO
        }
    }

    private async createDepositTokenOperation(web3: Web3, value: BigNumber.Value) {
        const contract = this.getPoolContract(web3)
        return contract?.methods.deposit(value.toString())
    }

    public async deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const gasEstimate = await this.depositEstimate(account, chainId, web3, value)
        const operation = await this.createDepositTokenOperation(web3, value)
        const args = this.isNativeToken
            ? {
                  value: value.toString(),
                  from: account,
                  gas: gasEstimate.toNumber(),
              }
            : {
                  from: account,
                  gas: gasEstimate.toNumber(),
              }

        if (!operation) {
            throw new Error("Can't create deposit operation")
        }
        return new Promise<string>((resolve, reject) => {
            operation
                .send(args)
                .once(TransactionEventType.ERROR, reject)
                .once(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
        })
    }

    private async createWithdrawTokenOperation(web3: Web3, value: BigNumber.Value) {
        const contract = this.getPoolContract(web3)
        const sharesToWithdraw = await this.amountToShares(web3, value)
        return contract?.methods.withdraw(sharesToWithdraw)
    }

    public async withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const operation = await this.createWithdrawTokenOperation(web3, value)
            const gasEstimate = await operation?.estimateGas({
                from: account,
            })
            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            return ZERO
        }
    }

    public async withdraw(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const gasEstimate = await this.withdrawEstimate(account, chainId, web3, value)
        const operation = await this.createWithdrawTokenOperation(web3, value)

        if (!operation) {
            throw new Error("Can't create withdraw operation")
        }

        return new Promise<string>((resolve) =>
            operation
                .send({
                    from: account,
                    gas: gasEstimate.toNumber(),
                })
                .once(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                }),
        )
    }
}
