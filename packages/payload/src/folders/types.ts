import type { TypeWithID } from '../collections/config/types.js'
import type { CollectionSlug, SanitizedCollectionConfig } from '../index.js'

export type FolderInterface = {
  _parentFolder?: FolderInterface | (number | string | undefined)
  documentsAndFolders?: {
    docs: {
      relationTo: CollectionSlug
      value: any
    }[]
  }
  name: string
} & TypeWithID

export type FolderBreadcrumb = {
  id: null | number | string
  name: string
  root?: boolean
}

export type Subfolder = {
  fileCount: number
  hasSubfolders: boolean
  id: number | string
  name: string
  subfolderCount: number
}

export type FolderEnabledColection = {
  admin: {
    custom: {
      folderCollectionSlug: CollectionSlug
    }
  }
  slug: CollectionSlug
} & SanitizedCollectionConfig

export type GetFolderDataResult<DocType = TypeWithID> = {
  breadcrumbs: FolderBreadcrumb[] | null
  hasMoreDocuments: boolean
  items: {
    relationTo: string
    value: DocType | number | string
  }[]
}
