// Not allow 0000.1, 000100
export const NUMERIC_INPUT_REGEXP_PATTERN = '^[1-9]|^0(?![0-9])[.,]?[0-9]*$'

export const UNIT_TEST_ADDRESS = '0x732b8e42455f79F3072fe18222A7E926588B4747'
export const UNIT_TEST_ERC20_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

export const EMPTY_LIST = Object.freeze([]) as never[]
export const EMPTY_OBJECT = Object.freeze({}) as Record<string, never>
