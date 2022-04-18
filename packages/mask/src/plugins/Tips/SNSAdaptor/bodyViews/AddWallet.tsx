import { BindingProof, NextIDAction, NextIDPlatform } from '@masknet/shared-base'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { isSameAddress, useChainId, useProviderType, useWallet } from '@masknet/web3-shared-evm'
import { memo, useEffect, useState } from 'react'
import { SignSteps, Steps } from '../../../../components/shared/VerifyWallet/Steps'
import { useAsync, useAsyncFn } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import Services from '../../../../extension/service'
import { useCustomSnackbar } from '@masknet/theme'

interface AddWalletViewProps {
    currentPersona: any
    bounds: BindingProof[]
    onCancel: () => void
}

const AddWalletView = memo(({ currentPersona, bounds, onCancel }: AddWalletViewProps) => {
    const [isBound, setIsBound] = useState(false)
    const [signed, setSigned] = useState(false)
    const chainId = useChainId()
    const providerType = useProviderType()
    const { showSnackbar } = useCustomSnackbar()
    const wallet = {
        ...useWallet(),
        account: useWallet()?.address,
    }
    useEffect(() => {
        if (bounds === []) return
        const res = bounds.filter((x) => isSameAddress(x.identity, wallet.address))
        if (res.length > 0) {
            setIsBound(true)
        } else {
            setIsBound(false)
        }
    }, [wallet, currentPersona, bounds])

    const { value: payload } = useAsync(async () => {
        if (!currentPersona?.publicHexKey || !wallet.account) return
        return NextIDProof.createPersonaPayload(
            currentPersona.publicHexKey,
            NextIDAction.Create,
            wallet.account,
            NextIDPlatform.Ethereum,
            'default',
        )
    }, [])

    const [{ value: signature }, personaSilentSign] = useAsyncFn(async () => {
        if (!payload || !currentPersona?.identifier) return
        try {
            const signResult = await Services.Identity.generateSignResult(
                currentPersona.identifier,
                payload.signPayload,
            )
            return signResult.signature.signature
        } catch (error) {
            console.error(error)
            return
        }
    }, [currentPersona?.identifier, payload])

    const [{ value: walletSignState }, walletSign] = useAsyncFn(async () => {
        if (!payload || !currentPersona?.publicHexKey || !wallet.account) return false
        try {
            const walletSig = await Services.Ethereum.personalSign(payload.signPayload, wallet.account, '', {
                chainId: chainId,
                providerType: providerType,
            })
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
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }, [currentPersona?.publicHexKey, payload, wallet, signature])
    const [{ loading: confirmLoading, value: step = SignSteps.Ready }, handleConfirm] = useAsyncFn(async () => {
        try {
            if (signed) {
                onCancel()
            }

            if (!signature && !walletSignState) {
                await personaSilentSign()
                return SignSteps.FirstStepDone
            } else if (signature && !walletSignState) {
                await walletSign()
                return SignSteps.SecondStepDone
            } else {
                return Services.Helper.removePopupWindow()
            }
        } catch {
            showSnackbar('Connect error', { variant: 'error' })
            return SignSteps.Ready
        }
    }, [signature, walletSignState, walletSign, personaSilentSign, signed])
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    if (!currentPersona || !wallet) return null

    return (
        <div>
            <Steps
                wallet={wallet as any}
                persona={currentPersona}
                step={signed ? SignSteps.SecondStepDone : step}
                confirmLoading={confirmLoading}
                disableConfirm={isBound && !signed}
                notInPop
                changeWallet={openSelectProviderDialog}
                onConfirm={handleConfirm}
                onCustomCancel={onCancel}
            />
        </div>
    )
})

export default AddWalletView
