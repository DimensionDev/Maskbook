import React from 'react'
import AsyncComponent from '../../utils/AsyncComponent'
import { AdditionalContent } from './AdditionalPostContent'
import { CryptoService } from '../../extension/content-script/rpc'

interface Props {
    provePost: string
    postBy: string
}
export function AddToKeyStore({ provePost, postBy }: Props) {
    return (
        <AsyncComponent
            promise={async (provePost, postBy) => CryptoService.verifyOthersProve(provePost, postBy)}
            values={[provePost, postBy]}
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
        <AdditionalContent title={<span style={{ color: 'red' }}>Maskbook public key NOT verified ❌</span>}>
            {props.error.message} This public key won't be saved.{console.error(props.error)}
        </AdditionalContent>
    ),
}
