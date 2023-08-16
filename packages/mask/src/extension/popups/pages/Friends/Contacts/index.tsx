import { makeStyles } from '@masknet/theme'
import { memo, type RefObject } from 'react'
import { ContactCard } from '../ContactCard/index.js'
import { type FriendsInformation } from '../../../hook/useFriends.js'
import { Box } from '@mui/material'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { EmptyStatus } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    empty: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 12,
        color: theme.palette.text.secondary,
        whiteSpace: 'nowrap',
    },
    cardContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '0 16px 16px 16px',
        flexGrow: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

export interface ContactsProps {
    friends: FriendsInformation[]
    listRef: RefObject<HTMLElement>
}

export const Contacts = memo<ContactsProps>(function Contacts({ friends, listRef }) {
    const { classes } = useStyles()
    const { t } = useI18N()
    return friends.length === 0 ? (
        <EmptyStatus className={classes.empty}>{t('popups_encrypted_friends_no_friends')}</EmptyStatus>
    ) : (
        <Box className={classes.cardContainer} ref={listRef}>
            {friends.map((friend) => {
                return (
                    <ContactCard
                        key={friend.id}
                        avatar={friend.avatar}
                        nextId={friend.persona?.publicKeyAsHex}
                        publicKey={friend.persona?.rawPublicKey}
                        profiles={friend.profiles}
                        isLocal
                    />
                )
            })}
        </Box>
    )
})
