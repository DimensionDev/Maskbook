import { makeStyles } from '@masknet/theme'
import { useAccount } from '@masknet/web3-hooks-base'
import { useUser } from '../hooks/useUser.js'
import { UserProfile } from './UserProfile.js'
import { HoldingList } from './HoldingList.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: '100%',
        boxSizing: 'border-box',
    },
    holdingList: {
        marginTop: theme.spacing(1.5),
    },
}))

export function KeysTab() {
    const { classes } = useStyles()
    const account = useAccount()
    const { data: user, isInitialLoading } = useUser(account)

    return (
        <div className={classes.container}>
            <UserProfile address={account} user={user} loading={isInitialLoading} variant="self" />
            <HoldingList address={account} className={classes.holdingList} />
        </div>
    )
}
