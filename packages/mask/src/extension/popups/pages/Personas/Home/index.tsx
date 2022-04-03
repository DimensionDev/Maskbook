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

const PersonaHome = memo(() => {
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

export default PersonaHome
