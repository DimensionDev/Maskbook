import { useMemo, useState } from 'react'
import { useAsync, useUpdateEffect } from 'react-use'
import { DialogActions, DialogContent, Tab, Typography } from '@mui/material'
import { isDashboardPage, EMPTY_LIST } from '@masknet/shared-base'
import { MaskTabList, useTabs } from '@masknet/theme'
import {
    createContract,
    ChainId,
    SchemaType,
    getAaveConstants,
    ZERO_ADDRESS,
    networkResolver,
    NetworkType,
} from '@masknet/web3-shared-evm'
import { PluginWalletStatusBar, useI18N } from '../../../utils'
import { InjectedDialog } from '@masknet/shared'
import { AllProviderTradeContext } from '../../Trader/trader/useAllProviderTradeContext'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { WalletRPC } from '../../Wallet/messages'
import { SavingsProtocol, TabType } from '../types'
import { useStyles } from './SavingsDialogStyles'
import { SavingsTable } from './SavingsTable'
import { SavingsForm } from './SavingsForm'
import type { AaveProtocolDataProvider } from '@masknet/web3-contracts/types/AaveProtocolDataProvider'
import AaveProtocolDataProviderABI from '@masknet/web3-contracts/abis/AaveProtocolDataProvider.json'
import { LidoProtocol } from '../protocols/LDOProtocol'
import { AAVEProtocol } from '../protocols/AAVEProtocol'
import { LDO_PAIRS } from '../constants'
import type { AbiItem } from 'web3-utils'
import { flatten, compact, chunk } from 'lodash-unified'
import { useChainId, useFungibleTokens, useWeb3 } from '@masknet/plugin-infra/web3'
import { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'
import { TabContext, TabPanel } from '@mui/lab'
export interface SavingsDialogProps {
    open: boolean
    onClose?: () => void
}

export function SavingsDialog({ open, onClose }: SavingsDialogProps) {
    const { t } = useI18N()
    const isDashboard = isDashboardPage()
    const { classes } = useStyles({ isDashboard })

    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [chainId, setChainId] = useState<ChainId>(currentChainId)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })

    const [tab, setTab] = useState<TabType>(TabType.Deposit)
    const [selectedProtocol, setSelectedProtocol] = useState<SavingsProtocol | null>(null)

    const { value: chains = EMPTY_LIST } = useAsync(async () => {
        const networks = await WalletRPC.getSupportedNetworks()
        return networks.map((network: NetworkType) => networkResolver.networkChainId(network))
    }, [])

    const { value: aaveTokens } = useAsync(async () => {
        if (!open || chainId !== ChainId.Mainnet) {
            return EMPTY_LIST
        }

        const address = getAaveConstants(chainId).AAVE_PROTOCOL_DATA_PROVIDER_CONTRACT_ADDRESS || ZERO_ADDRESS

        const protocolDataContract = createContract<AaveProtocolDataProvider>(
            web3,
            address,
            AaveProtocolDataProviderABI as AbiItem[],
        )

        const tokens = await protocolDataContract?.methods.getAllReservesTokens().call()

        const aTokens = await protocolDataContract?.methods.getAllATokens().call()

        return tokens?.map((token) => {
            return [token[1], aTokens?.filter((f) => f[0].toUpperCase() === `a${token[0]}`.toUpperCase())[0][1]]
        })
    }, [open, web3, chainId])

    const { value: detailedAaveTokens } = useFungibleTokens(
        NetworkPluginID.PLUGIN_EVM,
        compact(flatten(aaveTokens ?? [])),
        {
            chainId,
        },
    )

    const protocols = useMemo(
        () => [
            ...LDO_PAIRS.filter((x) => x[0].chainId === chainId).map((pair) => new LidoProtocol(pair)),
            ...chunk(detailedAaveTokens, 2).map(
                (pair) =>
                    new AAVEProtocol(pair as [FungibleToken<ChainId, SchemaType>, FungibleToken<ChainId, SchemaType>]),
            ),
        ],
        [chainId, detailedAaveTokens, tab],
    )

    useUpdateEffect(() => {
        setChainId(currentChainId)
    }, [currentChainId])

    const [currentTab, onChange, tabs] = useTabs('Deposit', 'Withdraw')

    return (
        <TargetChainIdContext.Provider>
            <AllProviderTradeContext.Provider>
                <InjectedDialog
                    open={open}
                    title={t('plugin_savings')}
                    isOnBack={Boolean(selectedProtocol)}
                    onClose={() => {
                        if (selectedProtocol === null) {
                            onClose?.()
                        } else {
                            setSelectedProtocol(null)
                        }
                    }}>
                    <DialogContent style={{ padding: 0, overflowX: 'hidden' }}>
                        {selectedProtocol ? (
                            <DialogContent style={{ padding: 0, overflowX: 'hidden' }}>
                                <SavingsForm
                                    tab={tab}
                                    chainId={chainId}
                                    protocol={selectedProtocol}
                                    onClose={onClose}
                                />
                            </DialogContent>
                        ) : (
                            <>
                                <DialogContent style={{ padding: 0, overflowX: 'hidden' }}>
                                    <div className={classes.abstractTabWrapper}>
                                        <NetworkTab
                                            chainId={chainId}
                                            setChainId={setChainId}
                                            classes={classes}
                                            chains={chains.filter(Boolean) as ChainId[]}
                                        />
                                    </div>
                                    <div className={classes.tableTabWrapper}>
                                        <TabContext value={currentTab}>
                                            <MaskTabList variant="base" onChange={onChange} aria-label="Savings">
                                                <Tab
                                                    label={<Typography>{tabs.Deposit}</Typography>}
                                                    value={tabs.Deposit}
                                                />
                                                <Tab
                                                    label={<Typography>{tabs.Withdraw}</Typography>}
                                                    value={tabs.Withdraw}
                                                />
                                            </MaskTabList>

                                            <TabPanel style={{ padding: '8px 0 0 0' }} value={tabs.Deposit}>
                                                <SavingsTable
                                                    chainId={chainId}
                                                    tab={TabType.Deposit}
                                                    protocols={protocols}
                                                    setTab={setTab}
                                                    setSelectedProtocol={setSelectedProtocol}
                                                />
                                            </TabPanel>
                                            <TabPanel style={{ padding: '8px 0 0 0' }} value={tabs.Withdraw}>
                                                <SavingsTable
                                                    chainId={chainId}
                                                    tab={TabType.Withdraw}
                                                    protocols={protocols}
                                                    setTab={setTab}
                                                    setSelectedProtocol={setSelectedProtocol}
                                                />
                                            </TabPanel>
                                        </TabContext>
                                    </div>
                                </DialogContent>
                                <DialogActions style={{ padding: 0 }}>
                                    <PluginWalletStatusBar>
                                        <ChainBoundary
                                            expectedChainId={chainId}
                                            expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                                        />
                                    </PluginWalletStatusBar>
                                </DialogActions>
                            </>
                        )}
                    </DialogContent>
                </InjectedDialog>
            </AllProviderTradeContext.Provider>
        </TargetChainIdContext.Provider>
    )
}
