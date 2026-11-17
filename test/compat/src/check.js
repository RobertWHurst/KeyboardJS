export function check(label, condition) {
  if (!condition) throw new Error(`${label} failed`);
}
