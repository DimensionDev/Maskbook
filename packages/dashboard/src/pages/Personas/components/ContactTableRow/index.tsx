import type { RelationProfile } from '@masknet/shared'
import { memo, useCallback } from 'react'
import { Box, TableCell, TableRow, Typography, Avatar, useTheme, Button } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { StarIcon, MaskNetworkIcon } from '@masknet/icons'
import { MaskColorVar } from '@masknet/theme'
import { Services } from '../../../../API'
import { useDashboardI18N } from '../../../../locales'
import { generateContactAvatarColor } from '../../../../utils/generateContactAvatarColor'
import { useAddContactToFavorite, useRemoveContactFromFavorite } from '../../hooks/useFavoriteContact'
import { PersonaContext } from '../../hooks/usePersonaContext'

const useStyles = makeStyles()({
    favorite: {
        marginLeft: 16,
        marginRight: 26,
        width: 24,
        height: 24,
    },
    avatarContainer: {
        position: 'relative',
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
    info: {
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 17,
        justifyContent: 'space-between',
    },
    userId: {
        fontSize: 12,
        color: MaskColorVar.normalText,
    },
})

export interface ContactTableRowProps {
    contact: RelationProfile
    index: number
    network: string
}

export const ContactTableRow = memo<ContactTableRowProps>(({ network, contact, index }) => {
    const t = useDashboardI18N()
    const { currentPersona } = PersonaContext.useContainer()
    const [, addContactToFavorite] = useAddContactToFavorite()
    const [, removeContactFromFavorite] = useRemoveContactFromFavorite()

    const theme = useTheme().palette.mode

    const handleClickStar = useCallback(() => {
        if (currentPersona) {
            contact.favorite
                ? removeContactFromFavorite(contact.identifier, currentPersona)
                : addContactToFavorite(contact.identifier, currentPersona)
        }
    }, [contact, currentPersona])

    const handleClickInvite = useCallback(() => {
        Services.Helper.openNewWindowAndPasteShareContent(
            network,
            t.personas_invite_post({ identifier: contact.identifier.userId }),
        )
    }, [])

    return (
        <ContactTableRowUI
            handleClickInvite={handleClickInvite}
            handleClickStar={handleClickStar}
            theme={theme}
            contact={contact}
            index={index}
        />
    )
})

export interface ContactTableRowUIProps extends Omit<ContactTableRowProps, 'network'> {
    handleClickInvite(): void
    handleClickStar(): void
    theme: 'light' | 'dark'
}

export const ContactTableRowUI = memo<ContactTableRowUIProps>(
    ({ contact, index, handleClickStar, handleClickInvite, theme }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()
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
                                    onClick={handleClickStar}
                                />
                            ) : null}
                        </Box>
                        <Box className={classes.avatarContainer}>
                            <Avatar
                                aria-label={contact.name}
                                src={contact.avatar}
                                sx={{
                                    backgroundColor: generateContactAvatarColor(contact.identifier.toText(), theme),
                                    width: 48,
                                    height: 48,
                                }}>
                                {first[0]}
                                {(last || '')[0]}
                            </Avatar>
                            {contact.fingerprint ? <MaskNetworkIcon className={classes.maskIcon} /> : null}
                        </Box>
                        <Box className={classes.info}>
                            <Typography>{contact.name}</Typography>
                            <Typography className={classes.userId}>@{contact.identifier.userId}</Typography>
                        </Box>
                    </Box>
                </TableCell>
                <TableCell align="center">
                    {!contact.fingerprint ? (
                        <Button color="secondary" size="small" className={classes.button} onClick={handleClickInvite}>
                            {t.personas_contacts_invite()}
                        </Button>
                    ) : null}
                </TableCell>
            </TableRow>
        )
    },
)
