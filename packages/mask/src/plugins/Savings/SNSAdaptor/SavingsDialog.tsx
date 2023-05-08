import { useMemo, useState } from 'react'
import { useAsync, useUpdateEffect } from 'react-use'
import { chunk, compact, flatten } from 'lodash-es'
import type { AbiItem } from 'web3-utils'
import { DialogActions, DialogContent, Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import {
    Web3ContextProvider,
    useChainContext,
    useFungibleTokens,
    useWeb3,
    ActualChainContextProvider,
    useNetworkContext,
} from '@masknet/web3-hooks-base'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { EMPTY_LIST, NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { makeStyles, MaskColorVar, MaskTabList, useTabs } from '@masknet/theme'
import { ChainId, createContract, getAaveConstants, type SchemaType, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { InjectedDialog, PluginWalletStatusBar, NetworkTab } from '@masknet/shared'
import { useI18N } from '../../../utils/index.js'
import { AllProviderTradeContext } from '../../Trader/trader/useAllProviderTradeContext.js'
import { type SavingsProtocol, TabType } from '../types.js'
import { SavingsTable } from './SavingsTable.js'
import { SavingsFormDialog } from './SavingsForm.js'
import type { AaveProtocolDataProvider } from '@masknet/web3-contracts/types/AaveProtocolDataProvider.js'
import AaveProtocolDataProviderABI from '@masknet/web3-contracts/abis/AaveProtocolDataProvider.json'
import { LidoProtocol } from '../protocols/LDOProtocol.js'
import { AAVEProtocol } from '../protocols/AAVEProtocol.js'
import { LDO_PAIRS } from '../constants.js'

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
    tab: {
        height: 36,
        minHeight: 36,
        backgroundColor: Sniffings.is_dashboard_page ? `${MaskColorVar.primaryBackground2}!important` : undefined,
    },
    tabPaper: {
        backgroundColor: 'inherit',
    },
    tabs: {
        width: 535,
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        borderRadius: 4,
        '& .Mui-selected': {
            color: '#ffffff',
            backgroundColor: `${theme.palette.primary.main}!important`,
        },
    },
    indicator: {
        display: 'none',
    },
    tabPanel: {
        marginTop: theme.spacing(3),
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
    const { t } = useI18N()
    const { pluginID } = useNetworkContext()
    const { classes } = useStyles()

    const { chainId: currentChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [chainId, setChainId] = useState<ChainId>(ChainId.Mainnet)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })

    const [tab, setTab] = useState<TabType>(TabType.Deposit)
    const [selectedProtocol, setSelectedProtocol] = useState<SavingsProtocol | null>(null)

    const { value: aaveTokens, loading: loadingAAve } = useAsync(async () => {
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

    const { value: detailedAaveTokens, loading: loadingAAveDetails } = useFungibleTokens(
        NetworkPluginID.PLUGIN_EVM,
        compact(flatten(aaveTokens ?? [])),
        {
            chainId,
        },
    )

    const loadingProtocols = loadingAAve || loadingAAveDetails || !detailedAaveTokens?.length

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
        if (chains.includes(currentChainId)) {
            setChainId(currentChainId)
        } else {
            setChainId(ChainId.Mainnet)
        }
    }, [currentChainId])

    const [currentTab, onChange, tabs] = useTabs(t('plugin_savings_deposit'), t('plugin_savings_withdraw'))

    return (
        <Web3ContextProvider value={{ pluginID, chainId: ChainId.Mainnet }}>
            <AllProviderTradeContext.Provider>
                <TabContext value={currentTab}>
                    <InjectedDialog
                        open={open}
                        classes={{ paper: classes.dialogRoot }}
                        title={t('plugin_savings')}
                        onClose={() => {
                            onClose?.()
                            setSelectedProtocol(null)
                        }}
                        titleTabs={
                            <MaskTabList variant="base" onChange={onChange} aria-label="Savings">
                                <Tab label={tabs.Deposit} value={tabs.Deposit} />
                                <Tab label={tabs.Withdraw} value={tabs.Withdraw} />
                            </MaskTabList>
                        }>
                        <DialogContent className={classes.content}>
                            <>
                                <div className={classes.abstractTabWrapper}>
                                    <NetworkTab
                                        classes={{
                                            tab: classes.tab,
                                            tabs: classes.tabs,
                                            tabPaper: classes.tabPaper,
                                            tabPanel: classes.tabPanel,
                                            indicator: classes.indicator,
                                        }}
                                        requireChains
                                        chains={chains.filter(Boolean)}
                                        pluginID={NetworkPluginID.PLUGIN_EVM}
                                    />
                                </div>
                                <div className={classes.tableTabWrapper}>
                                    <TabPanel style={{ padding: '8px 0 0 0' }} value={tabs.Deposit}>
                                        <SavingsTable
                                            chainId={chainId}
                                            loadingProtocols={loadingProtocols}
                                            tab={TabType.Deposit}
                                            protocols={protocols}
                                            setTab={setTab}
                                            setSelectedProtocol={setSelectedProtocol}
                                        />
                                    </TabPanel>
                                    <TabPanel style={{ padding: '8px 0 0 0' }} value={tabs.Withdraw}>
                                        <SavingsTable
                                            chainId={chainId}
                                            loadingProtocols={loadingProtocols}
                                            tab={TabType.Withdraw}
                                            protocols={protocols}
                                            setTab={setTab}
                                            setSelectedProtocol={setSelectedProtocol}
                                        />
                                    </TabPanel>
                                </div>
                            </>
                        </DialogContent>

                        <DialogActions style={{ padding: 0, position: 'sticky', bottom: 0 }}>
                            <PluginWalletStatusBar />
                        </DialogActions>
                    </InjectedDialog>
                </TabContext>
                {selectedProtocol ? (
                    <ActualChainContextProvider>
                        <SavingsFormDialog
                            tab={tab}
                            chainId={chainId}
                            protocol={selectedProtocol}
                            onClose={() => setSelectedProtocol(null)}
                        />
                    </ActualChainContextProvider>
                ) : null}
            </AllProviderTradeContext.Provider>
        </Web3ContextProvider>
    )
}
