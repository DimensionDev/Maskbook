import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'
// import BN from 'bn.js'
import { ZERO } from '@masknet/web3-shared-base'
import { ChainId, createContract, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { ProtocolType, SavingsProtocol } from '../../types'
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
    private _nativeToken = 'ibBNB'

    constructor(readonly pair: [FungibleTokenDetailed, FungibleTokenDetailed]) {}

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
        return this.stakeToken.symbol === this._nativeToken
    }

    public getPoolContract(web3: Web3) {
        return createAlpacaContract(this.stakeToken.address, web3)
    }

    public async updateApr(chainId: ChainId, web3: Web3) {
        try {
            // const contract = this.getPoolContract(web3)
            // if (contract === null) {
            //     console.log('contract')
            //     return
            // }
            // const [configAddr, vaultDebtVal, reservePool, totalToken] = await Promise.all([
            //     contract.methods.config().call(),
            //     contract.methods.vaultDebtVal().call(),
            //     contract.methods.reservePool().call(),
            //     contract.methods.totalToken().call(),
            // ])
            // console.log({
            //     configAddr,
            //     vaultDebtVal,
            //     reservePool,
            //     totalToken,
            // })
            // const config = createAlpacaConfigContract(configAddr, web3)
            // if (config === null) {
            //     console.log('config', config)
            //     return
            // }
            // const balance = new BigNumber(totalToken)
            //     .minus(new BigNumber(vaultDebtVal))
            //     .plus(new BigNumber(reservePool))
            // console.log('getInterestRate', {
            //     vaultDebtVal,
            //     balance: balance.toFixed(),
            // })
            // const ratePerSec = await config.methods.getInterestRate(vaultDebtVal, balance.toFixed()).call()
            // console.log('ratePerSec', ratePerSec)
            // const supplyBase = new BigNumber(ratePerSec).times(TIMESTAMPS_PER_DAY)
            // const apy = supplyBase.times(DAYS_PER_YEAR).shiftedBy(-16)
            // this._apr = apy.toFixed(2)
            const req = await fetch(SUMMARY_API)
            const response = await req.json()
            const { lendingPools } = response.data
            const summary = lendingPools.find((_: any) => _.baseToken.address === this.bareToken.address)
            this._apr = new BigNumber(summary.lendingApr).toFixed(2)
        } catch (error) {
            console.log('error', error)
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
            const [shares, totalToken, totalSupply] = await Promise.all([
                contract.methods.balanceOf(account).call(),
                contract.methods.totalToken().call(),
                contract.methods.totalSupply().call(),
            ])
            const sharePrice = new BigNumber(totalToken).shiftedBy(18).dividedBy(new BigNumber(totalSupply))
            this._balance = new BigNumber(shares).multipliedBy(sharePrice).shiftedBy(-18)
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
            return new BigNumber(totalToken).shiftedBy(18).dividedBy(new BigNumber(totalSupply))
        } catch (error) {
            return ZERO
        }
    }

    private async amountToShares(web3: Web3, value: BigNumber.Value) {
        const sharePrice = await this.getSharePrice(web3)
        const shares = new BigNumber(value).shiftedBy(18).div(new BigNumber(sharePrice))
        return shares
    }

    public async depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const operation = await this.createDepositTokenOperation(web3, value)
            const gasEstimate = await operation?.estimateGas({
                from: account,
            })
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
        try {
            const gasEstimate = await this.depositEstimate(account, chainId, web3, value)
            const operation = await this.createDepositTokenOperation(web3, value)
            if (operation) {
                await operation.send(
                    this.isNativeToken
                        ? {
                              value: value.toString(),
                              from: account,
                          }
                        : {
                              from: account,
                              gas: gasEstimate.toNumber(),
                          },
                )
                return true
            }
            return false
        } catch (error) {
            return false
        }
    }

    private async createWithdrawTokenOperation(web3: Web3, value: BigNumber.Value) {
        const contract = this.getPoolContract(web3)
        const sharesToWithdraw = await this.amountToShares(web3, value)
        return contract?.methods.withdraw(sharesToWithdraw.toString())
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
        try {
            const gasEstimate = await this.withdrawEstimate(account, chainId, web3, value)
            const operation = await this.createWithdrawTokenOperation(web3, value)
            if (operation) {
                await operation.send({
                    from: account,
                    gas: gasEstimate.toNumber(),
                })
                return true
            }
            return false
        } catch (error) {
            return false
        }
    }
}
