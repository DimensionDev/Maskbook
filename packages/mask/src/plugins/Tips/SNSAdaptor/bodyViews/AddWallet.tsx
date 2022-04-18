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
    const onConfirm = () => {}
    const walletChange = () => {}

    return (
        <div>
            <Steps
                changeWallet={walletChange}
                wallet={wallet as any}
                persona={persona}
                step={curStep}
                onConfirm={onConfirm}
                confirmLoading
            />
        </div>
    )
})

export default AddWalletView
