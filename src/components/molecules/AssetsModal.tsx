/*************************************************************************************

    Table of Contents:

    import react
    import components

    AssetsModal function
      custom hooks
      Render

  *************************************************************************************/

/* import react */
import React, { useCallback } from 'react'

/* import components */
import { Modal } from '../molecules/Modal'
import { Scrollable } from '../atoms/Layout'
import { DeFiAssetImage } from '../atoms/DeFiAsset'
import { Table, TableRow, TableBody, TableData } from '../atoms/Table'

type AssetsModalProps = {
  isOpen: boolean
  closeModal: () => void
  assets: { name: string; address: string }[]
  modalTitle: string
}

export const AssetsModal: React.FC<AssetsModalProps> = ({ closeModal, isOpen, assets, modalTitle }) => {
  /*************************************************************************************

  custom hooks

  *************************************************************************************/

  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  /*************************************************************************************

  Render

  *************************************************************************************/
  return (
    <Modal handleClose={handleClose} isOpen={isOpen} modalTitle={modalTitle} disableCloseButton={false}>
      <Scrollable>
        <Table textAlignCenter style={{ borderSpacing: '0px 7px' }}>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.address}>
                <TableData>
                  <DeFiAssetImage borderless width={45} height={45}>
                    <img src={`https://assets.solace.fi/${asset.address.toLowerCase()}`} alt={asset.name} />
                  </DeFiAssetImage>
                </TableData>
                <TableData>{asset.name}</TableData>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollable>
    </Modal>
  )
}
