import { expect } from 'vitest'
import { polyfill } from '@masknet/secp256k1-webcrypto/node'
import '../shared-base/node_modules/tiny-secp256k1'
import { testSerializer } from '../test-serializer/index.js'

expect.addSnapshotSerializer(testSerializer)

polyfill()
