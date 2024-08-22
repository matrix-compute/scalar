import { nanoidSchema } from '@/entities/workspace/shared'
import { deepMerge } from '@scalar/object-utils/merge'
import { z } from 'zod'

import { securityRequirement } from '../security'
import {
  oasExternalDocumentationSchema,
  oasInfoSchema,
  oasTagSchema,
} from './spec-objects'

const oasCollectionSchema = z.object({
  openapi: z
    .union([
      z.string(),
      z.literal('3.0.0'),
      z.literal('3.1.0'),
      z.literal('4.0.0'),
    ])
    .optional()
    .default('3.1.0'),
  jsonSchemaDialect: z.string(),
  info: oasInfoSchema.optional(),
  /**
   * A declaration of which security mechanisms can be used across the API. The list of
   * values includes alternative security requirement objects that can be used. Only
   * one of the security requirement objects need to be satisfied to authorize a request.
   * Individual operations can override this definition. To make security optional, an empty
   * security requirement ({}) can be included in the array.
   */
  security: z.array(securityRequirement).optional().default([]),
  tags: z.array(oasTagSchema).default([]),
  externalDocs: oasExternalDocumentationSchema.optional(),
  /** TODO: Type these */
  components: z.record(z.string(), z.unknown()),
  /** TODO: Type these */
  webhooks: z.record(z.string(), z.unknown()),
  // These properties will be stripped out and mapped back as id lists
  // servers
  // paths/**
})

export const extendedCollectionSchema = z.object({
  uid: nanoidSchema,
  /** A dictionary which maps the openapi spec name keys to the security-scheme UID's for lookup */
  securitySchemeDict: z.record(z.string(), z.string()).optional().default({}),
  /** The currently selected server */
  selectedServerUid: z.string().default(''),
  /** UIDs which refer to servers on the workspace base */
  servers: nanoidSchema.array(),
  /** Request UIDs associated with a collection */
  requests: nanoidSchema.array(),
})

export const collectionSchema = oasCollectionSchema.merge(
  extendedCollectionSchema,
)
export type Collection = z.infer<typeof collectionSchema>
