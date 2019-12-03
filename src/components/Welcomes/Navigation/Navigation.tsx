import * as React from 'react'

import Close from '@material-ui/icons/Close'
import { geti18nString } from '../../../utils/i18n'
import { Button, useTheme, MobileStepper, makeStyles } from '@material-ui/core'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import { useHistory } from 'react-router'

interface Props {
    back?: () => void
    close?: () => void
    activeStep: number
}
const useStyles = makeStyles({
    stepper: {
        background: 'transparent',
    },
})
export default function Navigation({ back, close, activeStep }: Props) {
    const theme = useTheme()
    const classes = useStyles()
    const history = useHistory()

    return (
        <MobileStepper
            variant="progress"
            steps={4}
            position="static"
            activeStep={activeStep}
            classes={{ root: classes.stepper }}
            nextButton={
                <Button
                    size="small"
                    onClick={close ? close : () => history.replace('/')}
                    disableFocusRipple
                    disableRipple>
                    {geti18nString('welcome_0_close_button')}
                    <Close />
                </Button>
            }
            backButton={
                <Button disableFocusRipple disableRipple size="small" disabled={!back} onClick={back}>
                    {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                    {geti18nString('back')}
                </Button>
            }
        />
    )
}
