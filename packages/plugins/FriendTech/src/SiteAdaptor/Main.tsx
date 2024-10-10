import { useParamTab } from '@masknet/shared'
import { useAccount } from '@masknet/web3-hooks-base'
import { Box, Typography } from '@mui/material'
import { TitleTabs } from '../constants.js'
import { HistoryList } from './components/HistoryList.js'
import { KeysTab } from './components/KeysTab.js'
import { Trans } from '@lingui/macro'

export function Main() {
    const [tab] = useParamTab<TitleTabs>(TitleTabs.Keys)
    const account = useAccount()

    if (!account) {
        return (
            <Box height="100%" display="flex" alignItems="center" justifyContent="center">
                <Typography fontSize={14} color={(t) => t.palette.maskColor.third}>
                    <Trans>Connecting to the wallet to see what keys are held.</Trans>
                </Typography>
            </Box>
        )
    }

    if (tab === TitleTabs.History)
        return (
            <Box px={1.5} pt={1.5} overflow="auto" height="100%" boxSizing="border-box">
                <HistoryList account={account} />
            </Box>
        )
    return <KeysTab />
}
