import { useNavigate } from 'react-router'
import { MaskColorVar } from '@masknet/theme'
import { useSnackbarCallback } from '@masknet/shared'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { ImportWalletUI } from '@masknet/plugin-wallet/components'
import { PluginServices } from '../../API'

const Container = styled('div')`
    width: 528px;
    padding: 32px;
    border-radius: 20px;
    background-color: ${MaskColorVar.primaryBackground};
`
export function ImportWallet() {
    const navigate = useNavigate()

    const importByMnemonic = useSnackbarCallback(PluginServices.Wallet.importWalletByMnemonic, [], () => {
        navigate('/wallets')
    })
    const importByPrivateKey = useSnackbarCallback(PluginServices.Wallet.importWalletByPrivateKey, [], () => {
        navigate('/wallets')
    })
    return (
        <Container>
            <ImportWalletUI
                isPrivateKeyValid={PluginServices.Wallet.isPrivateKeyValid}
                onImportMnemonic={importByMnemonic}
                onImportPrivateKey={importByPrivateKey}
            />
        </Container>
    )
}
