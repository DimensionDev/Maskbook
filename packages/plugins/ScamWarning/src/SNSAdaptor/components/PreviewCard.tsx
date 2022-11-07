import * as React from 'react'
import { Stack } from '@mui/material'
import { useAsync } from 'react-use'
import { CryptoscanDb } from '@masknet/web3-providers'
import { uniq } from 'lodash-es'

interface PreviewCardProps {
    links: string[]
}

const excludedLinks = ['t.co']

export const PreviewCard = ({ links }: PreviewCardProps) => {
    const { value, loading } = useAsync(() => {
        const hosts = links.map((x) => new URL(x).host).filter((x) => !excludedLinks.includes(x))
        return CryptoscanDb.getScamWarnings(uniq(hosts))
    }, [links])

    return <Stack>{value?.join()}</Stack>
}
