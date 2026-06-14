import { useLingui } from '@lingui/react/macro'
import { EMPTY_LIST } from '@masknet/shared-base'
import { memo, useState } from 'react'
import { useFriendsPaged, useTitle } from '../../../hooks/index.js'
import { FriendsHomeUI } from './UI.js'

export const Component = memo(function FriendsHome() {
    const { t } = useLingui()
    useTitle(t`Contacts`)

    const [{ isPending, refetch }, , { data, fetchNextPage }] = useFriendsPaged()
    const [searchValue, setSearchValue] = useState('')

    return (
        <FriendsHomeUI
            friends={data?.pages ?? EMPTY_LIST}
            loading={isPending}
            setSearchValue={setSearchValue}
            searchValue={searchValue}
            searchResult={[]}
            fetchNextPage={fetchNextPage}
            fetchNextSearchPage={() => {}}
            refetch={refetch}
        />
    )
})
