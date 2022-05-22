import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { pow10, ZERO } from '@masknet/web3-shared-base'
import { ChainId, createContract, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import type { AaveLendingPool } from '@masknet/web3-contracts/types/AaveLendingPool'
import AaveLendingPoolABI from '@masknet/web3-contracts/abis/AaveLendingPool.json'
import { ProtocolType, SavingsProtocol } from '../../../types'
import AAVELikeFetcher from '../AAVELikeFetcher'

export default class AAVELikeProtocol implements SavingsProtocol {
    static DEFAULT_APR = '0.00'

    private _apr = '0.00'
    private _balance = ZERO
    private poolAddress
    private dataProviderAddr

    constructor(
        readonly pair: [FungibleTokenDetailed, FungibleTokenDetailed],
        poolAddress: string,
        dataProviderAddr: string,
    ) {
        this.poolAddress = poolAddress
        this.dataProviderAddr = dataProviderAddr
    }

    get type() {
        return ProtocolType.AAVE
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
        return this.poolAddress
    }

    public async updateApr(chainId: ChainId, web3: Web3) {
        try {
            const contract = AAVELikeFetcher.getProtocolDataContract(this.dataProviderAddr, chainId, web3)
            if (contract === null) {
                return
            }
            const reserveData = await contract?.methods.getReserveData(this.bareToken.address).call()
            const liquidityRate = reserveData.liquidityRate
            const RAY = pow10(27) // 10 to the power 27
            // // APY and APR are returned here as decimals, multiply by 100 to get the percents
            this._apr = new BigNumber(liquidityRate).times(100).div(RAY).toFixed(2)
        } catch (error) {
            console.error('AAVELikeProtocol: Apr Error:', error)
            this._apr = AAVELikeProtocol.DEFAULT_APR
        }
    }

    public async updateBalance(chainId: ChainId, web3: Web3, account: string) {
        try {
            const contract = AAVELikeFetcher.getProtocolDataContract(this.dataProviderAddr, chainId, web3)
            if (contract === null) {
                return
            }
            const userReserveData = await contract?.methods.getUserReserveData(this.bareToken.address, account).call()
            this._balance = new BigNumber(userReserveData.currentATokenBalance)
        } catch (error) {
            console.error('AAVELikeProtocol BALANCE ERROR: ', error)
            this._balance = ZERO
        }
    }

    public async depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const operation = await this.createDepositTokenOperation(account, chainId, web3, value)
            const gasEstimate = await operation?.estimateGas({
                from: account,
            })

            return new BigNumber(gasEstimate || 0)
        } catch (error) {
            console.error('AAVELikeProtocol deposit estimate ERROR: ', error)
            return ZERO
        }
    }

    private async createDepositTokenOperation(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const contract = createContract<AaveLendingPool>(web3, this.poolAddress, AaveLendingPoolABI as AbiItem[])
        return contract?.methods.deposit(this.bareToken.address, new BigNumber(value).toFixed(), account, '0')
    }

    public async deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const gasEstimate = await this.depositEstimate(account, chainId, web3, value)
            const operation = await this.createDepositTokenOperation(account, chainId, web3, value)
            if (operation) {
                return operation.send({
                    from: account,
                    gas: gasEstimate.toNumber(),
                })
            }
        } catch (error) {}
        return null
    }

    public async withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const contract = createContract<AaveLendingPool>(web3, this.poolAddress, AaveLendingPoolABI as AbiItem[])
            const gasEstimate = await contract?.methods
                .withdraw(this.bareToken.address, new BigNumber(value).toFixed(), account)
                .estimateGas({
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
            const contract = createContract<AaveLendingPool>(web3, this.poolAddress, AaveLendingPoolABI as AbiItem[])
            await contract?.methods.withdraw(this.bareToken.address, new BigNumber(value).toFixed(), account).send({
                from: account,
                gas: gasEstimate.toNumber(),
            })
            return true
        } catch (error) {
            return false
        }
    }
}
