
export interface GetListingData {
    rank: number
    dayChange: number
    price: number
}

type PricePoint = {
    price: string
}

export interface GetAllListingsData {
    name: string
    rank: number
    dayChange: string
    latestPricePoint: PricePoint
}

export interface UIProps {
    setExtendedHover: Dispatch<SetStateAction<boolean>>
}
