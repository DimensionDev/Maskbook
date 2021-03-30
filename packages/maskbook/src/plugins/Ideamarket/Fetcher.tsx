import { useAsync } from 'react-use'
import { getListing } from './api'
import LogoButton from './UI/LogoButton'

interface FetcherProps {
    username: string
}

export default function Fetcher(props: FetcherProps) {
    const response = useAsync(() => getListing(props.username), [props.username])

    if (response.loading) return <LogoButton found={false} username={props.username} />

    if (response.error || !response.value?.rank) return <LogoButton found={false} username={props.username} />

    return (
        <LogoButton
            found={true}
            username={props.username}
            rank={response.value?.rank}
            dayChange={response.value?.dayChange.toString()}
            price={response.value?.price.toString()}
        />
    )
}
