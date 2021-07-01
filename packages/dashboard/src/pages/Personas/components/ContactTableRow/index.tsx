import type { Contact } from '@masknet/shared'
import { memo, useCallback } from 'react'
import { Box, TableCell, TableRow, Typography, makeStyles, Avatar, useTheme, Button } from '@material-ui/core'
import { StarIcon, MaskNetworkIcon } from '@masknet/icons'
import { useAddContactToFavorite, useRemoveContactFromFavorite } from '../../hooks/useFavoriteContact'
import { MaskColorVar } from '@masknet/theme'

const mapContactAvatarColor = (string: string, theme: 'light' | 'dark') => {
    const hash = [...string].reduce((prev, current) => {
        // eslint-disable-next-line no-bitwise
        const next = current.charCodeAt(0) + (prev << 5) - prev
        // eslint-disable-next-line no-bitwise
        return next & next
    }, 0)
    return `hsl(${hash % 360}, ${theme === 'dark' ? `78%` : '98%'}, ${theme === 'dark' ? `50%` : '70%'})`
}

const useStyles = makeStyles(() => ({
    favorite: {
        marginLeft: 16,
        marginRight: 26,
        width: 24,
        height: 24,
    },
    avatarContainer: {
        position: 'relative',
    },
    name: {
        marginLeft: 17,
    },
    maskIcon: {
        position: 'absolute',
        width: 16,
        height: 16,
        right: 0,
        bottom: 0,
    },
    button: {
        padding: '3px 24px',
        borderRadius: 14,
    },
}))

export interface ContactTableRowProps {
    contact: Contact
    index: number
}

export const ContactTableRow = memo<ContactTableRowProps>(({ contact, index }) => {
    const [, addContactToFavorite] = useAddContactToFavorite()
    const [, removeContactFromFavorite] = useRemoveContactFromFavorite()

    const theme = useTheme().palette.mode

    const handleStarClick = useCallback(() => {
        contact.favorite ? removeContactFromFavorite(contact.identifier) : addContactToFavorite(contact.identifier)
    }, [addContactToFavorite, removeContactFromFavorite, contact])

    return <ContactTableRowUI handleStarClick={handleStarClick} theme={theme} contact={contact} index={index} />
})

export interface ContactTableRowUIProps extends ContactTableRowProps {
    handleStarClick(): void
    theme: 'light' | 'dark'
}

export const ContactTableRowUI = memo<ContactTableRowUIProps>(({ contact, index, handleStarClick, theme }) => {
    const classes = useStyles()
    const [first, last] = contact.name.split(' ')

    return (
        <TableRow>
            <TableCell align="left" variant="body">
                <Box display="flex" alignItems="center">
                    <Typography>{index}</Typography>
                    <Box className={classes.favorite}>
                        {contact.fingerprint ? (
                            <StarIcon
                                sx={{
                                    fill: contact.favorite ? MaskColorVar.warning : MaskColorVar.iconLight,
                                    cursor: 'pointer',
                                }}
                                onClick={handleStarClick}
                            />
                        ) : null}
                    </Box>
                    <Box className={classes.avatarContainer}>
                        <Avatar
                            aria-label={contact.name}
                            src={contact.avatar}
                            sx={{
                                backgroundColor: mapContactAvatarColor(contact.identifier.toText(), theme),
                                width: 48,
                                height: 48,
                            }}>
                            {first[0]}
                            {(last || '')[0]}
                        </Avatar>
                        {contact.fingerprint ? <MaskNetworkIcon className={classes.maskIcon} /> : null}
                    </Box>
                    <Typography className={classes.name}>{contact.name}</Typography>
                </Box>
            </TableCell>
            <TableCell align="center">
                {!contact.fingerprint ? (
                    <Button color="secondary" size="small" className={classes.button}>
                        invite
                    </Button>
                ) : null}
            </TableCell>
        </TableRow>
    )
})
