import React from 'react'
import AsyncComponent from '../../utils/components/AsyncComponent'
import { AdditionalContent } from './AdditionalPostContent'
import { FullWidth } from '../../utils/components/Flex'
import { CryptoService } from '../../extension/content-script/rpc'
import { useShareMenu } from './SelectPeopleDialog'
import { Person } from '../../extension/background-script/PeopleService'
import Link from '@material-ui/core/Link'

interface Props {
    postBy: string
    whoAmI: string
    encryptedText: string
    people: Person[]
}
function DecryptPostSuccess({
    data,
    displayAddDecryptor,
    requestAddDecryptor,
    people,
}: {
    data: { signatureVerifyResult: boolean; content: string }
    displayAddDecryptor: boolean
    requestAddDecryptor(to: Person[]): Promise<void>
    people: Person[]
}) {
    const { ShareMenu, hideShare, showShare } = useShareMenu(people, requestAddDecryptor)
    return (
        <AdditionalContent
            title={
                <>
                    {ShareMenu}
                    Maskbook decrypted content: <FullWidth />
                    {displayAddDecryptor ? (
                        <Link color="primary" onClick={showShare} style={{ marginRight: '1em', cursor: 'pointer' }}>
                            Add decryptor
                        </Link>
                    ) : null}
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

function DecryptPost({ postBy, whoAmI, encryptedText, people }: Props) {
    const [_, a] = encryptedText.split('🎼')
    const [b, _2] = a.split(':||')
    return (
        <AsyncComponent
            promise={async () => CryptoService.decryptFrom(b, postBy, whoAmI)}
            dependencies={[b, people]}
            awaitingComponent={DecryptPostAwaiting}
            completeComponent={props => (
                <DecryptPostSuccess
                    data={props.data}
                    displayAddDecryptor={whoAmI === postBy}
                    requestAddDecryptor={React.useCallback(async () => {}, [props.data])}
                    people={people}
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
