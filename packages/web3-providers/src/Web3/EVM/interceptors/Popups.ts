import { BigNumber } from 'bignumber.js'
import {
    ErrorEditor,
    type Middleware,
    getMaskTokenAddress,
    getSmartPayConstants,
    PayloadEditor,
    EthereumMethodType,
    type MessageRequest,
    type MessageResponse,
    isNativeTokenAddress,
    getNativeTokenAddress,
} from '@masknet/web3-shared-evm'
import {
    MessageStateType,
    isGreaterThan,
    isZero,
    toFixed,
    type TransferableMessage,
    isSameURL,
} from '@masknet/web3-shared-base'
import * as DepositPaymaster from /* webpackDefer: true */ '../../../SmartPay/libs/DepositPaymaster.js'
import * as SmartPay from /* webpackDefer: true */ '../../../SmartPay/index.js'
import { EVMWeb3Readonly } from '../apis/ConnectionReadonlyAPI.js'
import { EVMContractReadonly } from '../apis/ContractReadonlyAPI.js'
import { evm } from '../../../Manager/registry.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'
import { MaskWalletProviderInstance } from '../providers/index.js'

export class Popups implements Middleware<ConnectionContext> {
    private get networks() {
        if (!evm.state?.Network) throw new Error('The web3 state does not load yet.')
        return evm.state.Network.networks?.getCurrentValue()
    }

    private async getPaymentToken(context: ConnectionContext) {
        const maskAddress = getMaskTokenAddress(context.chainId)
        const nativeTokenAddress = getNativeTokenAddress(context.chainId)

        const DEFAULT_PAYMENT_TOKEN_STATE = {
            allowMaskAsGas: false,
            paymentToken: nativeTokenAddress,
        }
        try {
            const smartPayChainId = await SmartPay.SmartPayBundler.getSupportedChainId()
            if (context.chainId !== smartPayChainId || !context.owner)
                return {
                    allowMaskAsGas: false,
                    paymentToken: undefined,
                }

            const { PAYMASTER_MASK_CONTRACT_ADDRESS } = getSmartPayConstants(context.chainId)
            if (!PAYMASTER_MASK_CONTRACT_ADDRESS) return DEFAULT_PAYMENT_TOKEN_STATE

            const { signableConfig } = PayloadEditor.fromPayload(context.request, {
                chainId: context.chainId,
            })

            if (!signableConfig?.maxFeePerGas) return DEFAULT_PAYMENT_TOKEN_STATE

            const gas = await SmartPay.SmartPayAccount.estimateTransaction?.(smartPayChainId, signableConfig, {
                paymentToken: maskAddress,
            })

            const depositPaymaster = new DepositPaymaster.DepositPaymaster(context.chainId)
            const ratio = await depositPaymaster.getRatio()

            const maskGasFee = toFixed(
                new BigNumber(signableConfig.maxFeePerGas)
                    .multipliedBy(gas ?? 0)
                    .integerValue()
                    .multipliedBy(ratio),
                0,
            )

            const maskBalance = await EVMWeb3Readonly.getFungibleTokenBalance(maskAddress, undefined, {
                account: context.account,
                chainId: context.chainId,
            })

            const contract = EVMContractReadonly.getERC20Contract(maskAddress, { chainId: context.chainId })
            if (!contract) return DEFAULT_PAYMENT_TOKEN_STATE

            const maskAllowance = await contract.methods
                .allowance(context.account, PAYMASTER_MASK_CONTRACT_ADDRESS)
                .call({ from: context.account })

            const availableBalanceTooLow =
                isGreaterThan(maskGasFee, maskAllowance) || isGreaterThan(maskGasFee, maskBalance)

            const isNative = isNativeTokenAddress(context.paymentToken)

            return {
                allowMaskAsGas: !availableBalanceTooLow,
                paymentToken:
                    isNative ? context.paymentToken
                    : !availableBalanceTooLow ? maskAddress
                    : nativeTokenAddress,
            }
        } catch (error) {
            const nativeBalance = await EVMWeb3Readonly.getNativeTokenBalance({
                account: context.account,
                chainId: context.chainId,
            })

            if (isZero(nativeBalance))
                return { allowMaskAsGas: true, paymentToken: context.paymentToken ?? maskAddress }

            return DEFAULT_PAYMENT_TOKEN_STATE
        }
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        if (!context.risky || !context.writable) {
            await next()
            return
        }

        try {
            const MaskProvider = MaskWalletProviderInstance
            const currentChainId = MaskProvider.subscription.chainId.getCurrentValue()

            if (context.method === EthereumMethodType.eth_sendTransaction && currentChainId !== context.chainId) {
                await MaskProvider.switchChain(context.chainId)

                // if send risky requests to a custom network, the providerURL must be provided.
                const matchNetworkByProviderURL = this.networks?.find(
                    (x) => x.isCustomized && isSameURL(x.rpcUrl, context.providerURL),
                )

                // a built-in network will be matched by chainId
                const matchNetworkByChainId = this.networks?.find(
                    (x) => !x.isCustomized && x.chainId === context.chainId,
                )

                const network = matchNetworkByProviderURL ?? matchNetworkByChainId
                if (!network)
                    throw new Error(
                        'Failed to locate network. The providerURL must be given when sending risky requests to a custom network.',
                    )

                await evm.state?.Network?.switchNetwork(network.ID)
            }

            if (!evm.state?.Message) throw new Error('Failed to approve request.')

            const request: TransferableMessage<MessageRequest, MessageResponse> = {
                state: MessageStateType.NOT_DEPEND,
                origin: location.origin,
                request: {
                    arguments: context.requestArguments,
                    options: {
                        ...(await this.getPaymentToken(context)),
                        silent: context.silent,
                        owner: context.owner,
                        identifier: context.identifier?.toText(),
                        providerURL: context.providerURL,
                        gasOptionType: context.gasOptionType,
                    },
                },
            }
            const { request: updates, response } = await evm.state.Message.createRequestAndWaitForApproval(request)

            context.config = {
                ...context.config,
                ...updates.arguments.params[0],
            }

            const editor = ErrorEditor.from(null, response)

            if (editor.presence || !response) {
                context.abort(editor.error)
            } else {
                context.write(response.result)
            }
        } catch (error) {
            context.abort(error)
        }

        await next()
    }
}
