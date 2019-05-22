import React, { useCallback } from 'react'
import AsyncComponent from '../../utils/components/AsyncComponent'
import { AdditionalContent } from './AdditionalPostContent'
import { FullWidth } from '../../utils/components/Flex'
import { useShareMenu } from './SelectPeopleDialog'
import { Person } from '../../extension/background-script/PeopleService'
import Link from '@material-ui/core/Link'
import { withStylesTyped } from '../../utils/theme'
import { sleep } from '../../utils/utils'
import Services from '../../extension/service'
import { geti18nString } from '../../utils/i18n'

interface DecryptPostSuccessProps {
    data: { signatureVerifyResult: boolean; content: string }
    displayAppendDecryptor: boolean
    requestAppendDecryptor(to: Person[]): Promise<void>
    alreadySelectedPreviously: Person[]
    people: Person[]
}
const DecryptPostSuccess = withStylesTyped({
    link: { marginRight: '1em', cursor: 'pointer' },
    pass: { color: 'green' },
    fail: { color: 'red' },
})<DecryptPostSuccessProps>(({ data, people, classes, ...props }) => {
    const { ShareMenu, showShare } = useShareMenu(people, props.requestAppendDecryptor, props.alreadySelectedPreviously)
    return (
        <AdditionalContent
            title={
                <>
                    {ShareMenu}
                    {geti18nString('decrypted-postbox-title')}
                    <FullWidth />
                    {props.displayAppendDecryptor ? (
                        <Link color="primary" onClick={showShare} className={classes.link}>
                            {geti18nString('decrypted-postbox-add-decryptor')}
                        </Link>
                    ) : null}
                    {data.signatureVerifyResult ? (
                        <span className={classes.pass}>{geti18nString('decrypted-postbox-verified')}</span>
                    ) : (
                        <span className={classes.fail}>{geti18nString('decrypted-postbox-not-verified')}</span>
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
})

const DecryptPostAwaiting = <AdditionalContent title={geti18nString('decrypted-postbox-decrypting')} />
function DecryptPostFailed({ error }: { error: Error }) {
    return (
        <AdditionalContent title={geti18nString('decrypted-postbox-failed')}>
            {error && error.message}
        </AdditionalContent>
    )
}

interface DecryptPostProps {
    postBy: string
    whoAmI: string
    encryptedText: string
    people: Person[]
    alreadySelectedPreviously: Person[]
    requestAppendDecryptor(to: Person[]): Promise<void>
}
function DecryptPost({
    postBy,
    whoAmI,
    encryptedText,
    people,
    alreadySelectedPreviously,
    requestAppendDecryptor,
}: DecryptPostProps) {
    const rAD = useCallback(
        async (people: Person[]) => {
            await requestAppendDecryptor(people)
            await sleep(1500)
        },
        [requestAppendDecryptor],
    )
    function ifError(x: any): x is { error: string } {
        return 'error' in x
    }
    return (
        <AsyncComponent
            promise={() => Services.Crypto.decryptFrom(encryptedText, postBy, whoAmI)}
            dependencies={[encryptedText, people, alreadySelectedPreviously]}
            awaitingComponent={DecryptPostAwaiting}
            completeComponent={props =>
                ifError(props.data) ? (
                    <DecryptPostFailed error={new Error(props.data.error)} />
                ) : (
                    <DecryptPostSuccess
                        data={props.data}
                        alreadySelectedPreviously={alreadySelectedPreviously}
                        displayAppendDecryptor={whoAmI === postBy && alreadySelectedPreviously.length !== people.length}
                        requestAppendDecryptor={rAD}
                        people={people}
                    />
                )
            }
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
