import { Cursor } from "@hazae41/cursor";
import { Opaque } from "mods/triplets/opaque/opaque.js";

export namespace DER {

  export function readOrThrow(cursor: Cursor) {
    Opaque.DER.readOrThrow(cursor).resolveOrThrow()
  }

  // export function tryResolve(opaque: Opaque): Result<Triplet, DERReadError> {
  //   if (opaque.type.equals(Boolean.type))
  //     return opaque.tryReadInto(Boolean.DER)
  //   if (opaque.type.equals(Integer.type))
  //     return opaque.tryReadInto(Integer.DER)
  //   if (opaque.type.equals(BitString.type))
  //     return opaque.tryReadInto(BitString.DER)
  //   if (opaque.type.equals(OctetString.type))
  //     return opaque.tryReadInto(OctetString.DER)
  //   if (opaque.type.equals(Null.type))
  //     return opaque.tryReadInto(Null.DER)
  //   if (opaque.type.equals(ObjectIdentifier.type))
  //     return opaque.tryReadInto(ObjectIdentifier.DER)
  //   if (opaque.type.equals(UTF8String.type))
  //     return opaque.tryReadInto(UTF8String.DER)
  //   if (opaque.type.equals(PrintableString.type))
  //     return opaque.tryReadInto(PrintableString.DER)
  //   if (opaque.type.equals(Sequence.type))
  //     return opaque.tryReadInto(Sequence.DER).andThenSync(it => Sequence.tryResolve(it, DER))
  //   if (opaque.type.equals(Set.type))
  //     return opaque.tryReadInto(Set.DER).andThenSync(it => Set.tryResolve(it, DER))
  //   if (opaque.type.equals(IA5String.type))
  //     return opaque.tryReadInto(IA5String.DER)
  //   if (opaque.type.equals(UTCTime.type))
  //     return opaque.tryReadInto(UTCTime.DER)

  //   if (opaque.type.wrap === Type.wraps.CONSTRUCTED)
  //     return opaque.tryReadInto(Constructed.DER).andThenSync(it => Constructed.tryResolve(it, DER))

  //   return new Ok(opaque)
  // }

}