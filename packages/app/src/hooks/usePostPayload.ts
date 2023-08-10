import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getPostPayload } from '../helpers/getPostPayload.js'

// Custom hook to execute getPostPayload when location changes
export function usePostPayload() {
    const location = useLocation()
    const [payload, setPayload] = useState(getPostPayload())

    useEffect(() => {
        setPayload(getPostPayload())
    }, [location])

    // Return the getPostPayload function itself (if needed)
    return payload
}
