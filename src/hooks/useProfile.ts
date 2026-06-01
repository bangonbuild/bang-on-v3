import { useEffect, useState } from 'react'
import type { PaymentDetails, Profile } from '../types'
import { loadJson, saveJson, STORAGE_KEYS } from '../utils/storage'

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(() =>
    loadJson(STORAGE_KEYS.profile, { name: '', phone: '', trade: 'Builder' }),
  )
  const [payment, setPayment] = useState<PaymentDetails>(() =>
    loadJson(STORAGE_KEYS.payment, {
      businessName: '',
      abn: '',
      bsb: '',
      account: '',
      logo: '',
    }),
  )

  useEffect(() => {
    saveJson(STORAGE_KEYS.profile, profile)
  }, [profile])

  useEffect(() => {
    saveJson(STORAGE_KEYS.payment, payment)
  }, [payment])

  return { profile, payment, setProfile, setPayment }
}
