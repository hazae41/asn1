export * from "./length/length.test.js";
export * from "./triplets/index.test.js";
export * from "./type/type.test.js";
export * from "./variable_length_quantity/variable_length_quantity.test.js";

import { Base64 } from "@hazae41/base64";
import { assert, test } from "@hazae41/phobos";
import { Result } from "@hazae41/result";
import { readFile } from "fs/promises";
import { DER } from "mods/resolvers/der.js";
import { relative, resolve } from "node:path";

export namespace PEM {
  export const header = `-----BEGIN CERTIFICATE-----`
  export const footer = `-----END CERTIFICATE-----`

  export function parse(text: string) {
    text = text.replaceAll(`\n`, ``)

    if (!text.startsWith(header))
      throw new Error(`Missing PEM header`)
    if (!text.endsWith(footer))
      throw new Error(`Missing PEM footer`)

    const body = text.slice(header.length, -footer.length)

    return Base64.get().tryDecodePadded(body).unwrap().copyAndDispose()
  }
}

export namespace PKCS7 {
  export const header = `-----BEGIN PKCS7-----`
  export const footer = `-----END PKCS7-----`

  export function parse(text: string) {
    text = text.replaceAll(`\n`, ``)

    if (!text.startsWith(header))
      throw new Error(`Missing PKCS7 header`)
    if (!text.endsWith(footer))
      throw new Error(`Missing PKCS7 footer`)

    const body = text.slice(header.length, -footer.length)

    return Base64.get().tryDecodePadded(body).unwrap().copyAndDispose()
  }
}

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".mjs", ".ts")))

Result.debug = true

function compare(a: Uint8Array, b: Uint8Array) {
  return Buffer.from(a).equals(Buffer.from(b))
}

test("Cert Ed25519", async () => {
  const text = await readFile("./certs/ed25519.pem", "utf8")
  const triplet = DER.tryReadFromBytes(PEM.parse(text)).unwrap()

  assert(compare(PEM.parse(text), DER.tryWriteToBytes(triplet).unwrap()))
})

test("Cert Let's Encrypt", async () => {
  const text = await readFile("./certs/letsencrypt.pem", "utf8")
  const triplet = DER.tryReadFromBytes(PEM.parse(text)).unwrap()

  assert(compare(PEM.parse(text), DER.tryWriteToBytes(triplet).unwrap()))
})

test("Cert PKCS7", async () => {
  const text = await readFile("./certs/pkcs7.pem", "utf8")
  const triplet = DER.tryReadFromBytes(PKCS7.parse(text)).unwrap()

  assert(compare(PKCS7.parse(text), DER.tryWriteToBytes(triplet).unwrap()))
})

test("Cert frank4dd-rsa", async () => {
  const buffer = await readFile("./certs/frank4dd-rsa.der")
  const triplet = DER.tryReadFromBytes(buffer).unwrap()

  assert(compare(buffer, DER.tryWriteToBytes(triplet).unwrap()))
})

test("Cert frank4dd-dsa", async () => {
  const buffer = await readFile("./certs/frank4dd-dsa.der")
  const triplet = DER.tryReadFromBytes(buffer).unwrap()

  assert(compare(buffer, DER.tryWriteToBytes(triplet).unwrap()))
})

test("Cert Tor", async () => {
  const text = await readFile("./certs/tor.pem", "utf8")
  const buffer = Base64.get().tryDecodePadded(text).unwrap().copyAndDispose()
  const triplet = DER.tryReadFromBytes(buffer).unwrap()

  assert(compare(buffer, DER.tryWriteToBytes(triplet).unwrap()))
})

test("Cert Tor 2", async () => {
  const text = await readFile("./certs/tor2.pem", "utf8")
  const buffer = Base64.get().tryDecodePadded(text).unwrap().copyAndDispose()
  const triplet = DER.tryReadFromBytes(buffer).unwrap()

  assert(compare(buffer, DER.tryWriteToBytes(triplet).unwrap()))
})