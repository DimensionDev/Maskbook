import { ElementAnchor, EmptyStatus } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { memo } from 'react'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { type Friend } from '../../../hook/useFriends.js'
import { ContactCard } from '../ContactCard/index.js'

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
    friends: Friend[]
    fetchNextPage: () => void
}

export const Contacts = memo<ContactsProps>(function Contacts({ friends, fetchNextPage }) {
    const { classes } = useStyles()
    const { t } = useI18N()
    return friends.length === 0 ? (
        <EmptyStatus className={classes.empty}>{t('popups_encrypted_friends_no_friends')}</EmptyStatus>
    ) : (
        <Box className={classes.cardContainer}>
            {friends.map((friend, index) => {
                return (
                    <ContactCard
                        key={friend.persona.publicKeyAsHex}
                        avatar={friend.avatar}
                        nextId={friend.persona?.publicKeyAsHex}
                        publicKey={friend.persona?.rawPublicKey}
                        isLocal
                    />
                )
            })}
            <ElementAnchor callback={() => fetchNextPage()} height={10} />
        </Box>
    )
})
