"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { QrCode, Zap, CheckCircle2 } from 'lucide-react'
import { Button, Card, Field, Input, Select } from '@/components/ui'
import { CopyButton, DemoNotice, PageHeader, QRPreview } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { assets, networks } from '@/data/mock-wallet'
import { paymentService } from '@/services'
import { useAppStore } from '@/store/app-store'

const schema = z.object({
  network: z.string(),
  asset: z.string(),
  amount: z.coerce.number({ errorMap: () => ({ message: 'Enter an amount' }) }).positive('Amount must be greater than 0'),
})
type In = z.input<typeof schema>
type Out = z.output<typeof schema>

export default function ReceivePage() {
  const { identity, simulateIncomingStealthPayment, toast } = useAppStore()
  const [link, setLink] = useState('')
  const [lastRequest, setLastRequest] = useState<Out | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(schema),
    defaultValues: { network: 'Ethereum', asset: 'USDC', amount: undefined },
  })

  const onSubmit = async (v: Out) => {
    await paymentService.createPaymentRequest(v)
    const id = Math.random().toString(36).slice(2, 10)
    const to = identity?.metaAddress ?? 'st:eth:0x028c9fe47b9938dcb90184bba01948bc891048bce910283749bcf819028374900a'
    const generatedLink = `https://stealthpay.example/pay?to=${encodeURIComponent(
      to
    )}&amount=${v.amount}&asset=${v.asset}&network=${v.network}&ref=${id}`
    setLink(generatedLink)
    setLastRequest(v)
    toast('Payment request generated with reusable meta-address')
  }

  return (
    <AppShell>
      <div>
        <PageHeader
          title="Receive payment"
          description="Create a payment request with a QR code and link. Senders will derive a fresh one-time stealth address automatically."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Field label="Network">
                <Select {...register('network')}>
                  {networks.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Cryptocurrency">
                <Select {...register('asset')}>
                  {assets.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Amount" error={errors.amount?.message}>
                <Input type="number" step="any" placeholder="0.00" {...register('amount')} />
              </Field>

              {!identity && (
                <p className="rounded-2xl bg-warn-soft px-4 py-3 text-xs text-ink">
                  No identity yet: a placeholder demo address will be used. Generate one on the Identity page.
                </p>
              )}

              <Button type="submit" className="w-full" loading={isSubmitting}>
                Generate payment request
              </Button>
            </form>
          </Card>

          <Card className="flex flex-col items-center justify-center p-6">
            {link ? (
              <div className="w-full space-y-5">
                <QRPreview value={link} name="payment-request-qr" />
                <div className="rounded-2xl bg-canvas p-4">
                  <p className="mb-2 text-sm font-medium text-ink">Payment link</p>
                  <p className="font-mono text-xs break-all text-ink-soft">{link}</p>
                </div>
                <CopyButton text={link} label="Copy link" className="w-full" />

                {lastRequest && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      simulateIncomingStealthPayment(lastRequest.amount)
                      toast(`Simulated incoming payment of ${lastRequest.amount} ${lastRequest.asset}!`)
                    }}
                  >
                    <Zap className="size-4 text-amber-700" /> Simulate Sender Paying Request
                  </Button>
                )}

                <DemoNotice />
              </div>
            ) : (
              <div className="py-12 text-center text-ink-soft">
                <QrCode className="mx-auto mb-3 size-10" />
                <p className="text-sm">Your QR code and payment link will appear here.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
