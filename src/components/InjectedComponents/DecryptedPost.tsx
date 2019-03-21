import React from 'react'
import AsyncComponent from '../../utils/AsyncComponent'
import { AdditionalContent } from './AdditionalPostContent'
import { FullWidth } from '../../utils/Flex'
import { CryptoService } from '../../extension/content-script/rpc'

interface Props {
    postBy: string
    whoAmI: string
    encryptedText: string
}
export function DecryptPost({ postBy, whoAmI, encryptedText }: Props) {
    return (
        <AsyncComponent
            promise={async (encryptedString: string) => {
                const [version, postTo, salt, text, sig] = encryptedString.split('|')
                return CryptoService.decryptFrom(text, sig, salt, postBy, postTo, whoAmI)
            }}
            values={[encryptedText]}
            awaitingComponent={DecryptPostAwaiting}
            completeComponent={DecryptPostSuccess}
            failedComponent={DecryptPostFailed}
        />
    )
}
type UnboxPromise<T> = T extends PromiseLike<infer Q> ? Q : never
function DecryptPostSuccess({ data }: { data: { signatureVerifyResult: boolean; content: string } }) {
    return (
        <AdditionalContent
            title={
                <>
                    Decrypted with Maskbook: <FullWidth />
                    {data.signatureVerifyResult ? (
                        <span style={{ color: 'green' }}>Signature verified ✔</span>
                    ) : (
                        <span style={{ color: 'red' }}>Signature NOT verified ❌</span>
                    )}
                </>
            }
            children={data.content.split('\n').reduce(
                (prev, curr, i) => {
                    if (i === 0) return [curr]
                    else return [...prev, curr, <br />]
                },
                [] as React.ReactNode[],
            )}
        />
    )
}

const DecryptPostAwaiting = <AdditionalContent title="Maskbook is decrypting..." />
function DecryptPostFailed({ error }: { error: Error }) {
    return (
        <AdditionalContent title="Decrypted Failed">
            {(e => {
                if (e.match('DOMException')) return 'Maybe this post is not sent to you.'
                return e
            })(error && error.message)}
        </AdditionalContent>
    )
}
export const DecryptPostUI = {
    success: DecryptPostSuccess,
    awaiting: DecryptPostAwaiting,
    failed: DecryptPostFailed,
}
