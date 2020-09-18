import Web3 from 'web3'
import { OnlyRunInContext } from '@holoflows/kit/es'

OnlyRunInContext(['content', 'options'], 'web3')

// This is a none-provider client for constructing & deconstructing transactions in the content and options page.
// In the future, we can replace it by other libraries (maybe ethers.js)
export const web3 = new Web3()
