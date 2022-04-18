import { useWallet } from '@masknet/web3-shared-evm'
import { memo, useState } from 'react'
import { Steps } from '../../../../components/shared/VerifyWallet/Steps'

interface AddWalletViewProps {
    persona: any
}

const AddWalletView = memo(({ persona }: AddWalletViewProps) => {
    const [curStep, setCurStep] = useState(0)
    const wallet = {
        ...useWallet(),
        account: useWallet()?.address,
    }
    const walletSign = async () => {}
    const personaSign = async () => {}
    const walletChange = () => {}
    const onDone = () => {}

    return (
        <div>
            <Steps
                onDone={onDone}
                changeWallet={walletChange}
                wallet={wallet as any}
                persona={persona}
                step={curStep}
                personaSign={personaSign}
                walletSign={walletSign}
            />
        </div>
    )
})

export default AddWalletView
