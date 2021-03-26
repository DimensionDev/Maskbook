import type { SetState } from 'immer/dist/internal'

export interface getListingData {
    rank: number
    dayChange: number
    price: number
}

export interface ListingProps {
    username: string
    setExtendedHover: Dispatch<SetStateAction<boolean>>
}

export interface UIProps {
    setExtendedHover: Dispatch<SetStateAction<boolean>>
}
