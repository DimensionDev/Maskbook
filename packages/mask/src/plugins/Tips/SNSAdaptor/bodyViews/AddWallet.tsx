import { BindingProof, NextIDAction, NextIDPlatform } from '@masknet/shared-base'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import {
    isSameAddress,
    ProviderType,
    resolveProviderName,
    useAccount,
    useChainId,
    useNetworkType,
    useProviderType,
    useWallet,
} from '@masknet/web3-shared-evm'
import { memo, useCallback, useEffect, useState } from 'react'
import { SignSteps, Steps } from '../../../../components/shared/VerifyWallet/Steps'
import { useAsync, useAsyncFn } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import Services from '../../../../extension/service'
import { useCustomSnackbar } from '@masknet/theme'
import formatDateTime from 'date-fns/format'
import { useProviderDescriptor, useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'
import { useI18N } from '../../../../utils'
import { PluginId } from '@masknet/plugin-infra'

interface AddWalletViewProps {
    currentPersona: any
    bounds: BindingProof[]
    onCancel: () => void
}

const AddWalletView = memo(({ currentPersona, bounds, onCancel }: AddWalletViewProps) => {
    const { t } = useI18N()
    const [isBound, setIsBound] = useState(false)
    const [signed, setSigned] = useState(false)
    const { showSnackbar } = useCustomSnackbar()
    const providerType = useProviderType()
    const wallet = {
        ...useWallet(),
        account: useAccount(),
        networkType: useNetworkType(),
        providerType: providerType,
        chainId: useChainId(),
    }
    const { value: domain } = useReverseAddress(wallet.account)
    const { Utils } = useWeb3State() ?? {}
    const isNotEvm = !useProviderDescriptor()?.providerAdaptorPluginID.includes('evm')
    const nowTime = formatDateTime(new Date(), 'yyyy-MM-dd HH:mm')

    const walletName = () => {
        if (isNotEvm) return `${resolveProviderName(providerType)} Wallet`
        if (domain && Utils?.formatDomainName) return Utils.formatDomainName(domain)
        if (![wallet.providerType, providerType].includes(ProviderType.MaskWallet))
            return `${resolveProviderName(wallet.providerType ?? providerType)} Wallet`
        return wallet.name ?? 'Wallet'
    }

    useEffect(() => {
        const res = bounds.filter((x) => isSameAddress(x.identity, wallet.account))
        setIsBound(res.length > 0)
    }, [wallet, currentPersona, bounds])

    const { value: payload, loading: payloadLoading } = useAsync(async () => {
        if (!currentPersona?.publicHexKey || !wallet.account) return
        return NextIDProof.createPersonaPayload(
            currentPersona.publicHexKey,
            NextIDAction.Create,
            wallet.account,
            NextIDPlatform.Ethereum,
            'default',
        )
    }, [currentPersona?.publicHexKey, wallet.address])

    const [{ value: signature }, personaSilentSign] = useAsyncFn(async () => {
        if (!payload || !currentPersona?.identifier) return
        try {
            const signResult = await Services.Identity.generateSignResult(
                currentPersona.identifier,
                payload.signPayload,
            )
            showSnackbar(t('plugin_tips_persona_sign_success'), {
                variant: 'success',
                message: nowTime,
            })
            return signResult.signature.signature
        } catch (error) {
            showSnackbar(t('plugin_tips_persona_sign_error'), {
                variant: 'error',
                message: nowTime,
            })
            return
        }
    }, [currentPersona?.identifier, payload])

    const [{ value: walletSignState }, walletSign] = useAsyncFn(async () => {
        if (!payload || !currentPersona?.publicHexKey || !wallet.account) return false
        try {
            const walletSig = await Services.Ethereum.personalSign(payload.signPayload, wallet.account)
            if (!walletSig) throw new Error('Wallet sign failed')
            await NextIDProof.bindProof(
                payload.uuid,
                currentPersona.publicHexKey,
                NextIDAction.Create,
                NextIDPlatform.Ethereum,
                wallet.account,
                payload.createdAt,
                {
                    walletSignature: walletSig,
                    signature: signature,
                },
            )
            setSigned(true)
            showSnackbar(t('plugin_tips_wallet_sign_success'), { variant: 'success', message: nowTime })
            return true
        } catch (error) {
            showSnackbar(t('plugin_tips_wallet_sign_error'), { variant: 'error', message: nowTime })
            return false
        }
    }, [currentPersona?.publicHexKey, payload, wallet, signature])
    const [{ loading: confirmLoading, value: step = SignSteps.Ready }, handleConfirm] = useAsyncFn(async () => {
        try {
            if (signed) {
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
    }, [signed, signature, walletSignState, walletSign, personaSilentSign])
    const { setDialog } = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const changeWallet = useCallback(() => {
        setDialog({
            open: true,
            pluginId: PluginId.Tip,
        })
    }, [])
    if (!currentPersona || !wallet) return null

    return (
        <div>
            <Steps
                isBound={isBound}
                notEvm={isNotEvm}
                notConnected={!wallet.account}
                wallet={{
                    account: wallet.account,
                    chainId: wallet.chainId,
                    networkType: wallet.networkType,
                    providerType: wallet.providerType,
                }}
                walletName={walletName()}
                persona={currentPersona}
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
