import { memo, useState } from 'react'
import { ButtonGroupTabList } from '@masknet/theme'
import { Box, Tab, makeStyles } from '@material-ui/core'
import { TabContext, TabPanel } from '@material-ui/lab'
import { ContactsTable } from '../ContactsTable'

const useStyles = makeStyles((theme) => ({
    tab: {
        minWidth: 144,
    },
}))

enum PersonaContentTab {
    POST = 'POST',
    Contacts = 'Contacts',
}

export const PersonaContent = memo(() => {
    const classes = useStyles()
    const [tab, setTab] = useState<string>(PersonaContentTab.POST)

    return (
        <Box>
            <TabContext value={String(tab)}>
                <ButtonGroupTabList onChange={(e, v) => setTab(v)}>
                    <Tab value={PersonaContentTab.POST} label="POST" />
                    <Tab value={PersonaContentTab.Contacts} label="Contacts" />
                </ButtonGroupTabList>
                <TabPanel value={PersonaContentTab.POST}>Post</TabPanel>
                <TabPanel value={PersonaContentTab.Contacts}>
                    <ContactsTable />
                </TabPanel>
            </TabContext>
        </Box>
    )
})
