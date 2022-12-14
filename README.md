<p align="center">
<img width="500"
src="https://user-images.githubusercontent.com/4405263/207622612-955730cd-e731-4b0c-8d72-e23bdc214988.png" />
</p>

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
