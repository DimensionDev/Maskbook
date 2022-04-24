import { memo, useEffect, useMemo } from 'react'
import { useAsync, useAsyncFn, useLocation } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { EMPTY_LIST, NextIDAction, NextIDPlatform, PopupRoutes } from '@masknet/shared-base'
import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { ChainId, EthereumRpcType, isSameAddress, NetworkType, ProviderType } from '@masknet/web3-shared-evm'
import type { Web3Plugin } from '@masknet/plugin-infra/dist/web3-types'
import { SignSteps, Steps } from '../../../../../components/shared/VerifyWallet/Steps'
import Services from '../../../../service'
import { PersonaContext } from '../hooks/usePersonaContext'
import { useTitle } from '../../../hook/useTitle'
import { useI18N } from '../../../../../utils'
import { useUnconfirmedRequest } from '../../Wallet/hooks/useUnConfirmedRequest'
import { PopupContext } from '../../../hook/usePopupContext'
import urlcat from 'urlcat'

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
    const { currentPersona, refreshProofs } = PersonaContext.useContainer()
    const { signed, setSigned } = PopupContext.useContainer()
    const navigate = useNavigate()
    const location = useLocation()
    const { showSnackbar } = usePopupCustomSnackbar()
    const { value: request } = useUnconfirmedRequest()

    const wallet: Web3Plugin.ConnectionResult<ChainId, NetworkType, ProviderType> = location.state.usr

    const { value: bounds } = useAsync(async () => {
        if (!wallet.account) return EMPTY_LIST
        return NextIDProof.queryExistedBindingByPlatform(NextIDPlatform.Ethereum, wallet.account)
    }, [wallet])
    const isBound = useMemo(() => {
        if (!bounds || !bounds.length) return false
        const res = bounds.filter((x) => x.persona === currentPersona?.publicHexKey)
        if (res.length > 0) {
            const final = res[0].proofs.filter((x) => {
                return isSameAddress(x.identity, wallet?.account)
            })
            if (final.length > 0) return true
        }
        return false
    }, [bounds])

    useEffect(() => {
        if (request?.computedPayload?.type !== EthereumRpcType.SIGN) return

        navigate(urlcat(PopupRoutes.WalletSignRequest, { goBack: true }), {
            state: wallet,
        })
    }, [request, wallet])

    const { value: payload } = useAsync(async () => {
        if (!currentPersona?.publicHexKey || !wallet) return
        return NextIDProof.createPersonaPayload(
            currentPersona.publicHexKey,
            NextIDAction.Create,
            wallet.account,
            NextIDPlatform.Ethereum,
            'default',
        )
    }, [currentPersona?.publicHexKey, wallet])

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
    }, [currentPersona?.identifier, payload?.signPayload])

    const [{ value: walletSignState }, walletSign] = useAsyncFn(async () => {
        if (!payload || !currentPersona?.publicHexKey) return false
        try {
            const walletSig = await Services.Ethereum.personalSign(
                payload.signPayload,
                wallet.account,
                '',
                {
                    chainId: wallet.chainId,
                    account: wallet.account,
                    providerType: wallet.providerType,
                },
                { popupsWindow: false },
            )

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
            refreshProofs()
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }, [currentPersona?.publicHexKey, payload, wallet, signature])

    const changeWallet = () => {
        navigate(PopupRoutes.ConnectWallet)
    }

    const [{ loading: confirmLoading, value: step = SignSteps.Ready }, handleConfirm] = useAsyncFn(async () => {
        try {
            if (signed) Services.Helper.removePopupWindow()

            // first Step
            if (!signature && !walletSignState) {
                await personaSilentSign()
                return SignSteps.FirstStepDone
            } else if (signature && !walletSignState) {
                await walletSign()
                return SignSteps.SecondStepDone
            } else {
                await Services.Helper.removePopupWindow()
                return
            }
        } catch {
            // err step
            showSnackbar('Connect error', { variant: 'error' })
            return SignSteps.Ready
        }
    }, [signature, walletSignState, walletSign, personaSilentSign, signed])

    useTitle(t('popups_add_wallet'))

    if (!currentPersona || !wallet) return null

    return (
        <div className={classes.container}>
            <Steps
                disableConfirm={isBound && !signed}
                nickName={currentPersona.nickname}
                wallet={wallet}
                step={signed ? SignSteps.SecondStepDone : step}
                changeWallet={changeWallet}
                onConfirm={handleConfirm}
                confirmLoading={confirmLoading}
            />
        </div>
    )
})

export default VerifyWallet
