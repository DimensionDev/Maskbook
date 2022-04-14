import { makeStyles, useTabs } from '@masknet/theme'
import { ChainId, ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { TabContext, TabPanel } from '@mui/lab'
import { Tab, Tabs } from '@mui/material'
import { useI18N } from '../../../utils'
import type { TokenInfo } from '../types'
import { NFTListPage } from './NFTListPage'

const useStyles = makeStyles()((theme) => ({
    root: {},
}))
interface NFTListProps {
    address: string
    tokenInfo?: TokenInfo
    onSelect: (token: ERC721TokenDetailed) => void
}

export function NFTList(props: NFTListProps) {
    const { classes } = useStyles()
    const { address, onSelect, tokenInfo } = props
    const { t } = useI18N()

    const [currentTab, onChange, tabs] = useTabs('ETH', 'Polygon')

    if (!address) return null
    return (
        <TabContext value={currentTab}>
            <Tabs value={currentTab} variant="fullWidth" onChange={onChange}>
                <Tab label="ETH" value={tabs.ETH} />
                <Tab label="Polygon" value={tabs.Polygon} />
            </Tabs>
            <TabPanel value={tabs.ETH}>
                <NFTListPage tokenInfo={tokenInfo} chainId={ChainId.Mainnet} address={address} onSelect={onSelect} />
            </TabPanel>
            <TabPanel value={tabs.Polygon}>
                <NFTListPage tokenInfo={tokenInfo} chainId={ChainId.Matic} address={address} onSelect={onSelect} />
            </TabPanel>
        </TabContext>
    )
}
