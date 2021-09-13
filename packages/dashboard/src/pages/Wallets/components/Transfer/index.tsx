import { memo } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { Box, Tab } from '@material-ui/core'
import { useTabs } from '@masknet/theme'
import { TabContext, TabList, TabPanel } from '@material-ui/lab'
import { TransferERC20 } from './TransferERC20'
import { FungibleTokenDetailed, useNativeTokenDetailed } from '@masknet/web3-shared'
import { useLocation } from 'react-router-dom'

export const Transfer = memo(() => {
    // todo: token and chain
    const { state } = useLocation() as { state: { token: FungibleTokenDetailed } | null }
    const { value: nativeToken } = useNativeTokenDetailed()
    const [currentTab, onChange, tabs] = useTabs('tokens', 'collections')

    if (!nativeToken && !state?.token) return null

    return (
        <ContentContainer sx={{ marginTop: 3, display: 'flex', flexDirection: 'column' }}>
            <Box>
                <TabContext value={currentTab}>
                    <TabList onChange={onChange}>
                        <Tab label="Token" value={tabs.tokens} />
                        <Tab label="Collections" value={tabs.collections} />
                    </TabList>
                    <TabPanel value={tabs.tokens}>
                        <TransferERC20 token={state?.token! || nativeToken} />
                    </TabPanel>
                    <TabPanel value={tabs.collections}>todo</TabPanel>
                </TabContext>
            </Box>
        </ContentContainer>
    )
})
