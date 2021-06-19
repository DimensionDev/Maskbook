import { Route, Routes, useNavigate } from 'react-router'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import type { FC } from 'react'
import { WalletCreationChooseUI } from '../../../../maskbook/src/plugins/Wallet/UI/CreateImportChooseDialog'

const ChooseOptions = styled('div')`
    width: 520px;
`

enum CreateWalletRoutes {
    Choose = '/',
    Create = '/create',
    Import = '/import',
}
export const CreateWallet: FC = () => {
    const navigate = useNavigate()
    return (
        <Routes>
            <Route path={CreateWalletRoutes.Choose}>
                <ChooseOptions>
                    <WalletCreationChooseUI
                        onCreateClick={() => {
                            navigate(`/wallets${CreateWalletRoutes.Create}`)
                        }}
                        onImportClick={() => {
                            navigate(`/wallets${CreateWalletRoutes.Import}`)
                        }}
                    />
                </ChooseOptions>
            </Route>
            <Route path={CreateWalletRoutes.Choose}>
                <ChooseOptions>
                    <WalletCreationChooseUI onImportClick={() => {}} onCreateClick={() => {}} />
                </ChooseOptions>
            </Route>
            <Route path={CreateWalletRoutes.Create}>
                <h1>create</h1>
            </Route>
            <Route path={CreateWalletRoutes.Import}>
                <h1>import</h1>
            </Route>
            <Route>
                <div>nothing</div>
            </Route>
        </Routes>
    )
}
