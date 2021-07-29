import { useEffect, useState } from 'react'
import { useWeb3 } from './useWeb3'

export function useResolveEns(name: string) {
    const web3 = useWeb3()
    const [address, setAddress] = useState('')

    useEffect(() => {
        web3.eth.ens.getAddress(name, (_: Error, value: string) => {
            setAddress(value)
        })
    }, [name])

    return address
}
