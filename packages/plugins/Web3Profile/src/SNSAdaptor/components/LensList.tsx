import { memo, type FC } from 'react'
import { Button, List, ListItem, Typography, type ListProps, Avatar } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales/i18n_generated.js'
import { Icons } from '@masknet/icons'
import { CrossIsolationMessages } from '@masknet/shared-base'
import type { FireflyLensAccount } from '@masknet/web3-providers/types'

const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        list: {
            backgroundColor: isDark ? '#030303' : theme.palette.common.white,
            maxWidth: 320,
            // Show up to 6 item
            maxHeight: 244,
            overflow: 'auto',
            minWidth: 240,
            padding: theme.spacing(1.5),
            boxSizing: 'border-box',
            borderRadius: 16,
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        listItem: {
            cursor: 'default',
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(0.5),
            height: 40,
            marginBottom: 6,
            borderRadius: 4,
            '&:hover': {
                backgroundColor: theme.palette.maskColor.bg,
            },
            '&:last-of-type': {
                marginBottom: 0,
            },
        },
        name: {
            color: theme.palette.maskColor.main,
            fontWeight: 400,
            marginLeft: theme.spacing(0.5),
            marginRight: theme.spacing(2),
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            flexGrow: 1,
        },
        followButton: {
            marginLeft: 'auto',
            height: 32,
            padding: theme.spacing(1, 2),
            backgroundColor: '#ABFE2C',
            color: theme.palette.common.black,
            borderRadius: 99,
            fontSize: '12px',
            '&:hover': {
                backgroundColor: '#ABFE2C',
                color: theme.palette.common.black,
            },
        },
    }
})
interface Props extends ListProps {
    accounts: FireflyLensAccount[]
}

export const LensList: FC<Props> = memo(({ className, accounts, ...rest }) => {
    const { classes, cx } = useStyles()
    const t = useI18N()
    return (
        <List className={cx(classes.list, className)} {...rest}>
            {accounts.map((account) => (
                <ListItem className={classes.listItem} key={account.handle}>
                    {account.profileUri.length ? (
                        <Avatar src={account.profileUri[0]} sx={{ width: 20, height: 20 }} />
                    ) : (
                        <Icons.Lens size={20} />
                    )}
                    <Typography className={classes.name}>{account.name || account.handle}</Typography>
                    <Button
                        variant="text"
                        className={classes.followButton}
                        disableElevation
                        onClick={() => {
                            CrossIsolationMessages.events.followLensDialogEvent.sendToLocal({
                                open: true,
                                handle: account.handle,
                            })
                        }}>
                        {t.follow()}
                    </Button>
                </ListItem>
            ))}
        </List>
    )
})

LensList.displayName = 'LensList'
