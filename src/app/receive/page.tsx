"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Copy, Share2 } from 'lucide-react'
import { Button, Card, Field, Input, Select } from '@/components/ui'
import { CopyButton, DemoNotice, PageHeader, QRPreview } from '@/components/common'
import { AppShell } from '@/components/layout/app-shell'
import { useAppStore } from '@/store/app-store'

const schema = z.object({
  network: z.string(),
  asset: z.string(),
  amount: z.coerce.number().optional(),
})
type In = z.input<typeof schema>
type Out = z.output<typeof schema>

export default function ReceivePage() {
  const { identity, simulateIncomingStealthPayment, toast } = useAppStore()
  const metaAddr = identity?.metaAddress ?? 'st:0x8f3a9d......e2b1'
  const [link, setLink] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(schema),
    defaultValues: { network: 'Ethereum (Sepolia)', asset: 'ETH', amount: undefined },
  })

  const formValues = watch()

  const qrValue = link || `ethereum:${metaAddr}?amount=${formValues.amount || 0}&token=${formValues.asset || 'ETH'}`

  const handleShare = () => {
    const url = `https://stealthpay.io/pay?to=${encodeURIComponent(metaAddr)}&net=${encodeURIComponent(formValues.network || 'Ethereum')}&amt=${formValues.amount || ''}`
    setLink(url)
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
    toast('Payment request link copied to clipboard!')
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          title="Receive Payment"
          description="Generate an EIP-5564 payment request and export your stealth meta-address"
        />

        <DemoNotice />

        {/* RECEIVE CARD */}
        <Card className="p-5 sm:p-7 max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-6 items-center">
            {/* Left Column: Big QR Code Container */}
            <div className="flex flex-col items-center justify-center p-2">
              <div className="rounded-input border border-[var(--border-strong)] bg-white p-4 shadow-sm">
                <QRPreview
                  value={qrValue}
                  name="stealth-payment-qr.png"
                  size={190}
                />
              </div>
              <span className="mt-2 text-[10px] font-mono text-[var(--muted)]">
                STANDARD EIP-5564 PARSABLE PAYLOAD
              </span>
            </div>

            {/* Right Column: Address and Selectors */}
            <div className="space-y-3.5">
              {/* Your Meta-Address */}
              <div>
                <label className="mb-1 block text-xs font-mono font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">
                  Your Reusable Meta-Address
                </label>
                <div className="flex items-center justify-between rounded-control border border-[var(--border)] bg-[var(--surface-secondary)] p-2.5">
                  <span className="font-mono text-xs text-[var(--foreground)] truncate mr-2">
                    {metaAddr}
                  </span>
                  <CopyButton text={metaAddr} label="Copy" className="h-6 px-2 text-[10px] shrink-0" />
                </div>
              </div>

              {/* Network Selector */}
              <Field label="Network Destination">
                <Select {...register('network')} className="font-mono text-xs">
                  <option value="Ethereum (Sepolia)">Ethereum (Sepolia)</option>
                  <option value="Ethereum Mainnet">Ethereum Mainnet</option>
                  <option value="Polygon">Polygon</option>
                  <option value="Arbitrum One">Arbitrum One</option>
                  <option value="Optimism">Optimism</option>
                </Select>
              </Field>

              {/* Amount (Optional) */}
              <Field label="Target Amount (Optional)">
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    className="font-mono text-xs pr-14"
                    {...register('amount')}
                  />
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-mono font-semibold text-[var(--muted)]">
                    {formValues.asset || 'ETH'}
                  </span>
                </div>
              </Field>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2.5 pt-5 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 h-9 font-mono text-xs"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(metaAddr)
                }
                toast('Meta-address copied to clipboard!')
              }}
            >
              <Copy className="size-3.5 text-[var(--muted)]" /> Copy Meta-Address
            </Button>

            <Button
              type="button"
              className="flex-1 h-9 font-mono text-xs"
              onClick={handleShare}
            >
              <Share2 className="size-3.5" /> {copiedLink ? 'Link Copied to Clipboard' : 'Share Payment Link'}
            </Button>
          </div>
        </Card>

        {/* Demo Simulator Action */}
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs font-mono text-[var(--muted)] hover:text-[var(--foreground)]"
            onClick={() => {
              simulateIncomingStealthPayment(formValues.amount || 0.5)
              toast(`Simulated payment of ${formValues.amount || 0.5} ${formValues.asset || 'ETH'} detected!`)
            }}
          >
            <Zap className="size-3 text-[var(--primary)]" /> Simulate Sender Settling Request
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
