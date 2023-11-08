import { type ProfileInformation } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useTheme } from '@mui/material'
import { Avatar } from '../../../../shared-ui/components/Avatar.js'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles<{ isMore: boolean }>()((theme, { isMore }) => {
    return {
        iconStack: {
            padding: theme.spacing(0.5),
            background: theme.palette.maskColor.bg,
            borderRadius: '999px',
            cursor: 'pointer',
            display: 'inline-flex',
            boxSizing: 'border-box',
            minWidth: 'auto',
        },
        icon: {
            marginLeft: '-3.5px',
            fontSize: 'inherit',
            width: 16,
            height: 16,
            ':nth-of-type(1)': {
                zIndex: 1,
                marginLeft: 0,
            },
            ':nth-of-type(2)': {
                zIndex: 2,
            },
            ':nth-of-type(3)': {
                zIndex: 3,
            },
        },
        iconMore: {
            transform: 'translate(-6px, 3px)',
            zIndex: 4,
        },
        iconAdd: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: isMore ? 4 : 10,
            background: theme.palette.maskColor.primary,
            borderRadius: '50%',
            height: 16,
            width: 16,
        },
    }
})

interface RecipientsToolTipProps {
    recipients: ProfileInformation[]
    openDialog(): void
}

export function RecipientsToolTip({ recipients, openDialog }: RecipientsToolTipProps) {
    const isMore = recipients.length > 3
    const { classes } = useStyles({ isMore })
    const theme = useTheme()
    if (!recipients.length) return null
    return (
        <div className={classes.iconStack} onClick={openDialog}>
            {recipients.slice(0, 3).map((recipient) => (
                <Avatar key={recipient.identifier.userId} classes={{ root: classes.icon }} person={recipient} />
            ))}
            {isMore ?
                <Icons.More size={13} className={classes.iconMore} color={theme.palette.text.primary} />
            :   null}
            <div className={classes.iconAdd}>
                <Icons.Plus size={12} color={theme.palette.maskColor.white} />
            </div>
        </div>
    )
}
