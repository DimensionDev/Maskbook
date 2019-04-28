import React from 'react'
import AsyncComponent from '../../utils/components/AsyncComponent'
import { AdditionalContent } from './AdditionalPostContent'
import Services from '../../extension/service'

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
    success: <AdditionalContent title="Maskbook public key added to keystore ✔" />,
    awaiting: <AdditionalContent title="Maskbook public key found, verifying..." />,
    failed: (props: { error: Error }) => (
        <AdditionalContent title="Maskbook public key NOT verified ❌">
            {props.error.message} This public key won't be saved.{console.error(props.error)}
        </AdditionalContent>
    ),
}
