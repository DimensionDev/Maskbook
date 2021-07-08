import { memo, useState } from 'react'
import { ButtonGroupTabList } from '@masknet/theme'
import { Box, Tab, makeStyles } from '@material-ui/core'
import { TabContext, TabPanel } from '@material-ui/lab'
import { ContactsTable } from '../ContactsTable'

const useStyles = makeStyles((theme) => ({
    container: {
        flex: 1,
        height: '100%',
    },
    tab: {
        maxHeight: '100%',
        height: '100%',
        overflow: 'scroll',
    },
}))

enum PersonaContentTab {
    POST = 'POST',
    Contacts = 'Contacts',
}

export interface PersonaContentProps {
    network: string
}

export const PersonaContent = memo<PersonaContentProps>(({ network }) => {
    const classes = useStyles()
    const [tab, setTab] = useState<string>(PersonaContentTab.POST)

    return (
        <Box className={classes.container}>
            <TabContext value={String(tab)}>
                <ButtonGroupTabList onChange={(e, v) => setTab(v)} aria-label="person-button-group">
                    <Tab value={PersonaContentTab.POST} label="POST" />
                    <Tab value={PersonaContentTab.Contacts} label="Contacts" />
                </ButtonGroupTabList>
                <TabPanel value={PersonaContentTab.POST} className={classes.tab}>
                    Post
                </TabPanel>
                <TabPanel value={PersonaContentTab.Contacts} className={classes.tab}>
                    <ContactsTable network={network} />
                </TabPanel>
            </TabContext>
        </Box>
    )
})
