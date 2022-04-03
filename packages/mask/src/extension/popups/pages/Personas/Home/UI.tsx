// ! We're going to SSR this UI, so DO NOT import anything new!

// TODO: Migrate following files before we can SSR
// ProfileList
// useI18N

import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { ProfileList } from '../components/ProfileList'
import { Navigator } from '../../../components/Navigator'

const useStyles = makeStyles()({
    content: {
        flex: 1,
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
    },
})

export const PersonaHomeUI = memo(() => {
    const { classes } = useStyles()

    return (
        <>
            <div className={classes.content}>
                <ProfileList />
            </div>
            <Navigator />
        </>
    )
})
