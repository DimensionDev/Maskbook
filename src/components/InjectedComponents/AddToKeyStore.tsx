import React from 'react'
import AsyncComponent from '../../utils/components/AsyncComponent'
import { AdditionalContent } from './AdditionalPostContent'
import Services from '../../extension/service'
import { geti18nString } from '../../utils/i18n'

interface Props {
    provePost: string
    postBy: string
}
export function AddToKeyStore({ provePost, postBy }: Props) {
    return (
        <AsyncComponent
            promise={async () => Services.Crypto.verifyOthersProve(provePost, postBy)}
            dependencies={[provePost, postBy]}
            awaitingComponent={AddToKeyStoreUI.awaiting}
            completeComponent={() => AddToKeyStoreUI.success}
            failedComponent={AddToKeyStoreUI.failed}
        />
    )
}
export const AddToKeyStoreUI = {
    success: <AdditionalContent title={geti18nString('add-to-key-store-success')} />,
    awaiting: <AdditionalContent title={geti18nString('add-to-key-store-verifying')} />,
    failed: (props: { error: Error }) => (
        <AdditionalContent title={geti18nString('add-to-key-store-failed-title')}>
            {geti18nString('add-to-key-store-failed-text', props.error.message)}
            {console.error(props.error)}
        </AdditionalContent>
    ),
}
