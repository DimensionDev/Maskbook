import type { Web3Helper } from '@masknet/web3-helpers'
import {
    isNativeTokenAddress,
    type ChainId,
    getTraderConstants,
    getOpenOceanConstants,
    ProviderURL,
    type Transaction,
    ContractTransaction,
    type SchemaType,
    createContract,
    getTokenConstants,
    isNativeTokenSchemaType,
} from '@masknet/web3-shared-evm'
import { TradeStrategy, type TradeComputed, type TraderAPI } from '../types/Trader.js'
import { ZERO, isZero, leftShift, pow10 } from '@masknet/web3-shared-base'
import { OPENOCEAN_BASE_URL, OPENOCEAN_SUPPORTED_CHAINS } from './constants/openocean.js'
import type { SwapOOData, SwapOORequest } from './types/openocean.js'
import { fetchJSON } from '../entry-helpers.js'
import urlcat from 'urlcat'
import { TradeProvider } from '@masknet/public-api'
import { BigNumber } from 'bignumber.js'
import { pick } from 'lodash-es'
import { Web3API } from '../Connection/index.js'
import WETH_ABI from '@masknet/web3-contracts/abis/WETH.json'
import type { WETH } from '@masknet/web3-contracts/types/WETH.js'
import type { AbiItem } from 'web3-utils'

export class OpenOcean implements TraderAPI.Provider {
    private Web3 = new Web3API()
    public provider = TradeProvider.OPENOCEAN
    private async swapOO(request: SwapOORequest) {
        const payload = await fetchJSON<{
            data: string
            outAmount: string
            minOutAmount: number
            to: string
            value: string
            estimatedGas: string
        }>(
            urlcat(OPENOCEAN_BASE_URL, `/${request.chainId}/swap`, {
                inTokenSymbol: request.toToken?.symbol,
                inTokenAddress: request.fromToken?.address,
                outTokenSymbol: request.toToken?.symbol,
                outTokenAddress: request.toToken?.address,
                amount: request.fromAmount,
                gasPrice: 5000000000,
                slippage: request.slippage,
                disabledDexIds: '',
                account: request.userAddr,
                referrer: getOpenOceanConstants(request.chainId).REFERRER_ADDRESS?.toLowerCase(),
            }),
        )

        const { data, outAmount, minOutAmount, to, value, estimatedGas } = payload
        const _resAmount = leftShift(outAmount, request.toToken.decimals).toNumber()
        const _fromAmount = leftShift(request.fromAmount, request.fromToken.decimals).toNumber()

        return {
            data,
            estimatedGas,
            targetApproveAddr: request.fromToken.address,
            targetDecimals: request.fromToken.decimals,
            resAmount: _resAmount,
            fromAmount: _fromAmount,
            resPricePerFromToken: +(_fromAmount / _resAmount).toFixed(8),
            resPricePerToToken: +(_resAmount / _fromAmount).toFixed(8),
            to,
            value,
            slippage: request.slippage,
            fromTokenSymbol: request.fromToken.symbol,
            toTokenSymbol: request.toToken.symbol,
            minOutAmount,
        } as SwapOOData
    }
    private async getTrade(
        chainId: ChainId,
        account: string,
        inputAmount: string,
        slippage: number,
        inputToken?: Web3Helper.FungibleTokenAll,
        outputToken?: Web3Helper.FungibleTokenAll,
    ) {
        const { OPENOCEAN_ETH_ADDRESS } = getTraderConstants(chainId)
        if (isZero(inputAmount) || !inputToken || !outputToken || !OPENOCEAN_SUPPORTED_CHAINS.includes(chainId))
            return null

        const sellToken = isNativeTokenAddress(inputToken.address)
            ? { ...inputToken, address: OPENOCEAN_ETH_ADDRESS ?? '' }
            : inputToken
        const buyToken = isNativeTokenAddress(outputToken.address)
            ? { ...outputToken, address: OPENOCEAN_ETH_ADDRESS ?? '' }
            : outputToken

        return this.swapOO({
            isNativeSellToken: isNativeTokenAddress(inputToken.address),
            fromToken: sellToken,
            toToken: buyToken,
            fromAmount: inputAmount,
            slippage,
            userAddr: account,
            rpc: ProviderURL.from(chainId),
            chainId,
        })
    }
    public async getTradeInfo(
        chainId: ChainId,
        account: string,
        inputAmount_: string,
        slippage: number,
        inputToken?: Web3Helper.FungibleTokenAll | undefined,
        outputToken?: Web3Helper.FungibleTokenAll | undefined,
    ) {
        try {
            const trade = await this.getTrade(chainId, account, inputAmount_, slippage, inputToken, outputToken)
            if (!trade || !inputToken || !outputToken) return null

            const inputAmount = new BigNumber(trade.fromAmount).multipliedBy(pow10(inputToken.decimals)).integerValue()
            const executionPrice = new BigNumber(trade.resPricePerToToken)
            const outputAmount = new BigNumber(trade.resAmount).multipliedBy(pow10(outputToken.decimals)).integerValue()
            const priceImpact = new BigNumber(trade.priceImpact ?? 0)

            const computed: TradeComputed<SwapOOData> = {
                strategy: TradeStrategy.ExactIn,
                inputToken,
                outputToken,
                inputAmount,
                outputAmount,
                executionPrice,
                fee: ZERO,
                maximumSold: inputAmount,
                minimumReceived: new BigNumber(trade.minOutAmount),
                // minimumProtocolFee
                priceImpact,

                trade_: { ...trade },
            }

            try {
                const gas = await this.getTradeGasLimit(account, chainId, computed)

                return {
                    gas,
                    value: computed,
                    provider: this.provider,
                }
            } catch {
                return {
                    value: computed,
                    provider: this.provider,
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                return {
                    value: null,
                    error,
                    provider: this.provider,
                }
            }
            return null
        }
    }

    public async getNativeWrapperTradeInfo(
        chainId: ChainId,
        account: string,
        inputAmount: string,
        inputToken?: Web3Helper.FungibleTokenAll,
        outputToken?: Web3Helper.FungibleTokenAll,
    ) {
        const web3 = this.Web3.getWeb3(chainId)
        const tradeAmount = new BigNumber(inputAmount || '0')
        const { WNATIVE_ADDRESS } = getTokenConstants(chainId)
        if (tradeAmount.isZero() || !inputToken || !outputToken || !WNATIVE_ADDRESS) return null

        const wrapperContract = createContract<WETH>(web3, WNATIVE_ADDRESS, WETH_ABI as AbiItem[])

        const computed = {
            strategy: TradeStrategy.ExactIn,
            inputToken,
            outputToken,
            inputAmount: tradeAmount,
            outputAmount: tradeAmount,
            executionPrice: ZERO,
            maximumSold: ZERO,
            minimumReceived: tradeAmount,
            priceImpact: ZERO,
            fee: ZERO,
            trade_: {
                isWrap: isNativeTokenSchemaType(inputToken.schema as SchemaType),
                isNativeTokenWrapper: true,
            },
        }

        try {
            const tx = await new ContractTransaction(wrapperContract).fillAll(wrapperContract?.methods.deposit(), {
                from: account,
                value: tradeAmount.toFixed(),
            })

            const gas = tx.gas ?? '0'

            return {
                gas,
                provider: this.provider,
                value: computed,
            }
        } catch {
            return {
                value: computed,
                provider: this.provider,
            }
        }
    }

    public getTradeGasLimit(account: string, chainId: ChainId, tradeComputed: TradeComputed<SwapOOData>) {
        if (!tradeComputed.trade_?.estimatedGas) return tradeComputed.trade_?.estimatedGas
        const config = {
            from: account,
            ...pick(tradeComputed.trade_, ['to', 'data', 'value']),
        } as Transaction

        if (!config.value) return '0'

        return this.Web3.estimateTransaction(chainId, config, 0)
    }
}
