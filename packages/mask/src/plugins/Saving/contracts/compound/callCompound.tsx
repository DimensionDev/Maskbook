import cEtherAbi from '@masknet/web3-contracts/abis/cEther.json'
import cTokenAbi from '@masknet/web3-contracts/abis/cToken.json'
import { createContract, useAccount, useWeb3, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import type { AbiItem } from 'web3-utils'
import type { CompoundMarket } from '../../contracts/compound/useCompound'
import * as BN from 'bignumber.js'
import { useCallback } from 'react'
import { useCustomSnackbar } from '@masknet/theme'
const { default: BigNumber } = BN

const _supplyMarket = async (web3: any, account: string, market: CompoundMarket, amount: string | number) => {
    const isEth = market.underlying.address !== ZERO_ADDRESS
    const decimals = isEth ? market.cToken.decimals : market.underlying.decimals
    amount = +amount
    let _amount = new BN.BigNumber(amount).multipliedBy(Math.pow(10, decimals)).integerValue(BigNumber.ROUND_DOWN)

    const balance = new BN.BigNumber(market.underlying.balance ?? '0')
    if (_amount.gt(balance)) {
        _amount = balance
    }
    const abi = isEth ? cEtherAbi : cTokenAbi
    if (isEth) {
        const underlyingContract = createContract(web3, market.underlying.address, abi as AbiItem[])
        const allowance = await underlyingContract?.methods.allowance(account, market.cToken.address).call()
        const notEnough = new BN.BigNumber(allowance).lt(_amount)
        if (notEnough) {
            const gasEstimate = await underlyingContract?.methods.approve(market.cToken.address, _amount).estimateGas({
                from: account,
            })
            await underlyingContract?.methods.approve(market.cToken.address, _amount).send({
                from: account,
                gas: gasEstimate,
            })
        }
    }
    const cTokenContract = createContract(web3, market.cToken.address, abi as AbiItem[])

    if (isEth) {
        const gasEstimate = await cTokenContract?.methods.mint(_amount).estimateGas({
            from: account,
        })
        await cTokenContract?.methods.mint(_amount).send({
            from: account,
            gas: gasEstimate,
        })
    } else {
        const gasEstimate = await cTokenContract?.methods.mint().estimateGas({
            from: account,
            value: _amount,
        })
        await cTokenContract?.methods.mint().send({
            from: account,
            value: _amount,
            gas: gasEstimate,
        })
    }
}

export const useSupplyCallback = () => {
    const web3 = useWeb3()
    const account = useAccount()
    const { showSnackbar } = useCustomSnackbar()

    const supplyMarket = useCallback(
        async (market: CompoundMarket, amount: string | number) => {
            if (+amount <= 0 || +amount > (market.underlying.balance || 0)) {
                showSnackbar('Please enter a valid amount.', {
                    variant: 'error',
                })
                return
            }
            try {
                return await _supplyMarket(web3, account, market, amount)
            } catch (error: any) {
                showSnackbar(error.message, {
                    variant: 'error',
                })
            }
        },
        [web3, account],
    )

    return [supplyMarket] as const
}

const _redeemMarket = async (web3: any, account: string, market: CompoundMarket, amount: string | number) => {
    amount = +amount
    const _amount = new BN.BigNumber(amount).multipliedBy(Math.pow(10, market.cToken.decimals)).integerValue()

    BN.BigNumber
    const abi = market.underlying.address === ZERO_ADDRESS ? cEtherAbi : cTokenAbi
    const cTokenContract = createContract(web3, market.cToken.address, abi as AbiItem[])
    const gasEstimate = await cTokenContract?.methods.redeem(_amount).estimateGas({
        from: account,
    })
    await cTokenContract?.methods.redeem(_amount).send({
        from: account,
        gas: gasEstimate,
    })
}

export const useRedemCallback = () => {
    const web3 = useWeb3()
    const account = useAccount()
    const { showSnackbar } = useCustomSnackbar()

    const redeemMarket = useCallback(
        async (market: CompoundMarket, amount: string | number) => {
            if (+amount <= 0 || +amount > (market.cToken.balance || 0)) {
                showSnackbar('Please enter a valid amount.', {
                    variant: 'error',
                })
                return
            }
            try {
                return await _redeemMarket(web3, account, market, amount)
            } catch (error: any) {
                showSnackbar(error.message, {
                    variant: 'error',
                })
            }
        },
        [web3, account],
    )

    return [redeemMarket] as const
}
