/// <reference types="node" />
import BN from "bn.js";
export declare class Numberu32 extends BN {
    /**
     * Convert to Buffer representation
     */
    toBuffer(): Buffer;
    /**
     * Construct a Numberu64 from Buffer representation
     */
    static fromBuffer(buffer: any): BN;
}
export declare class Numberu64 extends BN {
    /**
     * Convert to Buffer representation
     */
    toBuffer(): Buffer;
    /**
     * Construct a Numberu64 from Buffer representation
     */
    static fromBuffer(buffer: any): BN;
}
