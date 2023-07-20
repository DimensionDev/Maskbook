// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { ContactCard } from '../ContactCard/index.js'
import { Box } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
    },
}))

export interface FriendsHomeUIProps {}

export const FriendsHomeUI = memo<FriendsHomeUIProps>(() => {
    const { classes } = useStyles()

    return (
        <div className={classes.container}>
            <Box display="flex" flexDirection="column" gap="12px" padding="16px">
                <ContactCard />
                <ContactCard />
                <ContactCard />
            </Box>
        </div>
    )
})
