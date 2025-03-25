'use client'

import { getTranslation } from '@payloadcms/translations'

import { FieldLabel } from '../../../fields/FieldLabel/index.js'
import { useConfig } from '../../../providers/Config/index.js'
import { useTranslation } from '../../../providers/Translation/index.js'
import { useListDrawerContext } from '../../ListDrawer/Provider.js'
import { ReactSelect } from '../../ReactSelect/index.js'

const drawerBaseClass = 'list-drawer'

export const DrawerRelationshipSelect = () => {
  const { i18n, t } = useTranslation()
  const {
    config: { collections },
    getEntityConfig,
  } = useConfig()
  const { enabledCollections, selectedOption, setSelectedOption } = useListDrawerContext()
  const enabledCollectionConfigs = collections.filter(({ slug }) =>
    enabledCollections.includes(slug),
  )
  if (enabledCollectionConfigs.length > 1) {
    const activeCollectionConfig = getEntityConfig({ collectionSlug: selectedOption.value })

    return (
      <div className={`${drawerBaseClass}__select-collection-wrap`}>
        <FieldLabel label={t('upload:selectCollectionToBrowse')} />
        <ReactSelect
          className={`${drawerBaseClass}__select-collection`}
          onChange={setSelectedOption}
          options={enabledCollectionConfigs.map((coll) => ({
            label: getTranslation(coll.labels.singular, i18n),
            value: coll.slug,
          }))}
          value={{
            label: getTranslation(activeCollectionConfig?.labels.singular, i18n),
            value: activeCollectionConfig?.slug,
          }}
        />
      </div>
    )
  }
  return null
}
