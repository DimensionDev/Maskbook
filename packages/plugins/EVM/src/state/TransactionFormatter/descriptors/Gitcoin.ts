import { TransactionContext, formatBalance, i18NextInstance } from '@masknet/web3-shared-base'
import { ChainId, getGitcoinConstant, getNativeTokenAddress } from '@masknet/web3-shared-evm'
import { BigNumber } from 'bignumber.js'
import { Web3StateSettings } from '../../../settings/index.js'
import type { TransactionDescriptor } from '../types.js'

type ParameterTuple = {
    0: string
    1: string
    2: string
    /** #0 */
    token: string
    /** #1 */
    amount: string
    /** #2 */
    dest: string
}
export class GitcoinDescriptor implements TransactionDescriptor {
    async compute(context_: TransactionContext<ChainId, string | boolean | undefined>) {
        const context = context_ as unknown as TransactionContext<ChainId, ParameterTuple[]>
        if (!context.methods?.length) return

        const hub = Web3StateSettings.value.Hub?.getHub?.({
            chainId: context.chainId,
        })

        const GITCOIN_ETH_ADDRESS = getGitcoinConstant(context.chainId, 'GITCOIN_ETH_ADDRESS')
        const nativeTokenAddress = getNativeTokenAddress(context.chainId)

        for (const { name, parameters } of context.methods) {
            if (name === 'donate' && parameters) {
                const tokenAddress = parameters._donations[0].token
                const address = tokenAddress === GITCOIN_ETH_ADDRESS ? nativeTokenAddress : tokenAddress
                const token = await hub?.getFungibleToken?.(address, { chainId: context.chainId })
                const amount = new BigNumber(parameters._donations[0].amount)
                    .plus(parameters._donations[1].amount)
                    .toFixed()
                return {
                    chainId: context.chainId,
                    tokenInAddress: address,
                    tokenInAmount: amount,
                    title: i18NextInstance.t('plugin_infra_descriptor_gitcoin_donate_title'),
                    description: i18NextInstance.t('plugin_infra_descriptor_gitcoin_submitted', {
                        amount: formatBalance(amount, token?.decimals, 6),
                        symbol: token?.symbol,
                    }),
                    snackbar: {
                        successfulDescription: i18NextInstance.t('plugin_infra_descriptor_gitcoin_donate_success', {
                            amount: formatBalance(amount, token?.decimals, 6),
                            symbol: token?.symbol,
                        }),
                        failedDescription: i18NextInstance.t('plugin_infra_descriptor_gitcoin_donate_fail'),
                    },
                }
            }
        }

        return
    }
}
