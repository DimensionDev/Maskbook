import BigNumber from 'bignumber.js'
import { ZERO } from '@masknet/web3-shared-base'
import type Web3 from 'web3'
import { ChainId, createContract, FungibleTokenDetailed, getSavingsConstants, getTokenConstants, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { ProtocolType, SavingsProtocol } from '../types'
import type { AbiItem } from 'web3-utils'

import type { VenusToken } from "@masknet/web3-contracts/types/venusToken"
import type { Vbep } from "@masknet/web3-contracts/types/vbep"
import  vbepABI  from "@masknet/web3-contracts/abis/vbep.json"
import  venusTokenABI  from "@masknet/web3-contracts/abis/venusToken.json"

import { CONTRACT_VBEP_ADDRESS, CONTRACT_TOKEN_ADDRESS } from '../constants/venus'
import  XvsVaultABI  from "@masknet/web3-contracts/abis/xvsVault.json";
import  XvsABI  from "@masknet/web3-contracts/abis/xvs.json";
import type { XvsVault } from "@masknet/web3-contracts/types/xvsVault";
import type { Xvs }  from "@masknet/web3-contracts/types/xvs";
import type BigNumber from 'bignumber.js';



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
        const vTokenAddress = CONTRACT_TOKEN_ADDRESS.find(vault => vault.address === this.bareToken.address)
        const vaultAddress = getSavingsConstants(chainId).VENUS_VAULT_PROXY
        const TokenAddress = CONTRACT_VBEP_ADDRESS.find(vault => vault.address === this.stakeToken.address)

        try {

            const contract = createContract<Xvs>(
                    web3,
                    vTokenAddress?.address || ZERO_ADDRESS,
                    XvsABI as AbiItem[],
                )

            const vaultAddress = getSavingsConstants(chainId).VENUS_VAULT_PROXY || ZERO_ADDRESS
            const vaultAddressContract = createContract<XvsVault>(
                web3,
                vaultAddress,
                XvsVaultABI as AbiItem[]
                )


            const xvsTokenPoolLength = await vaultAddressContract?.methods.poolLength(vTokenAddress?.address!).call();

            const fetchPoolParameters = Array.from({ length: xvsTokenPoolLength }).map(
            (_, index) => ({ rewardToken: vTokenAddress, pid: index }),
            );


            async function fetchOnePool(param: { rewardToken: any; pid: any }) {
                const [poolInfo, rewardPerBlock, totalAllocPoints] = await Promise.all([
                  vaultAddressContract?.methods.poolInfos(param.rewardToken, param.pid).call(),
                  vaultAddressContract?.methods
                    .rewardTokenAmountsPerBlock(param.rewardToken)
                    .call(),

                  vaultAddressContract?.methods.totalAllocPoints(param.rewardToken).call(),
                ]);

                const totalStaked = await contract?.methods.balanceOf(vaultAddress).call();

                let [userPendingRewards, userInfo] = [
                  '0',
                  {
                    amount: '0',
                    pendingWithdrawals: [],
                    rewardDebt: '0',
                  },
                ];


                const rewardPerBlockOfPool = new BigNumber(rewardPerBlock!)
                  .multipliedBy(poolInfo?.allocPoint!)
                  .div(totalAllocPoints!);
                const blockPerDay = 86400 / 3; // per 3 seconds for a block
                const dailyEmission = new BigNumber(rewardPerBlockOfPool).multipliedBy(
                  blockPerDay,
                );

                return {
                  poolId: new BigNumber(param.pid),
                  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                  stakedToken: tokenAddressNameMap[poolInfo.token],
                  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                  rewardToken: tokenAddressNameMap[param.rewardToken],
                  pendingReward: new BigNumber(userPendingRewards),
                  userStakedAmount: new BigNumber(userInfo.amount),
                  lockPeriodSecond: new BigNumber(poolInfo?.lockPeriod!),
                  apr: new BigNumber(dailyEmission).multipliedBy(365).div(totalStaked!),
                  totalStaked: new BigNumber(totalStaked!),
                  dailyEmission,
                };
              }

            const patchedPoolInfos = await Promise.all(
                fetchPoolParameters.map(param => fetchOnePool(param))
            );


            this._apr =  await patchedPoolInfos.apr ||  0.0
        } catch (error) {
            this._apr = VenusProtocol.DEFAULT_APR
        }
    }

    public async updateBalance(chainId: ChainId, web3: Web3, account: string) {
        const vTokenAddress = CONTRACT_TOKEN_ADDRESS.find(vault => vault.address === this.bareToken.address)
        try {
            const contract = createContract<Xvs>(
                web3,
                vTokenAddress?.address || ZERO_ADDRESS,
                XvsABI as AbiItem[],
            )

            const userBalance = await contract?.methods.balanceOf(account).call()

            this._balance = new BigNumber(userBalance!)

        } catch (error) {
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
            return ZERO
        }
    }

    private async createDepositTokenOperation(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        const vTokenAddress = CONTRACT_TOKEN_ADDRESS.find(vault => vault.address === this.bareToken.address)
        const TokenAddress = CONTRACT_VBEP_ADDRESS.find(vault => vault.address === this.stakeToken.address)


        const vaultAddress = getSavingsConstants(chainId).VENUS_VAULT_PROXY || ZERO_ADDRESS
        const vaultAddressContract = createContract<XvsVault>(
            web3,
            vaultAddress,
            XvsVaultABI as AbiItem[]
        )


        const xvsTokenPoolLength = await vaultAddressContract?.methods.poolLength(vTokenAddress?.address).call();

        const fetchPoolParameters = Array.from({ length: xvsTokenPoolLength }).map(
        (_, index) => ({ rewardToken: vTokenAddress, pid: index }),
        );

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
        //todo withdrawEstimate
        try {
            return true
        } catch (error) {
            return ZERO
        }
    }

    public async withdraw(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value) {
        try {
            const vbepContract = createContract<Vbep>(
                web3,
                getSavingsConstants(chainId).VENUS_vBEP20_DELEGATE || ZERO_ADDRESS,
                vbepABI as AbiItem[],
            )
            const vToken = createContract<VenusToken>(
                web3,
                getTokenConstants(chainId).vXVS_ADDRESS || ZERO_ADDRESS,
                venusTokenABI as AbiItem[],
            )

            // await vToken?.methods.approve({
            //     asset.vtokenAddress,
            //     new BigNumber(2)
            //         .pow(256)
            //         .minus(1)
            //         .toString(10),
            //     )
            // })

            await vbepContract?.methods.mint(new BigNumber(value).pow(8)).toString(10).send({
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
    }

}
function vault(vault: any, arg1: { address: any }) {
    throw new Error('Function not implemented.')
}

