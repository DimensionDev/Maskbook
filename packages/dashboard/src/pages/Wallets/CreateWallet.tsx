import { useNavigate } from 'react-router'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { CreateWalletUI } from '@masknet/plugin-wallet/components'
import { PluginServices } from '../../API'

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
                createNewWallet={PluginServices.Wallet.importWalletByMnemonic}
            />
        </Container>
    )
}
