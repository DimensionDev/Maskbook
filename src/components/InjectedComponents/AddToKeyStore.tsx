import React from 'react'
import AsyncComponent from '../../utils/components/AsyncComponent'
import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import Services from '../../extension/service'
import { useI18N } from '../../utils/i18n-next-ui'
import { ProfileIdentifier } from '../../database/type'

export interface AddToKeyStoreProps {
    provePost: string
    postBy: ProfileIdentifier
    completeComponentProps?: Partial<SuccessProps>
    completeComponent?: React.ComponentType<{ data: boolean }> | null
    waitingComponentProps?: Partial<WaitingProps>
    waitingComponent?: React.ComponentType | null
    failedComponentProps?: Partial<FailedProps>
    failedComponent?: React.ComponentType<FailedProps> | null
}
export function AddToKeyStore({ provePost, postBy, ...props }: AddToKeyStoreProps) {
    return (
        <AsyncComponent
            promise={async () => Services.Crypto.verifyOthersProve(provePost, postBy)}
            dependencies={[provePost, postBy]}
            awaitingComponent={
                props.waitingComponent === undefined
                    ? () => <AddToKeyStoreUI.awaiting {...props.waitingComponentProps} />
                    : props.waitingComponent
            }
            completeComponent={
                props.completeComponent === undefined
                    ? () => <AddToKeyStoreUI.success {...props.completeComponentProps} />
                    : props.completeComponent
            }
            failedComponent={
                props.failedComponent === undefined
                    ? inner => <AddToKeyStoreUI.failed error={inner.error} {...props.failedComponentProps} />
                    : props.failedComponent
            }
        />
    )
}
type SuccessProps = Partial<AdditionalContentProps>
type WaitingProps = Partial<AdditionalContentProps>
type FailedProps = Partial<AdditionalContentProps> & { error: Error }
export const AddToKeyStoreUI = {
    success: React.memo((props: SuccessProps) => {
        const { t } = useI18N()
        return <AdditionalContent header={t('add_to_key_store_success')} {...props} />
    }),
    awaiting: React.memo((props: WaitingProps) => {
        const { t } = useI18N()
        return <AdditionalContent header={t('add_to_key_store_verifying')} {...props} />
    }),
    failed: React.memo(({ error, ...props }: FailedProps) => {
        const { t } = useI18N()
        return (
            <AdditionalContent
                header={t('add_to_key_store_failed_title')}
                message={(console.error(error), t('add_to_key_store_failed_text', { error: error.message }))}
                {...props}
            />
        )
    }),
}
