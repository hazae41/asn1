import { Cursor } from "@hazae41/binary";
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

  export function read(cursor: Cursor): Triplet {
    const start = cursor.offset
    const type = Type.read(cursor)
    cursor.offset = start

    if (type.equals(Boolean.type))
      return Boolean.read(cursor)
    if (type.equals(Integer.type))
      return Integer.read(cursor)
    if (type.equals(BitString.type))
      return BitString.read(cursor)
    if (type.equals(OctetString.type))
      return OctetString.read(cursor)
    if (type.equals(Null.type))
      return Null.read(cursor)
    if (type.equals(ObjectIdentifier.type))
      return ObjectIdentifier.read(cursor)
    if (type.equals(UTF8String.type))
      return UTF8String.read(cursor)
    if (type.equals(PrintableString.type))
      return PrintableString.read(cursor)
    if (type.equals(Sequence.type))
      return Sequence.read(cursor, read)
    if (type.equals(Set.type))
      return Set.read(cursor, read)
    if (type.equals(IA5String.type))
      return IA5String.read(cursor)
    if (type.equals(UTCTime.type))
      return UTCTime.read(cursor)

    if (type.clazz === Type.clazzes.UNIVERSAL)
      throw new Error(`Unknown UNIVERSAL type ${type.tag}`)

    if (type.wrap === Type.wraps.CONSTRUCTED)
      return Constructed.read(cursor, read)
    return Unknown.read(cursor)
  }

  export function fromBytes(bytes: Uint8Array) {
    return read(new Cursor(bytes))
  }

  export function toBytes(triplet: Triplet) {
    const cursor = Cursor.allocUnsafe(triplet.size())
    triplet.write(cursor)
    return cursor.bytes
  }
}