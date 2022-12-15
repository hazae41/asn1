import { Binary } from "@hazae41/binary";
import { BitString } from "mods/triplets/bit_string/bit_string.js";
import { Boolean } from "mods/triplets/boolean/boolean.js";
import { Constructed } from "mods/triplets/constructed/constructed.js";
import { IA5String } from "mods/triplets/ia5_string/ia5_string.js";
import { Integer } from "mods/triplets/integer/integer.js";
import { Null } from "mods/triplets/null/null.js";
import { ObjectIdentifier } from "mods/triplets/object_identifier/object_identifier.js";
import { OctetString } from "mods/triplets/octet_string/octet_string.js";
import { PrintableString } from "mods/triplets/printable_string/printable_string.js";
import { Sequence } from "mods/triplets/sequence/sequence.js";
import { Set } from "mods/triplets/set/set.js";
import { Triplet } from "mods/triplets/triplet.js";
import { Unknown } from "mods/triplets/unknown/unknown.js";
import { UTCTime } from "mods/triplets/utc_time/utc_time.js";
import { UTF8String } from "mods/triplets/utf8_string/utf8_string.js";
import { Type } from "mods/type/type.js";

export namespace DER {

  export function size(triplet: Triplet) {
    return triplet.size()
  }

  export function write(binary: Binary, triplet: Triplet) {
    triplet.write(binary)
  }

  export function read(binary: Binary): Triplet {
    const start = binary.offset
    const type = Type.read(binary)
    binary.offset = start

    if (type.equals(Boolean.type))
      return Boolean.read(binary)
    if (type.equals(Integer.type))
      return Integer.read(binary)
    if (type.equals(BitString.type))
      return BitString.read(binary)
    if (type.equals(OctetString.type))
      return OctetString.read(binary)
    if (type.equals(Null.type))
      return Null.read(binary)
    if (type.equals(ObjectIdentifier.type))
      return ObjectIdentifier.read(binary)
    if (type.equals(UTF8String.type))
      return UTF8String.read(binary)
    if (type.equals(PrintableString.type))
      return PrintableString.read(binary)
    if (type.equals(Sequence.type))
      return Sequence.read(binary, read)
    if (type.equals(Set.type))
      return Set.read(binary, read)
    if (type.equals(IA5String.type))
      return IA5String.read(binary)
    if (type.equals(UTCTime.type))
      return UTCTime.read(binary)

    if (type.clazz === Type.clazzes.UNIVERSAL)
      throw new Error(`Unknown UNIVERSAL type ${type.tag}`)

    if (type.wrap === Type.wraps.CONSTRUCTED)
      return Constructed.read(binary, read)
    return Unknown.read(binary)
  }

  export function fromBuffer(buffer: Buffer) {
    return read(new Binary(buffer))
  }

  export function toBuffer(triplet: Triplet) {
    const binary = Binary.allocUnsafe(size(triplet))
    write(binary, triplet)
    return binary.buffer
  }
}