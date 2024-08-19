import type { Collection } from '@/entities/workspace/collection'
import type { Request } from '@/entities/workspace/spec'
import type { OpenAPIV3, OpenAPIV3_1 } from '@scalar/openapi-types'

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

function specFromCollection({
  collection,
  requests,
}: {
  collection: Collection
  requests: Record<string, Request>
}) {
  const base = collection.spec
  const spec: WithRequired<OpenAPIV3_1.Document, 'paths'> = {
    openapi: (base.openapi as OpenAPIV3_1.Document['openapi']) || '3.1.0',
    info: base.info ?? {
      title: 'Scalar Generated Spec',
    },
    paths: {},
  }

  collection.childUids.forEach((uid) => {
    const r = requests[uid]

    const request: OpenAPIV3.OperationObject = {
      summary: r.summary,
      operationId: r.operationId,
    }

    if (!spec.paths[r.path]) spec.paths[r.path] = {}
    spec.paths[r.path]![r.method.toLowerCase()] = request
  })
  return spec
}
