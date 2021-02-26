import { memo } from 'react'
import { experimentalStyled as styled, Typography } from '@material-ui/core'
import { WalletQRCodeContainer } from '../WalletQRCodeContainer'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { useDashboardI18N } from '../../locales'
const Container = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: center;
`

const Tip = styled(Typography)(
    ({ theme }) => `
    text-align: center;
    color: ${MaskColorVar.textSecondary};
    font-size: ${theme.typography.body1.fontSize};
    margin-bottom: ${theme.spacing(5)};
`,
)

export const WalletConnect = memo(() => {
    const t = useDashboardI18N()
    return (
        <Container>
            <Tip color="textSecondary">{t.wallets_wallet_connect_title()}</Tip>
            <WalletQRCodeContainer width={330} height={330} borderWidth={15} borderHeight={2} />
        </Container>
    )
})
