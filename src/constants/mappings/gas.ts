export const FunctionGasLimits: { [key: string]: number } = {
  ['coverPaymentManager.withdraw']: 114016,
  ['coverPaymentManager.depositStable']: 197272,
  ['coverPaymentManager.depositNonStable']: 205480,
  ['solaceCoverProductV3.cancel']: 288831,
  ['solaceCoverProductV3.purchase']: 358087,
  ['solaceCoverProductV3.purchaseWithNonStable']: 426093,
  ['solaceCoverProductV3.purchaseWithStable']: 417039,
  ['stakingRewardsV2.compoundLock']: 255664,
  ['stakingRewardsV2.compoundLocks']: 278677,
  ['tellerErc20_v2.deposit']: 608284,
  ['tellerEth_v2.depositEth']: 509098,
  ['tellerEth_v2.depositWeth']: 597664,
  ['tellerFtm.depositFtm']: 509164,
  ['tellerFtm.depositWftm']: 597700,
  ['tellerMatic.depositMatic']: 509164,
  ['tellerMatic.depositWmatic']: 597700,
  ['teller_v2.claimPayout']: 190950,
  ['xSolace.stakeSigned']: 143344,
  ['xSolace.unstake']: 113443,
  ['xSolaceMigrator.migrateSigned']: 600000,
  ['xsLocker.createLockSigned']: 560597,
  ['xsLocker.extendLock']: 189006,
  ['xsLocker.increaseAmountSigned']: 202431,
  ['xsLocker.withdraw']: 365209,
  ['xsLocker.withdrawInPart']: 250000,
  ['xsLocker.withdrawMany']: 493442,
}
