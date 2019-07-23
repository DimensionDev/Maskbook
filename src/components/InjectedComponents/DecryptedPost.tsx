import React, { useCallback, useState, useEffect } from 'react'
import AsyncComponent from '../../utils/components/AsyncComponent'
import { AdditionalContent } from './AdditionalPostContent'
import { useShareMenu } from './SelectPeopleDialog'
import { sleep } from '../../utils/utils'
import Services from '../../extension/service'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import { Link, Box, useMediaQuery, useTheme } from '@material-ui/core'
import { Person } from '../../database'
import { PersonIdentifier } from '../../database/type'
import { NotSetupYetPrompt } from './NotSetupYetPrompt'
import { myUsernameRef } from '../../extension/content-script/injections/MyUsername'
import { isMobile } from '../../social-network-provider/facebook.com/isMobile'
import { useValueRef } from '../../utils/hooks/useValueRef'

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

const DecryptPostAwaiting = <AdditionalContent title={geti18nString('decrypted_postbox_decrypting')} />
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
    requestAppendRecipients(to: Person[]): Promise<void>
}
function DecryptPost(props: DecryptPostProps) {
    const { postBy, whoAmI, encryptedText, people, alreadySelectedPreviously, requestAppendRecipients } = props
    const rAD = useCallback(
        async (people: Person[]) => {
            await requestAppendRecipients(people)
            await sleep(1500)
        },
        [requestAppendRecipients],
    )
    return (
        <AsyncComponent
            promise={() => Services.Crypto.decryptFrom(encryptedText, postBy, whoAmI)}
            dependencies={[encryptedText, people, alreadySelectedPreviously]}
            awaitingComponent={DecryptPostAwaiting}
            completeComponent={_props =>
                'error' in _props.data ? (
                    <DecryptPostFailed error={new Error(_props.data.error)} />
                ) : (
                    (props.onDecrypted(_props.data.content),
                    (
                        <DecryptPostSuccess
                            data={_props.data}
                            alreadySelectedPreviously={alreadySelectedPreviously}
                            requestAppendRecipients={postBy.equals(whoAmI) ? rAD : undefined}
                            people={people}
                        />
                    ))
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
