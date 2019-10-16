import React, { useMemo, useState } from 'react'
import AsyncComponent from '../../utils/components/AsyncComponent'
import { AdditionalContent } from './AdditionalPostContent'
import { useShareMenu } from './SelectPeopleDialog'
import { sleep } from '../../utils/utils'
import { ServicesWithProgress } from '../../extension/service'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import { Box, Link, SnackbarContent, useMediaQuery, useTheme } from '@material-ui/core'
import { Person } from '../../database'
import { Identifier, PersonIdentifier } from '../../database/type'
import { NotSetupYetPrompt } from '../shared/NotSetupYetPrompt'
import {
    DecryptionProgress,
    FailureDecryption,
    SuccessDecryption,
} from '../../extension/background-script/CryptoServices/decryptFrom'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { debugModeSetting } from '../shared-settings/settings'
import { DebugModeUI_PostHashDialog } from '../DebugModeUI/PostHashDialog'
import { GetContext } from '@holoflows/kit/es'
import { deconstructPayload } from '../../utils/type-transform/Payload'
import { DebugList } from '../DebugModeUI/DebugList'

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
    if (mediaQuery) {
        passString = passString[passString.length - 1]
        failString = failString[failString.length - 1]
    }
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

function DecryptPostAwaiting(props: { type?: DecryptionProgress }) {
    const key = {
        finding_post_key: 'decrypted_postbox_decrypting_finding_post_key',
        finding_person_public_key: 'decrypted_postbox_decrypting_finding_person_key',
        undefined: 'decrypted_postbox_decrypting',
    } as const
    return <AdditionalContent title={geti18nString(key[(props.type && props.type.progress) || 'undefined'])} />
}

const useDecryptPostFailedStyles = makeStyles({
    root: {
        marginBottom: '2em',
        maxWidth: '50em',
    },
})
export function DecryptPostFailed({ error }: { error: Error }) {
    const styles = useDecryptPostFailedStyles()
    if (error && error.message === geti18nString('service_not_setup_yet')) {
        return <NotSetupYetPrompt />
    }
    return <SnackbarContent classes={styles} elevation={0} message={error && error.message} />
}

interface DecryptPostProps {
    onDecrypted(post: string): void

    postBy: PersonIdentifier
    whoAmI: PersonIdentifier
    encryptedText: string
    people: Person[]
    alreadySelectedPreviously: Person[]
    requestAppendRecipients?(to: Person[]): Promise<void>
    disableSuccessDecryptionCache?: boolean
}
function DecryptPost(props: DecryptPostProps) {
    const { postBy, whoAmI, encryptedText, people, alreadySelectedPreviously, requestAppendRecipients } = props
    debugger

    const [decryptedResult, setDecryptedResult] = useState<null | SuccessDecryption>(null)
    const [decryptingStatus, setDecryptingStatus] = useState<DecryptionProgress | FailureDecryption | undefined>(
        undefined,
    )

    const [debugHash, setDebugHash] = useState<string>('Unknown')
    const setting = useValueRef(debugModeSetting)
    const isDebugging = GetContext() === 'options' ? true : setting

    const requestAppendRecipientsWrapped = useMemo(() => {
        if (!postBy.equals(whoAmI)) return undefined
        if (!requestAppendRecipients) return undefined
        return async (people: Person[]) => {
            await requestAppendRecipients!(people)
            await sleep(1500)
        }
    }, [requestAppendRecipients, postBy, whoAmI])
    const debugHashJSX = useMemo(() => {
        if (!isDebugging) return null
        const postPayload = deconstructPayload(encryptedText, null)
        if (!postPayload) return null
        const postByMyself = <DebugModeUI_PostHashDialog network={postBy.network} post={encryptedText} />

        const ownersAESKeyEncrypted =
            postPayload.version === -38 ? postPayload.AESKeyEncrypted : postPayload.ownersAESKeyEncrypted
        return (
            <DebugList
                items={[
                    postBy.equals(whoAmI) ? postByMyself : (['Hash of this post', debugHash] as const),
                    ['Decrypt reason', decryptedResult ? decryptedResult.through.join(',') : 'Unknown'],
                    ['Payload version', postPayload.version],
                    ['Payload ownersAESKeyEncrypted', ownersAESKeyEncrypted],
                    ['Payload iv', postPayload.iv],
                    ['Payload encryptedText', postPayload.encryptedText],
                    ['Payload signature', postPayload.signature],
                ]}
            />
        )
    }, [debugHash, whoAmI, decryptedResult, postBy, encryptedText, isDebugging])
    if (decryptedResult && !props.disableSuccessDecryptionCache) {
        return (
            <>
                <DecryptPostSuccess
                    data={decryptedResult}
                    alreadySelectedPreviously={alreadySelectedPreviously}
                    requestAppendRecipients={requestAppendRecipientsWrapped}
                    people={people}
                />
                {isDebugging ? debugHashJSX : null}
            </>
        )
    }
    const awaitingComponent =
        decryptingStatus && 'error' in decryptingStatus ? (
            <DecryptPostFailed error={new Error(decryptingStatus.error)} />
        ) : (
            <DecryptPostAwaiting type={decryptingStatus} />
        )
    return (
        <>
            <AsyncComponent
                promise={async () => {
                    const iter = ServicesWithProgress.decryptFrom(encryptedText, postBy, whoAmI)
                    let last = await iter.next()
                    while (!last.done) {
                        if ('debug' in last.value) {
                            switch (last.value.debug) {
                                case 'debug_finding_hash':
                                    setDebugHash(last.value.hash.join('-'))
                            }
                        } else {
                            setDecryptingStatus(last.value)
                        }
                        last = await iter.next()
                    }
                    return last.value
                }}
                dependencies={[
                    encryptedText,
                    postBy.toText(),
                    whoAmI.toText(),
                    Identifier.IdentifiersToString(people.map(x => x.identifier)),
                    Identifier.IdentifiersToString(alreadySelectedPreviously.map(x => x.identifier)),
                ]}
                awaitingComponent={awaitingComponent}
                completeComponent={result => {
                    if ('error' in result.data) {
                        return <DecryptPostFailed error={new Error(result.data.error)} />
                    }
                    setDecryptedResult(result.data)
                    props.onDecrypted(result.data.content)
                    return (
                        <DecryptPostSuccess
                            data={result.data}
                            alreadySelectedPreviously={alreadySelectedPreviously}
                            requestAppendRecipients={requestAppendRecipientsWrapped}
                            people={people}
                        />
                    )
                }}
                failedComponent={DecryptPostFailed}
            />
            {isDebugging ? debugHashJSX : null}
        </>
    )
}

export const DecryptPostUI = {
    success: DecryptPostSuccess,
    awaiting: DecryptPostAwaiting,
    failed: DecryptPostFailed,
    UI: DecryptPost,
}
