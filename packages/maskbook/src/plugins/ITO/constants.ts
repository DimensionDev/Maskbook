export const ITO_MetaKey_1 = 'com.maskbook.ito:1'
export const ITO_MetaKey_2 = 'com.maskbook.ito:2'
export const ITO_PluginID = 'com.maskbook.ito'
export const ITO_EXCHANGE_RATION_MAX = 6
export const ITO_CONTRACT_BASE_TIMESTAMP = new Date('2021-03-29T00:00:00.000Z').getTime()

export const TIME_WAIT_BLOCKCHAIN = 30000
// Keccak-256(ifQualified(address)) XOR Keccak-256(logQualified(address,uint256))
export const QUALIFICATION_INTERFACE_ID = '0xfb036a85'
// Keccak-256(ifQualified(address,bytes32[])) XOR Keccak-256(logQualified(address,bytes32[]))
export const QUALIFICATION2_INTERFACE_ID = '0x6762aec5'
// Keccak-256(get_start_time())
export const QUALIFICATION_HAS_START_TIME_INTERFACE_ID = '0xdf29dfc4'
// Keccak-256(isLucky(address))
export const QUALIFICATION_HAS_LUCKY_INTERFACE_ID = '0xadaa0f8a'

export const MSG_DELIMITER = '2c1aca02'

// for estimate gas
export const FAKE_SIGN_PASSWORD = '0x75466cc969717b172b14253aaeebdc958f2b5037a852c1337650ed4978242dd9'
