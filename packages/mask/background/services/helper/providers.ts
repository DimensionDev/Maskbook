import { NextIDProofAPI } from '@masknet/web3-providers'

const NextIDProof = new NextIDProofAPI()

export const bindProof = NextIDProof.bindProof
export const queryIsBound = NextIDProof.queryIsBound
export const createPersonaPayload = NextIDProof.createPersonaPayload
export const queryExistedBindingByPersona = NextIDProof.queryExistedBindingByPersona
export const queryExistedBindingByPlatform = NextIDProof.queryExistedBindingByPlatform
