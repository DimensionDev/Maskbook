import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { chunk, compact, flatten } from 'lodash-es'
import type { AbiItem } from 'web3-utils'
import { DialogActions, DialogContent, Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import {
    Web3ContextProvider,
    useFungibleTokens,
    RevokeChainContextProvider,
    ChainContextProvider,
    useChainContext,
} from '@masknet/web3-hooks-base'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { ChainId, getAaveConstant } from '@masknet/web3-shared-evm'
import { InjectedDialog, PluginWalletStatusBar, NetworkTab } from '@masknet/shared'
import { AllProviderTradeContext } from '@masknet/plugin-trader'
import { Contract } from '@masknet/web3-providers'
import type { AaveProtocolDataProvider } from '@masknet/web3-contracts/types/AaveProtocolDataProvider.js'
import AaveProtocolDataProviderABI from '@masknet/web3-contracts/abis/AaveProtocolDataProvider.json'
import { type SavingsProtocol, TabType, type TokenPair } from '../types.js'
import { SavingsTable } from './SavingsTable/index.js'
import { SavingsFormDialog } from './SavingsForm.js'
import { LidoProtocol } from '../protocols/LDOProtocol.js'
import { AAVEProtocol } from '../protocols/AAVEProtocol.js'
import { LDO_PAIRS } from '../constants.js'
import { useI18N } from '../locales/index.js'

const useStyles = makeStyles()((theme) => ({
    abstractTabWrapper: {
        width: '100%',
        paddingBottom: theme.spacing(2),
        position: 'sticky',
        top: 0,
        zIndex: 2,
    },
    tableTabWrapper: {
        padding: theme.spacing(1, 2),
    },
    content: {
        padding: 0,
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    dialogRoot: {
        height: 620,
        minWidth: 400,
        width: 600,
        boxShadow: 'none',
        backgroundImage: 'none',
        maxWidth: 'none',
    },
}))

export interface SavingsDialogProps {
    open: boolean
    onClose?: () => void
}

const chains = [ChainId.Mainnet]

export function SavingsDialog({ open, onClose }: SavingsDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: ChainId.Mainnet })
    const [selectedProtocol, setSelectedProtocol] = useState<SavingsProtocol | null>(null)

    const { data: aaveTokens, isLoading: loadingAAve } = useQuery({
        enabled: open && chainId === ChainId.Mainnet,
        queryKey: ['savings', 'aave', 'tokens', chainId],
        queryFn: async () => {
            const address = getAaveConstant(chainId, 'AAVE_PROTOCOL_DATA_PROVIDER_CONTRACT_ADDRESS')
            if (!address) return EMPTY_LIST

            const protocolDataContract = Contract.getWeb3Contract<AaveProtocolDataProvider>(
                address,
                AaveProtocolDataProviderABI as AbiItem[],
                {
                    chainId,
                },
            )

            const [tokens, aTokens] = await Promise.all([
                protocolDataContract?.methods.getAllReservesTokens().call(),
                protocolDataContract?.methods.getAllATokens().call(),
            ])

            if (!tokens) return EMPTY_LIST
            return tokens.map((token) => {
                return [token[1], aTokens?.find((f) => f[0].toUpperCase() === `a${token[0]}`.toUpperCase())?.[1]]
            })
        },
        staleTime: 300_000,
    })

    const { value: detailedAaveTokens = EMPTY_LIST, loading: loadingAAveDetails } = useFungibleTokens(
        NetworkPluginID.PLUGIN_EVM,
        compact(flatten(aaveTokens ?? [])),
        {
            chainId,
        },
    )

    const loadingProtocols = loadingAAve || loadingAAveDetails || !detailedAaveTokens.length

    const protocols = useMemo(
        () => [
            ...LDO_PAIRS.filter((x) => x[0].chainId === chainId).map((pair) => new LidoProtocol(pair)),
            ...chunk(detailedAaveTokens, 2).map((pair) => new AAVEProtocol(pair as TokenPair)),
        ],
        [chainId, detailedAaveTokens],
    )

    const [currentTab, onChange, tabs] = useTabs(TabType.Deposit, TabType.Withdraw)

    return (
        <Web3ContextProvider value={{ pluginID: NetworkPluginID.PLUGIN_EVM, chainId: ChainId.Mainnet }}>
            <AllProviderTradeContext.Provider>
                <ChainContextProvider value={{ chainId }}>
                    <TabContext value={currentTab}>
                        <InjectedDialog
                            open={open}
                            classes={{ paper: classes.dialogRoot }}
                            title={t.plugin_savings()}
                            onClose={() => {
                                onClose?.()
                                setSelectedProtocol(null)
                            }}
                            titleTabs={
                                <MaskTabList variant="base" onChange={onChange} aria-label="Savings">
                                    <Tab label={t.plugin_savings_deposit()} value={tabs.deposit} />
                                    <Tab label={t.plugin_savings_withdraw()} value={tabs.withdraw} />
                                </MaskTabList>
                            }>
                            <DialogContent className={classes.content}>
                                <div className={classes.abstractTabWrapper}>
                                    <NetworkTab
                                        requireChains
                                        chains={chains.filter(Boolean)}
                                        pluginID={NetworkPluginID.PLUGIN_EVM}
                                    />
                                </div>
                                <div className={classes.tableTabWrapper}>
                                    <TabPanel style={{ padding: '8px 0 0 0' }} value={tabs.deposit}>
                                        <SavingsTable
                                            loadingProtocols={loadingProtocols}
                                            tab={TabType.Deposit}
                                            protocols={protocols}
                                            setSelectedProtocol={setSelectedProtocol}
                                        />
                                    </TabPanel>
                                    <TabPanel style={{ padding: '8px 0 0 0' }} value={tabs.withdraw}>
                                        <SavingsTable
                                            loadingProtocols={loadingProtocols}
                                            tab={TabType.Withdraw}
                                            protocols={protocols}
                                            setSelectedProtocol={setSelectedProtocol}
                                        />
                                    </TabPanel>
                                </div>
                            </DialogContent>

                            <DialogActions style={{ padding: 0, position: 'sticky', bottom: 0 }}>
                                <PluginWalletStatusBar />
                            </DialogActions>
                        </InjectedDialog>
                    </TabContext>
                </ChainContextProvider>
                {selectedProtocol ? (
                    <RevokeChainContextProvider>
                        <SavingsFormDialog
                            tab={currentTab}
                            chainId={chainId}
                            protocol={selectedProtocol}
                            onClose={() => setSelectedProtocol(null)}
                        />
                    </RevokeChainContextProvider>
                ) : null}
            </AllProviderTradeContext.Provider>
        </Web3ContextProvider>
    )
}
