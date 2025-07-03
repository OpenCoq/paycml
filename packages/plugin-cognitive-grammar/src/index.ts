// import type { Config } from 'payload'
import type { CognitiveGrammarPluginConfig } from './types.js'
// import type { Request, Response } from 'express'

// Simple interfaces to avoid dependency issues during development
interface Config {
  collections?: any[]
  endpoints?: any[]
  globals?: any[]
}

interface Request {
  params: any
  body: any
  cognitive?: any
}

interface Response {
  json: (data: any) => void
  status: (code: number) => Response
}

import { createKernelRegistry } from './kernel-registry.js'
import { createHypergraph } from './hypergraph.js'
import { createAttentionAllocator } from './attention-allocator.js'
import { createPatternMatcher } from './pattern-matcher.js'
import { createPLNEngine } from './pln-engine.js'
import { cognitiveGrammarCollection } from './collections/cognitive-grammar.js'

/**
 * Cognitive Grammar Plugin for Payload CMS
 * 
 * This plugin provides a framework for implementing cognitive architectures
 * with hypergraph-based data structures, attention allocation, and neural-symbolic
 * reasoning capabilities.
 */
export const cognitiveGrammarPlugin = (config: CognitiveGrammarPluginConfig) => {
  return (incomingConfig: Config): Config => {
    // Skip plugin if disabled
    if (config.enabled === false) {
      return incomingConfig
    }

    // Initialize the cognitive kernel registry
    const kernelRegistry = createKernelRegistry()
    
    // Register provided kernels
    config.kernels.forEach(kernel => {
      kernelRegistry.register(kernel)
    })

    // Initialize hypergraph for cognitive data structures
    const hypergraph = createHypergraph()
    
    // Initialize attention allocator if configured
    const attentionAllocator = config.attentionAllocation 
      ? createAttentionAllocator(config.attentionAllocation)
      : undefined

    // Initialize pattern matcher if configured
    const patternMatcher = config.patternMatcher
      ? createPatternMatcher(config.patternMatcher)
      : undefined

    // Initialize PLN engine
    const plnEngine = createPLNEngine()

    // Add cognitive grammar collection for managing kernels
    const updatedCollections = [
      ...(incomingConfig.collections || []),
      cognitiveGrammarCollection,
    ]

    // Initialize cognitive processing for specified collections
    const processedCollections = updatedCollections.map(collection => {
      const cognitiveConfig = config.collections?.[collection.slug]
      
      if (!cognitiveConfig?.enableCognitiveProcessing) {
        return collection
      }

      // Add cognitive processing hooks
      return {
        ...collection,
        hooks: {
          ...collection.hooks,
          beforeValidate: [
            ...(collection.hooks?.beforeValidate || []),
            async ({ data, req }: { data: any; req: any }) => {
              // Cognitive pre-processing
              if (cognitiveConfig.kernels) {
                for (const kernelId of cognitiveConfig.kernels) {
                  const kernel = kernelRegistry.get(kernelId)
                  if (kernel) {
                    try {
                      const result = await kernelRegistry.activate(kernelId, data)
                      if (result) {
                        // Merge cognitive processing results
                        Object.assign(data, result)
                      }
                    } catch (error) {
                      if (config.debug) {
                        console.error(`Cognitive kernel ${kernelId} failed:`, error)
                      }
                    }
                  }
                }
              }
              return data
            }
          ],
          afterChange: [
            ...(collection.hooks?.afterChange || []),
            async ({ doc, req }: { doc: any; req: any }) => {
              // Update hypergraph with new data
              if (doc && typeof doc === 'object' && 'id' in doc) {
                const nodeId = `${collection.slug}:${doc.id}`
                const node = {
                  id: nodeId,
                  type: collection.slug,
                  truthValue: { strength: 1.0, uncertainty: 0.0 },
                  attentionValue: { 
                    shortTermImportance: cognitiveConfig.attentionWeight || 0.5,
                    longTermImportance: 0.5,
                    vlti: false 
                  },
                  outgoing: [],
                  incoming: [],
                  metadata: doc
                }
                hypergraph.addNode(node)
              }
              return doc
            }
          ]
        }
      }
    })

    // Add cognitive grammar endpoints
    const cognitiveEndpoints = [
      {
        path: '/cognitive-kernels',
        method: 'get' as const,
        handler: async (req: Request, res: Response) => {
          const kernels = kernelRegistry.list()
          res.json({ kernels })
        }
      },
      {
        path: '/cognitive-kernels/:id/activate',
        method: 'post' as const,
        handler: async (req: Request, res: Response) => {
          const { id } = req.params
          const { input } = req.body
          
          try {
            const result = await kernelRegistry.activate(id, input)
            res.json({ success: true, result })
          } catch (error) {
            res.status(500).json({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            })
          }
        }
      },
      {
        path: '/hypergraph/query',
        method: 'post' as const,
        handler: async (req: Request, res: Response) => {
          const { pattern } = req.body
          const nodes = hypergraph.query(pattern)
          res.json({ nodes })
        }
      },
      {
        path: '/attention/status',
        method: 'get' as const,
        handler: async (req: Request, res: Response) => {
          if (!attentionAllocator) {
            return res.status(404).json({ error: 'Attention allocator not configured' })
          }
          
          const status = {
            totalBudget: attentionAllocator.getBudget(),
            available: attentionAllocator.getAvailable(),
            allocations: Array.from(attentionAllocator.allocations.entries())
          }
          res.json(status)
        }
      }
    ]

    // Store cognitive components in global context for access
    const cognitiveContext = {
      kernelRegistry,
      hypergraph,
      attentionAllocator,
      patternMatcher,
      plnEngine,
      config
    }

    // Attach to payload instance when available
    if (incomingConfig.globals) {
      incomingConfig.globals.push({
        slug: 'cognitive-grammar-context',
        access: {
          read: () => false, // Internal use only
          update: () => false,
        },
        fields: [],
        hooks: {
          beforeValidate: [
            async ({ data, req }: { data: any; req: any }) => {
              // Attach cognitive context to request
              if (req && typeof req === 'object') {
                ;(req as any).cognitive = cognitiveContext
              }
              return data
            }
          ]
        }
      })
    }

    return {
      ...incomingConfig,
      collections: processedCollections,
      endpoints: [
        ...(incomingConfig.endpoints || []),
        ...cognitiveEndpoints
      ],
      globals: incomingConfig.globals || []
    }
  }
}

export * from './types.js'
export { createKernelRegistry } from './kernel-registry.js'
export { createHypergraph } from './hypergraph.js'
export { createAttentionAllocator } from './attention-allocator.js'
export { createPatternMatcher } from './pattern-matcher.js'
export { createPLNEngine } from './pln-engine.js'