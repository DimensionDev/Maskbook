import Web3 from 'web3'
import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'

assertEnvironment(Environment.HasBrowserAPI)
// This is a none-provider client for constructing & deconstructing transactions in the content and options page.
// In the future, we can replace it by other libraries (maybe ethers.js)
export const nonFunctionalWeb3 = new Web3()
