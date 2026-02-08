import protobuf from "protobufjs/minimal.js";

const { Writer, Reader } = protobuf;

class Protobuf {
	constructor() {}

	encode(obj) {
		const writer = Writer.create();
		for (const tag of Object.keys(obj).map(Number)) {
			const value = obj[tag];
			this._encode(writer, tag, value);
		}
		return writer.finish();
	}

	_encode(writer, tag, value) {
		switch (typeof value) {
			case "undefined":
				break;
			case "number":
				writer.uint32((tag << 3) | 0).int32(value);
				break;
			case "bigint":
				writer.uint32((tag << 3) | 0).int64(value.toString());
				break;
			case "string":
				writer.uint32((tag << 3) | 2).string(value);
				break;
			case "boolean":
				writer.uint32((tag << 3) | 0).bool(value);
				break;
			case "object":
				if (value instanceof Uint8Array) {
					writer.uint32((tag << 3) | 2).bytes(value);
				} else if (Array.isArray(value)) {
					value.forEach((item) => this._encode(writer, tag, item));
				} else if (value === null) {
					break;
				} else {
					const nestedBuffer = this.encode(value);
					writer.uint32((tag << 3) | 2).bytes(nestedBuffer);
				}
				break;
			default:
				throw new Error("Unsupported type: " + (value && typeof value));
		}
	}

	decode(buffer) {
		if (typeof buffer === "string") {
			buffer = this.hexToBytes(buffer);
		}

		const result = {};
		const reader = Reader.create(buffer);

		while (reader.pos < reader.len) {
			const k = reader.uint32();
			const tag = k >> 3,
				type = k & 0b111;

			let value;

			switch (type) {
				case 0:
					value = this.long2int(reader.int64());
					break;
				case 1:
					value = this.long2int(reader.fixed64());
					break;
				case 2:
					value = reader.bytes();
					try {
						value = this.decode(value);
					} catch {
						try {
							const decoded = new TextDecoder().decode(value);
							const reEncoded = new TextEncoder().encode(decoded);
							if (reEncoded.length === value.length) {
								value = decoded;
							}
						} catch {
							// ignore
						}
					}
					break;
				case 5:
					value = reader.fixed32();
					break;
				default:
					throw new Error("Unsupported wire type: " + type);
			}

			if (Array.isArray(result[tag])) {
				result[tag].push(value);
			} else if (result[tag] !== undefined) {
				result[tag] = [result[tag], value];
			} else {
				result[tag] = value;
			}
		}
		return result;
	}

	hexToBytes(hex) {
		const bytes = new Uint8Array(hex.length / 2);
		for (let i = 0; i < bytes.length; i++) {
			bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
		}
		return bytes;
	}

	long2int(long) {
		if (long == null) return 0;

		// 如果已经是 number
		if (typeof long === "number") {
			return long;
		}

		// 如果是 bigint
		if (typeof long === "bigint") {
			const num = Number(long);
			return Number.isSafeInteger(num) ? num : long;
		}

		// 如果是字符串
		if (typeof long === "string") {
			const bigint = BigInt(long);
			const num = Number(bigint);
			return Number.isSafeInteger(num) ? num : bigint;
		}

		// 如果是 protobuf long 对象
		if (
			typeof long === "object" &&
			long.low !== undefined &&
			long.high !== undefined
		) {
			if (long.high === 0) return long.low >>> 0;

			const bigint =
				(BigInt(long.high) << 32n) | (BigInt(long.low) & 0xffffffffn);

			const num = Number(bigint);
			return Number.isSafeInteger(num) ? num : bigint;
		}

		// fallback
		return 0;
	}
}

export default new Protobuf();
