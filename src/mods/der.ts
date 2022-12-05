import { Binary } from "libs/binary/binary.js";
import { BitString } from "mods/triplets/bit_string/bit_string.js";
import { Boolean } from "mods/triplets/boolean/boolean.js";
import { Constructed } from "mods/triplets/constructed/constructed.js";
import { Integer } from "mods/triplets/integer/integer.js";
import { Null } from "mods/triplets/null/null.js";
import { ObjectIdentifier } from "mods/triplets/object_identifier/object_identifier.js";
import { OctetString } from "mods/triplets/octet_string/octet_string.js";
import { PrintableString } from "mods/triplets/printable_string/printable_string.js";
import { Sequence } from "mods/triplets/sequence/sequence.js";
import { Set } from "mods/triplets/set/set.js";
import { Unknown } from "mods/triplets/unknown/unknown.js";
import { UTCTime } from "mods/triplets/utc_time/utc_time.js";
import { UTF8String } from "mods/triplets/utf8_string/utf8_string.js";
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