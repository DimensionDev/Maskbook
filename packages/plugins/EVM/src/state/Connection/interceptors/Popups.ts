import { isUndefined, omitBy } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import {
    ErrorEditor,
    type Middleware,
    type ConnectionContext,
    type TransactionOptions,
    getMaskTokenAddress,
    getSmartPayConstants,
    DepositPaymaster,
    PayloadEditor,
} from '@masknet/web3-shared-evm'
import { ExtensionSite, getSiteType, isEnhanceableSiteType } from '@masknet/shared-base'
import { SmartPayBundler, Web3 } from '@masknet/web3-providers'
import { isGreaterThan, toFixed } from '@masknet/web3-shared-base'
import { SharedContextSettings } from '../../../settings/index.js'

const DEFAULT_PAYMENT_TOKEN_STATE = {
    allowMaskAsGas: false,
    paymentToken: undefined,
}

export class Popups implements Middleware<ConnectionContext> {
    private async getPaymentToken(context: ConnectionContext) {
        try {
            const smartPayChainId = await SmartPayBundler.getSupportedChainId()
            if (context.chainId !== smartPayChainId || !context.owner) return DEFAULT_PAYMENT_TOKEN_STATE

            const { PAYMASTER_MASK_CONTRACT_ADDRESS } = getSmartPayConstants(context.chainId)
            if (!PAYMASTER_MASK_CONTRACT_ADDRESS) return DEFAULT_PAYMENT_TOKEN_STATE

            const maskAddress = getMaskTokenAddress(context.chainId)

            const contract = Web3.getERC20Contract(context.chainId, maskAddress)

            if (!contract) return DEFAULT_PAYMENT_TOKEN_STATE

            const depositPaymaster = new DepositPaymaster(context.chainId)
            const ratio = await depositPaymaster.getRatio()

            const { signableConfig } = PayloadEditor.fromPayload(context.request, {
                chainId: context.chainId,
            })

            if (!signableConfig?.maxFeePerGas) return DEFAULT_PAYMENT_TOKEN_STATE

            const gas = await context.connection.estimateTransaction?.(signableConfig, undefined, {
                paymentToken: maskAddress,
            })

            const maskGasFee = toFixed(
                new BigNumber(signableConfig.maxFeePerGas)
                    .multipliedBy(gas ?? 0)
                    .integerValue()
                    .multipliedBy(ratio),
                0,
            )

            const maskBalance = await Web3.getFungibleTokenBalance(context.chainId, maskAddress, context.account)

            const maskAllowance = await contract.methods
                .allowance(context.account, PAYMASTER_MASK_CONTRACT_ADDRESS)
                .call({ from: context.account })

            const availableBalanceTooLow =
                isGreaterThan(maskGasFee, maskAllowance) || isGreaterThan(maskGasFee, maskBalance)

            return {
                allowMaskAsGas: !availableBalanceTooLow,
                paymentToken: context.paymentToken ?? !availableBalanceTooLow ? maskAddress : undefined,
            }
        } catch (error) {
            return {
                allowMaskAsGas: false,
                paymentToken: undefined,
            }
        }
    }
    async fn(context: ConnectionContext, next: () => Promise<void>) {
        // Draw the Popups up and wait for user confirmation before publishing risky requests on the network
        if (context.risky && context.writeable) {
            const paymentToken = await this.getPaymentToken(context)
            const options = omitBy<TransactionOptions>(
                {
                    owner: context.owner,
                    identifier: context.identifier?.toText(),
                    popupsWindow: getSiteType() === ExtensionSite.Dashboard || isEnhanceableSiteType(),
                    ...paymentToken,
                },
                isUndefined,
            )
            const response = await SharedContextSettings.value.send(context.request, options)
            const editor = ErrorEditor.from(null, response)

            if (editor.presence) {
                context.abort(editor.error)
            } else {
                context.write(response.result)
            }
        }
        await next()
    }
}
