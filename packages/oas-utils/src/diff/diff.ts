import microdiff from 'microdiff'

export function diffSpec(a: object, b: object) {
  return microdiff(a, b)
}
