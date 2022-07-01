import type { RelationProfile } from '@masknet/shared-base'
import { memo, useCallback } from 'react'
import { Box, TableCell, TableRow, Typography, Avatar, useTheme } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Star as StarIcon, MaskBlue as MaskBlueIcon } from '@masknet/icons'
import { Services } from '../../../../API'
import { useDashboardI18N } from '../../../../locales'
import { useAddContactToFavorite, useRemoveContactFromFavorite } from '../../hooks/useFavoriteContact'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { useAsyncFn } from 'react-use'
import { LoadingButton } from '@mui/lab'
import { generateContactAvatarColor } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
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
    tableRow: {
        '&:hover': {
            backgroundColor: theme.palette.background.default,
        },
    },
}))

export interface ContactTableRowProps {
    contact: RelationProfile
    index: number
    network: string
    onReset: () => void
}

export const ContactTableRow = memo<ContactTableRowProps>(({ network, contact, index, onReset }) => {
    const t = useDashboardI18N()
    const { currentPersona } = PersonaContext.useContainer()
    const [, addContactToFavorite] = useAddContactToFavorite()
    const [, removeContactFromFavorite] = useRemoveContactFromFavorite()

    const theme = useTheme().palette.mode

    const handleClickStar = useCallback(async () => {
        if (!currentPersona) return
        contact.favorite
            ? await removeContactFromFavorite(contact.identifier, currentPersona)
            : await addContactToFavorite(contact.identifier, currentPersona)
        onReset()
    }, [contact, currentPersona, onReset])

    const [{ loading }, handleClickInvite] = useAsyncFn(async () => {
        return Services.SocialNetwork.openShareLink(
            network,
            t.personas_invite_post({ identifier: contact.identifier.userId }),
        )
    }, [])

    return (
        <ContactTableRowUI
            handleClickInvite={handleClickInvite}
            handleClickStar={handleClickStar}
            theme={theme}
            loading={loading}
            contact={contact}
            index={index}
        />
    )
})

export interface ContactTableRowUIProps {
    contact: RelationProfile
    index: number
    handleClickInvite(): void
    handleClickStar(): void
    loading: boolean
    theme: 'light' | 'dark'
}

// https://unicode-table.com/en/0020/
const SPACE_POINT = 0x0020

export const ContactTableRowUI = memo<ContactTableRowUIProps>(
    ({ contact, index, handleClickStar, handleClickInvite, theme, loading }) => {
        const t = useDashboardI18N()
        const { classes } = useStyles()
        const [first, last] = contact.name.split(' ')

        return (
            <TableRow className={classes.tableRow}>
                <TableCell align="left" variant="body" sx={{ border: 'none', p: 1.5 }}>
                    <Box display="flex" alignItems="center">
                        <Typography>{index}</Typography>
                        <Box className={classes.favorite}>
                            {contact.fingerprint ? (
                                <StarIcon
                                    color={contact.favorite ? MaskColorVar.warning : MaskColorVar.iconLight}
                                    sx={{ cursor: 'pointer' }}
                                    aria-hidden={false}
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
                                {/* To support emoji */}
                                {String.fromCodePoint(
                                    first.codePointAt(0) ?? SPACE_POINT,
                                    last?.codePointAt(0) ?? SPACE_POINT,
                                )}
                            </Avatar>
                            {contact.fingerprint ? <MaskBlueIcon size={16} className={classes.maskIcon} /> : null}
                        </Box>
                        <Box className={classes.info}>
                            <Typography>{contact.name}</Typography>
                            <Typography className={classes.userId}>@{contact.identifier.userId}</Typography>
                        </Box>
                    </Box>
                </TableCell>
                <TableCell align="center" sx={{ border: 'none' }}>
                    {!contact.fingerprint ? (
                        <LoadingButton
                            loading={loading}
                            color="secondary"
                            size="small"
                            variant="contained"
                            className={classes.button}
                            onClick={handleClickInvite}>
                            {t.personas_contacts_invite()}
                        </LoadingButton>
                    ) : null}
                </TableCell>
            </TableRow>
        )
    },
)
