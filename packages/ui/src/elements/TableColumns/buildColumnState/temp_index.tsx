import type { I18nClient } from '@payloadcms/translations'
import type {
  ClientComponentProps,
  ClientField,
  CollectionSlug,
  Column,
  DefaultCellComponentProps,
  Document,
  Field,
  ListPreferences,
  PaginatedDocs,
  Payload,
  SanitizedCollectionConfig,
  ServerComponentProps,
  StaticLabel,
} from 'payload'

import {
  fieldIsHiddenOrDisabled,
  fieldIsID,
  fieldIsPresentationalOnly,
  flattenTopLevelFields,
} from 'payload/shared'
import React from 'react'

import type { SortColumnProps } from '../../SortColumn/index.js'

import { RenderServerComponent } from '../../RenderServerComponent/index.js'
import { SortColumn } from '../../SortColumn/index.js'
import { filterFields } from '../filterFields.js'
import { isColumnActive } from './isColumnActive.js'
import { renderCell } from './renderCell.js'
import { sortFieldMap } from './sortFieldMap.js'

export type BuildColumnStateArgs = {
  beforeRows?: Column[]
  clientFields: ClientField[]
  columnPreferences: ListPreferences['columns']
  columns?: ListPreferences['columns']
  customCellProps: DefaultCellComponentProps['customCellProps']
  enableRowSelections: boolean
  enableRowTypes?: boolean
  i18n: I18nClient
  payload: Payload
  serverFields: Field[]
  sortColumnProps?: Partial<SortColumnProps>
  useAsTitle: SanitizedCollectionConfig['admin']['useAsTitle']
} & (
  | {
      collectionSlug: CollectionSlug
      dataType: 'monomorphic'
      docs: PaginatedDocs['docs']
    }
  | {
      collectionSlug: never | undefined
      dataType: 'polymorphic'
      docs: {
        relationTo: CollectionSlug
        value: Document
      }[]
    }
)

export const buildColumnState = (args: BuildColumnStateArgs): Column[] => {
  const {
    beforeRows,
    clientFields,
    collectionSlug,
    columnPreferences,
    columns,
    customCellProps,
    dataType,
    docs,
    enableRowSelections,
    i18n,
    payload,
    serverFields,
    sortColumnProps,
    useAsTitle,
  } = args

  // clientFields contains the fake `id` column
  let sortedFieldMap = flattenTopLevelFields(filterFields(clientFields), true) as ClientField[]
  let _sortedFieldMap = flattenTopLevelFields(filterFields(serverFields), true) as Field[] // TODO: think of a way to avoid this additional flatten

  // place the `ID` field first, if it exists
  // do the same for the `useAsTitle` field with precedence over the `ID` field
  // then sort the rest of the fields based on the `defaultColumns` or `columnPreferences`
  const idFieldIndex = sortedFieldMap?.findIndex((field) => fieldIsID(field))

  if (idFieldIndex > -1) {
    const idField = sortedFieldMap.splice(idFieldIndex, 1)[0]
    sortedFieldMap.unshift(idField)
  }

  const useAsTitleFieldIndex = useAsTitle
    ? sortedFieldMap.findIndex((field) => 'name' in field && field.name === useAsTitle)
    : -1

  if (useAsTitleFieldIndex > -1) {
    const useAsTitleField = sortedFieldMap.splice(useAsTitleFieldIndex, 1)[0]
    sortedFieldMap.unshift(useAsTitleField)
  }

  const sortTo = columnPreferences || columns

  if (sortTo) {
    // sort the fields to the order of `defaultColumns` or `columnPreferences`
    sortedFieldMap = sortFieldMap<ClientField>(sortedFieldMap, sortTo)
    _sortedFieldMap = sortFieldMap<Field>(_sortedFieldMap, sortTo) // TODO: think of a way to avoid this additional sort
  }

  const activeColumnsIndices = []

  const sorted: Column[] = sortedFieldMap?.reduce((acc, clientField, colIndex) => {
    if (fieldIsHiddenOrDisabled(clientField) && !fieldIsID(clientField)) {
      return acc
    }

    const serverField = _sortedFieldMap.find(
      (f) => 'name' in clientField && 'name' in f && f.name === clientField.name,
    )

    const columnPreference = columnPreferences?.find(
      (preference) =>
        clientField && 'name' in clientField && preference.accessor === clientField.name,
    )

    const isActive = isColumnActive({
      activeColumnsIndices,
      columnPreference,
      columns,
      field: clientField,
    })

    if (isActive && !activeColumnsIndices.includes(colIndex)) {
      activeColumnsIndices.push(colIndex)
    }

    let CustomLabel = undefined

    if (dataType === 'monomorphic') {
      const CustomLabelToRender =
        serverField &&
        'admin' in serverField &&
        'components' in serverField.admin &&
        'Label' in serverField.admin.components &&
        serverField.admin.components.Label !== undefined // let it return `null`
          ? serverField.admin.components.Label
          : undefined

      // TODO: customComponent will be optional in v4
      const clientProps: Omit<ClientComponentProps, 'customComponents'> = {
        field: clientField,
      }

      const customLabelServerProps: Pick<
        ServerComponentProps,
        'clientField' | 'collectionSlug' | 'field' | 'i18n' | 'payload'
      > = {
        clientField,
        collectionSlug,
        field: serverField,
        i18n,
        payload,
      }

      CustomLabel = CustomLabelToRender
        ? RenderServerComponent({
            clientProps,
            Component: CustomLabelToRender,
            importMap: payload.importMap,
            serverProps: customLabelServerProps,
          })
        : undefined
    }

    const fieldAffectsDataSubFields =
      clientField &&
      clientField.type &&
      (clientField.type === 'array' ||
        clientField.type === 'group' ||
        clientField.type === 'blocks')

    const Heading = (
      <SortColumn
        disable={fieldAffectsDataSubFields || fieldIsPresentationalOnly(clientField) || undefined}
        Label={CustomLabel}
        label={
          clientField && 'label' in clientField ? (clientField.label as StaticLabel) : undefined
        }
        name={'name' in clientField ? clientField.name : undefined}
        {...(sortColumnProps || {})}
      />
    )

    const column: Column = {
      accessor: 'name' in clientField ? clientField.name : undefined,
      active: isActive,
      CustomLabel,
      field: clientField,
      Heading,
      renderedCells: isActive
        ? docs.map((doc, rowIndex) => {
            return renderCell({
              clientField,
              collectionSlug: dataType === 'monomorphic' ? collectionSlug : doc.relationTo,
              columnIndex: colIndex,
              customCellProps,
              doc: dataType === 'monomorphic' ? doc : doc.value,
              enableRowSelections,
              i18n,
              isLinkedColumn: colIndex === activeColumnsIndices[0],
              payload,
              rowIndex,
              serverField,
            })
          })
        : [],
    }

    acc.push(column)

    return acc
  }, [])

  if (beforeRows) {
    sorted.unshift(...beforeRows)
  }

  return sorted
}
