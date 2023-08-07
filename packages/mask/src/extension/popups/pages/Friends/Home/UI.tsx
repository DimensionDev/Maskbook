// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { makeStyles, LoadingBase } from '@masknet/theme'
import { memo } from 'react'
import { ContactCard } from '../ContactCard/index.js'
import { type FriendsInformation } from '../../../hook/useFriends.js'
import { Box, Typography } from '@mui/material'
import { Search } from '../Search/index.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { EmptyStatus } from '@masknet/shared'
import type { NextIDPersonaBindingsWithIdentifier } from '../../../hook/useFriendsFromSearch.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.palette.maskColor.white,
        display: 'flex',
        flexDirection: 'column',
    },
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
    mainText: {
        color: theme.palette.text.primary,
    },
}))

export interface FriendsHomeUIProps {
    searchValue: string
    searchResult: NextIDPersonaBindingsWithIdentifier[]
    loading: boolean
    friends: FriendsInformation[]
    setSearchValue: (v: string) => void
}

export const FriendsHomeUI = memo<FriendsHomeUIProps>(function FriendsHomeUI({
    loading,
    friends,
    setSearchValue,
    searchResult,
    searchValue,
}) {
    const { classes, cx } = useStyles()
    const { t } = useI18N()
    return (
        <div className={classes.container}>
            <Box padding="16px 16px 0 16px">
                <Search setSearchValue={setSearchValue} />
            </Box>
            {loading ? (
                <div className={cx(classes.empty, classes.mainText)}>
                    <LoadingBase />
                    <Typography>{t('loading')}</Typography>
                </div>
            ) : searchValue ? (
                searchResult.length === 0 ? (
                    <EmptyStatus className={classes.empty}>
                        {t('popups_encrypted_friends_search_no_result')}
                    </EmptyStatus>
                ) : (
                    <Box display="flex" flexDirection="column" gap="12px" padding="16px">
                        {searchResult.map((friend) => {
                            return (
                                <ContactCard
                                    key={friend.persona}
                                    nextId={friend.persona}
                                    profiles={friend.proofs}
                                    publicKey={friend.linkedPersona?.rawPublicKey}
                                    isLocal={friend.isLocal}
                                />
                            )
                        })}
                    </Box>
                )
            ) : friends.length === 0 ? (
                <EmptyStatus className={classes.empty}>{t('popups_encrypted_friends_no_friends')}</EmptyStatus>
            ) : (
                <Box display="flex" flexDirection="column" gap="12px" padding="16px">
                    {friends.map((friend) => {
                        return (
                            <ContactCard
                                key={friend.id}
                                avatar={friend.avatar}
                                nextId={friend.linkedPersona?.publicKeyAsHex as string}
                                publicKey={friend.linkedPersona?.rawPublicKey}
                                profiles={friend.profiles}
                                isLocal
                            />
                        )
                    })}
                </Box>
            )}
        </div>
    )
})
