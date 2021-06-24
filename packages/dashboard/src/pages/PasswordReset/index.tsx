import { RowLayout } from '../../components/RegisterFrame/RowLayout'
import { ColumnContentLayout } from '../../components/RegisterFrame/ColumnContentLayout'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router'
import React from 'react'

export const Actions = styled('div')(
    ({ theme }) => `
    padding: ${theme.spacing(5)} 0;
`,
)

export enum RoutePaths {
    InputAccountEmail = '/',
    VerificationCodeSending = '/verification-code',
    NewPassword = '/new-password',
}

const PasswordReset = () => {
    const location = useLocation()
    return (
        <RowLayout>
            <ColumnContentLayout>
                <Outlet />
            </ColumnContentLayout>
        </RowLayout>
    )
}

export default PasswordReset
