import { makeStyles, useTabs } from '@masknet/theme'
import type { NonFungibleToken } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { TabContext, TabPanel } from '@mui/lab'
import { Tab, Tabs, Typography } from '@mui/material'
import { Application_NFT_LIST_PAGE, SUPPORTED_CHAIN_IDS } from '../constants'
import type { TokenInfo } from '../types'
import { NFTListPage } from './NFTListPage'

const useStyles = makeStyles<{ currentTab: Application_NFT_LIST_PAGE }>()((theme, props) => ({
    selected: {
        backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',
        border: 'none',
        borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#2F3336' : '#EFF3F4'}`,
        color: `${theme.palette.text.primary} !important`,
        minHeight: 37,
        height: 37,
        zIndex: 1,
    },
    tab: {
        backgroundColor: theme.palette.mode === 'dark' ? '#15171A' : '#F6F8F8',
        color: theme.palette.text.secondary,
        border: `1px solid ${theme.palette.mode === 'dark' ? '#2F3336' : '#EFF3F4'}`,
        minHeight: 37,
        height: 37,
        zIndex: 1,
    },
    tabPanel: {
        padding: theme.spacing(1),
        paddingTop: 50,
        paddingBottom: 80,
    },
}))
interface NFTListProps {
    address: string
    tokenInfo?: TokenInfo
    onSelect: (token: NonFungibleToken<ChainId, SchemaType>) => void
    onChangePage?: (page: Application_NFT_LIST_PAGE) => void
    tokens?: Array<NonFungibleToken<ChainId, SchemaType>>
    children?: React.ReactElement
}

export function NFTList(props: NFTListProps) {
    const { address, onSelect, tokenInfo, onChangePage, tokens = [], children } = props

    const [currentTab, onChange, tabs] = useTabs(
        Application_NFT_LIST_PAGE.Application_nft_tab_eth_page,
        Application_NFT_LIST_PAGE.Application_nft_tab_polygon_page,
    )

    const { classes } = useStyles({ currentTab })
    const _onChange = (event: unknown, value: any) => {
        onChange(event, value)
        onChangePage?.(value)
    }

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
                    position: 'absolute',
                    width: '99.5%',
                    justifyContent: 'center',
                }}>
                {SUPPORTED_CHAIN_IDS.map((x, i) => {
                    const curChainId = currentTab === tabs.ETH ? ChainId.Mainnet : ChainId.Matic
                    return (
                        <Tab
                            key={i}
                            label={
                                <Typography fontSize={14} fontWeight={700}>
                                    {x === ChainId.Mainnet
                                        ? Application_NFT_LIST_PAGE.Application_nft_tab_eth_page
                                        : Application_NFT_LIST_PAGE.Application_nft_tab_polygon_page}
                                </Typography>
                            }
                            value={x === ChainId.Mainnet ? tabs.ETH : tabs.Polygon}
                            className={curChainId === x ? classes.selected : classes.tab}
                        />
                    )
                })}
            </Tabs>
            {SUPPORTED_CHAIN_IDS.map((x, i) => (
                <TabPanel key={i} value={x === ChainId.Mainnet ? tabs.ETH : tabs.Polygon} className={classes.tabPanel}>
                    <NFTListPage
                        tokens={tokens.filter((y) => y.chainId === x) ?? []}
                        tokenInfo={tokenInfo}
                        chainId={x}
                        address={address}
                        onSelect={onSelect}
                        children={children}
                    />
                </TabPanel>
            ))}
        </TabContext>
    )
}
