import React from 'react'
import AsyncComponent from '../../utils/AsyncComponent'
import { sleep } from '../../utils/utils'
import { queryPersonCryptoKey, getMyPrivateKey, PersonCryptoKey } from '../../key-management/db'
import { decryptText } from '../../crypto/crypto'
import { AdditionalContent } from './AdditionalPostContent'
import { FullWidth } from '../../utils/Flex'

interface Props {
    postBy: string
    myself: string
    encryptedText: string
}
let myPrivate: PersonCryptoKey | null = null
getMyPrivateKey().then(x => (myPrivate = x))
export function DecryptPost({ postBy, myself, encryptedText }: Props) {
    return (
        <AsyncComponent
            promise={async (encryptedString: string) => {
                const [version, username, salt, text, sig] = encryptedString.split('|')
                while (!myPrivate) {
                    await sleep(50)
                    myPrivate = await getMyPrivateKey()
                }
                let pub: CryptoKey
                const priv = myPrivate
                const requires = postBy === myself ? username : postBy
                try {
                    pub = (await queryPersonCryptoKey(requires))!.key.publicKey
                } catch {
                    throw new Error(`${requires}'s Public key not found`)
                }
                return decryptText(text, sig, salt, priv.key.privateKey!, pub, postBy === myself)
            }}
            values={[encryptedText]}
            awaitingComponent={DecryptPostAwaiting}
            completeComponent={DecryptPostSuccess}
            failedComponent={DecryptPostFailed}
        />
    )
}
type UnboxPromise<T> = T extends PromiseLike<infer Q> ? Q : never
type AsyncReturnType<T extends (...args: any[]) => Promise<any>> = UnboxPromise<ReturnType<T>>
function DecryptPostSuccess({ data }: { data: AsyncReturnType<typeof decryptText> }) {
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
                if (e.match('DOM Exception')) return 'Maybe this post is not sent to you.'
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
