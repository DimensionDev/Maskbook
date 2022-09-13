import { describe, expect, test } from 'vitest'
import { mixin } from '../../src/utils/mixin.js'

class ClassBase {
    public type = 'base'

    public getType() {
        return this.type
    }
}

class ClassA {
    public type = 'A'

    public getA() {
        return 'A'
    }
}

class ClassB {
    public type = 'B'

    public getB() {
        return 'B'
    }
}

class ClassC extends ClassBase {
    public override type = 'C'

    public getC() {
        return 'C'
    }
}

describe('mixin', () => {
    const target = { name: 'target' }
    const source1 = new ClassA()
    const source2 = new ClassB()
    const source3 = new ClassC()
    const result = mixin(target, source1, source2, source3)

    test('access properties on target', () => {
        expect(result.name).toBe('target')
    })

    test('access properties on rest source', () => {
        expect(result.type).toBe('A')
        expect(result.getA()).toBe('A')
        expect(result.getB()).toBe('B')
        expect(result.getC()).toBe('C')
    })

    test('access properties on parent of rest source', () => {
        expect(result.getType()).toBe('C')
    })

    test('should not recreate function when access again', () => {
        const fn1 = result.getA
        const fn2 = result.getA
        expect(fn1).toEqual(fn2)
    })
})
