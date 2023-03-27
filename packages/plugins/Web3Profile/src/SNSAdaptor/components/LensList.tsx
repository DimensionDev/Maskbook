import { memo, type FC } from 'react'
import { Button, List, ListItem, Typography, type ListProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { LensAccount } from '@masknet/web3-providers'
import { useI18N } from '../../locales/i18n_generated.js'
import { Icons } from '@masknet/icons'
import { CrossIsolationMessages } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        list: {
            backgroundColor: isDark ? '#030303' : theme.palette.common.white,
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
            '&:hover': {
                backgroundColor: theme.palette.maskColor.bg,
                borderRadius: 4,
            },
            '&:last-of-type': {
                marginBottom: 0,
            },
        },
        name: {
            color: theme.palette.maskColor.main,
            fontWeight: 400,
            marginLeft: theme.spacing(0.5),
            marginRight: 'auto',
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
    accounts: LensAccount[]
}

export const LensList: FC<Props> = memo(({ className, accounts, ...rest }) => {
    const { classes, cx } = useStyles()
    const t = useI18N()
    return (
        <List className={cx(classes.list, className)} {...rest}>
            {accounts.map((account) => (
                <ListItem className={classes.listItem} key={account.displayName}>
                    <Icons.Lens size={20} />
                    <Typography className={classes.name}>{account.displayName || account.lens}</Typography>
                    <Button
                        variant="text"
                        className={classes.followButton}
                        disableElevation
                        onClick={() => {
                            CrossIsolationMessages.events.followLensDialogEvent.sendToLocal({
                                open: true,
                                handle: account.lens,
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
