<div align="center">
<img src="https://user-images.githubusercontent.com/4405263/219944360-d138f86e-5517-4859-a532-1a6e45579074.png" />
</div>

```bash
npm i @hazae41/asn1
```

[**Node Package 📦**](https://www.npmjs.com/package/@hazae41/asn1)

## Features

### Current features
- 100% TypeScript and ESM
- No external dependency
- Zero-copy reading and writing
- Encoding agnostic (even though only DER is currently implemented)
- Almost all universal triplets
- Implicit and explicit tagged types

### [Upcoming features](https://github.com/sponsors/hazae41)
- More time types
- More string types
- More encodings

## Usage

```typescript
const input = new Uint8Array([0x01, 0x01, 0xFF])

const triplet = DER.fromBytes(input) // Boolean

console.log(triplet.toString()) // "BOOLEAN true"

const output = DER.toBytes(triplet) // Uint8Array
```
