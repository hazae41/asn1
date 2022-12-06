# Zero-copy ASN.1 <=> DER 🏎️

Zero-copy ASN.1 <=> DER in pure modern TypeScript

```bash
npm i @hazae41/asn1
```

[**Node Package 📦**](https://www.npmjs.com/package/@hazae41/asn1)

### Current features
- 100% TypeScript and ESM
- Zero-copy reading and writing
- DER decoding and encoding
- No external dependency
- Unit tested

### Usage

```typescript
const input = Buffer.from([0x01, 0x01, 0xFF])
const triplet = DER.fromBuffer(buffer)

console.log(triplet.toString()) // BOOLEAN true

const output = DER.toBuffer(triplet)
```