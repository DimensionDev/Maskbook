'use strict'

import Services from "../service";
import { createCredentialsContainer } from "@dimensiondev/mask-webauthn/api";

const { get, create } = createCredentialsContainer({
    publicKeyAuthenticator: {
        create(...args: any[]) {
            console.log('create start', ...args)
            return Services.WebAuthn.create(...args)
        },
        get(...args: any[]) {
            console.log('get start', ...args)
            return Services.WebAuthn.get(...args)
        }
    }
})

Object.defineProperty(globalThis, 'maskwebauthn', {
    value: Object.freeze({
        create,
        get
    }),
    writable: false,
})
