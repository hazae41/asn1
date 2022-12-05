import { Binary } from "libs/binary/binary.js";
import { BitString } from "mods/tuples/bit_string/bit_string.js";
import { Boolean } from "mods/tuples/boolean/boolean.js";
import { Constructed } from "mods/tuples/constructed/constructed.js";
import { Integer } from "mods/tuples/integer/integer.js";
import { Null } from "mods/tuples/null/null.js";
import { ObjectIdentifier } from "mods/tuples/object_identifier/object_identifier.js";
import { OctetString } from "mods/tuples/octet_string/octet_string.js";
import { PrintableString } from "mods/tuples/printable_string/printable_string.js";
import { Sequence } from "mods/tuples/sequence/sequence.js";
import { Set } from "mods/tuples/set/set.js";
import { Unknown } from "mods/tuples/unknown/unknown.js";
import { UTCTime } from "mods/tuples/utc_time/utc_time.js";
import { UTF8String } from "mods/tuples/utf8_string/utf8_string.js";
import { Type } from "mods/type/type.js";
import { ToStringable } from "mods/types.js";

export namespace DER {

  export function parse(binary: Binary): ToStringable {
    const start = binary.offset
    const type = Type.fromDER(binary)
    binary.offset = start

    if (type.equals(Boolean.type))
      return Boolean.fromDER(binary)
    if (type.equals(Integer.type))
      return Integer.fromDER(binary)
    if (type.equals(BitString.type))
      return BitString.fromDER(binary)
    if (type.equals(OctetString.type))
      return OctetString.fromDER(binary)
    if (type.equals(Null.type))
      return Null.fromDER(binary)
    if (type.equals(ObjectIdentifier.type))
      return ObjectIdentifier.fromDER(binary)
    if (type.equals(UTF8String.type))
      return UTF8String.fromDER(binary)
    if (type.equals(PrintableString.type))
      return PrintableString.fromDER(binary)
    if (type.equals(Sequence.type))
      return Sequence.fromDER(binary, parse)
    if (type.equals(Set.type))
      return Set.fromDER(binary, parse)
    if (type.equals(UTCTime.type))
      return UTCTime.fromDER(binary)

    if (type.clazz === Type.clazzes.UNIVERSAL)
      throw new Error(`Unknown UNIVERSAL type`)

    if (type.wrap === Type.wraps.CONSTRUCTED)
      return Constructed.fromDER(binary, parse)
    return Unknown.fromDER(binary)
  }

}