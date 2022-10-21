import { useMemo, useState } from 'react'
import { useAsync, useUpdateEffect } from 'react-use'
import { chunk, compact, flatten } from 'lodash-unified'
import { DialogActions, DialogContent, Tab } from '@mui/material'
import { EMPTY_LIST, isDashboardPage, NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, MaskColorVar, MaskTabList, useTabs } from '@masknet/theme'
import { ChainId, createContract, getAaveConstants, SchemaType, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { InjectedDialog, PluginWalletStatusBar } from '@masknet/shared'
import { useI18N } from '../../../utils/index.js'
import { AllProviderTradeContext } from '../../Trader/trader/useAllProviderTradeContext.js'
import { NetworkTab } from '../../../components/shared/NetworkTab.js'
import { SavingsProtocol, TabType } from '../types.js'
import { SavingsTable } from './SavingsTable.js'
import { SavingsFormDialog } from './SavingsForm.js'
import type { AaveProtocolDataProvider } from '@masknet/web3-contracts/types/AaveProtocolDataProvider'
import AaveProtocolDataProviderABI from '@masknet/web3-contracts/abis/AaveProtocolDataProvider.json'
import { LidoProtocol } from '../protocols/LDOProtocol.js'
import { AAVEProtocol } from '../protocols/AAVEProtocol.js'
import { LDO_PAIRS } from '../constants.js'
import type { AbiItem } from 'web3-utils'
import { TabContext, TabPanel } from '@mui/lab'
import {
    ChainContextProvider,
    NetworkContextProvider,
    useChainId,
    useFungibleTokens,
    useWeb3,
} from '@masknet/web3-hooks-base'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary.js'

const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    abstractTabWrapper: {
        width: '100%',
        paddingBottom: theme.spacing(2),
        position: 'sticky',
        top: 0,
        zIndex: 2,
    },
    tableTabWrapper: {
        padding: theme.spacing(2),
    },
    tab: {
        height: 36,
        minHeight: 36,
        backgroundColor: isDashboard ? `${MaskColorVar.primaryBackground2}!important` : undefined,
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
}))

export interface SavingsDialogProps {
    open: boolean
    onClose?: () => void
}

const chains = [ChainId.Mainnet]

export function SavingsDialog({ open, onClose }: SavingsDialogProps) {
    const { t } = useI18N()
    const isDashboard = isDashboardPage()
    const { classes } = useStyles({ isDashboard })

    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [chainId, setChainId] = useState<ChainId>(ChainId.Mainnet)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM, { chainId })

    const [tab, setTab] = useState<TabType>(TabType.Deposit)
    const [selectedProtocol, setSelectedProtocol] = useState<SavingsProtocol | null>(null)

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
        if (chains.includes(currentChainId)) {
            setChainId(currentChainId)
        } else {
            setChainId(ChainId.Mainnet)
        }
    }, [currentChainId])

    const [currentTab, onChange, tabs] = useTabs('Deposit', 'Withdraw')

    return (
        <NetworkContextProvider value={NetworkPluginID.PLUGIN_EVM}>
            <ChainContextProvider value={{ chainId: ChainId.Mainnet }}>
                <AllProviderTradeContext.Provider>
                    <TabContext value={currentTab}>
                        <InjectedDialog
                            open={open}
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
                            <DialogContent style={{ padding: 0, overflowX: 'hidden' }}>
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
                                            chains={chains.filter(Boolean) as ChainId[]}
                                        />
                                    </div>
                                    <div className={classes.tableTabWrapper}>
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
                                    </div>
                                </>
                            </DialogContent>

                            <DialogActions style={{ padding: 0, position: 'sticky', bottom: 0 }}>
                                <PluginWalletStatusBar>
                                    <ChainBoundary
                                        expectedChainId={chainId}
                                        expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                                    />
                                </PluginWalletStatusBar>
                            </DialogActions>
                        </InjectedDialog>
                    </TabContext>
                    {selectedProtocol ? (
                        <SavingsFormDialog
                            tab={tab}
                            chainId={chainId}
                            protocol={selectedProtocol}
                            onClose={() => setSelectedProtocol(null)}
                        />
                    ) : null}
                </AllProviderTradeContext.Provider>
            </ChainContextProvider>
        </NetworkContextProvider>
    )
}
