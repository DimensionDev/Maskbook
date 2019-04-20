import React from 'react'
import AsyncComponent from '../../utils/AsyncComponent'
import { AdditionalContent } from './AdditionalPostContent'
import { FullWidth } from '../../utils/Flex'
import { CryptoService } from '../../extension/content-script/rpc'
import Button from '@material-ui/core/Button/Button'

interface Props {
    postBy: string
    whoAmI: string
    encryptedText: string
}
function DecryptPostSuccess({
    data,
    displayAddDecryptor,
    requestAddDecryptor,
}: {
    data: { signatureVerifyResult: boolean; content: string }
    displayAddDecryptor: boolean
    requestAddDecryptor(): void
}) {
    return (
        <AdditionalContent
            title={
                <>
                    Maskbook decrypted content: <FullWidth />
                    {data.signatureVerifyResult ? (
                        <span style={{ color: 'green' }}>Signature verified ✔</span>
                    ) : (
                        <span style={{ color: 'red' }}>Signature NOT verified ❌</span>
                    )}
                    {displayAddDecryptor ? (
                        <Button
                            variant="raised"
                            color="primary"
                            size="small"
                            onClick={requestAddDecryptor}
                            style={{ position: 'absolute', transform: 'translateY(-40px)', right: 10 }}>
                            Add decryptor
                        </Button>
                    ) : null}
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

const DecryptPostAwaiting = <AdditionalContent title="Maskbook decrypting..." />
function DecryptPostFailed({ error }: { error: Error }) {
    return (
        <AdditionalContent title="Maskbook decryption failed">
            {(e => {
                if (e.match('DOMException')) return 'Maybe this post is not sent to you.'
                return e
            })(error && error.message)}
        </AdditionalContent>
    )
}

function DecryptPost({ postBy, whoAmI, encryptedText }: Props) {
    const [_, a] = encryptedText.split('🎼')
    const [b, _2] = a.split(':||')
    return (
        <AsyncComponent
            promise={async (encryptedString: string) => CryptoService.decryptFrom(encryptedString, postBy, whoAmI)}
            values={[b]}
            awaitingComponent={DecryptPostAwaiting}
            completeComponent={props => (
                <DecryptPostSuccess
                    data={props.data}
                    displayAddDecryptor={whoAmI === postBy}
                    requestAddDecryptor={React.useCallback(() => {}, [props.data])}
                />
            )}
            failedComponent={DecryptPostFailed}
        />
    )
}
export const DecryptPostUI = {
    success: DecryptPostSuccess,
    awaiting: DecryptPostAwaiting,
    failed: DecryptPostFailed,
    UI: React.memo(DecryptPost),
}
