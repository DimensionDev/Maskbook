import { useState } from 'react'
import { ChainId, getChainIdFromNetworkType, useChainId } from '@masknet/web3-shared-evm'
import { DialogContent, Tab } from '@mui/material'
import { useTabs } from '@masknet/theme'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { AllProviderTradeContext } from '../../../Trader/trader/useAllProviderTradeContext'
import { TargetChainIdContext } from '../../../Trader/trader/useTargetChainIdContext'
import { useI18N } from '../../../../utils'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { WalletStatusBox } from '../../../../components/shared/WalletStatusBox'
import { NetworkTab } from '../../../../components/shared/NetworkTab'
import { useControlledDialog } from '../../../../utils/hooks/useControlledDialog'
import { useAsync } from 'react-use'
import { WalletRPC } from '../../../Wallet/messages'
import { CompoundMarket, useAllMarkets } from '../../contracts/compound/useCompound'
import CompoundMarketItem from './CompoundMarketItem'
import { MarketHeader } from './MarketHeader'
import { SupplyDialog } from './SupplyDialog'
import { WithdrawDialog } from './WithdrawDialog'

const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    walletStatusBox: {
        width: 535,
        margin: '24px auto',
    },
    abstractTabWrapper: {
        width: '100%',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
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
    content: {
        paddingTop: 0,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface SavingDialogProps {
    open?: boolean
    onClose?: () => void
}

export function SavingDialog({ open, onClose }: SavingDialogProps) {
    const { t } = useI18N()
    const isDashboard = location.href.includes('dashboard.html')
    const { classes } = useStyles({ isDashboard })
    const currentChainId = useChainId()
    const [chainId, setChainId] = useState<ChainId>(currentChainId)
    const allMarkets = useAllMarkets()
    const [currentTab, onChange, , setTab] = useTabs('Supply', 'Withdraw')
    const tabs = ['Supply', 'Withdraw']

    console.log(allMarkets)
    const { open: isSupplyDialogOpen, onOpen: onSupplyDialogOpen, onClose: onSupplyDialogClose } = useControlledDialog()
    const {
        open: isWithdrawDialogOpen,
        onOpen: onWithdrawDialogOpen,
        onClose: onWithdrawDialogClose,
    } = useControlledDialog()

    const [supplyingMarket, setSupplyingMarket] = useState(null)
    const [withdrawingMarket, setWithdrawingMarket] = useState(null)

    const { value: chains } = useAsync(async () => {
        const networks = await WalletRPC.getSupportedNetworks()
        return networks.map((network) => getChainIdFromNetworkType(network))
    }, [])

    return (
        <TargetChainIdContext.Provider>
            <AllProviderTradeContext.Provider>
                <InjectedDialog
                    open={!!open}
                    onClose={() => {
                        onClose?.()
                        // closeDialog()
                    }}
                    title={t('plugin_saving_saving')}>
                    <DialogContent className={classes.content}>
                        {!isDashboard ? (
                            <div className={classes.walletStatusBox}>
                                <WalletStatusBox />
                            </div>
                        ) : null}
                        <div className={classes.abstractTabWrapper}>
                            <NetworkTab
                                chainId={chainId}
                                setChainId={setChainId}
                                classes={classes}
                                chains={chains ?? []}
                            />
                        </div>
                        <TabContext value={currentTab}>
                            <TabList onChange={onChange}>
                                {tabs.map((key) => (
                                    <Tab key={key} value={key} label={key} />
                                ))}
                            </TabList>
                            <TabPanel value="Supply">
                                <div>
                                    <MarketHeader />
                                    {allMarkets?.map((market: any, idx) => {
                                        return (
                                            <CompoundMarketItem
                                                key={idx}
                                                market={market}
                                                onClick={() => {
                                                    setSupplyingMarket(market)
                                                    onSupplyDialogOpen()
                                                }}
                                            />
                                        )
                                    })}
                                </div>
                            </TabPanel>
                            <TabPanel value="Withdraw">
                                <div>
                                    <MarketHeader />
                                    {(allMarkets || [])
                                        .filter((market: CompoundMarket) => {
                                            return market.cToken.balance !== '0'
                                        })
                                        .map((market: any, idx) => {
                                            return (
                                                <CompoundMarketItem
                                                    key={idx}
                                                    market={market}
                                                    isWithdrawTab
                                                    onClick={() => {
                                                        setWithdrawingMarket(market)
                                                        onWithdrawDialogOpen()
                                                    }}
                                                />
                                            )
                                        })}
                                </div>
                            </TabPanel>
                        </TabContext>
                    </DialogContent>
                </InjectedDialog>

                {isSupplyDialogOpen && supplyingMarket && (
                    <SupplyDialog open={isSupplyDialogOpen} onClose={onSupplyDialogClose} market={supplyingMarket} />
                )}
                {isWithdrawDialogOpen && withdrawingMarket && (
                    <WithdrawDialog
                        open={isWithdrawDialogOpen}
                        onClose={onWithdrawDialogClose}
                        market={withdrawingMarket}
                    />
                )}
            </AllProviderTradeContext.Provider>
        </TargetChainIdContext.Provider>
    )
}
