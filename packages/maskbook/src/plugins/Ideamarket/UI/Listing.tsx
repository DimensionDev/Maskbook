import { useAsync } from 'react-use'
// useMemo test.
import { getListing } from '../api'

import Loading from './Loading'
import NotListed from './NotListed'
import Listed from './Listed'

interface ListingProps {
    username: string
}

export default function Listing(props: ListingProps) {
    const listingResponse = useAsync(() => getListing(props.username), [props.username])

    // maybe implement loading thingy?

    if (listingResponse.loading) return <Loading />
    if (listingResponse.error || !listingResponse.value?.rank) return <NotListed />

    const rank = Number(listingResponse.value?.rank)
    const price = Number(listingResponse.value?.price).toFixed(2)
    const dayChange = Number(Number(listingResponse.value?.dayChange).toFixed(2))
    const username = props.username.substring(1)

    return <Listed price={price} dayChange={dayChange} rank={rank} username={username} />
}
