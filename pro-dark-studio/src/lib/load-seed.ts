export async function loadSeed<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load seed file: ${path}`);
  }
  return res.json();
}
