import { memo, useState } from 'react'
import { useLocation } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { NextIDAction, NextIDPayload, NextIDPlatform, PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { ChainId, isSameAddress, NetworkType, ProviderType } from '@masknet/web3-shared-evm'
import type { Web3Plugin } from '@masknet/plugin-infra/src/web3-types'
import { SignSteps, Steps } from '../../../../../components/shared/VerifyWallet/Steps'
import Services from '../../../../service'
import { PersonaContext } from '../../Personas/hooks/usePersonaContext'
import { useTitle } from '../../../hook/useTitle'
import { useI18N } from '../../../../../utils'
import { useQueryIsBound } from '../../../hook/useQueryIsBound'

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
    const [step, setStep] = useState(SignSteps.Ready)
    const [signature, setSignature] = useState<string>()
    const [payload, setPayload] = useState<NextIDPayload>()
    const [isBound, setIsBound] = useState(false)
    const navigate = useNavigate()
    useTitle(t('popups_add_wallet'))
    const location = useLocation()
    const wallet: Web3Plugin.ConnectionResult<ChainId, NetworkType, ProviderType> = location.state.usr

    const bounds = useQueryIsBound(wallet.account)
    if (bounds && bounds.length > 0 && !isBound) {
        const res = bounds.filter((x) => x.persona === currentPersona?.publicHexKey)
        if (res.length > 0) {
            const final = res[0].proofs.filter((x) => {
                return isSameAddress(x.identity, wallet.account)
            })
            if (final.length > 0) setIsBound(true)
        }
    }

    if (!currentPersona || !wallet) return null

    const personaSilentSign = async () => {
        try {
            const payload = await NextIDProof.createPersonaPayload(
                currentPersona.publicHexKey as string,
                NextIDAction.Create,
                wallet.account,
                NextIDPlatform.Ethereum,
                'default',
            )
            if (!payload) throw new Error('Failed to create persona payload.')
            setPayload(payload)
            const signResult = await Services.Identity.generateSignResult(
                currentPersona.identifier,
                payload.signPayload,
            )
            setSignature(signResult.signature.signature)
            if (!signResult) throw new Error('Failed to sign persona.')
            setStep(SignSteps.FirstStepDone)
        } catch (error) {
            console.error(error)
        }
    }
    const walletSign = async () => {
        if (!payload) throw new Error('payload error')
        try {
            const walletSig = await Services.Ethereum.personalSign(payload.signPayload, wallet.account, '', {
                chainId: wallet.chainId,
                providerType: wallet.providerType,
            })
            if (!walletSig) throw new Error('Wallet sign failed')
            await NextIDProof.bindProof(
                payload.uuid,
                currentPersona.publicHexKey as string,
                NextIDAction.Create,
                NextIDPlatform.Ethereum,
                wallet.account,
                payload.createdAt,
                {
                    walletSignature: walletSig,
                    signature: signature,
                },
            )
            setStep(SignSteps.SecondStepDone)
        } catch (error) {
            console.error(error)
        }
    }
    const changeWallet = () => {
        navigate(PopupRoutes.ConnectWallet)
    }
    return (
        <div className={classes.container}>
            <Steps
                disableConfirm={isBound}
                persona={currentPersona}
                wallet={wallet}
                changeWallet={changeWallet}
                step={step}
                personaSign={personaSilentSign}
                walletSign={walletSign}
                onDone={() => navigate(PopupRoutes.ConnectedWallets)}
            />
        </div>
    )
})

export default VerifyWallet
