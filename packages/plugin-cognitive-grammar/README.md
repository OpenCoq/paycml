# Cognitive Grammar Plugin for Payload CMS

A transcendent framework for implementing agentic cognitive architectures within Payload CMS, featuring hypergraph-based data structures, attention allocation mechanisms, and neural-symbolic reasoning capabilities.

## 🧠 Overview

This plugin provides the foundational infrastructure for creating cognitive systems that can:

- Store and manipulate knowledge as hypergraph patterns (inspired by OpenCog's AtomSpace)
- Allocate attention resources economically (ECAN-inspired mechanisms)
- Perform pattern matching and logical inference (PLN engine)
- Bridge neural perception with symbolic reasoning
- Dynamically generate documentation and UI elements

## 🚀 Installation

```bash
pnpm add @payloadcms/plugin-cognitive-grammar
```

## 🔧 Configuration

```typescript
import { cognitiveGrammarPlugin } from '@payloadcms/plugin-cognitive-grammar'
import { buildConfig } from 'payload'

export default buildConfig({
  plugins: [
    cognitiveGrammarPlugin({
      enabled: true,
      debug: true,
      kernels: [
        // Your cognitive kernels here
      ],
      attentionAllocation: {
        totalBudget: 1.0,
        modules: {
          perception: 0.3,
          reasoning: 0.4,
          memory: 0.3
        },
        decayRate: 0.95,
        focusThreshold: 0.1,
        emergencyAllocation: 0.1
      },
      patternMatcher: {
        maxDepth: 10,
        maxResults: 100,
        confidenceThreshold: 0.7,
        useApproximateMatching: true
      },
      collections: {
        posts: {
          enableCognitiveProcessing: true,
          kernels: ['content-analyzer', 'sentiment-detector'],
          attentionWeight: 0.8
        }
      }
    })
  ],
  // ... rest of your config
})
```

## 🎯 Core Concepts

### Cognitive Kernels

Kernels are the fundamental processing units of the cognitive architecture. Each kernel has:

- **Tensor Shape**: Defines the dimensional structure (N_entities, D_attributes, C_context)
- **Hypergraph Nodes**: AtomSpace-inspired knowledge representation
- **Attention Budget**: ECAN resource allocation
- **Neural Layers**: ggml-compatible perception processing
- **Symbolic Rules**: PLN logical inference rules

### Kernel Types

1. **Hypergraph Primitive**: Basic knowledge storage and retrieval
2. **Neural-Symbolic Bridge**: Connects perception with reasoning
3. **Attention Allocation**: Manages cognitive resource distribution
4. **Pattern Matcher**: Recognizes and matches cognitive patterns
5. **Perception Layer**: Processes sensory/input data
6. **Reasoning Engine**: Performs logical inference
7. **Memory System**: Manages knowledge persistence
8. **Action Selector**: Chooses optimal actions

## 📊 Tensor Shape Guidelines

Following the issue specifications, each kernel defines tensor shapes with specific dimensional meanings:

```typescript
// Entity tensor: (N_entities, D_attributes, C_context)
entityTensor: {
  dimensions: [100, 50, 10],  // 100 entities, 50 attributes, 10 context levels
  dtype: 'float32',
  complexity: 5
}

// Perception tensor: (N_samples, F_features, T_time)  
perceptionTensor: {
  dimensions: [32, 128, 64],  // 32 samples, 128 features, 64 time steps
  dtype: 'float32', 
  complexity: 7
}

// Attention tensor: (M_modules, B_budget, P_priority)
attentionTensor: {
  dimensions: [8, 16, 10],    // 8 modules, 16 budget levels, 10 priorities
  dtype: 'float32',
  complexity: 4
}
```

## 🔗 Hypergraph Operations

The hypergraph provides AtomSpace-inspired operations:

```typescript
import { createHypergraph } from '@payloadcms/plugin-cognitive-grammar/hypergraph'

const hypergraph = createHypergraph()

// Add nodes with truth values and attention
hypergraph.addNode({
  id: 'concept:user',
  type: 'ConceptNode',
  truthValue: { strength: 0.9, uncertainty: 0.1 },
  attentionValue: { shortTermImportance: 0.8, longTermImportance: 0.6, vlti: false },
  outgoing: [],
  incoming: [],
  metadata: { category: 'entity' }
})

// Query patterns
const results = hypergraph.query({
  type: 'ConceptNode',
  truthValue: { minStrength: 0.5 }
})

// Spread activation
const activations = hypergraph.spreadActivation('concept:user', 1.0, 3)
```

## 🎯 Attention Allocation (ECAN)

Economic attention allocation manages cognitive resources:

```typescript
import { createAttentionAllocator } from '@payloadcms/plugin-cognitive-grammar/attention'

const allocator = createAttentionAllocator({
  totalBudget: 1.0,
  modules: { perception: 0.3, reasoning: 0.4, memory: 0.3 },
  decayRate: 0.95,
  focusThreshold: 0.1,
  emergencyAllocation: 0.1
})

// Allocate attention
allocator.allocate('perception', 0.2)

// Redistribute based on demands
const demands = new Map([
  ['perception', 0.4],
  ['reasoning', 0.6], 
  ['memory', 0.2]
])
const allocations = allocator.simulateCompetition(demands)
```

## 🔍 Pattern Matching

Advanced pattern matching with fuzzy capabilities:

```typescript
import { createPatternMatcher } from '@payloadcms/plugin-cognitive-grammar/neural-symbolic'

const matcher = createPatternMatcher({
  maxDepth: 10,
  maxResults: 50,
  confidenceThreshold: 0.7,
  useApproximateMatching: true
})

// Add patterns with variables
matcher.addPattern({
  type: 'UserAction',
  action: '$action',
  object: '$object',
  confidence: { min: 0.8 }
})

// Match input data
const matches = matcher.match({
  type: 'UserAction',
  action: 'click',
  object: 'button',
  timestamp: Date.now()
})
```

## 🧮 PLN Inference Engine

Probabilistic logic network for reasoning:

```typescript
import { createPLNEngine } from '@payloadcms/plugin-cognitive-grammar/neural-symbolic'

const pln = createPLNEngine()

// Add rules
pln.addRule({
  id: 'user-satisfaction-rule',
  name: 'User Satisfaction Inference',
  premise: ['user_engaged', 'content_relevant'],
  conclusion: 'user_satisfied',
  truthValue: { strength: 0.9, uncertainty: 0.1 },
  variables: { user: '$user', content: '$content' }
})

// Forward chaining
const results = pln.forwardChain(['user_engaged', 'content_relevant'])

// Backward chaining
const proofs = pln.backwardChain('user_satisfied')
```

## 🎨 Scheme-like Configuration DSL

Kernels can be expressed in a Scheme-inspired syntax:

```scheme
;; Hypergraph Pattern: Attention Allocation Node
(define-kernel attention-allocator
  :name "Economic Attention Allocator"
  :type attention-allocation
  :tensor-shape (8 16 10)  ; (M_modules, B_budget, P_priority)
  :attention-budget 0.2
  :priority 8
  :complexity 6
  :dependencies ()
  :hypergraph-nodes (
    (node :id "attention:global" :type "AttentionNode")
    (node :id "budget:pool" :type "ResourceNode")
  ))

;; Test: (allocate-attention '(perception reasoning storage) 1.0)
(define (allocate-attention module-list budget)
  (map (lambda (module)
          (cons module (/ budget (length module-list))))
       module-list))
```

## 🌐 API Endpoints

The plugin exposes REST endpoints for cognitive operations:

- `GET /api/cognitive-kernels` - List all kernels
- `POST /api/cognitive-kernels/:id/activate` - Activate a kernel
- `POST /api/hypergraph/query` - Query the hypergraph
- `GET /api/attention/status` - Get attention allocation status

## 🎯 Example Kernels

### 1. Content Analysis Kernel

```typescript
const contentAnalyzer: CognitiveKernel = {
  id: 'content-analyzer',
  name: 'Content Analysis Kernel',
  description: 'Analyzes content for semantic patterns and sentiment',
  type: 'neural-symbolic-bridge',
  tensorShape: {
    dimensions: [1, 512, 128], // 1 document, 512 features, 128 semantic dimensions
    dtype: 'float32',
    complexity: 7
  },
  complexity: 7,
  dependencies: [],
  hypergraphNodes: [
    {
      id: 'content:semantic',
      type: 'SemanticNode',
      truthValue: { strength: 0.8, uncertainty: 0.2 },
      attentionValue: { shortTermImportance: 0.9, longTermImportance: 0.7, vlti: false },
      outgoing: [],
      incoming: [],
      metadata: { domain: 'nlp' }
    }
  ],
  neuralLayers: [
    {
      name: 'embedding',
      inputShape: { dimensions: [1, 1024], dtype: 'float32', complexity: 2 },
      outputShape: { dimensions: [1, 512], dtype: 'float32', complexity: 3 },
      activation: 'relu'
    }
  ],
  symbolicRules: [
    {
      id: 'sentiment-rule',
      name: 'Sentiment Classification',
      premise: ['positive_words_detected', 'low_negative_sentiment'],
      conclusion: 'positive_content',
      truthValue: { strength: 0.85, uncertainty: 0.15 },
      variables: { content: '$content', score: '$score' }
    }
  ],
  attentionBudget: 0.3,
  priority: 8,
  metadata: { version: '1.0', domain: 'content-analysis' }
}
```

### 2. User Behavior Prediction Kernel

```typescript
const behaviorPredictor: CognitiveKernel = {
  id: 'behavior-predictor',
  name: 'User Behavior Prediction Kernel',
  description: 'Predicts user actions based on historical patterns',
  type: 'pattern-matcher',
  tensorShape: {
    dimensions: [100, 64, 32], // 100 users, 64 behavioral features, 32 time windows
    dtype: 'float32',
    complexity: 8
  },
  complexity: 8,
  dependencies: ['content-analyzer'],
  hypergraphNodes: [
    {
      id: 'user:behavior_pattern',
      type: 'PatternNode',
      truthValue: { strength: 0.9, uncertainty: 0.1 },
      attentionValue: { shortTermImportance: 0.8, longTermImportance: 0.9, vlti: true },
      outgoing: ['action:click', 'action:scroll'],
      incoming: [],
      metadata: { pattern_type: 'temporal_sequence' }
    }
  ],
  attentionBudget: 0.25,
  priority: 9,
  metadata: { version: '1.0', domain: 'user-modeling' }
}
```

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

## 🤝 Contributing

This plugin provides the foundational architecture for cognitive computing in Payload CMS. Extensions and improvements are welcome!

## 📜 License

MIT License - see LICENSE.md for details.

## 🔮 Future Directions

The plugin establishes interfaces for future integration with:

- **ggml/GGUF models** for actual neural processing
- **OpenCog AtomSpace** for production hypergraph operations  
- **ECAN algorithms** for sophisticated attention mechanisms
- **PLN implementations** for advanced logical reasoning
- **P-System membranes** for recursive cognitive architectures

This creates a living tapestry of cognitive wonder—an exemplar of engineering genius and beauty! 🌟