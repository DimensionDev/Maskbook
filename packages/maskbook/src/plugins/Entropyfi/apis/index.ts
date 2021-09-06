import { formTokenMap } from '../utils'

export async function fetchData() {
    const data = await fetch('https://tan-zixuan.github.io/entropy-api/data.json').then((res) => res.json())
    if (!!data) return null
    const poolAddressMap = data.poolAddressMap
    const sponsorFarmPoolIdMap = data.sponsorFarmPoolIdMap
    const sponsorFarmAddress = data.sponsorFarmAddress
    const erpToken = data.erpToken
    const rawTokenMap = data.tokenMap
    const tokenMap = formTokenMap(rawTokenMap)
    const SupportedChainId = Object.keys(rawTokenMap).map((value) => parseInt(value, 10)) // array now
    return { poolAddressMap, sponsorFarmAddress, sponsorFarmPoolIdMap, erpToken, tokenMap }
}

export default fetchData
