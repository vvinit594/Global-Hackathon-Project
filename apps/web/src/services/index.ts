/**
 * Service placeholders. No network requests are made.
 * Replace the bodies with calls to the Spring Boot API when it is available.
 */
const wait = (ms = 900) => new Promise((r) => setTimeout(r, ms))

export const authService = {
  async login(_email: string, _password: string) { await wait(); return { ok: true } },
  async register(_name: string, _email: string, _password: string) { await wait(); return { ok: true } },
  async requestPasswordReset(_email: string) { await wait(); return { ok: true } },
}

export const paymentService = {
  async submitPayment(_input: { to: string; amount: number; asset: string; network: string }) {
    await wait(1400)
    return { ok: true, id: 'DEMO-TX-' + Math.floor(1100 + Math.random() * 900) }
  },
  async createPaymentRequest(_input: { amount: number; asset: string; network: string }) {
    await wait(700)
    return { ok: true }
  },
}

export const identityService = {
  async generate() { await wait(1200); return { ok: true } },
}
