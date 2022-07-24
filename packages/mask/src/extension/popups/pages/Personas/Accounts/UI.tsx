import { memo, useState } from 'react'
import { EmptyIcon } from '@masknet/icons'
import type { EnhanceableSite } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Button, Typography } from '@mui/material'
import { AccountAvatar } from '../components/AccountAvatar'
import { useI18N } from '../../../../../utils'
import { ConnectDialog } from '../components/ConnectDialog'
import type { Account } from '../type'

const useStyles = makeStyles()(() => ({
    container: {
        padding: '8px 16px 72px 16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F7F9FA',
    },
    connect: {
        backgroundColor: '#ffffff',
        padding: '11px 16px',
        borderRadius: 99,
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        color: '#07101B',
        position: 'fixed',
        bottom: 32,
        left: 32,
        right: 32,
    },
    list: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        columnGap: 6,
        rowGap: 16,
    },
    placeholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        flex: 1,
    },
    item: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
    },
    name: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#07101B',
        marginTop: 12,
    },
}))

export interface AccountsUIProps {
    accounts: Account[]
    networks: EnhanceableSite[]
    onConnect: (networkIdentifier: EnhanceableSite) => void
    onEnterDetail: (account: Account) => void
}

export const AccountsUI = memo<AccountsUIProps>(({ accounts, networks, onConnect, onEnterDetail }) => {
    const { classes } = useStyles()
    const [open, setOpen] = useState(false)
    const { t } = useI18N()

    return (
        <div className={classes.container}>
            {accounts.length ? (
                <div className={classes.list}>
                    {accounts.map((account, key) => {
                        const { avatar, identifier, is_valid } = account
                        return (
                            <div key={key} className={classes.item} onClick={() => onEnterDetail(account)}>
                                <AccountAvatar avatar={avatar} network={identifier.network} isValid={is_valid} />
                                <Typography className={classes.name}>
                                    @
                                    {identifier.userId.length > 14
                                        ? `${identifier.userId.slice(0, 14)}...`
                                        : identifier.userId}
                                </Typography>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className={classes.placeholder}>
                    <EmptyIcon style={{ fontSize: 60 }} />
                </div>
            )}
            <Button className={classes.connect} onClick={() => setOpen(true)}>
                {t('popups_connect_your_web2_social_accounts')}
            </Button>
            <ConnectDialog open={open} onClose={() => setOpen(false)} networks={networks} onConnect={onConnect} />
        </div>
    )
})
