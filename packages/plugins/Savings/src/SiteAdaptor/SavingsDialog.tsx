import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { compact } from 'lodash-es'
import { DialogActions, DialogContent, Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import {
    Web3ContextProvider,
    ChainContextProvider,
    useChainContext,
    RevokeChainContextProvider,
} from '@masknet/web3-hooks-base'
import { EMPTY_LIST, NetworkPluginID, toHex } from '@masknet/shared-base'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { ChainId, createERC20Token, getAaveConstant, parseStringOrBytes32 } from '@masknet/web3-shared-evm'
import { InjectedDialog, PluginWalletStatusBar, NetworkTab } from '@masknet/shared'
import { EVMContract } from '@masknet/web3-providers'
import { AaveProtocolDataProviderAbi } from '@masknet/web3-contracts/types/AaveProtocolDataProvider.js'
import { ERC20Abi } from '@masknet/web3-contracts/types/ERC20.js'
import { ERC20Bytes32Abi } from '@masknet/web3-contracts/types/ERC20Bytes32.js'
import { type SavingsProtocol, TabType, type TokenPair } from '../types.js'
import { SavingsTable } from './SavingsTable/index.js'
import { LidoProtocol } from '../protocols/LDOProtocol.js'
import { LDO_PAIRS } from '../constants.js'
import { WithdrawFormDialog } from './WithdrawForm.js'
import { SavingsFormDialog } from './SavingsForm.js'
import { AAVEProtocol } from '../protocols/AAVEProtocol.js'
import { Trans } from '@lingui/react/macro'

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
        scrollbarWidth: 'none',
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

interface SavingsDialogProps {
    open: boolean
    onClose?: () => void
}

const chains = [ChainId.Mainnet]

interface AaveReserve {
    address: string
    symbol: string
    aTokenAddress?: string
    aTokenSymbol?: string
}

export function SavingsDialog({ open, onClose }: SavingsDialogProps) {
    const { classes } = useStyles()

    const [withdrawDialogOpen, setWithDrawDialogOpen] = useState(false)
    const [depositDialogOpen, setDepositDialogOpen] = useState(false)
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: ChainId.Mainnet })
    const [selectedProtocol, setSelectedProtocol] = useState<SavingsProtocol | null>(null)

    const { data: aaveReserves, isPending: loadingAAve } = useQuery({
        enabled: open && chainId === ChainId.Mainnet,
        queryKey: ['savings', 'aave', 'tokens', chainId],
        queryFn: async (): Promise<AaveReserve[]> => {
            const address = getAaveConstant(chainId, 'AAVE_PROTOCOL_DATA_PROVIDER_CONTRACT_ADDRESS')
            if (!address) return []

            const protocolDataContract = EVMContract.getContract(address, AaveProtocolDataProviderAbi)

            const [tokens, aTokens] = await Promise.all([
                EVMContract.readContract(protocolDataContract, 'getAllReservesTokens', [], { chainId }),
                EVMContract.readContract(protocolDataContract, 'getAllATokens', [], { chainId }),
            ])

            if (!tokens?.length) return []
            return tokens.map((token) => {
                const aToken = aTokens?.find((f) => f.symbol.toUpperCase() === `a${token.symbol}`.toUpperCase())
                return {
                    address: token.tokenAddress,
                    symbol: token.symbol,
                    aTokenAddress: aToken?.tokenAddress,
                    aTokenSymbol: aToken?.symbol,
                }
            })
        },
        staleTime: 3_600_000,
    })

    // symbols come from the data provider above, only name and decimals need extra ERC20 reads
    const { data: aavePairs = EMPTY_LIST, isPending: loadingAAvePairs } = useQuery({
        enabled: !!aaveReserves?.length,
        queryKey: ['savings', 'aave', 'pairs', chainId, aaveReserves],
        staleTime: 600_000,
        queryFn: () =>
            Promise.all(
                (aaveReserves ?? []).map(async ({ address, symbol, aTokenAddress, aTokenSymbol }) => {
                    // a pair needs the aToken; reserves without one cannot be saved into
                    if (!aTokenAddress) return
                    const erc20 = EVMContract.getContract(address, ERC20Abi)
                    const erc20Bytes32 = EVMContract.getContract(address, ERC20Bytes32Abi)
                    const [name, nameBytes32, decimals] = await Promise.allSettled([
                        EVMContract.readContract(erc20, 'name', [], { chainId }),
                        EVMContract.readContract(erc20Bytes32, 'name', [], { chainId }),
                        EVMContract.readContract(erc20, 'decimals', [], { chainId }),
                    ])
                    const tokenName = parseStringOrBytes32(
                        name.status === 'fulfilled' ? name.value : '',
                        nameBytes32.status === 'fulfilled' && nameBytes32.value ? toHex(nameBytes32.value) : undefined,
                        symbol, // fall back to the provider symbol rather than "Unknown Token"
                    )
                    const tokenDecimals = decimals.status === 'fulfilled' ? Number(decimals.value ?? 0) : 0
                    const bare = createERC20Token(chainId, address, tokenName, symbol, tokenDecimals)
                    // aTokens share the decimals of their underlying reserve
                    const stakeSymbol = aTokenSymbol ?? `a${symbol}`
                    const stake = createERC20Token(chainId, aTokenAddress, stakeSymbol, stakeSymbol, tokenDecimals)
                    return [bare, stake] as TokenPair
                }),
            ).then((pairs) => compact(pairs)),
    })

    const loadingProtocols = loadingAAve || loadingAAvePairs || !aavePairs.length

    const protocols = useMemo(
        () => [
            ...LDO_PAIRS.filter((x) => x[0].chainId === chainId).map((pair) => new LidoProtocol(pair)),
            ...aavePairs.map((pair) => new AAVEProtocol(pair)),
        ],
        [chainId, aavePairs],
    )

    const [currentTab, onChange, tabs] = useTabs(TabType.Deposit, TabType.Withdraw)

    return (
        <>
            <Web3ContextProvider network={NetworkPluginID.PLUGIN_EVM} chainId={ChainId.Mainnet}>
                <ChainContextProvider chainId={chainId}>
                    <TabContext value={currentTab}>
                        <InjectedDialog
                            open={open}
                            classes={{ paper: classes.dialogRoot }}
                            title={<Trans>Savings</Trans>}
                            onClose={() => {
                                onClose?.()
                                setSelectedProtocol(null)
                            }}
                            titleTabs={
                                <MaskTabList variant="base" onChange={onChange} aria-label="Savings">
                                    <Tab label={<Trans>Deposit</Trans>} value={tabs.deposit} />
                                    <Tab label={<Trans>Withdraw</Trans>} value={tabs.withdraw} />
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
                                            onDeposit={(protocol: SavingsProtocol) => {
                                                setDepositDialogOpen(true)
                                                setSelectedProtocol(protocol)
                                            }}
                                        />
                                    </TabPanel>
                                    <TabPanel style={{ padding: '8px 0 0 0' }} value={tabs.withdraw}>
                                        <SavingsTable
                                            loadingProtocols={loadingProtocols}
                                            tab={TabType.Withdraw}
                                            protocols={protocols}
                                            onWithdraw={(protocol: SavingsProtocol) => {
                                                setWithDrawDialogOpen(true)
                                                setSelectedProtocol(protocol)
                                            }}
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

                {selectedProtocol && depositDialogOpen ?
                    <RevokeChainContextProvider>
                        <SavingsFormDialog
                            tab={currentTab}
                            chainId={chainId}
                            protocol={selectedProtocol}
                            onClose={() => {
                                setSelectedProtocol(null)
                                setDepositDialogOpen(false)
                            }}
                        />
                    </RevokeChainContextProvider>
                :   null}
            </Web3ContextProvider>
            {selectedProtocol && withdrawDialogOpen ?
                <WithdrawFormDialog
                    protocol={selectedProtocol}
                    onClose={() => {
                        setSelectedProtocol(null)
                        setWithDrawDialogOpen(false)
                    }}
                    chainId={chainId}
                />
            :   null}
        </>
    )
}
