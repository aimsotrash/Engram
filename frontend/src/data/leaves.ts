import type { Chunk } from '@/lib/types';

type LF = [string, string, number, number, string];
// [title, folder, retention, daysAgo, content]

const RAW: LF[] = [
  // ── Development · strong ──────────────────────────────────────
  ['React Hooks Pattern','Development',0.98,1,'Deep dive into useState, useEffect, useCallback, useMemo and custom hooks architecture.'],
  ['TypeScript Generics','Development',0.97,1,'Advanced generic constraints, conditional types, and mapped types for type-safe APIs.'],
  ['JavaScript Closures','Development',0.96,2,'Lexical scoping, closure creation, and memory implications in event handlers.'],
  ['CSS Grid Layout','Development',0.95,2,'Two-dimensional layouts, grid template areas, and responsive grid systems.'],
  ['Flexbox Complete Guide','Development',0.94,1,'Flex container vs item properties, alignment, wrapping, and common layout patterns.'],
  ['Git Branching Strategy','Development',0.93,3,'Feature branches, trunk-based development, GitFlow vs GitHub Flow comparison.'],
  ['REST API Design','Development',0.92,2,'Resource naming, HTTP methods, status codes, versioning, and HATEOAS principles.'],
  ['JWT Authentication','Development',0.91,4,'Token structure, signing algorithms, refresh token rotation, and storage strategies.'],
  ['Docker Containerization','Development',0.90,3,'Dockerfile best practices, layer caching, multi-stage builds, and image optimization.'],
  ['Node.js Event Loop','Development',0.89,2,'Call stack, task queue, microtask queue, libuv, and avoiding event loop blocking.'],
  ['React Context API','Development',0.88,5,'Provider pattern, context splitting to avoid re-renders, and composition with hooks.'],
  ['TypeScript Utility Types','Development',0.87,4,'Partial, Required, Pick, Omit, Record, ReturnType, and creating custom utility types.'],
  ['Express Middleware Chain','Development',0.86,3,'Middleware execution order, error handling middleware, and async middleware patterns.'],
  ['Async/Await Patterns','Development',0.85,6,'Promise chaining, parallel execution with Promise.all, error propagation, and cancellation.'],
  ['WebSockets Implementation','Development',0.83,4,'WS protocol handshake, connection lifecycle, heartbeat/ping-pong, and reconnection.'],
  ['React Query Caching','Development',0.82,5,'staleTime, cacheTime, background refetching, optimistic updates, and query invalidation.'],
  ['Vite Configuration','Development',0.82,4,'Plugin system, alias resolution, environment variables, and production build tuning.'],
  ['ESLint TypeScript Setup','Development',0.81,3,'@typescript-eslint plugin rules, import ordering, custom rule configuration.'],
  ['npm Workspaces','Development',0.81,7,'Monorepo setup, hoisting, cross-package dependencies, and shared tsconfig.'],
  ['Python async/await','Development',0.80,5,'asyncio event loop, coroutines, tasks, semaphores, and aiohttp usage.'],
  ['bcrypt Password Hashing','Development',0.80,6,'Salt rounds, hash comparison, timing attacks, and Argon2 as modern alternative.'],
  ['HTTP/2 Protocol','Development',0.79,7,'Multiplexing, header compression (HPACK), server push, and stream prioritization.'],
  ['Docker Compose Setup','Development',0.79,5,'Service definitions, volume mounts, network bridges, health checks, and env files.'],
  ['Zustand State Management','Development',0.78,8,'Store slices, middleware, devtools integration, and comparison with Redux.'],
  ['Redux Toolkit','Development',0.78,7,'createSlice, createAsyncThunk, RTK Query, and entity adapters for normalized state.'],
  ['Custom React Hooks','Development',0.77,6,'Extraction pattern, dependency arrays, composition, and testing custom hooks.'],
  ['CSS Custom Properties','Development',0.77,9,'Variable cascade, computed values, runtime theming, and fallback values.'],
  ['Python Decorators','Development',0.76,8,'Function vs class decorators, functools.wraps, parameterized decorators, stacking.'],
  ['FastAPI Routing','Development',0.76,10,'Path parameters, query params, request body, dependency injection, and APIRouter.'],
  ['Webpack Code Splitting','Development',0.76,7,'Dynamic import, SplitChunksPlugin, magic comments, and bundle analysis.'],
  ['TypeScript Discriminated Unions','Development',0.75,9,'Exhaustive checks with never, type narrowing, and pattern matching alternatives.'],
  ['React Router v6','Development',0.75,8,'Nested routes, outlet, loader/action, lazy routes, and migration from v5.'],
  ['Pydantic Validation','Development',0.75,11,'BaseModel, field validators, computed fields, model config, and serialization.'],
  // ── Development · fading ─────────────────────────────────────
  ['OAuth2.0 Implementation','Development',0.72,12,'Authorization code flow, PKCE, token refresh, scopes, and provider integration.'],
  ['Redis Pub/Sub System','Development',0.70,14,'Channel subscriptions, pattern matching, message broker patterns, and scaling.'],
  ['FastAPI Background Tasks','Development',0.68,18,'BackgroundTasks vs Celery, task queuing, progress tracking, and error handling.'],
  ['Kubernetes Deployments','Development',0.65,20,'Deployment manifests, ReplicaSets, rolling updates, readiness/liveness probes.'],
  ['PostgreSQL Indexing','Development',0.62,22,'B-tree vs GiST vs GIN, partial indexes, covering indexes, and EXPLAIN ANALYZE.'],
  ['GraphQL Schema Design','Development',0.60,25,'Type system, resolvers, dataloader batching, N+1 problem, and subscriptions.'],
  ['Nginx Configuration','Development',0.58,28,'Upstream proxying, SSL termination, rate limiting, gzip, and location blocks.'],
  ['CI/CD Pipeline Setup','Development',0.55,30,'GitHub Actions workflow, artifact caching, matrix builds, and deploy gates.'],
  ['Terraform Basics','Development',0.52,35,'HCL syntax, providers, state management, workspaces, and remote backends.'],
  ['Microservices Patterns','Development',0.50,40,'Saga, CQRS, event sourcing, circuit breaker, and service mesh concepts.'],
  ['Service Mesh Overview','Development',0.48,45,'Istio sidecar proxy, mTLS, traffic management, observability, and control plane.'],
  ['gRPC Implementation','Development',0.46,50,'Proto3 syntax, service definitions, streaming, interceptors, and deadlines.'],
  // ── Development · weak ───────────────────────────────────────
  ['Serverless Functions','Development',0.40,60,'Cold starts, execution limits, event triggers, and cost optimization strategies.'],
  ['Rust Ownership Model','Development',0.32,75,'Borrow checker, lifetimes, moves vs copies, and the memory safety guarantees.'],
  ['WebAssembly Basics','Development',0.25,90,'Binary format, linear memory, JS interop, and use cases for compute-heavy tasks.'],
  ['Kafka Streams','Development',0.18,110,'Partitions, consumer groups, stream processing topology, and exactly-once semantics.'],
  ['Go Goroutines','Development',0.14,130,'Goroutine scheduler, channels, select statement, and concurrency patterns.'],
  // ── Development · forgotten ──────────────────────────────────
  ['Erlang Actor Model','Development',0.06,180,'Lightweight processes, message passing, OTP supervision trees, and fault tolerance.'],
  ['Haskell Type System','Development',0.04,200,'Monads, type classes, lazy evaluation, and purely functional programming concepts.'],

  // ── AI/ML · strong ───────────────────────────────────────────
  ['Transformer Architecture','AI/ML',0.95,2,'Self-attention, multi-head attention, positional encoding, and the encoder-decoder stack.'],
  ['Prompt Engineering','AI/ML',0.94,1,'Few-shot prompting, chain-of-thought, system prompts, and instruction tuning.'],
  ['RAG Pipeline Design','AI/ML',0.92,3,'Retrieval-Augmented Generation: chunking, embedding, vector search, and re-ranking.'],
  ['LLM Fine-tuning','AI/ML',0.90,4,'LoRA, QLoRA, RLHF, instruction tuning, and catastrophic forgetting prevention.'],
  ['Embedding Models','AI/ML',0.88,5,'Sentence transformers, contrastive learning, cosine similarity, and embedding spaces.'],
  ['Vector Database Design','AI/ML',0.87,4,'Approximate nearest neighbor, HNSW, IVF, and Pinecone vs Weaviate vs Qdrant.'],
  ['Attention Mechanism','AI/ML',0.85,6,'Scaled dot-product attention, key-query-value matrices, and attention visualization.'],
  ['OpenAI API Integration','AI/ML',0.84,5,'Chat completions, function calling, streaming, token counting, and rate limiting.'],
  ['LangChain Framework','AI/ML',0.82,7,'Chains, agents, memory types, tools, and building RAG applications.'],
  ['Hugging Face Pipeline','AI/ML',0.81,8,'Model hub, transformers library, tokenizers, and inference optimization.'],
  ['Neural Network Basics','AI/ML',0.80,9,'Backpropagation, gradient descent, activation functions, and vanishing gradients.'],
  ['Convolutional Networks','AI/ML',0.79,7,'Feature maps, pooling, receptive field, and architectures from LeNet to ResNet.'],
  ['BERT Pre-training','AI/ML',0.78,10,'Masked language modeling, NSP, contextual embeddings, and downstream fine-tuning.'],
  ['Semantic Search','AI/ML',0.76,11,'Dense retrieval, bi-encoders, cross-encoders, and hybrid BM25+dense search.'],
  ['Text Chunking Strategies','AI/ML',0.76,8,'Sentence splitting, recursive chunking, overlap strategies, and chunk metadata.'],
  ['GPT Architecture','AI/ML',0.75,12,'Decoder-only transformer, causal masking, in-context learning, and scaling laws.'],
  // ── AI/ML · fading ───────────────────────────────────────────
  ['CLIP Embeddings Guide','AI/ML',0.71,13,'Contrastive image-text pretraining, zero-shot classification, and multimodal search.'],
  ['Diffusion Models','AI/ML',0.68,16,'Forward noising, denoising score matching, DDPM, and latent diffusion.'],
  ['Reinforcement Learning','AI/ML',0.65,20,'Q-learning, policy gradients, reward shaping, and PPO algorithm.'],
  ['Time Series Forecasting','AI/ML',0.62,25,'ARIMA, Prophet, LSTM for sequences, and feature engineering for time series.'],
  ['Anomaly Detection','AI/ML',0.60,28,'Isolation Forest, autoencoders, statistical methods, and threshold selection.'],
  ['Graph Neural Networks','AI/ML',0.57,32,'Message passing, GCN, GAT, link prediction, and molecular property prediction.'],
  ['Federated Learning','AI/ML',0.54,38,'Privacy-preserving training, FedAvg, differential privacy, and communication costs.'],
  ['Model Quantization','AI/ML',0.51,42,'INT8/INT4 quantization, post-training vs QAT, calibration, and accuracy tradeoffs.'],
  ['Knowledge Distillation','AI/ML',0.48,48,'Teacher-student training, soft targets, temperature scaling, and task-specific distillation.'],
  ['Active Learning','AI/ML',0.46,55,'Query strategies, uncertainty sampling, diversity sampling, and annotation cost reduction.'],
  // ── AI/ML · weak ─────────────────────────────────────────────
  ['Bayesian Neural Networks','AI/ML',0.38,70,'Weight uncertainty, variational inference, Monte Carlo dropout, and calibration.'],
  ['Meta-Learning','AI/ML',0.30,85,'Few-shot learning, MAML, Prototypical Networks, and model-agnostic approaches.'],
  ['Causal Inference in ML','AI/ML',0.22,100,'Structural causal models, interventions, counterfactuals, and deconfounding.'],
  ['Neuromorphic Computing','AI/ML',0.15,140,'Spiking neural networks, event-driven computation, and Intel Loihi architecture.'],
  // ── AI/ML · forgotten ────────────────────────────────────────
  ['Kolmogorov Complexity','AI/ML',0.07,190,'Minimum description length, algorithmic information theory, and compression bounds.'],
  ['Liquid State Machines','AI/ML',0.03,220,'Reservoir computing, echo state networks, and temporal processing with fixed weights.'],

  // ── System Design · strong ───────────────────────────────────
  ['Load Balancing Strategies','System Design',0.82,3,'Round-robin, least connections, consistent hashing, and health check integration.'],
  ['Database Sharding','System Design',0.80,4,'Horizontal partitioning, shard keys, hotspot prevention, and cross-shard queries.'],
  ['Caching Patterns','System Design',0.79,5,'Cache-aside, write-through, write-behind, TTL strategies, and eviction policies.'],
  ['CAP Theorem','System Design',0.77,6,'Consistency vs availability trade-off, partition tolerance, and real-world examples.'],
  ['ACID Properties','System Design',0.76,7,'Atomicity, consistency, isolation, durability, and transaction isolation levels.'],
  ['Event Sourcing','System Design',0.75,8,'Event log as source of truth, projections, snapshots, and temporal queries.'],
  // ── System Design · fading ───────────────────────────────────
  ['API Gateway Pattern','System Design',0.72,10,'Rate limiting, auth, routing, aggregation, and BFF (Backend for Frontend) pattern.'],
  ['Message Queue Design','System Design',0.70,12,'At-least-once vs exactly-once delivery, dead letter queues, and backpressure.'],
  ['CQRS Pattern','System Design',0.67,15,'Command/query separation, eventual consistency, read model optimization.'],
  ['Distributed Tracing','System Design',0.65,18,'OpenTelemetry, trace context propagation, span relationships, and sampling.'],
  ['Database Replication','System Design',0.62,22,'Primary-replica setup, synchronous vs async replication, and failover strategies.'],
  ['Rate Limiting Algorithms','System Design',0.60,26,'Token bucket, leaky bucket, sliding window, and Redis-based implementation.'],
  ['Service Discovery','System Design',0.58,30,'Client-side vs server-side discovery, Consul, etcd, and DNS-based discovery.'],
  ['Saga Pattern','System Design',0.55,35,'Choreography vs orchestration, compensation transactions, and rollback strategies.'],
  ['Circuit Breaker Pattern','System Design',0.52,40,'Closed/open/half-open states, failure threshold, timeout, and Hystrix/Resilience4j.'],
  ['Distributed Locking','System Design',0.50,45,'Redlock algorithm, ZooKeeper sequential nodes, and TTL-based lock expiry.'],
  ['Two-Phase Commit','System Design',0.47,50,'Coordinator-participant protocol, prepare/commit phases, and failure scenarios.'],
  ['Bloom Filters','System Design',0.45,55,'Probabilistic set membership, false positive rate, space efficiency, and use cases.'],
  // ── System Design · weak ─────────────────────────────────────
  ['Vector Clocks','System Design',0.38,65,'Partial ordering of events, causality tracking, and conflict detection in distributed systems.'],
  ['Paxos Consensus','System Design',0.30,80,'Prepare/promise/accept phases, quorum, and leader election in distributed consensus.'],
  ['Raft Algorithm','System Design',0.25,95,'Log replication, leader election, membership changes, and comparison with Paxos.'],
  ['Byzantine Fault Tolerance','System Design',0.18,115,'Byzantine generals problem, PBFT, and blockchain consensus mechanisms.'],
  ['Consistent Hashing Ring','System Design',0.15,135,'Virtual nodes, token distribution, data migration on node join/leave.'],
  ['CRDTs','System Design',0.12,160,'Conflict-free replicated data types, G-Counter, LWW-Register, and operational CRDTs.'],
  // ── System Design · forgotten ────────────────────────────────
  ['Lamport Timestamps','System Design',0.08,185,'Logical clocks, happens-before relation, and total ordering in distributed events.'],
  ['Chord DHT Protocol','System Design',0.05,210,'Finger tables, consistent hashing, key lookup, and node join/stabilization.'],

  // ── Productivity · strong ────────────────────────────────────
  ['Pomodoro Technique','Productivity',0.96,1,'25-minute focused sessions, short/long breaks, and flow state maintenance.'],
  ['Zettelkasten Method','Productivity',0.94,2,'Atomic notes, permanent vs fleeting notes, and bidirectional linking.'],
  ['GTD Framework','Productivity',0.92,3,'Capture, clarify, organize, reflect, engage — the 5 steps of stress-free productivity.'],
  ['Deep Work Principles','Productivity',0.90,4,'Uninterrupted focus blocks, attention residue, and scheduling deep work sessions.'],
  ['Second Brain PARA','Productivity',0.88,5,'Projects, Areas, Resources, Archives — digital organization for knowledge workers.'],
  ['Spaced Repetition System','Productivity',0.87,4,'Forgetting curve, review intervals, Anki deck design, and retention optimization.'],
  ['Inbox Zero Workflow','Productivity',0.86,6,'Email triage, defer/do/delegate/delete, and keeping the inbox as a trusted system.'],
  ['Time Blocking Calendar','Productivity',0.85,5,'Theming days, defensive scheduling, buffer blocks, and weekly review.'],
  ['Feynman Learning Technique','Productivity',0.83,7,'Explain simply, identify gaps, simplify further, and teach to retain.'],
  ['Active Recall Study','Productivity',0.82,8,'Retrieval practice, self-quizzing, and the testing effect in memory formation.'],
  ['Mind Mapping','Productivity',0.80,9,'Central idea branching, color coding, spatial thinking, and concept connections.'],
  ['Eisenhower Matrix','Productivity',0.79,10,'Urgent vs important quadrants, delegation, and eliminating low-value tasks.'],
  ['Habit Stacking','Productivity',0.78,11,'Anchoring new habits to existing ones, implementation intentions, and cue design.'],
  ['Morning Routines','Productivity',0.77,12,'Consistent wake time, activation energy reduction, and keystone habit design.'],
  ['Weekly Review Process','Productivity',0.76,13,'Collecting, processing, organizing, reviewing, and next week planning ritual.'],
  ['Note-Taking Cornell Method','Productivity',0.75,14,'Cue column, notes column, summary section, and review triggers.'],
  // ── Productivity · fading ────────────────────────────────────
  ['Bullet Journal System','Productivity',0.71,16,'Rapid logging, daily/monthly logs, future log, and migration practice.'],
  ['Kanban Board Design','Productivity',0.68,20,'WIP limits, flow visualization, pull system, and continuous improvement.'],
  ['OKR Framework','Productivity',0.64,25,'Objective and key results, alignment, grading rubric, and quarterly cadence.'],
  ['Energy Management','Productivity',0.60,30,'Ultradian rhythms, energy auditing, recovery rituals, and peak performance timing.'],
  ['Reading Workflow','Productivity',0.55,38,'Active reading, marginalia, highlights to notes, and literature review process.'],
  // ── Productivity · weak ──────────────────────────────────────
  ['Stoic Journaling','Productivity',0.38,65,'Evening reflection, negative visualization, premeditatio malorum, and gratitude.'],
  ['Analogical Thinking','Productivity',0.28,85,'Cross-domain insights, structural mapping, and analogical reasoning for problem-solving.'],
  ['Interleaving Practice','Productivity',0.15,120,'Mixed practice effects, desirable difficulties, and long-term retention improvement.'],

  // ── Personal · strong ────────────────────────────────────────
  ['Sleep Optimization','Personal',0.90,2,'Sleep debt, circadian rhythm, REM cycles, and sleep hygiene practices.'],
  ['Exercise and Cognition','Personal',0.87,4,'BDNF production, neurogenesis, and optimal workout timing for learning.'],
  ['Nutrition for Focus','Personal',0.84,6,'Glucose stability, omega-3s, caffeine half-life, and avoiding afternoon crashes.'],
  ['Mindfulness Meditation','Personal',0.82,8,'Focused attention vs open monitoring, default mode network, and stress reduction.'],
  ['Cold Exposure Benefits','Personal',0.79,10,'Cold water therapy, dopamine release, brown fat activation, and mental resilience.'],
  // ── Personal · fading ────────────────────────────────────────
  ['Journaling for Clarity','Personal',0.70,14,'Stream of consciousness, structured prompts, and reflective writing benefits.'],
  ['Digital Minimalism','Personal',0.65,20,'Intentional tech use, app removal experiments, and reclaiming attention.'],
  ['Reading Fiction Benefits','Personal',0.60,28,'Empathy building, theory of mind, vocabulary expansion, and cognitive flexibility.'],
  ['Social Connection Science','Personal',0.55,35,'Loneliness health effects, quality vs quantity of relationships, and weak ties.'],
  ['Gratitude Practice','Personal',0.50,44,'Reappraisal, hedonic adaptation prevention, and neurological effects of gratitude.'],
  ['Financial Independence','Personal',0.47,52,'FIRE movement, savings rate, compound growth, and withdrawal rate strategies.'],
  ['Breathing Techniques','Personal',0.45,58,'Box breathing, 4-7-8 method, physiological sigh, and HRV improvement.'],
  // ── Personal · weak ──────────────────────────────────────────
  ['Flow State Science','Personal',0.35,70,'Csikszentmihalyi model, challenge-skill balance, autotelic experience triggers.'],
  ['Learning Languages','Personal',0.22,100,'Comprehensible input, spaced immersion, output practice, and polyglot strategies.'],
  ['Creativity Techniques','Personal',0.14,140,'Divergent thinking, SCAMPER, random input, and incubation periods.'],
  // ── Personal · forgotten ─────────────────────────────────────
  ['Lucid Dreaming Induction','Personal',0.06,190,'WILD/MILD techniques, reality checks, dream journaling, and sleep scheduling.'],
  ['Stoic Philosophy Basics','Personal',0.04,210,'Virtue ethics, dichotomy of control, memento mori, and practical Stoicism.'],
];

function msAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export const MOCK_LEAVES: Chunk[] = RAW.map(([title, folder, retention, daysAgo, content], i) => ({
  id: `leaf-${i + 1}`,
  content,
  source_type: 'file',
  source_name: title,
  category: (['AI/ML', 'System Design'].includes(folder) ? 'technical' :
             folder === 'Productivity' ? 'general' :
             folder === 'Personal' ? 'personal' : 'technical') as
             'technical' | 'personal' | 'reference' | 'general',
  created_at: msAgo(daysAgo + 30),
  last_accessed: msAgo(daysAgo),
  access_count: Math.max(1, Math.round(retention * 22)),
  stability_S: retention,
  complexity_k: 0.15 + (i % 7) * 0.04,
  retention,
  tags: [folder.toLowerCase().replace('/', '-').replace(' ', '-')],
  folder,
}));

export const CATEGORY_STATS = [
  { name: 'Development',   pct: 82, col: '#38d96b', count: RAW.filter(r => r[1] === 'Development').length },
  { name: 'AI/ML',         pct: 68, col: '#8BEA55', count: RAW.filter(r => r[1] === 'AI/ML').length },
  { name: 'System Design', pct: 41, col: '#F4D03F', count: RAW.filter(r => r[1] === 'System Design').length },
  { name: 'Productivity',  pct: 75, col: '#38bef4', count: RAW.filter(r => r[1] === 'Productivity').length },
  { name: 'Personal',      pct: 45, col: '#FF9A1F', count: RAW.filter(r => r[1] === 'Personal').length },
];
