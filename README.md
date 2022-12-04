# ASN.1 <=> DER

Zero-copy ASN.1 <=> DER encoding/decoding in pure modern TypeScript

```bash
npm i @hazae41/asn1
```

[**Node Package 📦**](https://www.npmjs.com/package/@hazae41/asn1)

### Current features
- 100% TypeScript and ESM
- Zero-copy reading and writing
- No dependency
- Unit tested
- DER decoding

### Upcoming features
- (WIP) DER encoding

### Usage

```typescript
const buffer = Buffer.from([0x01, 0x01, 0xFF])
const asn1 = DER.parse(new Binary(buffer))

console.log(asn1) // BOOLEAN true
```