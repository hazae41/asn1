import { CursorReadLengthUnderflowError, CursorWriteLenghtUnderflowError, Readable, Writable } from "@hazae41/binary";
import { Bytes } from "@hazae41/bytes";
import { Cursor, CursorReadUnknownError } from "@hazae41/cursor";
import { Ok, Result } from "@hazae41/result";
import { InvalidLengthError, Unimplemented } from "mods/errors/errors.js";
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
import { DERTriplet, DERWritable, Triplet } from "mods/triplets/triplet.js";
import { UTCTime } from "mods/triplets/utc_time/utc_time.js";
import { UTF8String } from "mods/triplets/utf8_string/utf8_string.js";
import { Type } from "mods/type/type.js";

export namespace DER {

  export function tryResolve(opaque: Opaque): Result<Triplet, CursorReadUnknownError | Unimplemented | InvalidLengthError> {
    if (opaque.type.equals(Boolean.type))
      return opaque.tryInto(Boolean.DER)
    if (opaque.type.equals(Integer.type))
      return opaque.tryInto(Integer.DER)
    if (opaque.type.equals(BitString.type))
      return opaque.tryInto(BitString.DER)
    if (opaque.type.equals(OctetString.type))
      return opaque.tryInto(OctetString.DER)
    if (opaque.type.equals(Null.type))
      return opaque.tryInto(Null.DER)
    if (opaque.type.equals(ObjectIdentifier.type))
      return opaque.tryInto(ObjectIdentifier.DER)
    if (opaque.type.equals(UTF8String.type))
      return opaque.tryInto(UTF8String.DER)
    if (opaque.type.equals(PrintableString.type))
      return opaque.tryInto(PrintableString.DER)
    if (opaque.type.equals(Sequence.type))
      return opaque.tryInto(Sequence.DER).andThenSync(it => Sequence.tryResolve(it, DER))
    if (opaque.type.equals(Set.type))
      return opaque.tryInto(Set.DER).andThenSync(it => Set.tryResolve(it, DER))
    if (opaque.type.equals(IA5String.type))
      return opaque.tryInto(IA5String.DER)
    if (opaque.type.equals(UTCTime.type))
      return opaque.tryInto(UTCTime.DER)

    if (opaque.type.wrap === Type.wraps.CONSTRUCTED)
      return opaque.tryInto(Constructed.DER).andThenSync(it => Constructed.tryResolve(it, DER))

    return new Ok(opaque)
  }

  export function tryRead(cursor: Cursor): Result<Triplet, CursorReadUnknownError | Unimplemented | InvalidLengthError> {
    return Opaque.DER.tryRead(cursor).andThenSync(tryResolve)
  }

  export function tryReadOrRollback(cursor: Cursor): Result<Triplet, CursorReadUnknownError | Unimplemented | InvalidLengthError> {
    return Readable.tryReadOrRollback(DER, cursor)
  }

  export function tryReadFromBytes(bytes: Bytes): Result<Triplet, CursorReadUnknownError | Unimplemented | InvalidLengthError | CursorReadLengthUnderflowError> {
    return Readable.tryReadFromBytes(DER, bytes)
  }

  export function tryWriteToBytes<D extends DERWritable>(triplet: DERTriplet<D>): Result<Bytes, Writable.SizeError<D> | Writable.WriteError<D> | CursorWriteLenghtUnderflowError> {
    return Writable.tryWriteToBytes(triplet.toDER())
  }

}