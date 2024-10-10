import { memo } from 'react'
import { first } from 'lodash-es'
import { Box } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ElementAnchor, EmptyStatus } from '@masknet/shared'
import { ContactCard } from '../ContactCard/index.js'
import { type Friend } from '../../../hooks/index.js'
import { Trans } from '@lingui/macro'

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
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

interface ContactsProps {
    friendsArray: Array<{ friends: Friend[]; nextPageOffset: number }>
    fetchNextPage: () => void
}

export const Contacts = memo<ContactsProps>(function Contacts({ friendsArray, fetchNextPage }) {
    const { classes } = useStyles()
    return !first(friendsArray) || first(friendsArray)?.friends.length === 0 ?
            <EmptyStatus className={classes.empty}>
                <Trans>No contacts stored locally, you can try searching.</Trans>
            </EmptyStatus>
        :   <Box className={classes.cardContainer}>
                {friendsArray.map(({ friends }) => {
                    return friends.map((friend) => (
                        <ContactCard
                            key={friend.persona.publicKeyAsHex}
                            avatar={friend.avatar}
                            nextId={friend.persona?.publicKeyAsHex}
                            publicKey={friend.persona?.rawPublicKey}
                            profile={friend.profile}
                            isLocal
                        />
                    ))
                })}
                <ElementAnchor callback={() => fetchNextPage()} height={10} />
            </Box>
})
