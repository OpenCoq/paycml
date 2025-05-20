'use client'

import type { Data } from 'payload'
import type { FolderOrDocument } from 'payload/shared'

import React, { useEffect } from 'react'

import { useConfig } from '../../../providers/Config/index.js'
import { useTranslation } from '../../../providers/Translation/index.js'
import { MoveDocToFolderButton } from '../MoveDocToFolder/index.js'

type Props = {
  collectionSlug: string
  data: Data
  docTitle: string
  folderFieldName: string
}

export const FolderTableCellClient = ({
  collectionSlug,
  data,
  docTitle,
  folderFieldName,
}: Props) => {
  const docID = data.id
  const folderID = data?.[folderFieldName]

  const { config } = useConfig()
  const { t } = useTranslation()
  const [fromFolderName, setFromFolderName] = React.useState(() =>
    folderID ? `${t('general:loading')}...` : t('folder:noFolder'),
  )

  const hasLoadedFolderName = React.useRef(false)

  const onConfirm = React.useCallback(
    async ({ id, name }) => {
      try {
        await fetch(`${config.routes.api}/${collectionSlug}/${docID}`, {
          body: JSON.stringify({
            [folderFieldName]: id,
          }),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PATCH',
        })

        setFromFolderName(name || t('folder:noFolder'))
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error moving document to folder', error)
      }
    },
    [config.routes.api, collectionSlug, docID, t],
  )

  useEffect(() => {
    const loadFolderName = async () => {
      try {
        const req = await fetch(
          `${config.routes.api}/${config.folders.slug}${folderID ? `/${folderID}` : ''}`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'GET',
          },
        )

        const res = await req.json()
        setFromFolderName(res?.name || t('folder:noFolder'))
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error moving document to folder', error)
      }
    }

    if (!hasLoadedFolderName.current) {
      void loadFolderName()
      hasLoadedFolderName.current = true
    }
  }, [])

  return (
    <MoveDocToFolderButton
      buttonProps={{
        size: 'small',
      }}
      collectionSlug={collectionSlug}
      docData={data as FolderOrDocument['value']}
      docID={docID}
      docTitle={docTitle}
      fromFolderID={data?.[folderFieldName]}
      fromFolderName={fromFolderName}
      modalSlug={`move-doc-to-folder-cell--${docID}`}
      onConfirm={onConfirm}
      skipConfirmModal={false}
    />
  )
}
