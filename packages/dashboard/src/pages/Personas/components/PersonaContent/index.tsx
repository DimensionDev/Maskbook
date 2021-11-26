import { memo, useState } from 'react'
import { ButtonGroupTabList } from '@masknet/theme'
import { Box, Tab } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { TabContext, TabPanel } from '@mui/lab'
import { ContactsTable } from '../ContactsTable'
import { PostHistory } from '../PostHistory'
const useStyles = makeStyles()((theme) => ({
    container: {
        flex: 1,
        height: '100%',
    },
    tab: {
        maxHeight: '100%',
        height: '100%',
        overflow: 'auto',
        padding: `${theme.spacing(3)} 0`,
    },
    tabs: {
        width: '288px',
    },
}))

enum PersonaContentTab {
    Posts = 'POST',
    Contacts = 'Contacts',
}

export interface PersonaContentProps {
    network: string
}
export const PersonaContent = memo<PersonaContentProps>(({ network }) => {
    const { classes } = useStyles()
    const [tab, setTab] = useState<string>(PersonaContentTab.Posts)

    return (
        <Box className={classes.container}>
            <TabContext value={String(tab)}>
                <ButtonGroupTabList
                    classes={{ root: classes.tabs }}
                    onChange={(e, v) => setTab(v)}
                    aria-label="persona-post-contacts-button-group">
                    <Tab value={PersonaContentTab.Posts} label="Posts" />
                    <Tab value={PersonaContentTab.Contacts} label="Contacts" />
                </ButtonGroupTabList>
                <TabPanel value={PersonaContentTab.Posts} className={classes.tab}>
                    <PostHistory network={network} />
                </TabPanel>
                <TabPanel value={PersonaContentTab.Contacts} className={classes.tab}>
                    <ContactsTable network={network} />
                </TabPanel>
            </TabContext>
        </Box>
    )
})
