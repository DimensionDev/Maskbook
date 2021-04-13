import NotListed from './NotListed'
import Listed from './Listed'

interface ListingProps {
    username: string
    rank?: number
    dayChange?: string
    price?: string
    found: boolean
    setExtendedHover: Dispatch<SetStateAction<boolean>>
}
export default function Listing(props: ListingProps) {
    if (!props.found) return <NotListed setExtendedHover={props.setExtendedHover} />

    const rank = Number(props.rank)
    const price = Number(props.price).toFixed(2)
    const dayChange = Number(Number(props.dayChange).toFixed(2))
    const username = props.username.substring(1)

    return (
        <Listed
            price={price}
            dayChange={dayChange}
            rank={rank}
            username={username}
            setExtendedHover={props.setExtendedHover}
        />
    )
}
