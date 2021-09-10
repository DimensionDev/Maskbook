import { memo } from 'react'
import { ContentContainer } from '../../../../components/ContentContainer'
import { Box, Tab } from '@material-ui/core'
import { useTabs } from '@masknet/theme'
import { TabContext, TabList, TabPanel } from '@material-ui/lab'
import { TransferERC20 } from './TransferERC20'
import { useNativeTokenDetailed } from '@masknet/web3-shared'

export const Transfer = memo(() => {
    const { value: nativeToken } = useNativeTokenDetailed()
    const [currentTab, onChange, tabs] = useTabs('tokens', 'collections')

    if (!nativeToken) return null

    return (
        <ContentContainer sx={{ marginTop: 3, display: 'flex', flexDirection: 'column' }}>
            <Box>
                <TabContext value={currentTab}>
                    <TabList onChange={onChange}>
                        <Tab label="Token" value={tabs.tokens} />
                        <Tab label="Collections" value={tabs.collections} />
                    </TabList>
                    <TabPanel value={tabs.tokens}>
                        <TransferERC20 token={nativeToken} />
                    </TabPanel>
                    <TabPanel value={tabs.collections}>todo</TabPanel>
                </TabContext>
            </Box>
        </ContentContainer>
    )
})
