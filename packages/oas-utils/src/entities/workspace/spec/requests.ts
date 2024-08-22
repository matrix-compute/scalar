import { securityRequirement } from '@/entities/workspace/security'
import { nanoidSchema } from '@/entities/workspace/shared'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import type { AxiosResponse } from 'axios'
import { type ZodSchema, z } from 'zod'

import type { RequestExample } from './request-examples'
import { oasParameterSchema } from './spec-objects'

export const requestMethods = [
  'connect',
  'delete',
  'get',
  'head',
  'options',
  'patch',
  'post',
  'put',
  'trace',
] as const

export type RequestMethod = (typeof requestMethods)[number]

/** A single set of populated values for a sent request */
export type ResponseInstance = AxiosResponse & {
  /** Time in ms the request took */
  duration: number
}

/** A single request/response set to save to the history stack */
export type RequestEvent = {
  request: RequestExample
  response: ResponseInstance
  timestamp: number
}

// TODO: Type body definitions
type RequestBody = object
const requestBodySchema = z.any() satisfies ZodSchema<RequestBody>

/** Open API Compliant Request Validator */
export const oasRequestSchema = z.object({
  /**
   * A list of tags for API documentation control. Tags can be used for logical
   * grouping of operations by resources or any other qualifier.
   */
  tags: z.string().array().optional(),
  /** A short summary of what the operation does. */
  summary: z.string().optional(),
  /** A verbose explanation of the operation behavior. CommonMark syntax MAY be used for rich text representation. */
  description: z.string().optional(),
  /**
   * Unique string used to identify the operation. The id MUST be unique among all operations described in the API.
   * The operationId value is case-sensitive. Tools and libraries MAY use the operationId to uniquely identify an
   * operation, therefore, it is RECOMMENDED to follow bin common programming naming conventions./
   */
  operationId: z.string().optional(),
  /**
   * A declaration of which security mechanisms can be used across the API. The list of
   * values includes alternative security requirement objects that can be used. Only
   * one of the security requirement objects need to be satisfied to authorize a request.
   * Individual operations can override this definition. To make security optional, an empty
   * security requirement ({}) can be included in the array.
   */
  security: z.array(securityRequirement).optional(),
  /**
   * The request body applicable for this operation. The requestBody is fully supported in HTTP methods where the
   * HTTP 1.1 specification [RFC7231] has explicitly defined semantics for request bodies. In other cases where the
   * HTTP spec is vague (such as GET, HEAD and DELETE), requestBody is permitted but does not have well-defined
   * semantics and SHOULD be avoided if possible.
   */
  requestBody: requestBodySchema.optional(),
  /**
   * Request parameters
   */
  parameters: oasParameterSchema.array(),
  /**
   * External documentation object
   */
  externalDocs: z.object({
    url: z.string(),
    description: z.string().optional(),
  }),
  deprecated: z.boolean().optional(),
  /** Response formats */
  responses: z.record(z.string(), z.any()),
}) satisfies ZodSchema<OpenAPIV3_1.OperationObject>

/**
 * Extended properties added to the spec definition for client usage
 *
 * WARNING: DO NOT ADD PROPERTIES THAT SHARE A NAME WITH OAS OPERATION ENTITIES
 *
 * This object is directly converted to a spec operation during saving
 */
const extendedRequestSchema = z.object({
  uid: nanoidSchema,
  /** Response history for a session */
  history: z.any().array().default([]),
  /** Security schemes which have been created specifically for this request */
  securitySchemeUids: nanoidSchema.array(),
  /** The currently selected security schemes at the request level */
  selectedSecuritySchemeUids: nanoidSchema.array(),
  /** Path Key */
  path: z.string(),
  /** Request Method */
  method: z.enum(requestMethods),
  /** List of server UIDs specific to the request */
  servers: nanoidSchema.array(),
})

/** Unified request schema for client usage */
export const requestSchema = oasRequestSchema.merge(extendedRequestSchema)
export type Request = z.infer<typeof requestSchema>
