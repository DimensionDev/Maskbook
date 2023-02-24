import type { Meta } from '@storybook/react'
import { AddTokenFormUI as component } from '../../../src/pages/Wallets/components/AddTokenFormUI/index.js'
import { action } from '@storybook/addon-actions'
import { useForm, FormProvider } from 'react-hook-form'

export default {
    component,
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
    args: {
        onNext: action('onNext'),
        onClose: action('onClose'),
    },
} as Meta<typeof component>
