import { memo, useState } from 'react'
import { ButtonGroupTabList } from '@masknet/theme'
import { Box, Tab } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { TabContext, TabPanel } from '@material-ui/lab'
import { ContactsTable } from '../ContactsTable'
import { PostHistory } from '../PostHistory'
const useStyles = makeStyles()({
    container: {
        flex: 1,
        height: '100%',
    },
    tab: {
        maxHeight: '100%',
        height: '100%',
        overflow: 'scroll',
    },
})

enum PersonaContentTab {
    Posts = 'POST',
    Contacts = 'Contacts',
}

export interface PersonaContentProps {
    network: string
    useIds: string[]
}
export const PersonaContent = memo<PersonaContentProps>(({ network, useIds }) => {
    const { classes } = useStyles()
    const [tab, setTab] = useState<string>(PersonaContentTab.Posts)

    return (
        <Box className={classes.container}>
            <TabContext value={String(tab)}>
                <ButtonGroupTabList onChange={(e, v) => setTab(v)} aria-label="persona-post-contacts-button-group">
                    <Tab value={PersonaContentTab.Posts} label="Posts" />
                    <Tab value={PersonaContentTab.Contacts} label="Contacts" />
                </ButtonGroupTabList>
                <TabPanel value={PersonaContentTab.Posts} className={classes.tab}>
                    <PostHistory useIds={useIds} network={network} />
                </TabPanel>
                <TabPanel value={PersonaContentTab.Contacts} className={classes.tab}>
                    <ContactsTable network={network} />
                </TabPanel>
            </TabContext>
        </Box>
    )
})
