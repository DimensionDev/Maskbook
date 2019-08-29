import React, { useCallback, useState, useEffect } from 'react'
import AsyncComponent from '../../utils/components/AsyncComponent'
import { AdditionalContent } from './AdditionalPostContent'
import { useShareMenu } from './SelectPeopleDialog'
import { sleep } from '../../utils/utils'
import Services from '../../extension/service'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import { Box, Link, useMediaQuery, useTheme } from '@material-ui/core'
import { Person } from '../../database'
import { Identifier, PersonIdentifier, PostIdentifier } from '../../database/type'
import { NotSetupYetPrompt } from '../shared/NotSetupYetPrompt'
import { MessageCenter, TypedMessages } from '../../utils/messages'
import { deconstructPayload, Payload } from '../../utils/type-transform/Payload'

interface DecryptPostSuccessProps {
    data: { signatureVerifyResult: boolean; content: string }

    requestAppendRecipients?(to: Person[]): Promise<void>

    alreadySelectedPreviously: Person[]
    people: Person[]
}

const useStyles = makeStyles({
    link: { marginRight: '1em', cursor: 'pointer' },
    pass: { color: 'green' },
    fail: { color: 'red' },
})

function DecryptPostSuccess({ data, people, ...props }: DecryptPostSuccessProps) {
    const classes = useStyles()
    const { ShareMenu, showShare } = useShareMenu(
        people,
        props.requestAppendRecipients || (async () => {}),
        props.alreadySelectedPreviously,
    )
    const theme = useTheme()
    const mediaQuery = useMediaQuery(theme.breakpoints.down('sm'))
    let passString = geti18nString('decrypted_postbox_verified')
    let failString = geti18nString('decrypted_postbox_not_verified')
    if (mediaQuery) passString = passString[passString.length - 1]
    if (failString) failString = failString[failString.length - 1]
    return (
        <AdditionalContent
            title={
                <>
                    {ShareMenu}
                    {geti18nString('decrypted_postbox_title')}
                    <Box flex={1} />
                    {props.requestAppendRecipients && (
                        <Link color="primary" onClick={showShare} className={classes.link}>
                            {geti18nString('decrypted_postbox_add_recipients')}
                        </Link>
                    )}
                    {data.signatureVerifyResult ? (
                        <span className={classes.pass}>{passString}</span>
                    ) : (
                        <span className={classes.fail}>{failString}</span>
                    )}
                </>
            }
            renderText={data.content}
        />
    )
}

function DecryptPostAwaiting(props: { type?: DecryptingStatus }) {
    const key = {
        finding_post_key: 'decrypted_postbox_decrypting_finding_post_key',
        finding_person_public_key: 'decrypted_postbox_decrypting_finding_person_key',
        undefined: 'decrypted_postbox_decrypting',
    } as const
    return <AdditionalContent title={geti18nString(key[props.type || 'undefined'])} />
}

function DecryptPostFailed({ error }: { error: Error }) {
    if (error && error.message === geti18nString('service_not_setup_yet')) {
        return <NotSetupYetPrompt />
    }
    return (
        <AdditionalContent title={geti18nString('decrypted_postbox_failed')}>
            {error && error.message}
        </AdditionalContent>
    )
}

interface DecryptPostProps {
    onDecrypted(post: string): void

    postBy: PersonIdentifier
    whoAmI: PersonIdentifier
    encryptedText: string
    people: Person[]
    alreadySelectedPreviously: Person[]
    payload: Payload | null

    requestAppendRecipients(to: Person[]): Promise<void>
}
type DecryptingStatus = undefined | 'finding_person_public_key' | 'finding_post_key'
function DecryptPost(props: DecryptPostProps) {
    const { postBy, whoAmI, encryptedText, people, alreadySelectedPreviously, requestAppendRecipients } = props
    const { payload } = props

    const [decryptingStatus, setDecryptingStatus] = useState<DecryptingStatus>(undefined)
    const [__, forceReDecrypt] = useState<any>()
    const rAD = useCallback(
        async (people: Person[]) => {
            await requestAppendRecipients(people)
            await sleep(1500)
        },
        [requestAppendRecipients],
    )
    useEffect(() => {
        let listener = (data: TypedMessages['decryptionStatusUpdated']) => {
            if (!payload) return
            const id = new PostIdentifier(postBy, payload.iv)
            if (id.equals(data.post)) {
                switch (data.status) {
                    case 'finding_person_public_key':
                        setDecryptingStatus('finding_person_public_key')
                        break
                    case 'finding_post_key':
                        setDecryptingStatus('finding_post_key')
                        break
                    case 'found_person_public_key':
                        forceReDecrypt(Math.random())
                        break
                    case 'new_post_key':
                        forceReDecrypt(Math.random())
                        break
                    default:
                        break
                }
            }
        }
        // TODO: MessageCenter does not support removeListener currently. Will add later
        MessageCenter.on('decryptionStatusUpdated', listener)
        return () => {
            listener = () => {}
        }
    }, [postBy, payload])
    return (
        <AsyncComponent
            promise={() => {
                // TODO: add another ui state?
                if (whoAmI.isUnknown) {
                    return Promise.resolve({ then() {} } as typeof result)
                }
                const result = Services.Crypto.decryptFrom(encryptedText, postBy, whoAmI)
                return result
            }}
            dependencies={[
                __,
                encryptedText,
                postBy.toText(),
                whoAmI.toText(),
                Identifier.IdentifiersToString(people.map(x => x.identifier)),
                Identifier.IdentifiersToString(alreadySelectedPreviously.map(x => x.identifier)),
            ]}
            awaitingComponent={<DecryptPostAwaiting type={decryptingStatus} />}
            completeComponent={_props => {
                if ('error' in _props.data) {
                    return <DecryptPostFailed error={new Error(_props.data.error)} />
                }
                props.onDecrypted(_props.data.content)
                return (
                    <DecryptPostSuccess
                        data={_props.data}
                        alreadySelectedPreviously={alreadySelectedPreviously}
                        requestAppendRecipients={postBy.equals(whoAmI) ? rAD : undefined}
                        people={people}
                    />
                )
            }}
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
