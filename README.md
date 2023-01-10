<div align="center">
<img width="500" src="https://user-images.githubusercontent.com/4405263/207936683-26471a94-5b24-435b-a26c-c4803ad6399f.png" />
</div>
<h3 align="center">
Zero-copy ASN.1 <=> DER encoding for the web 🏎️
</h3>

```bash
npm i @hazae41/asn1
```

[**Node Package 📦**](https://www.npmjs.com/package/@hazae41/asn1)

### Current features
- 100% TypeScript and ESM
- No external dependency
- Zero-copy DER encoding and decoding
- Almost all universal triplets
- Implicit and explicit tagged types

<<<<<<< HEAD
### [Upcoming features](https://github.com/sponsors/hazae41)
=======
### Upcoming features
- More time types
>>>>>>> 11587d4 (get rid of buffers)
- More string types 

### Usage

```typescript
const input = new Uint8Array([0x01, 0x01, 0xFF])

const triplet = DER.fromBytes(input) // Boolean

console.log(triplet.toString()) // "BOOLEAN true"

const output = DER.toBytes(triplet) // Uint8Array
```
