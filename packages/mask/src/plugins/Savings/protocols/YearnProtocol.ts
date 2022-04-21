import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { ZERO } from '@masknet/web3-shared-base'
import { ChainId, createContract, TransactionState } from '@masknet/web3-shared-evm'

import { ChainIdYearn, FungibleTokenPair, ProtocolType, SavingsProtocol } from '../types'
import type { ERC20 } from '@masknet/web3-contracts/types/ERC20'
import ERC20ABI from '@masknet/web3-contracts/abis/ERC20.json'
import { VaultInterface, Vault, Yearn } from '@yfi/sdk'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers'

export class YearnProtocol implements SavingsProtocol {
    static DEFAULT_APR = '0.1'

    private _apr = '0.00'
    private _balance = ZERO

    constructor(readonly pair: FungibleTokenPair) {}

    static fromTokenPair(pair: FungibleTokenPair) {
        return new YearnProtocol(pair)
    }

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

    public async updateApr(chainId: ChainIdYearn, web3: Web3) {
        try {
            const web3Provider = new Web3Provider(web3.currentProvider as ExternalProvider)

            const yearn = new Yearn(chainId, {
                provider: web3Provider,
            })

            const vaultInterface = new VaultInterface(yearn, chainId, yearn.context)

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

    public async updateBalance(chainId: ChainIdYearn, web3: Web3, account: string) {
        try {
            const contract = createContract<ERC20>(web3, this.stakeToken.address, ERC20ABI as AbiItem[])
            const balance = await contract?.methods.balanceOf(account).call()
            this._balance = new BigNumber(balance ?? '0')
        } catch (error) {
            console.error('YFI BALANCE ERROR: ', error)
            this._balance = ZERO
        }
    }

    public async depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const gasEstimate = '5000000'
        return new BigNumber(gasEstimate)
    }

    public async deposit(
        account: string,
        chainId: ChainIdYearn,
        web3: Web3,
        value: BigNumber.Value,
        onChange: (state: TransactionState) => void,
    ) {
        try {
            const gasEstimate = await this.depositEstimate(account, chainId, web3, value)

            const web3Provider = new Web3Provider(web3.currentProvider as ExternalProvider)
            const yearn = new Yearn(chainId, {
                provider: web3Provider,
            })

            const vaultInterface = new VaultInterface(yearn, chainId, yearn.context)

            const tResponse = await vaultInterface.deposit(
                this.stakeToken.address,
                this.bareToken.address,
                value.toString(),
                account,
                {},
                {
                    gasLimit: gasEstimate.isFinite() ? gasEstimate.toNumber() : Number.NaN,
                },
            )

            return true
        } catch (error) {
            console.error('YFI deposit ERROR: ', error)
            return false
        }
    }

    public async withdrawEstimate(account: string, chainId: ChainIdYearn, web3: Web3, value: BigNumber.Value) {
        const gasEstimate = '5000000'
        return new BigNumber(gasEstimate)
    }

    public async withdraw(account: string, chainId: ChainIdYearn, web3: Web3, value: BigNumber.Value) {
        try {
            const gasEstimate = await this.withdrawEstimate(account, chainId, web3, value)

            const web3Provider = new Web3Provider(web3.currentProvider as ExternalProvider)
            const yearn = new Yearn(chainId, {
                provider: web3Provider,
            })

            const vaultInterface = new VaultInterface(yearn, chainId, yearn.context)

            const tResponse = await vaultInterface.withdraw(
                this.stakeToken.address,
                this.bareToken.address,
                value.toString(),
                account,
                {},
                {
                    gasLimit: gasEstimate.toNumber(),
                },
            )

            return true
        } catch (error) {
            console.error('YFI Withdraw ERROR: ', error)
            return false
        }
    }
}
