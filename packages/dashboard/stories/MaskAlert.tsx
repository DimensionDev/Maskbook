import { story } from '@masknet/storybook-shared'
import { MaskAlert as Component } from '../src/components/MaskAlert'

function C() {
    return (
        <>
            <Component description="Short: Mask Network." />
            <br />
            <Component
                description={
                    "Too long: Mask Network is a free, open-source, client-side interface. Mask Network allows you to interact directly with the blockchain, while you remain in full control of your keys and funds.Please think about this carefully. YOU are the one who is in control. Mask Network is not a bank or exchange. We don't hold your keys, your funds, or your information. This means we can't access accounts, recover keys, reset passwords, or reverse transactions."
                }
            />
            <br />
            <Component
                type="error"
                description={
                    "Mask Network is a free, open-source, client-side interface. Mask Network allows you to interact directly with the blockchain, while you remain in full control of your keys and funds.Please think about this carefully. YOU are the one who is in control. Mask Network is not a bank or exchange. We don't hold your keys, your funds, or your information. This means we can't access accounts, recover keys, reset passwords, or reverse transactions."
                }
            />
        </>
    )
}

const { meta, of } = story(C)

export default meta({
    title: 'Components/Mask Alert',
})

export const MaskAlert = of({})
