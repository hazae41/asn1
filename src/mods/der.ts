import { Binary } from "libs/binary/binary.js";
import { BitString } from "mods/bit_string/bit_string.js";
import { Boolean } from "mods/boolean/boolean.js";
import { Constructed } from "mods/constructed/constructed.js";
import { Integer } from "mods/integer/integer.js";
import { Null } from "mods/null/null.js";
import { ObjectIdentifier } from "mods/object_identifier/object_identifier.js";
import { OctetString } from "mods/octet_string/octet_string.js";
import { PrintableString } from "mods/printable_string/printable_string.js";
import { Sequence } from "mods/sequence/sequence.js";
import { Set } from "mods/set/set.js";
import { Type } from "mods/type/type.js";
import { ToStringable } from "mods/types.js";
import { Unknown } from "mods/unknown/unknown.js";
import { UTCTime } from "mods/utc_time/utc_time.js";
import { UTF8String } from "mods/utf8_string/utf8_string.js";

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