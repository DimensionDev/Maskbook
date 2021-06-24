import { PasswordForm } from '../../components/RegisterFrame/PasswordForm'
import { Button, TextField } from '@material-ui/core'
import React from 'react'
import { Actions } from './index'

const NewPassword = () => {
    return (
        <PasswordForm
            title={'Forgot Password?'}
            subtitle={
                'Enter the email address you used when you joined and we’ll send verification code to your email.'
            }>
            <TextField size={'medium'} placeholder={'Email Address'} error helperText="Incorrect entry." fullWidth />
            <Actions>
                <Button color={'primary'} size={'large'} fullWidth>
                    Next
                </Button>
            </Actions>
        </PasswordForm>
    )
}

export default NewPassword
