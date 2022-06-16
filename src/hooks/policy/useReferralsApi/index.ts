import { useWeb3React } from '@web3-react/core'
import { useState, useEffect } from 'react'
import { GetByUserResponse } from './GetByUserResponse'
import { InfoResponse } from './InfoResponse'

export default function useReferralsApi(): {
  referralCode: string | undefined
  earnedAmount: number | undefined
  referredCount: number | undefined
  appliedCode: string | undefined
} {
  const { account } = useWeb3React()

  const [referralCode, setReferralCode] = useState<string | undefined>(undefined)
  const [earnedAmount, setEarnedAmount] = useState<number | undefined>(undefined)
  const [referredCount, setReferredCount] = useState<number | undefined>(undefined)
  const [appliedCode, setAppliedCode] = useState<string | undefined>(undefined)

  const baseApiUrl = 'https://2vo3wfced8.execute-api.us-west-2.amazonaws.com/prod/'

  useEffect(() => {
    // GET OWN CODE
    const getUserReferralCodeUrl = `${baseApiUrl}referral-codes?user=${account}`
    const getUserReferralCode = async () => {
      const response = await fetch(getUserReferralCodeUrl)
      const data = (await response.json()) as GetByUserResponse
      const _referralCode = data.result?.[0]?.referral_code
      // if there is no referral code, then we must set it by calling baseUrl + referral-codes
      // on success, we will have either Message or `result.referral_code`
      if (!_referralCode) {
        const postReferralCodeUrl = `${baseApiUrl}referral-codes`
        const postReferralCode = async () => {
          const response = await fetch(postReferralCodeUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user: account,
              chain_id: 137,
              policy_id: 0,
            }),
          })
          const data = (await response.json()) as InfoResponse
          const _referralCode = data.result?.referral_codes?.[0]?.referral_code
          _referralCode && setReferralCode(_referralCode)
        }
        postReferralCode()
      } else setReferralCode(_referralCode)
    }
    getUserReferralCode()

    // GET EARNED AMOUNT, REFERRED COUNT and APPLIED CODE
    const getInfoUrl = `${baseApiUrl}info?user=${account}`
    const getInfo = async () => {
      const response = await fetch(getInfoUrl)
      const data = (await response.json()) as InfoResponse
      const _earnedAmount = data.result?.reward_accounting?.promo_rewards
      const _referredCount = data.result?.reward_accounting?.referred_count
      const _appliedCode = data.result?.applied_promo_codes?.[0]?.promo_code
      _earnedAmount ? setEarnedAmount(_earnedAmount) : setEarnedAmount(0)
      _referredCount ? setReferredCount(_referredCount) : setReferredCount(0)
      _appliedCode ? setAppliedCode(_appliedCode) : setAppliedCode('')
    }
    getInfo()
  }, [account])
  return { referralCode, earnedAmount, referredCount, appliedCode }
}
