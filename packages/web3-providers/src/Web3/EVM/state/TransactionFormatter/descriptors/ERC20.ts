import { BigNumber } from 'bignumber.js'
import {
    type TransactionContext,
    isZero,
    isSameAddress,
    type FormattedTransactionSnackbarSuccessDescription,
    type FormattedTransactionDescription,
    type FormattedTransactionTitle,
} from '@masknet/web3-shared-base'
import {
    type ChainId,
    type TransactionParameter,
    SchemaType,
    ProviderType,
    formatEthereumAddress,
} from '@masknet/web3-shared-evm'
import { evm } from '../../../../../Manager/registry.js'
import { BaseDescriptor } from './Base.js'
import type { TransactionDescriptorFormatResult } from '../types.js'
import { getTokenAmountDescription } from '../utils.js'

export class ERC20Descriptor extends BaseDescriptor {
    override async compute(
        context_: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorFormatResult | undefined> {
        const context = context_ as TransactionContext<ChainId>
        if (!context.methods?.length) return

        for (const { name, parameters } of context.methods) {
            switch (name) {
                case 'approve':
                    if (parameters?.spender === undefined || parameters?.value === undefined) break
                    const token = await this.Hub.getFungibleToken(context.to ?? '', { chainId: context.chainId })

                    const revokeTitle: FormattedTransactionTitle = 'Revoke Token'
                    const approveTitle: FormattedTransactionTitle = 'Unlock Token'
                    const revokeDescription: FormattedTransactionDescription =
                        token?.symbol ?
                            { key: 'Revoke the approval for {symbol}.', symbol: token.symbol }
                        :   'Revoke the approval for token'
                    const approveDescription: FormattedTransactionDescription =
                        token?.symbol ? { key: 'Unlock {symbol}.', symbol: token.symbol } : 'Unlock token'
                    const revokeSuccessDescription: FormattedTransactionSnackbarSuccessDescription =
                        'The token approval revoked.'
                    const approveSuccessDescription: FormattedTransactionSnackbarSuccessDescription =
                        token?.symbol ? { key: '{symbol} unlocked', symbol: token.symbol } : 'Token unlocked'

                    if (evm.state?.Provider?.providerType?.getCurrentValue() === ProviderType.MetaMask) {
                        const spenders = await this.Hub.getFungibleTokenSpenders(context.chainId, context.from, {
                            chainId: context.chainId,
                        })

                        const spender = spenders?.find(
                            (x) =>
                                isSameAddress(x.address, parameters?.spender) &&
                                isSameAddress(x.tokenInfo.address, context.to),
                        )

                        const spendingCap = new BigNumber(
                            spender?.amount ?? spender?.rawAmount ?? parameters.value,
                        ).toString()

                        const successfulDescription: FormattedTransactionSnackbarSuccessDescription =
                            isZero(parameters.value) ?
                                isZero(spendingCap) ? revokeSuccessDescription
                                :   {
                                        key: "You've approved {token} for {spender}. If you want to revoke this token, please set spending cap amount to 0.",
                                        spender:
                                            spender?.address ? formatEthereumAddress(spender.address, 4) : 'spender',
                                        token: getTokenAmountDescription(spendingCap, token),
                                    }
                            : isZero(spendingCap) ?
                                {
                                    key: "You didn't approve {symbol}. Please do not set spending cap to 0 and try it again.",
                                    symbol: token?.symbol || '',
                                }
                            :   approveSuccessDescription

                        const successfulTitle =
                            isZero(parameters.value) && !isZero(spendingCap) ? approveTitle : undefined

                        return {
                            chainId: context.chainId,
                            tokenInAddress: token?.address,
                            title: isZero(parameters.value) ? revokeTitle : approveTitle,
                            description: isZero(parameters.value) ? revokeDescription : approveDescription,
                            snackbar: {
                                successfulDescription,
                                successfulTitle,
                                failedDescription:
                                    isZero(parameters.value) ?
                                        'Failed to revoke token contract.'
                                    :   'Failed to unlock token contract.',
                            },
                            popup: {
                                method: name,
                            },
                        }
                    }

                    if (isZero(parameters.value)) {
                        return {
                            chainId: context.chainId,
                            tokenInAddress: token?.address,
                            title: revokeTitle,
                            description: revokeDescription,
                            popup: {
                                method: name,
                            },
                            snackbar: {
                                successfulDescription: revokeSuccessDescription,
                                failedDescription: 'Failed to revoke token contract.',
                            },
                        }
                    }

                    return {
                        chainId: context.chainId,
                        title: approveTitle,
                        tokenInAddress: token?.address,
                        tokenInAmount: parameters?.value,
                        description: approveDescription,
                        popup: {
                            spender: parameters.spender,
                            method: name,
                        },
                        snackbar: {
                            successfulDescription: approveSuccessDescription,
                            failedDescription: 'Failed to unlock token contract.',
                        },
                    }
            }

            if (
                (name === 'transfer' || name === 'transferFrom') &&
                parameters?.to &&
                parameters.value &&
                !parameters.tokenId
            ) {
                const schemaType = await this.Web3.getSchemaType(context.to ?? '', { chainId: context.chainId })
                if (schemaType === SchemaType.ERC721) return
                const token = await this.Hub.getFungibleToken(context.to ?? '', { chainId: context.chainId })
                return {
                    chainId: context.chainId,
                    tokenInAddress: token?.address,
                    tokenInAmount: parameters?.value,
                    title: 'Transfer Token',
                    description: { key: 'Send {token}', token: getTokenAmountDescription(parameters?.value, token) },
                    snackbar: {
                        successfulDescription: {
                            key: '{token} sent.',
                            token: getTokenAmountDescription(parameters?.value, token),
                        },
                        failedDescription: 'Failed to send token.',
                    },
                    popup: {
                        method: name,
                    },
                }
            }
        }

        return
    }
}
