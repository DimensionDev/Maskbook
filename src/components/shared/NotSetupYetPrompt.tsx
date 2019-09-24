import React from 'react'
import Services from '../../extension/service'
import { geti18nString } from '../../utils/i18n'
import { SnackbarContent, Button, makeStyles } from '@material-ui/core'
import { GetContext } from '@holoflows/kit/es'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'

const useNotSetUpYetStyles = makeStyles({
    root: {
        marginBottom: '2em',
        maxWidth: '50em',
    },
})
interface NotSetupYetPromptUIProps {
    preparingSetup: boolean
    onSetupClick(): void
    disableSetupButton: boolean
}
export function NotSetupYetPromptUI(props: NotSetupYetPromptUIProps) {
    const styles = useNotSetUpYetStyles()
    const button = (
        <Button onClick={props.onSetupClick} disabled={props.disableSetupButton} color="primary" size="small">
            {geti18nString('click_to_setup')}
        </Button>
    )
    const preparingSetup = (
        <>
            <br />
            {geti18nString('banner_preparing_setup')}
        </>
    )
    return (
        <SnackbarContent
            classes={styles}
            elevation={0}
            message={
                <>
                    {geti18nString('service_not_setup_yet')}
                    {props.preparingSetup ? preparingSetup : null}
                </>
            }
            action={button}
        />
    )
}

export function NotSetupYetPrompt() {
    const isContent = GetContext() === 'content' || GetContext() === 'debugging'
    // isContent is always stable in a context. So it's okay.
    // eslint-disable-next-line
    const id = isContent ? useLastRecognizedIdentity() : null

    return (
        <NotSetupYetPromptUI
            onSetupClick={() => {
                if (GetContext() === 'options') {
                    location.hash = '/welcome'
                } else if (id) {
                    Services.Welcome.openWelcomePage(id)
                }
            }}
            preparingSetup={isContent && isCurrentIdentityUnknown()}
            disableSetupButton={isContent ? isCurrentIdentityUnknown() : false}
        />
    )

    function isCurrentIdentityUnknown(): boolean {
        if (!id) return true
        return id.identifier.isUnknown
    }
}
