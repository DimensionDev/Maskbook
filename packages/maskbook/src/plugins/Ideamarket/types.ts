
export interface getListingData {
    rank: number
    dayChange: number
    price: number
}

type pricePoint = {
    price: string
}

export interface getAllListingsData {
    name: string
    rank: number
    dayChange: string
    latestPricePoint: pricePoint
}

export interface UIProps {
    setExtendedHover: Dispatch<SetStateAction<boolean>>
}
