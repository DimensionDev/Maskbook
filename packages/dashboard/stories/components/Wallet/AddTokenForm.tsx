import { story } from '@masknet/storybook-shared'
import { AddTokenFormUI as C } from '../../../src/pages/Wallets/components/AddTokenFormUI/index.js'
import { action } from '@storybook/addon-actions'
import { useForm, FormProvider } from 'react-hook-form'

const { meta, of } = story(C)

export default meta({
    title: 'Components/Wallet/Add Token Form',
    decorators: [
        (Story) => {
            const methods = useForm({
                mode: 'onChange',
                defaultValues: {
                    address: '',
                    symbol: '',
                    decimals: 0,
                },
            })
            return (
                <FormProvider {...methods}>
                    <Story />
                </FormProvider>
            )
        },
    ],
})

export const AddTokenForm = of({
    args: {
        onNext: action('onNext'),
        onClose: action('onClose'),
    },
})
