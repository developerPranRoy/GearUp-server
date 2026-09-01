/**
 * Picks a subset of keys from an object. Safe against prototype pollution —
 * uses Object.prototype.hasOwnProperty rather than obj.hasOwnProperty so
 * it works even if `obj` has a null prototype.
 */
const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Partial<T> => {
  const result: Partial<T> = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return result;
};

export default pick;
