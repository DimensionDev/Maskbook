// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { makeStyles, LoadingBase } from '@masknet/theme'
import { memo, type RefObject } from 'react'
import { type FriendsInformation } from '../../../hook/useFriends.js'
import { Box, Typography } from '@mui/material'
import { Search } from '../Search/index.js'
import { useI18N } from '../../../../../utils/i18n-next-ui.js'
import type { NextIDPersonaBindingsWithIdentifier } from '../../../hook/useFriendsFromSearch.js'
import { Contacts } from '../Contacts/index.js'
import { SearchList } from '../SearchList/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.palette.maskColor.white,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '100vh',
        overflowY: 'hidden',
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
    listRef: RefObject<HTMLElement>
}

export const FriendsHomeUI = memo<FriendsHomeUIProps>(function FriendsHomeUI({
    loading,
    friends,
    setSearchValue,
    searchResult,
    searchValue,
    listRef,
}) {
    const { classes, cx } = useStyles()
    const { t } = useI18N()
    return (
        <div className={classes.container}>
            <Box padding="16px">
                <Search setSearchValue={setSearchValue} />
            </Box>
            {loading ? (
                <div className={cx(classes.empty, classes.mainText)}>
                    <LoadingBase />
                    <Typography>{t('loading')}</Typography>
                </div>
            ) : searchValue ? (
                <SearchList searchResult={searchResult} />
            ) : (
                <Contacts friends={friends} listRef={listRef} />
            )}
        </div>
    )
})
