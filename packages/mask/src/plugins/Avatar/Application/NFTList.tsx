import { makeStyles, useTabs } from '@masknet/theme'
import { ChainId, ERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { TabContext, TabPanel } from '@mui/lab'
import { Tab, Tabs, Typography } from '@mui/material'
import classNames from 'classnames'
import { useI18N } from '../../../utils'
import { Application_NFT_LIST_PAGE } from '../constants'
import type { TokenInfo } from '../types'
import { NFTListPage } from './NFTListPage'

const useStyles = makeStyles<{ currentTab: Application_NFT_LIST_PAGE }>()((theme, props) => ({
    selected: {
        backgroundColor: theme.palette.mode === 'dark' ? 'black !important' : 'white !important',
        border: 'none',
        borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#2F3336' : '#EFF3F4'}`,
        color: `${theme.palette.text.primary} !important`,
    },
    tab: {
        backgroundColor: theme.palette.mode === 'dark' ? '#15171A' : '#F6F8F8',
        color: theme.palette.text.secondary,
        border: `1px solid ${theme.palette.mode === 'dark' ? '#2F3336' : '#EFF3F4'}`,
        minHeight: 37,
        height: 37,
    },
    tabPanel: {
        padding: theme.spacing(1),
    },
}))
interface NFTListProps {
    address: string
    tokenInfo?: TokenInfo
    onSelect: (token: ERC721TokenDetailed) => void
    onChangePage?: (page: Application_NFT_LIST_PAGE) => void
    tokens?: ERC721TokenDetailed[]
}

export function NFTList(props: NFTListProps) {
    const { address, onSelect, tokenInfo, onChangePage, tokens = [] } = props
    const { t } = useI18N()

    const [currentTab, onChange, tabs] = useTabs(
        Application_NFT_LIST_PAGE.Application_nft_tab_eth_page,
        Application_NFT_LIST_PAGE.Application_nft_tab_polygon_page,
    )

    const { classes } = useStyles({ currentTab })
    const _onChange = (event: unknown, value: any) => {
        onChange(event, value)
        onChangePage?.(value)
    }
    console.log(currentTab)
    if (!address) return null
    return (
        <TabContext value={currentTab}>
            <Tabs
                value={currentTab}
                variant="fullWidth"
                onChange={_onChange}
                sx={{
                    minHeight: 37,
                    height: 37,
                    '.MuiTabs-indicator': { display: 'none' },
                }}>
                <Tab
                    label={
                        <Typography fontSize={14} fontWeight={700}>
                            {Application_NFT_LIST_PAGE.Application_nft_tab_eth_page}
                        </Typography>
                    }
                    value={tabs.ETH}
                    className={classNames(classes.tab, currentTab === tabs.ETH ? classes.selected : '')}
                />
                <Tab
                    label={
                        <Typography fontSize={14} fontWeight={700}>
                            {Application_NFT_LIST_PAGE.Application_nft_tab_polygon_page}
                        </Typography>
                    }
                    value={tabs.Polygon}
                    className={classNames(classes.tab, currentTab === tabs.Polygon ? classes.selected : '')}
                />
            </Tabs>
            <TabPanel value={tabs.ETH} className={classes.tabPanel}>
                <NFTListPage
                    tokens={tokens.filter((x) => x.contractDetailed.chainId === ChainId.Mainnet) ?? []}
                    tokenInfo={tokenInfo}
                    chainId={ChainId.Mainnet}
                    address={address}
                    onSelect={onSelect}
                />
            </TabPanel>
            <TabPanel value={tabs.Polygon} className={classes.tabPanel}>
                <NFTListPage
                    tokens={tokens.filter((x) => x.contractDetailed.chainId === ChainId.Matic) ?? []}
                    tokenInfo={tokenInfo}
                    chainId={ChainId.Matic}
                    address={address}
                    onSelect={onSelect}
                />
            </TabPanel>
        </TabContext>
    )
}
