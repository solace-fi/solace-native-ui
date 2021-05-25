import React, { useState, useEffect, Fragment } from 'react'
import user from '../../static/user-avatar.png'

import { useWallet } from '../../context/WalletManager'
import { SUPPORTED_WALLETS } from '../../ethers/wallets'
import { User, UserImage, UserWallet, UserName } from './index'
import { useEthBalance } from '../../hooks/useEthBalance'

import { Button } from '../Button'

export default function App(): any {
  const wallet = useWallet()
  const balance = useEthBalance()

  return (
    <User>
      <UserImage>
        <img src={user} alt="User Name" />
      </UserImage>
      <UserWallet>
        {wallet.isActive ? (
          balance ? (
            `${balance} ETH`
          ) : (
            ''
          )
        ) : (
          <Button
            onClick={() =>
              wallet.connect(SUPPORTED_WALLETS[SUPPORTED_WALLETS.findIndex((wallet) => wallet.id === 'metamask')])
            }
          >
            Connect Wallet
          </Button>
        )}
      </UserWallet>
      {wallet.isActive ? (
        <Fragment>
          <UserName>{wallet.account}</UserName>
          {/* <Button onClick={() => wallet.disconnect()}>Disconnect MetaMask Wallet</Button> */}
        </Fragment>
      ) : null}
    </User>
  )
}
