import { PluginWalletStatusBar } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { TabPanel } from '@mui/lab'
import { Box } from '@mui/material'
import { memo } from 'react'
import { FireflyRedPacketHistoryList } from './FireflyRedPacketHistroyList.js'

const useStyles = makeStyles()((theme) => ({
    tabWrapper: {
        padding: '12px 16px',
    },
}))

interface Props {
    tabs: Record<'sent' | 'claimed', 'sent' | 'claimed'>
    handleOpenDetails: (rpid: string) => void
}

export const FireflyRedPacketPast = memo(function RedPacketPast({ tabs, handleOpenDetails }: Props) {
    const { classes } = useStyles()

    return (
        <>
            <div className={classes.tabWrapper}>
                <TabPanel value={tabs.sent} style={{ padding: 0 }}>
                    <FireflyRedPacketHistoryList
                        handleOpenDetails={handleOpenDetails}
                        historyType={FireflyRedPacketAPI.ActionType.Send}
                    />
                </TabPanel>
                <TabPanel value={tabs.claimed} style={{ padding: 0 }}>
                    <FireflyRedPacketHistoryList
                        handleOpenDetails={handleOpenDetails}
                        historyType={FireflyRedPacketAPI.ActionType.Claim}
                    />
                </TabPanel>
            </div>
            <Box style={{ width: '100%', position: 'absolute', bottom: 0, zIndex: 99 }}>
                <PluginWalletStatusBar requiredSupportPluginID={NetworkPluginID.PLUGIN_EVM} readonlyMode />
            </Box>
        </>
    )
})
