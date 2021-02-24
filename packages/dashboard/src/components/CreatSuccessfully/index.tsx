import { memo } from 'react'
import { Button, experimentalStyled as styled, Typography } from '@material-ui/core'
import { SuccessIcon } from '@dimensiondev/icons'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'

export interface CreateSuccessfully {
    onUnlock(): void
}

export const CreateSuccessfully = memo((props: CreateSuccessfully) => {
    const { onUnlock } = props

    return (
        <Container>
            <Icon>
                <SuccessIcon fontSize="inherit" />
            </Icon>
            <SuccessTitle>Success</SuccessTitle>
            <SuccessTips>You have created your wallet successfully</SuccessTips>
            <UnlockButton onClick={onUnlock}>Unlock Wallet</UnlockButton>
        </Container>
    )
})

const Icon = styled('div')`
    font-size: 64px;
`

const Container = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: center;
`

const SuccessTitle = styled(Typography)(
    ({ theme }) => `
    font-size: ${theme.typography.h5.fontSize};
    color: ${theme.palette.success.main};
    font-weight: ${theme.typography.fontWeightMedium};
    margin: ${theme.spacing(2)} 0px;
`,
)

const SuccessTips = styled(Typography)(
    ({ theme }) => `
    font-size:${theme.typography.fontSize};
    color: ${MaskColorVar.normalText};
`,
)

const UnlockButton = styled(Button)(
    ({ theme }) => `
    width: 124px;
    height: 32px;
    border-radius: 6px;
    margin-top: ${theme.spacing(7)}
`,
)
