// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { makeStyles } from '@masknet/theme'
import { memo } from 'react'
import { ContactCard } from '../ContactCard/index.js'
import { type FriendsInformation } from '../../../hook/useFriends.js'
import { Box } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
    },
}))

export interface FriendsHomeUIProps {
    friends: FriendsInformation[]
}

export const FriendsHomeUI = memo<FriendsHomeUIProps>(({ friends }) => {
    const { classes } = useStyles()
    return (
        <div className={classes.container}>
            <Box display="flex" flexDirection="column" gap="12px" padding="16px">
                {friends.map((friend) => (
                    <ContactCard key={friend.id} friend={friend} />
                ))}
            </Box>
        </div>
    )
})
