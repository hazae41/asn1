import { Cursor, Preparable, Readable } from "@hazae41/binary";
import { BitString } from "mods/triplets/bit_string/bit_string.js";
import { Boolean } from "mods/triplets/boolean/boolean.js";
import { Constructed } from "mods/triplets/constructed/constructed.js";
import { IA5String } from "mods/triplets/ia5_string/ia5_string.js";
import { Integer } from "mods/triplets/integer/integer.js";
import { Null } from "mods/triplets/null/null.js";
import { ObjectIdentifier } from "mods/triplets/object_identifier/object_identifier.js";
import { OctetString } from "mods/triplets/octet_string/octet_string.js";
import { Opaque } from "mods/triplets/opaque/opaque.js";
import { PrintableString } from "mods/triplets/printable_string/printable_string.js";
import { Sequence } from "mods/triplets/sequence/sequence.js";
import { Set } from "mods/triplets/set/set.js";
import { Triplet } from "mods/triplets/triplet.js";
import { UTCTime } from "mods/triplets/utc_time/utc_time.js";
import { UTF8String } from "mods/triplets/utf8_string/utf8_string.js";
import { Type } from "mods/type/type.js";

export namespace DER {

  function resolve(opaque: Opaque): Triplet {
    if (opaque.type.equals(Boolean.type))
      return opaque.into(Boolean.DER)
    if (opaque.type.equals(Integer.type))
      return opaque.into(Integer.DER)
    if (opaque.type.equals(BitString.type))
      return opaque.into(BitString.DER)
    if (opaque.type.equals(OctetString.type))
      return opaque.into(OctetString.DER)
    if (opaque.type.equals(Null.type))
      return opaque.into(Null.DER)
    if (opaque.type.equals(ObjectIdentifier.type))
      return opaque.into(ObjectIdentifier.DER)
    if (opaque.type.equals(UTF8String.type))
      return opaque.into(UTF8String.DER)
    if (opaque.type.equals(PrintableString.type))
      return opaque.into(PrintableString.DER)
    if (opaque.type.equals(Sequence.type))
      return resolveSequence(opaque.into(Sequence.DER))
    if (opaque.type.equals(Set.type))
      return resolveSet(opaque.into(Set.DER))
    if (opaque.type.equals(IA5String.type))
      return opaque.into(IA5String.DER)
    if (opaque.type.equals(UTCTime.type))
      return opaque.into(UTCTime.DER)

    if (opaque.type.clazz === Type.clazzes.UNIVERSAL)
      throw new Error(`Unknown UNIVERSAL type ${opaque.type.DER.byte}`)

    if (opaque.type.wrap === Type.wraps.CONSTRUCTED)
      return resolveConstructed(opaque.into(Constructed.DER))

    return opaque
  }

  function resolveSequence(sequence: Sequence<Opaque>) {
    const { type, triplets } = sequence

    return new Sequence(type, triplets.map(resolve))
  }

  function resolveSet(set: Set<Opaque>) {
    const { type, triplets } = set

    return new Set(type, triplets.map(resolve))
  }

  function resolveConstructed(constructed: Constructed<Opaque>) {
    const { type, triplets } = constructed

    return new Constructed(type, triplets.map(resolve))
  }

  export function read(cursor: Cursor): Triplet {
    const opaque = Opaque.DER.read(cursor)

    return resolve(opaque)
  }

  export function fromBytes(bytes: Uint8Array) {
    return Readable.fromBytes(DER, bytes)
  }

  export function toBytes(triplet: Triplet) {
    return Preparable.toBytes(triplet.DER)
  }

  export function tryRead(cursor: Cursor) {
    return Readable.tryRead(DER, cursor)
  }

  export function tryFromBytes(bytes: Uint8Array) {
    return Readable.tryFromBytes(DER, bytes)
  }
}