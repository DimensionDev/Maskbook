import { WalletStartUp } from './components/StartUp'
import { EthereumRpcType, ProviderType, useWallet, useWallets } from '@masknet/web3-shared'
import { WalletAssets } from './components/WalletAssets'
import { Route, Switch, useHistory } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { PopupRoutes } from '../../index'
import { WalletContext } from './hooks/useWalletContext'
import { LoadingPlaceholder } from '../../components/LoadingPlaceholder'
import { useLocation } from 'react-router'
import urlcat from 'urlcat'
import { ThemeProvider } from '@emotion/react'
import { MaskLightTheme } from '@masknet/theme'
import { useAsyncRetry } from 'react-use'
import { WalletMessages, WalletRPC } from '../../../../plugins/Wallet/messages'
import Services from '../../../service'

const ImportWallet = lazy(() => import('./ImportWallet'))
const AddDeriveWallet = lazy(() => import('./AddDeriveWallet'))
const WalletSettings = lazy(() => import('./WalletSettings'))
const WalletRename = lazy(() => import('./WalletRename'))
const DeleteWallet = lazy(() => import('./DeleteWallet'))
const CreateWallet = lazy(() => import('./CreateWallet'))
const SelectWallet = lazy(() => import('./SelectWallet'))
const BackupWallet = lazy(() => import('./BackupWallet'))
const AddToken = lazy(() => import('./AddToken'))
const TokenDetail = lazy(() => import('./TokenDetail'))
const SignRequest = lazy(() => import('./SignRequest'))
const GasSetting = lazy(() => import('./GasSetting'))
const Transfer = lazy(() => import('./Transfer'))
const ContractInteraction = lazy(() => import('./ContractInteraction'))
const Unlock = lazy(() => import('./Unlock'))

export default function Wallet() {
    const wallet = useWallet()
    const wallets = useWallets(ProviderType.MaskWallet)
    const location = useLocation()
    const history = useHistory()

    // const lockStatus = useValueRef(currentIsMaskWalletLockedSettings)

    const { loading: getRequestLoading, retry } = useAsyncRetry(async () => {
        if (
            [PopupRoutes.ContractInteraction, PopupRoutes.WalletSignRequest, PopupRoutes.GasSetting].some(
                (item) => item === location.pathname,
            )
        )
            return

        const payload = await WalletRPC.topUnconfirmedRequest()
        if (!payload) return

        const computedPayload = await Services.Ethereum.getComputedPayload(payload)
        const value = {
            payload,
            computedPayload,
        }

        const toBeClose = new URLSearchParams(location.search).get('toBeClose')
        if (value?.computedPayload) {
            switch (value.computedPayload.type) {
                case EthereumRpcType.SIGN:
                    history.replace(urlcat(PopupRoutes.WalletSignRequest, { toBeClose }))
                    break
                case EthereumRpcType.CONTRACT_INTERACTION:
                case EthereumRpcType.SEND_ETHER:
                    history.replace(urlcat(PopupRoutes.ContractInteraction, { toBeClose }))
                    break
                default:
                    break
            }
        }
    }, [location])

    useEffect(() => {
        return WalletMessages.events.requestsUpdated.on(retry)
    }, [retry])

    // useEffect(() => {
    //     if (lockStatus) {
    //         history.push(PopupRoutes.Unlock)
    //     }
    // }, [lockStatus])

    return (
        <Suspense fallback={<LoadingPlaceholder />}>
            <ThemeProvider theme={MaskLightTheme}>
                <WalletContext.Provider>
                    {getRequestLoading ? (
                        <LoadingPlaceholder />
                    ) : (
                        <Switch>
                            <Route path={PopupRoutes.Wallet} exact>
                                {wallets.length === 0 || !wallet ? <WalletStartUp /> : <WalletAssets />}
                            </Route>
                            <Route path={PopupRoutes.ImportWallet} children={<ImportWallet />} exact />
                            <Route path={PopupRoutes.AddDeriveWallet} children={<AddDeriveWallet />} exact />
                            <Route path={PopupRoutes.WalletSettings} children={<WalletSettings />} exact />
                            <Route path={PopupRoutes.WalletRename} children={<WalletRename />} exact />
                            <Route path={PopupRoutes.DeleteWallet} children={<DeleteWallet />} exact />
                            <Route path={PopupRoutes.CreateWallet} children={<CreateWallet />} exact />
                            <Route path={PopupRoutes.SelectWallet} children={<SelectWallet />} exact />
                            <Route path={PopupRoutes.BackupWallet} children={<BackupWallet />} exact />
                            <Route path={PopupRoutes.AddToken} children={<AddToken />} exact />
                            <Route path={PopupRoutes.WalletSignRequest} children={<SignRequest />} />
                            <Route path={PopupRoutes.GasSetting} children={<GasSetting />} />
                            <Route path={PopupRoutes.TokenDetail} children={<TokenDetail />} exact />
                            <Route path={PopupRoutes.Transfer} children={<Transfer />} exact />
                            <Route path={PopupRoutes.ContractInteraction} children={<ContractInteraction />} />
                            {/*<Route path={PopupRoutes.Unlock} children={<Unlock />} />*/}
                        </Switch>
                    )}
                </WalletContext.Provider>
            </ThemeProvider>
        </Suspense>
    )
}
