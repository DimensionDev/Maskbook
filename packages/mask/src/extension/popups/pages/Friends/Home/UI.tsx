// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { makeStyles, LoadingBase } from '@masknet/theme'
import { memo } from 'react'
import { ContactCard } from '../ContactCard/index.js'
import { type FriendsInformation } from '../../../hook/useFriends.js'
import { Box, Typography } from '@mui/material'
import { Search } from '../Search/index.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import { type NextIDPersonaBindings } from '@masknet/shared-base'
import { EmptyStatus } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FA',
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
}))

export interface FriendsHomeUIProps {
    searchValue: string
    searchResult: NextIDPersonaBindings[]
    loading: boolean
    friends: FriendsInformation[]
    setSearchValue: (v: string) => void
}

export const FriendsHomeUI = memo<FriendsHomeUIProps>(
    ({ loading, friends, setSearchValue, searchResult, searchValue }) => {
        const { classes } = useStyles()
        const { t } = useI18N()
        return (
            <div className={classes.container}>
                <Box padding="16px 16px 0 16px">
                    <Search setSearchValue={setSearchValue} />
                </Box>
                {loading ? (
                    <div className={classes.empty}>
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
                                console.log(friend)
                                return ''
                            })}
                        </Box>
                    )
                ) : (
                    <Box display="flex" flexDirection="column" gap="12px" padding="16px">
                        {friends.map((friend) => {
                            return <ContactCard key={friend.id} friend={friend} />
                        })}
                    </Box>
                )}
            </div>
        )
    },
)
