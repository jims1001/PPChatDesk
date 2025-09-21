export class Backoff {
  private attempt = 0;
  private readonly base: number;
  private readonly max: number;

  constructor(base = 1000, max = 15000) {
    this.base = base;
    this.max = max;
  }
  next() {
    const ms = Math.min(this.max, this.base * Math.pow(2, this.attempt));
    this.attempt++;
    return ms + Math.floor(Math.random() * 250); // jitter
  }
  reset() {
    this.attempt = 0;
  }
}
