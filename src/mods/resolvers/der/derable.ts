export interface DERable<T> {
  toDER(): T
}

export namespace DERable {

  export type From<T> = T extends DERable<infer U> ? U : never

  export type AllFrom<T extends readonly unknown[]> = {
    readonly [Index in keyof T]: From<T[Index]>
  }

}