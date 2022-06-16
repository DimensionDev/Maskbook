import { useEffect, useState } from 'react'

export function useMinRate(slippage: number, odd: number) {
    const [minRate, setMinOdds] = useState<string | number>(odd)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!odd || !slippage) return
        setLoading(true)
        const newMinRate = (1 + (((odd ?? 0) - 1) * (100 - slippage)) / 100).toFixed(8)
        setMinOdds(newMinRate)
        setLoading(false)
    }, [odd, slippage, setLoading])

    return { minRate, loading }
}
