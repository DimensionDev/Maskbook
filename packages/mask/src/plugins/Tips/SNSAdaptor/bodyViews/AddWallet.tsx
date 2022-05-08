import { BindingProof, NextIDAction, NextIDPlatform, PersonaInformation } from '@masknet/shared-base'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import {
    ChainId,
    isSameAddress,
    NetworkType,
    ProviderType,
    resolveProviderName,
    useAccount,
    useChainId,
    useNetworkType,
    useProviderType,
    useWallet,
} from '@masknet/web3-shared-evm'
import { memo, useCallback } from 'react'
import { SignSteps, Steps } from '../../../../components/shared/VerifyWallet/Steps'
import { useAsync, useAsyncFn } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import Services from '../../../../extension/service'
import { useCustomSnackbar } from '@masknet/theme'
import formatDateTime from 'date-fns/format'
import {
    NetworkPluginID,
    useProviderDescriptor,
    useReverseAddress,
    useWeb3State,
    Web3Plugin,
} from '@masknet/plugin-infra/web3'
import { useI18N } from '../../locales'

interface AddWalletViewProps {
    currentPersona: PersonaInformation
    bindings: BindingProof[]
    onCancel: () => void
}

const AddWalletView = memo(({ currentPersona, bindings, onCancel }: AddWalletViewProps) => {
    const t = useI18N()
    const { showSnackbar } = useCustomSnackbar()
    const providerType = useProviderType()
    const wallet = {
        ...useWallet(),
        account: useAccount(),
        networkType: useNetworkType(),
        chainId: useChainId(),
        providerType,
    }
    const { value: domain } = useReverseAddress(wallet.account)
    const { Utils } = useWeb3State() ?? {}
    const isNotEvm = useProviderDescriptor()?.providerAdaptorPluginID !== NetworkPluginID.PLUGIN_EVM
    const nowTime = formatDateTime(new Date(), 'yyyy-MM-dd HH:mm')
    const isBound = bindings.some((x) => isSameAddress(x.identity, wallet.account))

    const walletName = () => {
        if (isNotEvm) return `${resolveProviderName(providerType)} Wallet`
        if (domain && Utils?.formatDomainName) return Utils.formatDomainName(domain)
        if (![wallet.providerType, providerType].includes(ProviderType.MaskWallet))
            return `${resolveProviderName(wallet.providerType ?? providerType)} Wallet`
        return wallet.name ?? 'Wallet'
    }

    const { value: payload, loading: payloadLoading } = useAsync(async () => {
        if (!currentPersona || !wallet.account) return
        return NextIDProof.createPersonaPayload(
            currentPersona.identifier.publicKeyAsHex,
            NextIDAction.Create,
            wallet.account,
            NextIDPlatform.Ethereum,
            'default',
        )
    }, [currentPersona?.identifier, wallet.address])

    const [{ value: signature }, personaSilentSign] = useAsyncFn(async () => {
        if (!payload || !currentPersona?.identifier) return
        try {
            const signResult = await Services.Identity.generateSignResult(
                currentPersona.identifier,
                payload.signPayload,
            )
            showSnackbar(t.plugin_tips_persona_sign_success(), {
                variant: 'success',
                message: nowTime,
            })
            return signResult.signature.signature
        } catch (error) {
            showSnackbar(t.plugin_tips_persona_sign_error(), {
                variant: 'error',
                message: nowTime,
            })
            return
        }
    }, [currentPersona?.identifier, payload])

    const [{ value: walletSignState }, walletSign] = useAsyncFn(async () => {
        if (!payload || !currentPersona || !wallet.account) return false
        try {
            const walletSig = await Services.Ethereum.personalSign(payload.signPayload, wallet.account)
            if (!walletSig) throw new Error('Wallet sign failed')
            await NextIDProof.bindProof(
                payload.uuid,
                currentPersona.identifier.publicKeyAsHex,
                NextIDAction.Create,
                NextIDPlatform.Ethereum,
                wallet.account,
                payload.createdAt,
                {
                    walletSignature: walletSig,
                    signature,
                },
            )
            showSnackbar(t.plugin_tips_wallet_sign_success(), { variant: 'success', message: nowTime })
            return true
        } catch (error) {
            showSnackbar(t.plugin_tips_wallet_sign_error(), { variant: 'error', message: nowTime })
            return false
        }
    }, [currentPersona?.identifier, payload, signature])
    const [{ loading: confirmLoading, value: step = SignSteps.Ready }, handleConfirm] = useAsyncFn(async () => {
        try {
            if (walletSignState) {
                onCancel()
                return SignSteps.SecondStepDone
            }
            if (!signature && !walletSignState) {
                await personaSilentSign()
                return SignSteps.FirstStepDone
            } else if (signature && !walletSignState) {
                const res = await walletSign()
                return res ? SignSteps.SecondStepDone : SignSteps.FirstStepDone
            } else {
                onCancel()
                return SignSteps.SecondStepDone
            }
        } catch {
            showSnackbar('Connect error', { variant: 'error', message: nowTime })
            return SignSteps.Ready
        }
    }, [signature, walletSignState, walletSign, personaSilentSign])
    const { setDialog } = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const changeWallet = useCallback(() => {
        setDialog({
            open: true,
            pluginID: NetworkPluginID.PLUGIN_EVM,
        })
    }, [])
    if (!currentPersona || !wallet) return null

    return (
        <div>
            <Steps
                isBound={isBound}
                notEvm={isNotEvm}
                notConnected={!wallet.account}
                wallet={wallet as Web3Plugin.ConnectionResult<ChainId, NetworkType, ProviderType>}
                walletName={walletName()}
                nickname={currentPersona.nickname}
                step={step}
                confirmLoading={confirmLoading || payloadLoading}
                disableConfirm={isBound || isNotEvm || !wallet.account}
                notInPop
                changeWallet={changeWallet}
                onConfirm={handleConfirm}
                onCustomCancel={onCancel}
            />
        </div>
    )
})

export default AddWalletView
