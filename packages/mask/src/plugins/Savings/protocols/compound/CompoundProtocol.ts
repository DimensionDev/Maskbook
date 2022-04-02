import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { ZERO } from '@masknet/web3-shared-base'
import { ChainId, createContract, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { ProtocolType, SavingsProtocol } from '../../types'
import type { CERC20 } from '@masknet/web3-contracts/types/CERC20'
import type { CEther } from '@masknet/web3-contracts/types/CEther'
import CERC20ABI from '@masknet/web3-contracts/abis/CERC20.json'
import CEtherABI from '@masknet/web3-contracts/abis/CEther.json'

export const BLOCKS_PER_DAY = 6570
export const DAYS_PER_YEAR = 365

export class CompoundProtocol implements SavingsProtocol {
    static DEFAULT_APR = '0.00'

    private _apr = '0.00'
    private _balance = ZERO
    private _nativeToken = 'cETH'

    constructor(readonly pair: [FungibleTokenDetailed, FungibleTokenDetailed]) {}

    get type() {
        return ProtocolType.Compound
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

    get isNativeToken() {
        return this.stakeToken.symbol === this._nativeToken
    }

    get approveAddress() {
        return this.stakeToken.address
    }

    public getPoolContract(web3: Web3) {
        const contract = this.isNativeToken
            ? createContract<CEther>(web3, this.stakeToken.address, CEtherABI as AbiItem[])
            : createContract<CERC20>(web3, this.stakeToken.address, CERC20ABI as AbiItem[])
        return contract
    }

    public async updateApr(chainId: ChainId, web3: Web3) {
        try {
            const contract = this.getPoolContract(web3)
            if (contract === null) {
                this._apr = CompoundProtocol.DEFAULT_APR
                return
            }
            const supplyRate = await contract.methods.supplyRatePerBlock().call()
            const supplyBase = new BigNumber(supplyRate).shiftedBy(-18).times(BLOCKS_PER_DAY).plus(1)
            const apy = supplyBase.times(DAYS_PER_YEAR).times(100)
            this._apr = apy.toFixed(2)
        } catch (error) {
            this._apr = CompoundProtocol.DEFAULT_APR
        }
    }

    public async updateBalance(chainId: ChainId, web3: Web3, account: string) {
        try {
            const contract = this.getPoolContract(web3)
            if (contract === null) {
                this._balance = ZERO
                return
            }
            const balance = await contract.methods.balanceOfUnderlying(account).call()
            this._balance = new BigNumber(balance)
        } catch (error) {
            this._balance = ZERO
        }
    }

    public async depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const operation = await this.createDepositTokenOperation(web3, value)
            const args = this.isNativeToken
                ? {
                      value: value.toString(),
                      from: account,
                  }
                : {
                      from: account,
                  }
            const gasEstimate = await operation?.estimateGas(args)
            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            return ZERO
        }
    }

    private async createDepositTokenOperation(web3: Web3, value: BigNumber.Value) {
        const contract = this.getPoolContract(web3)
        if (this.isNativeToken) {
            return (contract as CEther)?.methods.mint()
        } else {
            return contract?.methods.mint(value.toString())
        }
    }

    public async deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const gasEstimate = await this.depositEstimate(account, chainId, web3, value)
            const operation = await this.createDepositTokenOperation(web3, value)
            const args = this.isNativeToken
                ? {
                      from: account,
                      value: value.toString(),
                      gas: gasEstimate.toNumber(),
                  }
                : {
                      from: account,
                      gas: gasEstimate.toNumber(),
                  }
            if (operation) {
                await operation.send(args)
                return true
            }
            return false
        } catch (error) {
            return false
        }
    }

    public async withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const contract = this.getPoolContract(web3)
            const operation = contract?.methods.redeemUnderlying(value.toString())
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
            const contract = this.getPoolContract(web3)
            await contract?.methods.redeemUnderlying(value.toString()).send({
                from: account,
                gas: gasEstimate.toNumber(),
            })
            return true
        } catch (error) {
            return false
        }
    }
}
