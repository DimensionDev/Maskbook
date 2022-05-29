import { MaskColorVar, MaskTabList, useTabs } from '@masknet/theme'
import { isDashboardPage } from '@masknet/shared-base'
import TabContext from '@mui/lab/TabContext'
import { Stack, Tab, Typography } from '@mui/material'
import { useNetworkDescriptors } from '@masknet/plugin-infra/web3'
import { WalletIcon } from '@masknet/shared'

interface NetworkTabProps extends withClasses<'tab' | 'tabs' | 'tabPanel' | 'indicator' | 'focusTab' | 'tabPaper'> {
    chains: number[]
    setChainId: (chainId: number) => void
    chainId: number
}

export function NetworkTab(props: NetworkTabProps) {
    const isDashboard = isDashboardPage()
    const { chainId, setChainId, chains } = props
    const networks = useNetworkDescriptors()
    const usedNetworks = networks.filter((x) => chains.find((c) => c === x.chainId))
    const networkIds = usedNetworks.map((x) => x.chainId.toString())
    const [currentTab, , , setTab] = useTabs(chainId.toString() ?? networkIds[0], ...networkIds)

    return (
        <TabContext value={currentTab}>
            <MaskTabList
                variant="flexible"
                onChange={(e, v) => {
                    setChainId(Number.parseInt(v, 10))
                    setTab(v)
                }}
                aria-label="Network Tabs">
                {usedNetworks.map((x) => {
                    return (
                        <Tab
                            key={x.chainId}
                            value={x.chainId.toString()}
                            label={
                                <Stack display="inline-flex" flexDirection="row" alignItems="center" gap={0.5}>
                                    <WalletIcon networkIcon={x.icon} size={18} />
                                    <Typography
                                        variant="body2"
                                        fontSize={14}
                                        style={{ color: MaskColorVar.textPrimary }}
                                        fontWeight={currentTab === x.chainId.toString() ? 700 : 400}>
                                        {x.name}
                                    </Typography>
                                </Stack>
                            }
                        />
                    )
                })}
            </MaskTabList>
        </TabContext>
    )
}
