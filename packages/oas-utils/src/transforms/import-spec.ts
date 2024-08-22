import {
  type Request,
  collectionSchema,
  oasTagSchema,
  requestMethods,
  requestSchema,
  serverSchema,
} from '@/entities/workspace/spec'
import type { Server } from '@/entities/workspace/spec/server'
import { schemaModel } from '@/helpers/schema-model'
import { keysOf } from '@scalar/object-utils/arrays'
import { dereference, load, toYaml, upgrade } from '@scalar/openapi-parser'
import type { OpenAPIV3, OpenAPIV3_1 } from '@scalar/openapi-types'
import type { UnknownObject } from '@scalar/types/utils'
import { nanoid } from 'nanoid'

/**
 * Import an OpenAPI spec file and convert it to workspace entities
 *
 * We will aim to keep the entities as close to the specification as possible
 * to leverage bi-directional translation. Where entities are able to be
 * created and used at various levels we will index via the uids to create
 * the relationships
 */
export const importSpecToWorkspace = async (spec: string | UnknownObject) => {
  const { filesystem } = await load(spec)
  const upgraded = upgrade(filesystem)
  const { schema: _schema, errors = [] } = await dereference(upgraded)
  const schema = _schema as OpenAPIV3.Document | OpenAPIV3_1.Document

  const importWarnings: string[] = [...errors.map((e) => e.message)]

  if (!schema) return { importWarnings, error: true }
  // ---------------------------------------------------------------------------
  // Some entities will be broken out as individual lists for modification in the workspace
  const requests: Request[] = []
  const servers: Server[] = serverSchema.array().parse(
    schema.servers?.map(
      (s) =>
        ({ ...s, uid: nanoid() }) ?? [
          {
            uid: nanoid(),
            url:
              typeof window !== 'undefined'
                ? window.location.origin
                : 'http://localhost',
            description: 'Replace with your API server',
          },
        ],
    ),
  )
  const collectionServers = servers.map((s) => s.uid)

  /**
   * List of all tag strings. For non compliant specs we may need to
   * add top level tag objects for missing tag objects
   */
  const tagNames: Set<string> = new Set()

  keysOf(schema.paths ?? {}).forEach((pathString) => {
    const path = schema?.paths?.[pathString]

    if (!path) return
    // Path level servers must be saved
    const pathServers =
      path.servers?.forEach((s) =>
        serverSchema.parse({ ...s, uid: nanoid() }),
      ) ?? []
    servers.push(...pathServers)

    requestMethods.forEach((method) => {
      const operation: OpenAPIV3_1.OperationObject<{ tags: string[] }> =
        path[method as keyof typeof path]
      if (operation && typeof operation === 'object') {
        const operationServers =
          operation.servers?.map((s) =>
            serverSchema.parse({ ...s, uid: nanoid() }),
          ) ?? []

        servers.push(...operationServers)

        // We will save a list of all tags to ensure they exists at the top level
        operation.tags?.forEach((t) => tagNames.add(t))

        // Format the request
        const request = requestSchema.parse({
          uid: nanoid(),
          method,
          path: pathString,
          history: [],
          selectedSecuritySchemeUids: [],
          securitySchemeUids: [],
          ...operation,
          // Merge path and operation level parameters
          parameters: [
            ...(path?.parameters ?? []),
            ...(operation.parameters ?? []),
          ],
          servers: [...pathServers, ...operationServers].map((s) => s.uid),
        })

        requests.push(request)
      }
    })
  })

  // todo workaround till we rethink how we do createTags
  const tags = schemaModel(schema?.tags, oasTagSchema.array(), false) ?? []

  // Delete any tag names that already have a definition
  tags.forEach((t) => tagNames.delete(t.name))

  // Add an entry for any tags that are used but do not have a definition
  tagNames.forEach((name) => tags.push(oasTagSchema.parse({ name })))

  // const components = schema?.components
  // const securityDefinitions = schema?.securityDefinitions
  const collection = collectionSchema.parse({
    uid: nanoid(),
    requests: requests.map((r) => r.uid),
    servers: collectionServers,
    ...schema,
  })

  /**
   * Servers and requests will be saved in top level maps and indexed via UID to
   * maintain specification relationships
   */
  return {
    servers,
    requests,
    collection,
  }
}
