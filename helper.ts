export async function fetchWithRetry(input: RequestInfo, init?: RequestInit, opts?: {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryOn?: (status: number) => boolean;
}): Promise<Response> {
  const retries = opts?.retries ?? 4;
  const base = opts?.baseDelayMs ?? 300;
  const max = opts?.maxDelayMs ?? 5000;
  const retryOn = opts?.retryOn ?? ((s: number) => s === 429 || (s >= 500 && s < 600));

  let attempt = 0;
  while (true) {
    try {
      const res = await fetch(input, init);
      if (!res.ok && attempt < retries && retryOn(res.status)) {
        const exp = Math.min(max, base * 2 ** attempt);
        const jitter = Math.random() * exp * 0.5;
        const delay = Math.floor(exp + jitter);
        await new Promise(r => setTimeout(r, delay));
        attempt++;
        continue;
      }
      return res;
    } catch (err) {
      if (attempt >= retries) throw err;
      const exp = Math.min(max, base * 2 ** attempt);
      const jitter = Math.random() * exp * 0.5;
      const delay = Math.floor(exp + jitter);
      await new Promise(r => setTimeout(r, delay));
      attempt++;
    }
  }
}