import React from 'react'
import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import Services from '../../extension/service'
import { useI18N } from '../../utils/i18n-next-ui'
import type { ProfileIdentifier } from '../../database/type'
import { useAsync } from 'react-use'

export interface AddToKeyStoreProps {
    provePost: string
    postBy: ProfileIdentifier
    completeComponentProps?: Partial<SuccessProps & { data: boolean }>
    completeComponent?: React.ComponentType<{ data: boolean }> | null
    waitingComponentProps?: Partial<WaitingProps>
    waitingComponent?: React.ComponentType | null
    failedComponentProps?: Partial<FailedProps>
    failedComponent?: React.ComponentType<FailedProps> | null
}
export function AddToKeyStore({ provePost, postBy, ...props }: AddToKeyStoreProps) {
    const state = useAsync(() => Services.Crypto.verifyOthersProve(provePost, postBy), [provePost, postBy])
    const { completeComponent: Success, completeComponentProps } = props
    const { failedComponent: Fail, failedComponentProps } = props
    const { waitingComponent, waitingComponentProps } = props
    if (state.loading) return render(waitingComponent, AddToKeyStoreUI.awaiting, waitingComponentProps)
    if (state.error) return render(Fail, AddToKeyStoreUI.failed, { error: state.error, ...failedComponentProps })
    else return render(Success, AddToKeyStoreUI.success, completeComponentProps)
    function render(outer: React.ComponentType<any> | null | undefined, def: React.ComponentType<any>, props?: {}) {
        if (outer === null) return null
        return React.createElement(outer || def, props)
    }
}
type SuccessProps = Partial<AdditionalContentProps>
type WaitingProps = Partial<AdditionalContentProps>
type FailedProps = Partial<AdditionalContentProps> & { error: Error }
export const AddToKeyStoreUI = {
    success: React.memo((props: SuccessProps) => {
        const { t } = useI18N()
        return <AdditionalContent title={t('add_to_key_store_success')} titleIcon="check" {...props} />
    }),
    awaiting: React.memo((props: WaitingProps) => {
        const { t } = useI18N()
        return <AdditionalContent title={t('add_to_key_store_verifying')} progress {...props} />
    }),
    failed: React.memo(({ error, ...props }: FailedProps) => {
        const { t } = useI18N()
        return (
            <AdditionalContent
                title={t('add_to_key_store_failed_title')}
                titleIcon="error"
                message={(console.error(error), t('add_to_key_store_failed_text', { error: error.message }))}
                {...props}
            />
        )
    }),
}
