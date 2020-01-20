import React, { useMemo, useState } from 'react'
import AsyncComponent from '../../utils/components/AsyncComponent'
import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import { useShareMenu } from './SelectPeopleDialog'
import { sleep } from '../../utils/utils'
import { ServicesWithProgress } from '../../extension/service'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import { Box, Link, useMediaQuery, useTheme } from '@material-ui/core'
import { Profile } from '../../database'
import { Identifier, ProfileIdentifier, PostIdentifier } from '../../database/type'
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
import { useStylesExtends } from '../custom-ui-helper'
import { BannerProps } from '../Welcomes/Banner'
import { TypedMessage } from '../../extension/background-script/CryptoServices/utils'

export interface DecryptPostSuccessProps extends withClasses<KeysInferFromUseStyles<typeof useSuccessStyles>> {
    data: { signatureVerifyResult: boolean; content: TypedMessage }
    postIdentifier?: PostIdentifier<ProfileIdentifier>
    requestAppendRecipients?(to: Profile[]): Promise<void>
    alreadySelectedPreviously: Profile[]
    people: Profile[]
    AdditionalContentProps?: Partial<AdditionalContentProps>
}

const useSuccessStyles = makeStyles({
    addRecipientsLink: { marginRight: '1em', cursor: 'pointer' },
    signatureVerifyPassed: { color: 'green' },
    signatureVerifyFailed: { color: 'red' },
})

export const DecryptPostSuccess = React.memo(function DecryptPostSuccess({
    data,
    people,
    postIdentifier,
    ...props
}: DecryptPostSuccessProps) {
    const classes = useStylesExtends(useSuccessStyles(), props)
    const { ShareMenu, showShare } = useShareMenu(
        people,
        props.requestAppendRecipients || (async () => {}),
        props.alreadySelectedPreviously,
    )
    const theme = useTheme()
    let passString = geti18nString('decrypted_postbox_verified')
    let failString = geti18nString('decrypted_postbox_not_verified')

    if (useMediaQuery(theme.breakpoints.down('sm'))) {
        passString = '✔'
        failString = '❌'
    }
    const msg = data.content
    if (msg.type === 'unknown')
        return <AdditionalContent title="Unknown type of Maskbook message" {...props.AdditionalContentProps} />
    else if (msg.type === 'complex')
        return (
            <AdditionalContent
                title="Complex Maskbook message is not renderable currently"
                {...props.AdditionalContentProps}
            />
        )
    return (
        <AdditionalContent
            postIdentifier={postIdentifier}
            title={
                <>
                    {ShareMenu}
                    {geti18nString('decrypted_postbox_title')}
                    <Box flex={1} />
                    {props.requestAppendRecipients && (
                        <Link color="primary" onClick={showShare} className={classes.addRecipientsLink}>
                            {geti18nString('decrypted_postbox_add_recipients')}
                        </Link>
                    )}
                    {data.signatureVerifyResult ? (
                        <span className={classes.signatureVerifyPassed}>{passString}</span>
                    ) : (
                        <span className={classes.signatureVerifyFailed}>{failString}</span>
                    )}
                </>
            }
            renderItem={msg}
            {...props.AdditionalContentProps}
        />
    )
})

export interface DecryptPostAwaitingProps {
    type?: DecryptionProgress
    AdditionalContentProps?: Partial<AdditionalContentProps>
}
export const DecryptPostAwaiting = React.memo(function DecryptPostAwaiting(props: DecryptPostAwaitingProps) {
    const key = {
        finding_post_key: 'decrypted_postbox_decrypting_finding_post_key',
        finding_person_public_key: 'decrypted_postbox_decrypting_finding_person_key',
        undefined: 'decrypted_postbox_decrypting',
    } as const
    return (
        <AdditionalContent
            title={geti18nString(key[(props.type && props.type.progress) || 'undefined'])}
            {...props.AdditionalContentProps}
        />
    )
})

export interface DecryptPostFailedProps {
    error: Error
    AdditionalContentProps?: Partial<AdditionalContentProps>
    NotSetupYetPromptProps?: Partial<BannerProps>
}
export const DecryptPostFailed = React.memo(function DecryptPostFailed({ error, ...props }: DecryptPostFailedProps) {
    if (error && error.message === geti18nString('service_not_setup_yet')) {
        return <NotSetupYetPrompt {...props.NotSetupYetPromptProps} />
    }
    return (
        <AdditionalContent
            title={geti18nString('service_decryption_failed')}
            renderText={error?.message}
            {...props.AdditionalContentProps}
        />
    )
})

export interface DecryptPostProps {
    onDecrypted(post: TypedMessage): void
    postBy: ProfileIdentifier
    postId?: string
    whoAmI: ProfileIdentifier
    encryptedText: string
    people: Profile[]
    alreadySelectedPreviously: Profile[]
    requestAppendRecipients?(to: Profile[]): Promise<void>
    disableSuccessDecryptionCache?: boolean
    successComponent?: React.ComponentType<DecryptPostSuccessProps>
    successComponentProps?: Partial<DecryptPostSuccessProps>
    waitingComponent?: React.ComponentType<DecryptPostAwaitingProps>
    waitingComponentProps?: Partial<DecryptPostAwaitingProps>
    failedComponent?: React.ComponentType<DecryptPostFailedProps>
    failedComponentProps?: Partial<DecryptPostFailedProps>
}
export function DecryptPost(props: DecryptPostProps) {
    const Success = props.successComponent || DecryptPostSuccess
    const Awaiting = props.waitingComponent || DecryptPostAwaiting
    const Failed = props.failedComponent || DecryptPostFailed

    const { postBy, postId, whoAmI, encryptedText, people, alreadySelectedPreviously, requestAppendRecipients } = props

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
        return async (people: Profile[]) => {
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
                <Success
                    data={decryptedResult}
                    postIdentifier={new PostIdentifier(postBy, postId || 'unknown')}
                    alreadySelectedPreviously={alreadySelectedPreviously}
                    requestAppendRecipients={requestAppendRecipientsWrapped}
                    people={people}
                    {...props.successComponentProps}
                />
                {isDebugging ? debugHashJSX : null}
            </>
        )
    }
    const awaitingComponent =
        decryptingStatus && 'error' in decryptingStatus ? (
            <Failed error={new Error(decryptingStatus.error)} {...props.failedComponentProps} />
        ) : (
            <Awaiting type={decryptingStatus} {...props.waitingComponentProps} />
        )
    return (
        <>
            <AsyncComponent
                promise={async () => {
                    const postPayload = deconstructPayload(encryptedText, null)
                    const iter = ServicesWithProgress.decryptFrom(
                        encryptedText,
                        postBy,
                        whoAmI,
                        (postPayload?.version === -38 ? postPayload.sharedPublic : false) ?? false,
                    )
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
                        return <Failed error={new Error(result.data.error)} {...props.failedComponentProps} />
                    }
                    setDecryptedResult(result.data)
                    props.onDecrypted(result.data.content)
                    return (
                        <Success
                            data={result.data}
                            postIdentifier={new PostIdentifier(postBy, postId || 'unknown')}
                            alreadySelectedPreviously={alreadySelectedPreviously}
                            requestAppendRecipients={requestAppendRecipientsWrapped}
                            people={people}
                            {...props.successComponentProps}
                        />
                    )
                }}
                failedComponent={DecryptPostFailed}
            />
            {isDebugging ? debugHashJSX : null}
        </>
    )
}
