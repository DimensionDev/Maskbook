import { NextIDAction, NextIDPlatform, PersonaInformation } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ProviderType } from '@masknet/web3-shared-evm'
import { memo, useMemo } from 'react'
import { SignSteps, Steps } from './VerifyWallet/Steps'
import { useAsync, useAsyncFn } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import formatDateTime from 'date-fns/format'
import {
    useAccount,
    useChainId,
    useProviderDescriptor,
    useProviderType,
    useReverseAddress,
    useWallet,
    useWeb3Connection,
    useWeb3State,
} from '@masknet/plugin-infra/web3'
import { useI18N } from '../../locales'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { InjectedDialog } from '@masknet/shared'
import { DialogContent } from '@mui/material'
import { context } from '../context'
import type { WalletTypes } from '../types'

const useStyles = makeStyles()((theme) => ({
    content: {
        width: 480,
        height: 510,
        maxHeight: 510,
        position: 'relative',
        paddingBottom: theme.spacing(3),
    },
}))

interface AddWalletDialogProps {
    currentPersona: PersonaInformation
    bindings: WalletTypes[]
    onCancel: () => void
    open: boolean
}

const AddWalletDialog = memo(({ currentPersona, bindings, onCancel, open }: AddWalletDialogProps) => {
    const t = useI18N()
    const { classes } = useStyles()
    const { showSnackbar } = useCustomSnackbar()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const providerType = useProviderType(NetworkPluginID.PLUGIN_EVM)
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { value: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, account)
    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    const isNotEvm = useProviderDescriptor()?.providerAdaptorPluginID !== NetworkPluginID.PLUGIN_EVM
    const nowTime = useMemo(() => formatDateTime(new Date(), 'yyyy-MM-dd HH:mm'), [])
    const isBound = bindings.some((x) => isSameAddress(x.address, account))

    const walletName = () => {
        if (isNotEvm && providerType) return `${Others?.providerResolver.providerName(providerType)} Wallet`
        if (domain && Others?.formatDomainName) return Others.formatDomainName(domain)
        if (providerType && providerType !== ProviderType.MaskWallet)
            return `${Others?.providerResolver.providerName(providerType)} Wallet`
        return wallet?.name ?? 'Wallet'
    }

    const { value: payload, loading: payloadLoading } = useAsync(async () => {
        if (!currentPersona || !account) return
        return NextIDProof.createPersonaPayload(
            currentPersona.identifier.publicKeyAsHex,
            NextIDAction.Create,
            account,
            NextIDPlatform.Ethereum,
            'default',
        )
    }, [currentPersona?.identifier, account])

    const [{ value: signature }, personaSilentSign] = useAsyncFn(async () => {
        if (!payload || !currentPersona?.identifier) return
        try {
            const signResult = await context.privileged_silentSign()?.(currentPersona.identifier, payload.signPayload)
            showSnackbar(t.tip_persona_sign_success(), {
                variant: 'success',
                message: nowTime,
            })
            return signResult.signature.signature
        } catch (error) {
            showSnackbar(t.tip_persona_sign_error(), {
                variant: 'error',
                message: nowTime,
            })
            return
        }
    }, [currentPersona?.identifier, payload])

    const [{ value: walletSignState }, walletSign] = useAsyncFn(async () => {
        if (!payload || !currentPersona || !account) return false
        try {
            const walletSig = await connection?.signMessage(payload.signPayload, 'personalSign', {
                chainId,
                account,
                providerType,
            })
            if (!walletSig) throw new Error('Wallet sign failed')
            await NextIDProof.bindProof(
                payload.uuid,
                currentPersona.identifier.publicKeyAsHex,
                NextIDAction.Create,
                NextIDPlatform.Ethereum,
                account,
                payload.createdAt,
                {
                    walletSignature: walletSig,
                    signature,
                },
            )
            showSnackbar(t.tip_wallet_sign_success(), { variant: 'success', message: nowTime })
            return true
        } catch (error) {
            console.log(error, 'error')
            showSnackbar(t.tip_wallet_sign_error(), { variant: 'error', message: nowTime })
            return false
        }
    }, [currentPersona?.identifier, payload, signature, connection])
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
    const { openDialog } = useRemoteControlledDialog(context.dialogUpdateMsg)

    if (!currentPersona || !providerType) return null

    return (
        <InjectedDialog
            classes={{ dialogContent: classes.content }}
            title="Add Wallet"
            fullWidth={false}
            open={open}
            onClose={onCancel}>
            <DialogContent>
                <Steps
                    isBound={isBound}
                    notEvm={isNotEvm}
                    notConnected={!account}
                    wallet={{
                        account,
                        chainId,
                        providerType,
                    }}
                    walletName={walletName()}
                    nickname={currentPersona.nickname}
                    step={step}
                    confirmLoading={confirmLoading || payloadLoading}
                    disableConfirm={isBound || !!(isNotEvm && account) || !account}
                    notInPop
                    changeWallet={openDialog}
                    onConfirm={handleConfirm}
                    onCustomCancel={onCancel}
                />
            </DialogContent>
        </InjectedDialog>
    )
})

export default AddWalletDialog
