export * from "./length/length.test.js";
export * from "./triplets/index.test.js";
export * from "./type/type.test.js";
export * from "./variable_length_quantity/variable_length_quantity.test.js";

import { readFile } from "fs/promises";
import { assert } from "libs/assert/assert.js";
import { DER } from "mods/der.js";
import { relative, resolve } from "node:path";
import { test } from "uvu";

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

    return Buffer.from(body, "base64")
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

    return Buffer.from(body, "base64")
  }
}

test.before(async () => {
  const directory = resolve("./dist/test/")
  const { pathname } = new URL(import.meta.url)
  console.log(relative(directory, pathname.replace(".cjs", ".ts")))
})

test("Cert Ed25519", async () => {
  const text = await readFile("./test/ed25519.pem", "utf8")
  const triplet = DER.fromBuffer(PEM.parse(text))

  assert(PEM.parse(text).toString("hex") === DER.toBuffer(triplet).toString("hex"))
})

test("Cert Let's Encrypt", async () => {
  const text = await readFile("./test/letsencrypt.pem", "utf8")
  const triplet = DER.fromBuffer(PEM.parse(text))

  assert(PEM.parse(text).toString("hex") === DER.toBuffer(triplet).toString("hex"))
})

test("Cert PKCS7", async () => {
  const text = await readFile("./test/pkcs7.pem", "utf8")
  const triplet = DER.fromBuffer(PKCS7.parse(text))

  assert(PKCS7.parse(text).toString("hex") === DER.toBuffer(triplet).toString("hex"))
})

test("Cert frank4dd-rsa", async () => {
  const buffer = await readFile("./test/frank4dd-rsa.der")
  const triplet = DER.fromBuffer(buffer)

  assert(buffer.toString("hex") === DER.toBuffer(triplet).toString("hex"))
})

test("Cert frank4dd-dsa", async () => {
  const buffer = await readFile("./test/frank4dd-dsa.der")
  const triplet = DER.fromBuffer(buffer)

  assert(buffer.toString("hex") === DER.toBuffer(triplet).toString("hex"))
})

test.run()