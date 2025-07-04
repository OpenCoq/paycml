// import type { CollectionConfig } from 'payload'

// Simple CollectionConfig interface to avoid dependency issues during development
interface CollectionConfig {
  slug: string
  access?: any
  admin?: any
  fields: any[]
  hooks?: any
}

/**
 * Collection for managing cognitive grammar kernels
 */
export const cognitiveGrammarCollection: CollectionConfig = {
  slug: 'cognitive-kernels',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    group: 'Cognitive Grammar',
    useAsTitle: 'name',
    description: 'Manage cognitive grammar kernels and their configurations',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the cognitive kernel',
      },
    },
    {
      name: 'kernelId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier for the kernel',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Description of the kernel\'s purpose and functionality',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Hypergraph Primitive', value: 'hypergraph-primitive' },
        { label: 'Neural-Symbolic Bridge', value: 'neural-symbolic-bridge' },
        { label: 'Attention Allocation', value: 'attention-allocation' },
        { label: 'Pattern Matcher', value: 'pattern-matcher' },
        { label: 'Perception Layer', value: 'perception-layer' },
        { label: 'Reasoning Engine', value: 'reasoning-engine' },
        { label: 'Memory System', value: 'memory-system' },
        { label: 'Action Selector', value: 'action-selector' },
      ],
      admin: {
        description: 'Type of cognitive kernel',
      },
    },
    {
      name: 'tensorShape',
      type: 'group',
      fields: [
        {
          name: 'dimensions',
          type: 'array',
          fields: [
            {
              name: 'dimension',
              type: 'number',
              required: true,
            },
          ],
          admin: {
            description: 'Tensor dimensions (e.g., [N_entities, D_attributes, C_context])',
          },
        },
        {
          name: 'dtype',
          type: 'select',
          options: [
            { label: 'Float32', value: 'float32' },
            { label: 'Float64', value: 'float64' },
            { label: 'Int32', value: 'int32' },
            { label: 'Int64', value: 'int64' },
            { label: 'Boolean', value: 'boolean' },
            { label: 'String', value: 'string' },
          ],
          defaultValue: 'float32',
          admin: {
            description: 'Data type of tensor elements',
          },
        },
        {
          name: 'complexity',
          type: 'number',
          required: true,
          min: 0,
          max: 10,
          admin: {
            description: 'Complexity score (0-10)',
          },
        },
      ],
      admin: {
        description: 'Tensor shape definition for the kernel',
      },
    },
    {
      name: 'attentionBudget',
      type: 'number',
      required: true,
      min: 0,
      max: 1,
      admin: {
        description: 'Attention budget allocation (0-1)',
      },
    },
    {
      name: 'priority',
      type: 'number',
      required: true,
      min: 0,
      max: 10,
      admin: {
        description: 'Priority level (0-10)',
      },
    },
    {
      name: 'dependencies',
      type: 'array',
      fields: [
        {
          name: 'dependency',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'List of kernel IDs this kernel depends on',
      },
    },
    {
      name: 'hypergraphNodes',
      type: 'array',
      fields: [
        {
          name: 'nodeId',
          type: 'text',
          required: true,
        },
        {
          name: 'nodeType',
          type: 'text',
          required: true,
        },
        {
          name: 'truthValue',
          type: 'group',
          fields: [
            {
              name: 'strength',
              type: 'number',
              required: true,
              min: 0,
              max: 1,
              admin: {
                description: 'Truth strength (0-1)',
              },
            },
            {
              name: 'uncertainty',
              type: 'number',
              required: true,
              min: 0,
              max: 1,
              admin: {
                description: 'Uncertainty level (0-1)',
              },
            },
          ],
        },
        {
          name: 'attentionValue',
          type: 'group',
          fields: [
            {
              name: 'shortTermImportance',
              type: 'number',
              required: true,
              min: 0,
              max: 1,
            },
            {
              name: 'longTermImportance',
              type: 'number',
              required: true,
              min: 0,
              max: 1,
            },
            {
              name: 'vlti',
              type: 'checkbox',
              label: 'Very Long Term Importance',
            },
          ],
        },
        {
          name: 'metadata',
          type: 'json',
          admin: {
            description: 'Additional metadata for the node',
          },
        },
      ],
      admin: {
        description: 'Hypergraph nodes associated with this kernel',
      },
    },
    {
      name: 'neuralLayers',
      type: 'array',
      fields: [
        {
          name: 'layerName',
          type: 'text',
          required: true,
        },
        {
          name: 'inputShape',
          type: 'group',
          fields: [
            {
              name: 'dimensions',
              type: 'array',
              fields: [
                {
                  name: 'dimension',
                  type: 'number',
                  required: true,
                },
              ],
            },
            {
              name: 'dtype',
              type: 'select',
              options: [
                { label: 'Float32', value: 'float32' },
                { label: 'Float64', value: 'float64' },
                { label: 'Int32', value: 'int32' },
                { label: 'Int64', value: 'int64' },
                { label: 'Boolean', value: 'boolean' },
                { label: 'String', value: 'string' },
              ],
              defaultValue: 'float32',
            },
            {
              name: 'complexity',
              type: 'number',
              required: true,
              min: 0,
              max: 10,
            },
          ],
        },
        {
          name: 'outputShape',
          type: 'group',
          fields: [
            {
              name: 'dimensions',
              type: 'array',
              fields: [
                {
                  name: 'dimension',
                  type: 'number',
                  required: true,
                },
              ],
            },
            {
              name: 'dtype',
              type: 'select',
              options: [
                { label: 'Float32', value: 'float32' },
                { label: 'Float64', value: 'float64' },
                { label: 'Int32', value: 'int32' },
                { label: 'Int64', value: 'int64' },
                { label: 'Boolean', value: 'boolean' },
                { label: 'String', value: 'string' },
              ],
              defaultValue: 'float32',
            },
            {
              name: 'complexity',
              type: 'number',
              required: true,
              min: 0,
              max: 10,
            },
          ],
        },
        {
          name: 'activation',
          type: 'select',
          options: [
            { label: 'ReLU', value: 'relu' },
            { label: 'Sigmoid', value: 'sigmoid' },
            { label: 'Tanh', value: 'tanh' },
            { label: 'Softmax', value: 'softmax' },
            { label: 'Linear', value: 'linear' },
          ],
          defaultValue: 'relu',
        },
      ],
      admin: {
        description: 'Neural perception layers for this kernel',
      },
    },
    {
      name: 'symbolicRules',
      type: 'array',
      fields: [
        {
          name: 'ruleId',
          type: 'text',
          required: true,
        },
        {
          name: 'ruleName',
          type: 'text',
          required: true,
        },
        {
          name: 'premise',
          type: 'array',
          fields: [
            {
              name: 'statement',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'conclusion',
          type: 'text',
          required: true,
        },
        {
          name: 'truthValue',
          type: 'group',
          fields: [
            {
              name: 'strength',
              type: 'number',
              required: true,
              min: 0,
              max: 1,
            },
            {
              name: 'uncertainty',
              type: 'number',
              required: true,
              min: 0,
              max: 1,
            },
          ],
        },
        {
          name: 'variables',
          type: 'json',
          admin: {
            description: 'Variable bindings for the rule',
          },
        },
      ],
      admin: {
        description: 'Symbolic reasoning rules for this kernel',
      },
    },
    {
      name: 'configuration',
      type: 'json',
      admin: {
        description: 'Additional configuration options for the kernel',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether the kernel is active',
      },
    },
    {
      name: 'lastActivation',
      type: 'date',
      admin: {
        description: 'Last time the kernel was activated',
        readOnly: true,
      },
    },
    {
      name: 'activationCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of times the kernel has been activated',
        readOnly: true,
      },
    },
    {
      name: 'performance',
      type: 'number',
      defaultValue: 1.0,
      min: 0,
      max: 1,
      admin: {
        description: 'Performance score (0-1)',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, _req }: { data: any; _req: any }) => {
        // Validate tensor dimensions
        if (data.tensorShape?.dimensions) {
          const dimensions = data.tensorShape.dimensions
          if (!Array.isArray(dimensions) || dimensions.length === 0) {
            throw new Error('Tensor dimensions must be a non-empty array')
          }
          
          for (const dim of dimensions) {
            if (!dim.dimension || dim.dimension <= 0) {
              throw new Error('All tensor dimensions must be positive integers')
            }
          }
        }
        
        // Validate dependencies
        if (data.dependencies) {
          for (const dep of data.dependencies) {
            if (dep.dependency === data.kernelId) {
              throw new Error('Kernel cannot depend on itself')
            }
          }
        }
        
        return data
      },
    ],
    afterChange: [
      async ({ doc, _req }: { doc: any; _req: any }) => {
        // Update activation timestamp when kernel is activated
        if (doc.active && _req?.cognitive?.kernelRegistry) {
          const registry = _req.cognitive.kernelRegistry
          const kernel = registry.get(doc.kernelId)
          if (kernel) {
            // Update the registry state
            const state = registry.getState(doc.kernelId)
            if (state) {
              state.lastActivation = new Date()
            }
          }
        }
        
        return doc
      },
    ],
  },
}