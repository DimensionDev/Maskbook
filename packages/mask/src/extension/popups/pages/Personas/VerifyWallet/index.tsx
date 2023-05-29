import urlcat from 'urlcat'
import { memo, useEffect } from 'react'
import { useAsync, useAsyncFn, useLocation } from 'react-use'
import { useNavigate } from 'react-router-dom'
import {
    NextIDAction,
    NextIDPlatform,
    PopupRoutes,
    NetworkPluginID,
    SignType,
    type Account,
} from '@masknet/shared-base'
import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { NextIDProof, Others, Web3 } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useReverseAddress, useWallets } from '@masknet/web3-hooks-base'
import { type ChainId, EthereumMethodType, providerResolver, ProviderType } from '@masknet/web3-shared-evm'
import { SignSteps, Steps } from '../../../../../components/shared/VerifyWallet/Steps.js'
import Services from '../../../../service.js'
import { PersonaContext } from '../hooks/usePersonaContext.js'
import { useTitle } from '../../../hook/useTitle.js'
import { useI18N } from '../../../../../utils/index.js'
import { useUnconfirmedRequest } from '../../Wallet/hooks/useUnConfirmedRequest.js'
import { PopupContext } from '../../../hook/usePopupContext.js'
import { MaskMessages } from '../../../../../../shared/messages.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        background: 'rgba(247, 249, 250, 1)',
        padding: '8px 16px 16px 16px',
    },
}))
const VerifyWallet = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { currentPersona } = PersonaContext.useContainer()
    const { signed, setSigned } = PopupContext.useContainer()
    const navigate = useNavigate()
    const location = useLocation()

    const wallet: Account<ChainId> & {
        providerType: ProviderType
        address?: string
    } = location.state.usr

    const { showSnackbar } = usePopupCustomSnackbar()
    const { value: request } = useUnconfirmedRequest()
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const { data: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, wallet?.account)

    const { value: isBound } = useAsync(async () => {
        if (!wallet.account || !currentPersona?.identifier.publicKeyAsHex) return false
        return NextIDProof.queryIsBound(
            currentPersona.identifier.publicKeyAsHex,
            NextIDPlatform.Ethereum,
            wallet.account,
        )
    }, [wallet.account, currentPersona?.identifier.publicKeyAsHex])

    const walletName = () => {
        if (domain) return Others.formatDomainName(domain)
        if (wallet.providerType !== ProviderType.MaskWallet)
            return `${providerResolver.providerName(wallet.providerType)} Wallet`
        return wallets.find((x) => isSameAddress(x.address, wallet.account))?.name ?? 'Wallet'
    }

    useEffect(() => {
        if (
            request?.payload.method !== EthereumMethodType.ETH_SIGN &&
            request?.payload.method !== EthereumMethodType.PERSONAL_SIGN
        )
            return

        navigate(urlcat(PopupRoutes.WalletSignRequest, { goBack: true }), {
            state: wallet,
        })
    }, [request, wallet])

    const { value: payload } = useAsync(async () => {
        if (!currentPersona?.identifier.publicKeyAsHex || !wallet) return
        return NextIDProof.createPersonaPayload(
            currentPersona.identifier.publicKeyAsHex,
            NextIDAction.Create,
            wallet.account,
            NextIDPlatform.Ethereum,
            'default',
        )
    }, [currentPersona?.identifier.publicKeyAsHex, wallet])

    const [{ value: signature }, personaSilentSign] = useAsyncFn(async () => {
        if (!payload || !currentPersona?.identifier) return
        try {
            const signature = await Services.Identity.signWithPersona(
                SignType.Message,
                payload.signPayload,
                currentPersona.identifier,
                true,
            )
            showSnackbar(t('popups_verify_persona_sign_success'), { variant: 'success' })
            return signature
        } catch (error) {
            showSnackbar(t('popups_verify_persona_sign_failed'), { variant: 'error' })
            console.error(error)
            return
        }
    }, [currentPersona?.identifier, payload?.signPayload])

    const [{ value: walletSignState }, walletSign] = useAsyncFn(async () => {
        if (!payload || !currentPersona?.identifier.publicKeyAsHex) return false
        try {
            const walletSignature = await Web3.signMessage('message', payload.signPayload, {
                chainId: wallet.chainId,
                account: wallet.account,
                providerType: wallet.providerType,
            })
            if (!walletSignature) throw new Error('Wallet sign failed')

            await NextIDProof.bindProof(
                payload.uuid,
                currentPersona.identifier.publicKeyAsHex,
                NextIDAction.Create,
                NextIDPlatform.Ethereum,
                wallet.account,
                payload.createdAt,
                {
                    walletSignature,
                    signature,
                },
            )

            // Broadcast updates
            MaskMessages.events.ownProofChanged.sendToAll()
            showSnackbar(t('popups_verify_wallet_sign_success'), { variant: 'success' })
            setSigned(true)
            return true
        } catch (error) {
            showSnackbar(t('popups_verify_wallet_sign_failed'), { variant: 'error' })
            return false
        }
    }, [currentPersona?.identifier.publicKeyAsHex, payload, wallet, signature])

    const changeWallet = () => {
        navigate(PopupRoutes.ConnectWallet)
    }

    const [{ loading: confirmLoading, value: step = SignSteps.Ready }, handleConfirm] = useAsyncFn(async () => {
        try {
            if (signed) Services.Helper.removePopupWindow()

            if (!signature && !walletSignState) {
                await personaSilentSign()
                return SignSteps.FirstStepDone
            } else if (signature && !walletSignState) {
                const walletSignRes = await walletSign()
                return walletSignRes ? SignSteps.SecondStepDone : SignSteps.FirstStepDone
            } else {
                await Services.Helper.removePopupWindow()
                return
            }
        } catch {
            showSnackbar('Connect error', { variant: 'error' })
            return SignSteps.Ready
        }
    }, [signature, walletSignState, walletSign, personaSilentSign, signed])

    // disconnect when router changes
    useEffect(
        () => () => {
            Web3.disconnect()
        },
        [],
    )
    useTitle(t('popups_add_wallet'))

    if (!currentPersona || !wallet) return null

    return (
        <div className={classes.container}>
            <Steps
                isBound={isBound}
                walletName={walletName()}
                disableConfirm={!!(isBound && !signed)}
                nickname={currentPersona.nickname}
                wallet={wallet}
                step={signed ? SignSteps.SecondStepDone : step}
                changeWallet={changeWallet}
                onConfirm={handleConfirm}
                confirmLoading={confirmLoading}
                onCustomCancel={() => navigate(-1)}
            />
        </div>
    )
})

export default VerifyWallet
