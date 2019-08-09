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
export function NotSetupYetPrompt() {
    const isContent = GetContext() === 'content' || GetContext() === 'debugging'
    const id = isContent ? useLastRecognizedIdentity() : null
    const styles = useNotSetUpYetStyles()
    const button = (
        <Button
            onClick={() => {
                if (GetContext() === 'options') {
                    location.hash = '/welcome'
                } else if (id) {
                    Services.Welcome.openWelcomePage(id)
                }
            }}
            disabled={isContent ? isUnknown() : false}
            color="primary"
            size="small">
            {geti18nString('click_to_setup')}
        </Button>
    )
    return (
        <SnackbarContent
            classes={styles}
            elevation={0}
            message={
                <>
                    {geti18nString('service_not_setup_yet')}
                    {isContent && isUnknown() ? (
                        <>
                            <br />
                            {geti18nString('banner_collecting_identity')}
                        </>
                    ) : null}
                </>
            }
            action={button}
        />
    )

    function isUnknown(): boolean {
        return id!.identifier.isUnknown
    }
}
