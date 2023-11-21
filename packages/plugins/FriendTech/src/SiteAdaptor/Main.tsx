import { useParamTab } from '@masknet/shared'
import { useAccount } from '@masknet/web3-hooks-base'
import { Box } from '@mui/material'
import { TitleTabs } from '../constants.js'
import { HistoryList } from './components/HistoryList.js'
import { KeysTab } from './components/KeysTab.js'

export function Main() {
    const [tab] = useParamTab<TitleTabs>(TitleTabs.Keys)
    const account = useAccount()

    if (tab === TitleTabs.History)
        return (
            <Box px={1.5} pt={1.5} overflow="auto" height="100%" boxSizing="border-box">
                <HistoryList account={account} />
            </Box>
        )
    return <KeysTab />
}
