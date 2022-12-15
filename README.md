<div align="center">
<img width="500" src="https://user-images.githubusercontent.com/4405263/207936683-26471a94-5b24-435b-a26c-c4803ad6399f.png" />
<h3 align="center">Zero-copy ASN.1 <=> DER encoding for the web 🏎️</h3>
</div>

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
