import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { ZERO } from '@masknet/web3-shared-base'
import { ChainId, createContract, FungibleTokenDetailed } from '@masknet/web3-shared-evm'

import { ProtocolType, SavingsProtocol } from '../types'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import { VaultInterface, Vault, Yearn } from '@yfi/sdk'

export class YearnProtocol implements SavingsProtocol {
    static DEFAULT_APR = '0.1'

    private _apr = '0.00'
    private _balance = ZERO

    constructor(readonly pair: [FungibleTokenDetailed, FungibleTokenDetailed]) {}

    get type() {
        return ProtocolType.YEARN
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

    public async updateApr(chainId: ChainId, web3: Web3) {
        try {
            // @ts-ignore: type is not assignable to parameter of type '1 | 250 | 1337 | 42161'
            const yearn = new Yearn(chainId, {
                provider: web3.currentProvider,
            })

            // @ts-ignore: type is not assignable to parameter of type '1 | 250 | 1337 | 42161'
            const vaultInterface = new VaultInterface(yearn, +chainId, yearn.context)

            const vaults: Vault[] = await vaultInterface.get([this.stakeToken.address])
            this._apr = YearnProtocol.DEFAULT_APR

            
            if (vaults && vaults.length > 0) {
                // APY and APR are returned here as decimals, multiply by 100 to get the percents                
                this._apr = (100 * (vaults[0].metadata.apy?.gross_apr ?? 0)).toFixed(2)
                return
            }
        } catch (error) {
            console.error('YFI APR ERROR: ', error)
            this._apr = YearnProtocol.DEFAULT_APR
        }
    }

    public async updateBalance(chainId: ChainId, web3: Web3, account: string) {
        try {
            const contract = createContract<ERC20>(web3, this.stakeToken.address, ERC20ABI as AbiItem[])
            this._balance = new BigNumber((await contract?.methods.balanceOf(account).call()) ?? '0')
        } catch (error) {
            console.error('YFI BALANCE ERROR: ', error)
            this._balance = ZERO
        }
    }

    public async depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const gasEstimate = ZERO
            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            console.error('YFI deposit estimate ERROR: ', error)
            return ZERO
        }
    }

    public async deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const gasEstimate = await this.depositEstimate(account, chainId, web3, value)

            // @ts-ignore: type is not assignable to parameter of type '1 | 250 | 1337 | 42161'
            const yearn = new Yearn(chainId, {
                provider: web3.currentProvider,
            })

            // @ts-ignore: type is not assignable to parameter of type '1 | 250 | 1337 | 42161'
            const vaultInterface = new VaultInterface(yearn, +chainId, yearn.context)

            const tResponse = await vaultInterface.deposit(
                this.stakeToken.address,
                this.bareToken.address,
                value.toString(),
                account,
            )

            return true
        } catch (error) {
            console.error('YFI deposit ERROR: ', error)
            return false
        }
    }

    public async withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const gasEstimate = ZERO
            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            return ZERO
        }
    }

    public async withdraw(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const gasEstimate = await this.withdrawEstimate(account, chainId, web3, value)

            // @ts-ignore: type is not assignable to parameter of type '1 | 250 | 1337 | 42161'
            const yearn = new Yearn(chainId, {
                provider: web3.currentProvider,
            })

            // @ts-ignore: type is not assignable to parameter of type '1 | 250 | 1337 | 42161'
            const vaultInterface = new VaultInterface(yearn, +chainId, yearn.context)

            const tResponse = await vaultInterface.withdraw(
                this.stakeToken.address,
                this.bareToken.address,
                value.toString(),
                account,
            )

            return true
        } catch (error) {
            console.error('YFI Withdraw ERROR: ', error)
            return false
        }
    }
}
