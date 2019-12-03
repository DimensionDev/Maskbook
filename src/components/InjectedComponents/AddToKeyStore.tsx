import React from 'react'
import AsyncComponent from '../../utils/components/AsyncComponent'
import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import Services from '../../extension/service'
import { geti18nString } from '../../utils/i18n'
import { PersonIdentifier } from '../../database/type'

export interface AddToKeyStoreProps {
    provePost: string
    postBy: PersonIdentifier
    completeComponentProps?: Partial<SuccessProps>
    completeComponent?: React.ComponentType
    waitingComponentProps?: Partial<WaitingProps>
    waitingComponent?: React.ComponentType
    failedComponentProps?: Partial<FailedProps>
    failedComponent?: React.ComponentType<FailedProps>
}
export function AddToKeyStore({ provePost, postBy, ...props }: AddToKeyStoreProps) {
    return (
        <AsyncComponent
            promise={async () => Services.Crypto.verifyOthersProve(provePost, postBy)}
            dependencies={[provePost, postBy]}
            awaitingComponent={
                props.waitingComponent || (() => <AddToKeyStoreUI.awaiting {...props.waitingComponentProps} />)
            }
            completeComponent={
                props.completeComponent || (() => <AddToKeyStoreUI.success {...props.completeComponentProps} />)
            }
            failedComponent={
                props.failedComponent ||
                (inner => <AddToKeyStoreUI.failed error={inner.error} {...props.failedComponentProps} />)
            }
        />
    )
}
type SuccessProps = Partial<AdditionalContentProps>
type WaitingProps = Partial<AdditionalContentProps>
type FailedProps = Partial<AdditionalContentProps> & { error: Error }
export const AddToKeyStoreUI = {
    success: React.memo((props: SuccessProps) => (
        <AdditionalContent title={geti18nString('add_to_key_store_success')} {...props} />
    )),
    awaiting: React.memo((props: WaitingProps) => (
        <AdditionalContent title={geti18nString('add_to_key_store_verifying')} {...props} />
    )),
    failed: React.memo(({ error, ...props }: FailedProps) => (
        <AdditionalContent title={geti18nString('add_to_key_store_failed_title')} {...props}>
            {geti18nString('add_to_key_store_failed_text', error.message)}
            {console.error(error)}
        </AdditionalContent>
    )),
}
