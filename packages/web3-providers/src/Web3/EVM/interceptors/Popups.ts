import { isUndefined, omitBy } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import {
    ErrorEditor,
    type Middleware,
    type TransactionOptions,
    getMaskTokenAddress,
    getSmartPayConstants,
    PayloadEditor,
    EthereumMethodType,
    ProviderType,
    createJsonRpcPayload,
} from '@masknet/web3-shared-evm'
import { ExtensionSite, getSiteType, isEnhanceableSiteType } from '@masknet/shared-base'
import { RequestStateType, isGreaterThan, isZero, toFixed } from '@masknet/web3-shared-base'
import { DepositPaymaster } from '../../../SmartPay/libs/DepositPaymaster.js'
import { SharedContextRef } from '../../../PluginContext/index.js'
import { SmartPayBundlerAPI } from '../../../SmartPay/index.js'
import { ConnectionReadonlyAPI } from '../apis/ConnectionReadonlyAPI.js'
import { ContractReadonlyAPI } from '../apis/ContractReadonlyAPI.js'
import { Web3StateRef } from '../apis/Web3StateAPI.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { Providers } from '../providers/index.js'

const DEFAULT_PAYMENT_TOKEN_STATE = {
    allowMaskAsGas: false,
    paymentToken: undefined,
}

export class Popups implements Middleware<ConnectionContext> {
    private Web3 = new ConnectionReadonlyAPI()
    private Contract = new ContractReadonlyAPI()
    private Bundler = new SmartPayBundlerAPI()

    private async getPaymentToken(context: ConnectionContext) {
        const maskAddress = getMaskTokenAddress(context.chainId)
        try {
            const smartPayChainId = await this.Bundler.getSupportedChainId()
            if (context.chainId !== smartPayChainId || !context.owner) return DEFAULT_PAYMENT_TOKEN_STATE

            const { PAYMASTER_MASK_CONTRACT_ADDRESS } = getSmartPayConstants(context.chainId)
            if (!PAYMASTER_MASK_CONTRACT_ADDRESS) return DEFAULT_PAYMENT_TOKEN_STATE

            const { signableConfig } = PayloadEditor.fromPayload(context.request, {
                chainId: context.chainId,
            })

            if (!signableConfig?.maxFeePerGas) return DEFAULT_PAYMENT_TOKEN_STATE

            const gas = await this.Web3.estimateTransaction?.(signableConfig, undefined, {
                chainId: context.chainId,
                account: context.account,
                paymentToken: maskAddress,
            })

            const depositPaymaster = new DepositPaymaster(context.chainId)
            const ratio = await depositPaymaster.getRatio()

            const maskGasFee = toFixed(
                new BigNumber(signableConfig.maxFeePerGas)
                    .multipliedBy(gas ?? 0)
                    .integerValue()
                    .multipliedBy(ratio),
                0,
            )

            const maskBalance = await this.Web3.getFungibleTokenBalance(maskAddress, undefined, {
                account: context.account,
                chainId: context.chainId,
            })

            const contract = this.Contract.getERC20Contract(maskAddress, { chainId: context.chainId })
            if (!contract) return DEFAULT_PAYMENT_TOKEN_STATE

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
            const nativeBalance = await this.Web3.getNativeTokenBalance({
                account: context.account,
                chainId: context.chainId,
            })

            if (isZero(nativeBalance))
                return { allowMaskAsGas: true, paymentToken: context.paymentToken ?? maskAddress }

            return {
                allowMaskAsGas: false,
                paymentToken: undefined,
            }
        }
    }
    async fn(context: ConnectionContext, next: () => Promise<void>) {
        // Draw the Popups up and wait for user confirmation before publishing risky requests on the network
        if (context.risky && context.writeable) {
            const currentChainId = await this.Web3.getChainId()

            if (context.method === EthereumMethodType.ETH_SEND_TRANSACTION && currentChainId !== context.chainId) {
                await Providers[ProviderType.MaskWallet].switchChain(context.chainId)
            }

            const paymentToken = await this.getPaymentToken(context)
            const requestToBeApproved = {
                state: RequestStateType.NOT_DEPEND,
                arguments: context.requestArguments,
                options: {
                    ...paymentToken,
                    owner: context.owner,
                    identifier: context.identifier?.toText(),
                },
            }

            const request = context.silent
                ? requestToBeApproved
                : await Web3StateRef.value.Request?.applyAndWaitRequest(requestToBeApproved)

            if (!request) {
                context.abort('Failed to approve request.')
                await next()
                return
            }

            const response = await SharedContextRef.value.send(
                createJsonRpcPayload(0, request.arguments),
                omitBy<TransactionOptions>(request.options, isUndefined),
            )
            const editor = ErrorEditor.from(null, response)

            if (editor.presence) {
                context.abort(editor.error)
            } else {
                context.write(response?.result)
            }
        }

        await next()
    }
}
