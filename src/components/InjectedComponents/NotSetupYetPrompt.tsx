import React from 'react'
import Services from '../../extension/service'
import { geti18nString } from '../../utils/i18n'
import { SnackbarContent, Button, makeStyles } from '@material-ui/core'
import { myUsernameRef } from '../../extension/content-script/injections/MyUsername'
import { isMobile } from '../../social-network/facebook.com/isMobile'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { GetContext } from '@holoflows/kit/es'

const useNotSetUpYetStyles = makeStyles({
    root: {
        marginBottom: '2em',
        maxWidth: '50em',
    },
})
export function NotSetupYetPrompt() {
    const id = useValueRef(myUsernameRef)
    const styles = useNotSetUpYetStyles()
    const button = (
        <Button
            onClick={() => {
                if (GetContext() === 'options') {
                    location.hash = '/welcome'
                } else Services.Welcome.openWelcomePage(id, isMobile)
            }}
            color="primary"
            size="small">
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
