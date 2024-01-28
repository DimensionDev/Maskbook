import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { getPostPayload } from '../helpers/getPostPayload.js'

export function usePostPayload() {
    const location = useLocation()
    return useMemo(getPostPayload, [location])
}
