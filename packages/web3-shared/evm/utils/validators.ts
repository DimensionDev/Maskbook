/**
 * @packageDocumentation
 * @module harmony-utils
 */

export const isKeyString = (keyString: string, lengh: number): boolean => {
  return !!keyString.replace("0x", "").match(`^[0-9a-fA-F]{${lengh}}$`);
};
isKeyString.validator = "isKeyString";

export const isAddress = (address: string): boolean => {
  return isKeyString(address, 40);
};
isAddress.validator = "isAddress";

export const isPrivateKey = (privateKey: string): boolean => {
  return isKeyString(privateKey, 64);
};
isPrivateKey.validator = "isPrivateKey";

export const isPublicKey = (publicKey: string): boolean => {
  return isKeyString(publicKey, 66);
};
isPublicKey.validator = "isPublicKey";

export const isHash = (hash: string): boolean => {
  return isKeyString(hash, 64);
};
isHash.validator = "isHash";

/**
 * [isNumber verify param is a Number]
 * @param  {any}  obj [value]
 * @return {Boolean}     [boolean]
 */
export const isNumber = (obj: any): boolean => {
  return obj === +obj;
};
isNumber.validator = "isNumber";

/**
 * [isNumber verify param is a Number]
 * @param  {any}  obj [value]
 * @return {boolean}     [boolean]
 */
export const isInt = (obj: any): boolean => {
  return isNumber(obj) && Number.isInteger(obj);
};

isInt.validator = "isInt";

/**
 * [isString verify param is a String]
 * @param  {any}  obj [value]
 * @return {Boolean}     [boolean]
 */
export const isString = (obj: any): boolean => {
  return obj === `${obj}`;
};

isString.validator = "isString";
/**
 * [isBoolean verify param is a Boolean]
 * @param  {any}  obj [value]
 * @return {Boolean}     [boolean]
 */
export const isBoolean = (obj: any): boolean => {
  return obj === !!obj;
};

isBoolean.validator = "isBoolean";
/**
 * [isArray verify param input is an Array]
 * @param  {any}  obj [value]
 * @return {Boolean}     [boolean]
 */
export const isArray = (obj: any): boolean => {
  return Array.isArray(obj);
};

isArray.validator = "isArray";
/**
 * [isJson verify param input is a Json]
 * @param  {any}  obj [value]
 * @return {Boolean}     [boolean]
 */
export const isJsonString = (obj: any): boolean => {
  try {
    return !!JSON.parse(obj) && isObject(JSON.parse(obj));
  } catch (e) {
    return false;
  }
};
isJsonString.validator = "isJsonString";

/**
 * [isObject verify param is an Object]
 * @param  {any}  obj [value]
 * @return {Boolean}     [boolean]
 */
export const isObject = (obj: any): boolean => {
  return obj !== null && !Array.isArray(obj) && typeof obj === "object";
};
isObject.validator = "isObject";

/**
 * [isFunction verify param is a Function]
 * @param  {any}  obj [value]
 * @return {Boolean}     [description]
 */

export const isFunction = (obj: any): boolean => {
  return typeof obj === "function";
};
isFunction.validator = "isFunction";

export const isHex = (obj: any): boolean => {
  if (!isString(obj)) {
    throw new Error(`${obj} is not string`);
  }
  return (
    (obj.startsWith("0x") || obj.startsWith("-0x")) &&
    isNumber(Number.parseInt(`${obj}`.toLowerCase().replace("0x", ""), 16))
  );
};

isHex.validator = "isHex";

export const isHttp = (obj: any): boolean => {
  if (!isString(obj)) {
    throw new Error(`${obj} is not valid url`);
  } else {
    return obj.startsWith("http://") || obj.startsWith("https://");
  }
};
isHttp.validator = "isHttp";

export const isWs = (obj: any): boolean => {
  if (!isString(obj)) {
    throw new Error(`${obj} is not valid url`);
  } else {
    return obj.startsWith("ws://") || obj.startsWith("wss://");
  }
};
isWs.validator = "isWs";

export enum DefaultBlockParams {
  earliest = "earliest",
  pending = "pending",
  latest = "latest",
}

export const isBlockNumber = (obj: any): boolean => {
  const blockParams = [
    DefaultBlockParams.earliest,
    DefaultBlockParams.pending,
    DefaultBlockParams.latest,
  ];

  if (!isString(obj)) {
    throw new Error(`${obj} is not valid blockNumber`);
  }

  return isHex(obj) || blockParams.some((val) => val === obj);
};
isBlockNumber.validator = "isBlockNumber";

export const isBech32Address = (raw: string): boolean => {
  return !!raw.match(/^one1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38}/);
};
isBech32Address.validator = "isBech32Address";

export const isBech32TestNetAddress = (raw: string): boolean => {
  return !!raw.match(/^tone1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{38}/);
};
isBech32TestNetAddress.validator = "isBech32TestNetAddress";

export const isValidAddress = (address: string): boolean => {
  if (!isString(address)) {
    throw new Error(`${address} is not string`);
  }
  if (
    isAddress(address) ||
    isBech32Address(address) ||
    isBech32TestNetAddress(address)
  ) {
    return true;
  } else {
    return false;
  }
};
isValidAddress.validator = "isValidAddress";
