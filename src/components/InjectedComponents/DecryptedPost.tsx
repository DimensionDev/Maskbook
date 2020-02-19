import React, { useMemo, useState, useEffect } from 'react'
import AsyncComponent from '../../utils/components/AsyncComponent'
import { AdditionalContent, AdditionalContentProps } from './AdditionalPostContent'
import { useShareMenu } from './SelectPeopleDialog'
import { sleep, getUrl } from '../../utils/utils'
import { ServicesWithProgress } from '../../extension/service'
import { useI18N } from '../../utils/i18n-next-ui'
import { makeStyles } from '@material-ui/styles'
import { Box, Link, useMediaQuery, useTheme, Typography } from '@material-ui/core'
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
import RedPacketInDecryptedPost from '../../plugins/Wallet/UI/RedPacket/RedPacketInDecryptedPost'
import { DecryptFailedReason } from '../../utils/constants'

export interface DecryptPostSuccessProps extends withClasses<KeysInferFromUseStyles<typeof useSuccessStyles>> {
    data: { signatureVerifyResult: boolean; content: TypedMessage }
    postIdentifier?: PostIdentifier<ProfileIdentifier>
    requestAppendRecipients?(to: Profile[]): Promise<void>
    alreadySelectedPreviously: Profile[]
    profiles: Profile[]
    sharedPublic?: boolean
    AdditionalContentProps?: Partial<AdditionalContentProps>
}

const useSuccessStyles = makeStyles({
    header: { display: 'flex', alignItems: 'center' },
    addRecipientsTitle: { marginLeft: '0.25em', marginRight: '0.25em' },
    addRecipientsLink: { marginRight: '1em', cursor: 'pointer' },
    signatureVerifyPassed: { color: 'green' },
    signatureVerifyFailed: { color: 'red' },
})

export const DecryptPostSuccess = React.memo(function DecryptPostSuccess(props: DecryptPostSuccessProps) {
    const { data, profiles: people, postIdentifier } = props
    const shareMenu = useShareMenu(
        people,
        props.requestAppendRecipients || (async () => {}),
        props.alreadySelectedPreviously,
    )
    return (
        <AdditionalContent
            metadataRenderer={{
                after: props => <RedPacketInDecryptedPost message={props.message} postIdentifier={postIdentifier} />,
            }}
            header={<DecryptPostSuccessHeader {...props} shareMenu={shareMenu} />}
            message={data.content}
            {...props.AdditionalContentProps}
        />
    )
})

function DecryptPostSuccessHeader(props: { shareMenu: ReturnType<typeof useShareMenu> } & DecryptPostSuccessProps) {
    const { t } = useI18N()
    const theme = useTheme()
    const classes = useStylesExtends(useSuccessStyles(), props)
    const {
        shareMenu: { ShareMenu, showShare },
        data,
        sharedPublic,
    } = props
    let passString = t('decrypted_postbox_verified')
    let failString = t('decrypted_postbox_not_verified')

    if (useMediaQuery(theme.breakpoints.down('sm'))) {
        passString = '✔'
        failString = '❌'
    }
    return (
        <Typography variant="caption" color="textSecondary" gutterBottom className={classes.header}>
            <img alt="" width={16} height={16} src={getUrl('/maskbook-icon-padded.png')} />
            {ShareMenu}
            <span className={classes.addRecipientsTitle}>{t('decrypted_postbox_title')}</span>
            <Box flex={1} />
            {props.requestAppendRecipients && !sharedPublic && (
                <Link color="primary" onClick={showShare} className={classes.addRecipientsLink}>
                    {t('decrypted_postbox_add_recipients')}
                </Link>
            )}
            {data.signatureVerifyResult ? (
                <span className={classes.signatureVerifyPassed}>{passString}</span>
            ) : (
                <span className={classes.signatureVerifyFailed}>{failString}</span>
            )}
        </Typography>
    )
}

export interface DecryptPostAwaitingProps {
    type?: DecryptionProgress
    AdditionalContentProps?: Partial<AdditionalContentProps>
}
export const DecryptPostAwaiting = React.memo(function DecryptPostAwaiting(props: DecryptPostAwaitingProps) {
    const { t } = useI18N()
    const key = {
        finding_post_key: 'decrypted_postbox_decrypting_finding_post_key',
        finding_person_public_key: 'decrypted_postbox_decrypting_finding_person_key',
        undefined: 'decrypted_postbox_decrypting',
    } as const
    return (
        <AdditionalContent
            header={t(key[(props.type && props.type.progress) || 'undefined'])}
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
    const { t } = useI18N()
    if (error && error.message === DecryptFailedReason.MyCryptoKeyNotFound) {
        return <NotSetupYetPrompt {...props.NotSetupYetPromptProps} />
    }
    return (
        <AdditionalContent
            header={t('service_decryption_failed')}
            message={error?.message}
            {...props.AdditionalContentProps}
        />
    )
})

export interface DecryptPostProps {
    onDecrypted(post: TypedMessage): void
    onDecryptedRaw?(post: string): void
    postBy: ProfileIdentifier
    postId?: PostIdentifier<ProfileIdentifier>
    whoAmI: ProfileIdentifier
    encryptedText: string
    people: Profile[]
    alreadySelectedPreviously: Profile[]
    requestAppendRecipients?(to: Profile[]): Promise<void>
    disableSuccessDecryptionCache?: boolean // ! not used
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

    const [postPayload, setPostPayload] = useState(() => deconstructPayload(encryptedText, null))
    const sharedPublic = (postPayload?.version === -38 ? postPayload.sharedPublic : false) ?? false
    useEffect(() => setPostPayload(deconstructPayload(encryptedText, null)), [encryptedText])

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
        if (!isDebugging || !postPayload) return null
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
    }, [isDebugging, postPayload, postBy, encryptedText, whoAmI, debugHash, decryptedResult])

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
                    const iter = ServicesWithProgress.decryptFrom(encryptedText, postBy, whoAmI, sharedPublic)
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
                    props.onDecryptedRaw?.(result.data.rawContent)

                    // HACK: the is patch, hidden NOT VERIFIED in everyone
                    if (sharedPublic) {
                        result.data.signatureVerifyResult = true
                    }

                    return (
                        <Success
                            data={result.data}
                            postIdentifier={postId}
                            alreadySelectedPreviously={alreadySelectedPreviously}
                            requestAppendRecipients={requestAppendRecipientsWrapped}
                            profiles={people}
                            sharedPublic={sharedPublic}
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
