import { noop } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import {
    ErrorEditor,
    type Middleware,
    getMaskTokenAddress,
    getSmartPayConstants,
    PayloadEditor,
    EthereumMethodType,
    ProviderType,
    type MessageRequest,
    type MessageResponse,
    isNativeTokenAddress,
} from '@masknet/web3-shared-evm'
import { MessageStateType, isGreaterThan, isZero, toFixed, type TransferableMessage } from '@masknet/web3-shared-base'
import { DepositPaymaster } from '../../../SmartPay/libs/DepositPaymaster.js'
import { SmartPayAccountAPI, SmartPayBundlerAPI } from '../../../SmartPay/index.js'
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
    private AbstractAccount = new SmartPayAccountAPI()

    private get customNetwork() {
        if (!Web3StateRef.value?.Network) throw new Error('The web3 state does not load yet.')
        const network = Web3StateRef.value.Network.network?.getCurrentValue()
        return network?.isCustomized ? network : undefined
    }

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

            const gas = await this.AbstractAccount.estimateTransaction?.(smartPayChainId, signableConfig, {
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

            const isNative = isNativeTokenAddress(context.paymentToken)

            return {
                allowMaskAsGas: !availableBalanceTooLow,
                paymentToken: isNative ? context.paymentToken : !availableBalanceTooLow ? maskAddress : undefined,
            }
        } catch (error) {
            const nativeBalance = await this.Web3.getNativeTokenBalance({
                account: context.account,
                chainId: context.chainId,
            })

            if (isZero(nativeBalance))
                return { allowMaskAsGas: true, paymentToken: context.paymentToken ?? maskAddress }

            return DEFAULT_PAYMENT_TOKEN_STATE
        }
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        const sendRequest = async () => {
            // Draw the Popups up and wait for user confirmation before publishing risky requests on the network
            if (context.risky && context.writeable) {
                const MaskProvider = Providers[ProviderType.MaskWallet]
                const currentChainId = MaskProvider.subscription.chainId.getCurrentValue()
                if (context.method === EthereumMethodType.ETH_SEND_TRANSACTION && currentChainId !== context.chainId) {
                    await MaskProvider.switchChain(context.chainId)
                    const networks = Web3StateRef.value.Network?.networks?.getCurrentValue()
                    const target = networks?.find((x) => x.chainId === context.chainId)
                    if (target) await Web3StateRef.value.Network?.switchNetwork(target?.ID)
                }

                const request: TransferableMessage<MessageRequest, MessageResponse> = {
                    state: MessageStateType.NOT_DEPEND,
                    request: {
                        arguments: context.requestArguments,
                        options: {
                            ...(await this.getPaymentToken(context)),
                            silent: context.silent,
                            owner: context.owner,
                            identifier: context.identifier?.toText(),
                            providerURL: this.customNetwork ? this.customNetwork.rpcUrl : undefined,
                            gasOptionType: context.gasOptionType,
                        },
                    },
                }

                if (!Web3StateRef.value.Message) throw new Error('Failed to approve request.')
                return Web3StateRef.value.Message.applyAndWaitResponse(request)
            } else if (context.writeable && this.customNetwork?.rpcUrl) {
                return this.Web3.getWeb3Provider({
                    chainId: context.chainId,
                    account: context.account,
                    providerURL: this.customNetwork.rpcUrl,
                }).sendAsync(context.request, noop)
            }
            return
        }

        try {
            const response = await sendRequest()

            if (response) {
                const editor = ErrorEditor.from(null, response)

                if (editor.presence) {
                    context.abort(editor.error)
                } else {
                    context.write(response.result)
                }
            }
        } catch (error) {
            context.abort(error)
        }

        await next()
    }
}
