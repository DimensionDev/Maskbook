import React from 'react'
import Services from '../../extension/service'
import { geti18nString } from '../../utils/i18n'
import { Button, makeStyles, SnackbarContent } from '@material-ui/core'
import { GetContext } from '@holoflows/kit/es'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { getActivatedUI } from '../../social-network/ui'
import { setStorage } from '../../utils/browser.storage'
import { useStylesExtends } from '../custom-ui-helper'
import { SnackbarContentProps } from '@material-ui/core/SnackbarContent'

const useSnackbarContentStyle = makeStyles({
    root: {
        marginBottom: '2em',
        maxWidth: '50em',
    },
})
export interface NotSetupYetPromptUIProps {
    preparingSetup: boolean
    onSetupClick(): void
    disableSetupButton: boolean
    SnackbarContentProps?: SnackbarContentProps
}
export const NotSetupYetPromptUI = React.memo((props: NotSetupYetPromptUIProps) => {
    const classes = useStylesExtends(useSnackbarContentStyle(), props.SnackbarContentProps || {})
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
            elevation={0}
            message={
                <>
                    {geti18nString('service_not_setup_yet')}
                    {props.preparingSetup ? preparingSetup : null}
                </>
            }
            action={button}
            {...props.SnackbarContentProps}
            classes={classes}
        />
    )
})

export interface NotSetupYetPromptProps extends Partial<NotSetupYetPromptUIProps> {}
export function NotSetupYetPrompt(props: Partial<NotSetupYetPromptProps>) {
    const isContent = GetContext() === 'content' || GetContext() === 'debugging'
    // isContent is always stable in a context. So it's okay.
    // eslint-disable-next-line
    const id = isContent ? useLastRecognizedIdentity() : null

    return (
        <NotSetupYetPromptUI
            onSetupClick={() => {
                if (isContent) {
                    setStorage(getActivatedUI().networkIdentifier, { forceDisplayWelcome: false }).then()
                }
                if (GetContext() === 'options') {
                    location.hash = '/welcome'
                } else if (id) {
                    Services.Welcome.openWelcomePage(id).then()
                }
            }}
            preparingSetup={isContent && isCurrentIdentityUnknown()}
            disableSetupButton={isContent ? isCurrentIdentityUnknown() : false}
            {...props}
        />
    )

    function isCurrentIdentityUnknown(): boolean {
        if (!id) return true
        return id.identifier.isUnknown
    }
}
