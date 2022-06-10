import { useChainId } from '@masknet/plugin-infra/web3'
import { makeStyles, useTabs } from '@masknet/theme'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { TabContext, TabPanel } from '@mui/lab'
import { Tab, Tabs, Typography } from '@mui/material'
import { useEffect } from 'react'
import { Application_NFT_LIST_PAGE, SUPPORTED_CHAIN_IDS } from '../constants'
import type { AllChainsNonFungibleToken } from '../types'
import { NFTListPage } from './NFTListPage'

const useStyles = makeStyles<{ currentTab: Application_NFT_LIST_PAGE }>()((theme, props) => ({
    selected: {
        backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',
        border: '1px solid transparent',
        borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#2F3336' : '#EFF3F4'}`,
        color: `${theme.palette.text.primary} !important`,
        minHeight: 37,
        height: 37,
        zIndex: 1,
    },
    tab: {
        backgroundColor: theme.palette.mode === 'dark' ? '#15171A' : '#F6F8F8',
        color: theme.palette.text.secondary,
        borderTop: '1px solid transparent',
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
    tokenInfo?: AllChainsNonFungibleToken
    onSelect: (token: AllChainsNonFungibleToken) => void
    onChangeChain?: (chainId: ChainId) => void
    tokens?: AllChainsNonFungibleToken[]
    children?: React.ReactElement
}

export function NFTList(props: NFTListProps) {
    const { onSelect, tokenInfo, onChangeChain, tokens = [], children } = props
    const chainId = useChainId()
    const [currentTab, onChange, tabs, setTab] = useTabs(
        Application_NFT_LIST_PAGE.Application_nft_tab_eth_page,
        Application_NFT_LIST_PAGE.Application_nft_tab_polygon_page,
    )

    const { classes } = useStyles({ currentTab })
    const _onChange = (event: unknown, value: Application_NFT_LIST_PAGE) => {
        onChange(event, value)

        onChangeChain?.(
            value === Application_NFT_LIST_PAGE.Application_nft_tab_eth_page ? ChainId.Mainnet : ChainId.Matic,
        )
    }
    useEffect(() => {
        setTab(
            chainId === ChainId.Matic
                ? Application_NFT_LIST_PAGE.Application_nft_tab_polygon_page
                : Application_NFT_LIST_PAGE.Application_nft_tab_eth_page,
        )
    }, [chainId, setTab])
    return (
        <TabContext value={currentTab}>
            <Tabs
                value={currentTab}
                variant="fullWidth"
                onChange={_onChange}
                sx={{
                    minHeight: 37,
                    height: 37,
                    '.MuiTabsindicator': { display: 'none' },
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
                        pluginId={NetworkPluginID.PLUGIN_EVM}
                        tokens={tokens}
                        tokenInfo={tokenInfo}
                        onChange={onSelect}
                        children={children}
                    />
                </TabPanel>
            ))}
        </TabContext>
    )
}
