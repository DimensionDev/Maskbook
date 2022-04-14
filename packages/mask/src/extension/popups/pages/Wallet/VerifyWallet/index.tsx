import { useWallet } from '@masknet/web3-shared-evm'
import { NextIDAction, NextIDPayload, NextIDPlatform } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { NextIDProof } from '@masknet/web3-providers'
import { memo, useState } from 'react'
import { SignSteps, Steps } from '../../../../../components/shared/VerifyWallet/Steps'
import Services from '../../../../service'
import { PersonaContext } from '../../Personas/hooks/usePersonaContext'
import { useTitle } from '../../../hook/useTitle'
import { useI18N } from '../../../../../utils'

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
    const wallet = useWallet()

    const [step, setStep] = useState(SignSteps.Ready)
    const [signature, setSignature] = useState<string>()
    const [payload, setPayload] = useState<NextIDPayload>()

    useTitle(t('popups_add_wallet'))

    if (!currentPersona || !wallet) return null
    const personaSilentSign = async () => {
        try {
            const payload = await NextIDProof.createPersonaPayload(
                currentPersona.publicHexKey as string,
                NextIDAction.Create,
                wallet.address,
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
            const walletSig = await Services.Ethereum.personalSign(payload.signPayload, wallet.address)
            if (!walletSig) throw new Error('Wallet sign failed')
            await NextIDProof.bindProof(
                payload.uuid,
                currentPersona.publicHexKey as string,
                NextIDAction.Create,
                NextIDPlatform.Ethereum,
                wallet.address,
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
    return (
        <div className={classes.container}>
            <Steps step={step} personaSign={personaSilentSign} walletSign={walletSign} />
        </div>
    )
})

export default VerifyWallet
