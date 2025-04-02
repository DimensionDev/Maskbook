import { useInfiniteQuery } from '@tanstack/react-query'
import { type GoogleDriveClient } from '@masknet/web3-providers'
import { compact } from 'lodash-es'
import { useEffect, useState } from 'react'

export function useGoogleDriveFiles(client: GoogleDriveClient) {
    const [isLogin, setIsLogin] = useState(false)

    useEffect(() => {
        client.login()
        return client.subscribe(setIsLogin)
    }, [client])

    const query = useInfiniteQuery({
        enabled: isLogin,
        queryKey: ['google-drive', 'files'],
        initialPageParam: '',
        queryFn: (param) => {
            return client.listBackupFiles({
                pageSize: '100',
                pageToken: param.pageParam,
            })
        },
        getNextPageParam: () => '',
        select(data) {
            return compact(data.pages.flatMap((x) => x))
        },
    })
    return query
}
