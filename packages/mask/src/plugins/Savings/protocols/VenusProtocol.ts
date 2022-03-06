import { pow10, ZERO } from '@masknet/web3-shared-base'
import type Web3 from 'web3'
import {
    ChainId,
    createContract,
    FungibleTokenDetailed,
    getSavingsConstants,
    ZERO_ADDRESS,
} from '@masknet/web3-shared-evm'
import { ProtocolType, SavingsProtocol } from '../types'
import type { AbiItem } from 'web3-utils'

import type { VenusToken } from '@masknet/web3-contracts/types/venusToken'
import type { Vbep } from '@masknet/web3-contracts/types/vbep'
import type { Vbnb } from '@masknet/web3-contracts/types/vbnb'
import vbepABI from '@masknet/web3-contracts/abis/vbep.json'
import VbnbABI from '@masknet/web3-contracts/abis/vbnb.json'
import venusTokenABI from '@masknet/web3-contracts/abis/venusToken.json'

import { CONTRACT_VBEP_ADDRESS, CONTRACT_TOKEN_ADDRESS, VENUS_SUBGRAPH } from '../constants/venus'
import XvsVaultABI from '@masknet/web3-contracts/abis/xvsVault.json'
import type { XvsVault } from '@masknet/web3-contracts/types/xvsVault'
import BigNumber from 'bignumber.js'

export class VenusProtocol implements SavingsProtocol {
    static DEFAULT_APR = '0.17'

    private _apr = '0.00'
    private _balance = ZERO

    readonly type = ProtocolType.Venus

    constructor(readonly pair: [FungibleTokenDetailed, FungibleTokenDetailed]) {}

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
            const subgraphUrl = VENUS_SUBGRAPH

            if (!subgraphUrl) {
                this._apr = VenusProtocol.DEFAULT_APR
            }

            const body = JSON.stringify({
                query: `{

                    markets(where: {
                        underlyingAddress: "${this.bareToken.address}"
                    })) {
                        id
                        underlyingAddress
                        exchangeRate
                    }

                }`,
            })

            const response = await fetch(subgraphUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body,
            })

            const fullResponse: {
                data: {
                    markets: {
                        id: string
                        underlyingAddress: string
                        exchangeRate: number
                    }[]
                }
            } = await response.json()
            const exchangeRate = +fullResponse.data.markets[0].exchangeRate

            const RAY = pow10(27) // 10 to the power 27
            const SECONDS_PER_YEAR = 31536000

            this._apr = new BigNumber(exchangeRate).div(RAY).toFixed(2)
        } catch (error) {
            this._apr = VenusProtocol.DEFAULT_APR
        }
    }

    public async updateBalance(chainId: ChainId, web3: Web3, account: string) {
        try {
            const subgraphUrl = VENUS_SUBGRAPH || ''
            if (!subgraphUrl) {
                this._apr = VenusProtocol.DEFAULT_APR
            }
            const balanceBody = JSON.stringify({
                query: `{
                    accountVTokens(where:{symbol: "${this.bareToken.symbol}"}){
                        id
                        symbol
                        vTokenBalance
                      }
                }`,
            })

            const balanceResponse = await fetch(subgraphUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: balanceBody,
            })
            const fullResponse: {
                data: {
                    accountVTokens: {
                        id: string
                        symbol: string
                        vTokenBalance: number
                    }[]
                }
            } = await balanceResponse.json()

            // get user balance

            const userReserveBody = JSON.stringify({
                query: `{
                    accountVTokens(where:{account: "${account}", symbol: "${this.bareToken.symbol}"}){
                        id
                        symbol
                        vTokenBalance
                        totalUnderlyingSupplied
                    }
                }`,
            })

            const userReserveBalance = await fetch(subgraphUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: userReserveBody,
            })

            const userResponse: {
                data: {
                    accountVTokens: {
                        totalUnderlyingSupplied: number
                    }
                }
            } = await userReserveBalance.json()

            this._balance = new BigNumber(userResponse.data.accountVTokens.totalUnderlyingSupplied || '0')
        } catch (error) {
            this._balance = ZERO
        }
    }

    public async depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const operation = await this.createDepositTokenOperation(account, chainId, web3, value)
            const gasEstimate = await operation.estimateGas({
                from: account,
            })

            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            return ZERO
        }
    }

    private async createDepositTokenOperation(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const vTokenAddress = CONTRACT_TOKEN_ADDRESS.find((vault) => vault.address === this.bareToken.address)
        const TokenAddress = CONTRACT_VBEP_ADDRESS.find((vault) => vault.address === this.stakeToken.address)

        if (this.bareToken.symbol !== 'bnb') {
            try {
                const vbepContract = createContract<Vbep>(web3, this.bareToken.address, vbepABI as AbiItem[])

                await vbepContract?.methods
                    .mint(new BigNumber(value).times(new BigNumber(10).pow(this.bareToken.decimals)).toString(10))
                    .send({ from: account })
            } catch (err) {
                console.log(err)
            }
        } else {
            try {
                const vBEPaddress = getSavingsConstants(chainId).VENUS_GOVERNOR_DELEGATOR
                const bnbContract = createContract<Vbnb>(web3, vBEPaddress!, VbnbABI as AbiItem[])
                const contractData = bnbContract?.methods.repayBorrow().encodeABI()

                const tx = {
                    from: account,
                    to: bnbContract!,
                    value: value,
                    data: contractData!,
                }

                // send transaction

                await web3.eth.sendTransaction(tx!, (err) => {
                    if (!err) {
                        callback(true)
                    }
                    callback(false)
                })
            } catch (err) {
                callback(false)
            }
        }

        const vaultAddress = getSavingsConstants(chainId).VENUS_VAULT_PROXY || ZERO_ADDRESS
        const vaultAddressContract = createContract<XvsVault>(web3, vaultAddress, XvsVaultABI as AbiItem[])

        const xvsTokenPoolLength = await vaultAddressContract?.methods.poolLength(vTokenAddress?.address).call()

        const fetchPoolParameters = Array.from({ length: xvsTokenPoolLength }).map((_, index) => ({
            rewardToken: vTokenAddress,
            pid: index,
        }))

        // deposit instructions
        return
    }

    public async deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const gasEstimate = await this.depositEstimate(account, chainId, web3, value)
            const operation = await this.createDepositTokenOperation(account, chainId, web3, value)
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

    public async withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const vTokenAddress = CONTRACT_TOKEN_ADDRESS.find((vault) => vault.address === this.bareToken.address)
        const TokenAddress = CONTRACT_VBEP_ADDRESS.find((vault) => vault.address === this.stakeToken.address)

        try {
            const vbepContract = createContract<Vbep>(web3, this.bareToken.address, vbepABI as AbiItem[])

            const gasEstimate = await vbepContract?.methods
                .mint(new BigNumber(value).times(new BigNumber(10).pow(this.bareToken.decimals)).toString(10))
                .estimateGas({
                    from: account,
                })
            return new BigNumber(gasEstimate || 0)
        } catch (err) {
            console.log(err)
        }
    }

    public async withdraw(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const TokenAddress = CONTRACT_VBEP_ADDRESS.find((vault) => vault.address === this.stakeToken.address)
        try {
            const vbepContract = createContract<Vbep>(
                web3,
                getSavingsConstants(chainId).VENUS_vBEP20_DELEGATE || ZERO_ADDRESS,
                vbepABI as AbiItem[],
            )
            const vToken = createContract<VenusToken>(
                web3,
                TokenAddress?.address || ZERO_ADDRESS,
                venusTokenABI as AbiItem[],
            )

            vbepContract?.methods
                .redeemUnderlying(new BigNumber(value).times(new BigNumber(10).pow(18)).integerValue().toString(10))
                .send({
                    from: account,
                    gas: 300000,
                })
            return true
        } catch (error) {
            console.error('VenusProtocol `deposit()` Error', error)
            return false
        }
    }
}
function callback(arg0: boolean) {
    throw new Error('Function not implemented.')
}
