import { useNavigate } from 'react-router'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { CreateWalletUI } from '../../../../maskbook/src/plugins/Wallet/SNSAdaptor/CreateWalletDialog'

const Container = styled('div')`
    width: 528px;
`
export function CreateWallet() {
    const navigate = useNavigate()
    return (
        <Container>
            <CreateWalletUI
                onCreated={() => {
                    navigate(`/wallets`)
                }}
            />
        </Container>
    )
}
