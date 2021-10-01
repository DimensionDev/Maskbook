import BigNumber from 'bignumber.js'
import { useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { createContainer } from 'unstated-next'
import { BoxInfo, BoxState } from '../type'

const ZERO_ADDRESS = ''

function useContext(initialState?: { boxId: string }) {
    const now = new Date()

    const [boxId, setBoxId] = useState(initialState?.boxId ?? '')

    const boxInfoResult = useAsyncRetry<BoxInfo>(async () => {
        const info = {
            boxId,
            creator: '',
            name: 'Big Fat Sexy Mystery Box.',
            sellAll: false,
            personalLimit: '1',
            remaining: '10',
            total: '100',
            startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
            endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
            tokenIds: [],
            tokenIdsPurchased: [],
            payments: [],
            tokenAddress: '',
            heroImageURL:
                'https://lh3.googleusercontent.com/J734DD96jgdCHK95vKF1lb1sGn2qyxRIo2wF7pDYN3rEoQqZSBTHH2tRecaxgFCux-oIZcJAZSsVYY9xaGhSIZwpkQlh3R6YHf8w=w600',
            qualificationAddress: ZERO_ADDRESS,
        }
        return Promise.resolve(info)
    }, [boxId])

    const boxState = useMemo(() => {
        if (boxInfoResult.error) return BoxState.ERROR
        const { value: info, loading } = boxInfoResult
        if (loading) return BoxState.UNKNOWN
        if (!info) return BoxState.ERROR
        const now = new Date()
        if (new BigNumber(info.tokenIdsPurchased.length).isGreaterThanOrEqualTo(info.personalLimit))
            return BoxState.DRAWED_OUT
        if (new BigNumber(info.remaining).isLessThanOrEqualTo(0)) return BoxState.SOLD_OUT
        if (info.startAt > now) return BoxState.NOT_READY
        if (info.endAt < now) return BoxState.EXPIRED
        return BoxState.READY
    }, [boxInfoResult])

    return {
        boxId,
        setBoxId,

        boxState,

        boxInfoResult,
    }
}

export const Context = createContainer(useContext)
