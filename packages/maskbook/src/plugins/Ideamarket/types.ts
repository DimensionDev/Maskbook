import type { Dispatch, SetStateAction } from 'react'

export interface GetListingData {
    rank: number
    dayChange: number
    price: number
}
export interface UIProps {
    setExtendedHover: Dispatch<SetStateAction<boolean>>
}
