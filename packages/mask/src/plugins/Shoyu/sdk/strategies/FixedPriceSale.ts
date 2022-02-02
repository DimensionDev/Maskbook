import { BigNumber, BigNumberish, BytesLike, utils } from "ethers";

class FixedPriceSale {
    static from(params: BytesLike) {
        const result = utils.defaultAbiCoder.decode(["uint256", "uint256"], params);
        return new FixedPriceSale(result[0], result[1]);
    }

    price: BigNumber;
    startedAt: BigNumber;

    constructor(price: BigNumberish, startedAt: BigNumberish) {
        this.price = BigNumber.from(price.toString());
        this.startedAt = BigNumber.from(startedAt.toString());
    }

    encode() {
        return utils.defaultAbiCoder.encode(["uint256", "uint256"], [this.price, this.startedAt]);
    }
}

export default FixedPriceSale;
