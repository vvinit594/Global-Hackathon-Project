"use client"

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const toast = useAppStore((s) => s.toast)

  const copy = async (text: string, key = text) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(key)
    toast('Copied to clipboard')
    setTimeout(() => setCopied(null), 1600)
  }

  return { copied, copy }
}
