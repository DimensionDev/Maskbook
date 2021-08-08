import { WalletHeader } from '../components/WalletHeader'
import { WalletInfo } from '../components/WalletInfo'
import { List, ListItem, ListItemText, makeStyles } from '@material-ui/core'
import { EnterDashboard } from '../../../components/EnterDashboard'
import { BackUpIcon, TrashIcon, CloudLinkIcon } from '@masknet/icons'
import { memo } from 'react'
import { useHistory } from 'react-router-dom'
import { DialogRoutes } from '../../../index'

const useStyles = makeStyles(() => ({
    content: {
        flex: 1,
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
    },
    list: {
        backgroundColor: '#ffffff',
        padding: 0,
    },
    item: {
        padding: 8,
        borderBottom: '1px solid #F7F9FA',
        cursor: 'pointer',
    },
    text: {
        margin: '0 0 0 15px',
        color: '#1C68F3',
        lineHeight: 1.5,
        fontWeight: 600,
        fontSize: 16,
    },
    icon: {
        fontSize: 20,
    },
}))

const WalletSettings = memo(() => {
    const history = useHistory()
    const classes = useStyles()

    return (
        <>
            <WalletHeader />
            <WalletInfo />
            <div className={classes.content}>
                <List dense className={classes.list}>
                    <ListItem className={classes.item} onClick={() => history.push(DialogRoutes.BackupWallet)}>
                        <BackUpIcon className={classes.icon} />
                        <ListItemText className={classes.text}>Back up the wallet</ListItemText>
                    </ListItem>
                    <ListItem className={classes.item} onClick={() => history.push(DialogRoutes.DeleteWallet)}>
                        <TrashIcon className={classes.icon} />
                        <ListItemText className={classes.text}>Delete wallet</ListItemText>
                    </ListItem>
                    <ListItem className={classes.item}>
                        <CloudLinkIcon className={classes.icon} />
                        <ListItemText className={classes.text}>View on Etherscan</ListItemText>
                    </ListItem>
                </List>
            </div>
            <EnterDashboard />
        </>
    )
})

export default WalletSettings
