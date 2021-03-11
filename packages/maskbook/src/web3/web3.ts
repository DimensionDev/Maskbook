import { ethers } from 'ethers'
import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'

assertEnvironment(Environment.HasBrowserAPI)

// Only for constructing & deconstructing transactions in the content and options page.
export const nonFunctionalProvider = new ethers.providers.JsonRpcProvider()
export const nonFunctionalSigner = nonFunctionalProvider.getSigner()
