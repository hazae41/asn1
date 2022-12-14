export * from "./length/length.test.js";
export * from "./triplets/index.test.js";
export * from "./type/type.test.js";
export * from "./variable_length_quantity/variable_length_quantity.test.js";

import { assert, test } from "@hazae41/phobos";
import { readFile } from "fs/promises";
import { Bytes } from "libs/bytes/bytes.js";
import { DER } from "mods/der.js";
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

    return Bytes.fromBase64(body)
  }
}

export namespace PKCS7 {
  export const header = `-----BEGIN PKCS7-----`
  export const footer = `-----END PKCS7-----`

  export function parse(text: string) {
    text = text.replaceAll(`\n`, ``)

    if (!text.startsWith(header))
      throw new Error(`Missing PEM header`)
    if (!text.endsWith(footer))
      throw new Error(`Missing PEM footer`)

    const body = text.slice(header.length, -footer.length)

    return Bytes.fromBase64(body)
  }
}

const directory = resolve("./dist/test/")
const { pathname } = new URL(import.meta.url)
console.log(relative(directory, pathname.replace(".cjs", ".ts")))

function compare(a: Uint8Array, b: Uint8Array) {
  return Bytes.toHex(a) === Bytes.toHex(b)
}

test("Cert Ed25519", async () => {
  const text = await readFile("./certs/ed25519.pem", "utf8")
  const triplet = DER.fromBytes(PEM.parse(text))

  assert(compare(PEM.parse(text), DER.toBytes(triplet)))
})

test("Cert Let's Encrypt", async () => {
  const text = await readFile("./certs/letsencrypt.pem", "utf8")
  const triplet = DER.fromBytes(PEM.parse(text))

  assert(compare(PEM.parse(text), DER.toBytes(triplet)))
})

test("Cert PKCS7", async () => {
  const text = await readFile("./certs/pkcs7.pem", "utf8")
  const triplet = DER.fromBytes(PKCS7.parse(text))

  assert(compare(PKCS7.parse(text), DER.toBytes(triplet)))
})

test("Cert frank4dd-rsa", async () => {
  const buffer = await readFile("./certs/frank4dd-rsa.der")
  const triplet = DER.fromBytes(buffer)

  assert(compare(buffer, DER.toBytes(triplet)))
})

test("Cert frank4dd-dsa", async () => {
  const buffer = await readFile("./certs/frank4dd-dsa.der")
  const triplet = DER.fromBytes(buffer)

  assert(compare(buffer, DER.toBytes(triplet)))
})

test("Cert Tor", async () => {
  const text = await readFile("./certs/tor.pem", "utf8")
  const buffer = Bytes.fromBase64(text)
  const triplet = DER.fromBytes(buffer)

  assert(compare(buffer, DER.toBytes(triplet)))
})

test("Cert Tor 2", async () => {
  const text = await readFile("./certs/tor2.pem", "utf8")
  const buffer = Bytes.fromBase64(text)
  const triplet = DER.fromBytes(buffer)

  assert(compare(buffer, DER.toBytes(triplet)))
})