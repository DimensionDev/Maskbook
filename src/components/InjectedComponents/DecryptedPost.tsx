import React, { useCallback, useState, useEffect } from 'react'
import AsyncComponent from '../../utils/components/AsyncComponent'
import { AdditionalContent } from './AdditionalPostContent'
import { useShareMenu } from './SelectPeopleDialog'
import { sleep } from '../../utils/utils'
import Services from '../../extension/service'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import { Link, Box, SnackbarContent, Button } from '@material-ui/core'
import { Person } from '../../database'
import { PersonIdentifier } from '../../database/type'
import { myUsernameRef } from '../../extension/content-script/injections/MyUsername'
import { isMobile } from '../../social-network/facebook.com/isMobile'

interface DecryptPostSuccessProps {
    data: { signatureVerifyResult: boolean; content: string }
    requestAppendDecryptor(to: Person[]): Promise<void>
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
    const { ShareMenu, showShare } = useShareMenu(people, props.requestAppendDecryptor, props.alreadySelectedPreviously)
    return (
        <AdditionalContent
            title={
                <>
                    {ShareMenu}
                    {geti18nString('decrypted_postbox_title')}
                    <Box flex={1} />
                    <Link color="primary" onClick={showShare} className={classes.link}>
                        {geti18nString('decrypted_postbox_add_decryptor')}
                    </Link>
                    {data.signatureVerifyResult ? (
                        <span className={classes.pass}>{geti18nString('decrypted_postbox_verified')}</span>
                    ) : (
                        <span className={classes.fail}>{geti18nString('decrypted_postbox_not_verified')}</span>
                    )}
                </>
            }
            renderText={data.content}
        />
    )
}

const DecryptPostAwaiting = <AdditionalContent title={geti18nString('decrypted_postbox_decrypting')} />
const useNotSetUpYetStyles = makeStyles({
    root: {
        marginBottom: '2em',
    },
})
function NotSetupYetPrompt() {
    const [id, set] = useState(myUsernameRef.value)
    useEffect(() => myUsernameRef.addListener(set))

    const styles = useNotSetUpYetStyles()
    const button = (
        <Button onClick={() => Services.Welcome.openWelcomePage(id, isMobile)} color="primary" size="small">
            {geti18nString('click_to_setup')}
        </Button>
    )
    return (
        <SnackbarContent
            classes={styles}
            elevation={0}
            message={geti18nString('service_not_setup_yet')}
            action={button}
        />
    )
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
    postBy: PersonIdentifier
    whoAmI: PersonIdentifier
    encryptedText: string
    people: Person[]
    alreadySelectedPreviously: Person[]
    requestAppendDecryptor(to: Person[]): Promise<void>
}
function DecryptPost(props: DecryptPostProps) {
    const { postBy, whoAmI, encryptedText, people, alreadySelectedPreviously, requestAppendDecryptor } = props
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
