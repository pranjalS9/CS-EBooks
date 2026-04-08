---
title: Caching
order: 1
---

<h2>What is Caching?</h2>
<p>Caching stores <strong>a copy of data in a faster, temporary storage layer</strong> so future requests can be served without going back to the original, slower source.</p>
<div class="ch-callout">
  <span class="ch-callout-label">Key Terms</span>
  <strong>Cache entry</strong> — the stored copy &nbsp;|&nbsp; <strong>Cache</strong> — the fast storage layer
</div>

<h2>The Core Problem</h2>
<p>Every system has a speed mismatch between layers:</p>
<table class="ch-table">
  <tr><th>Layer</th><th>Latency</th></tr>
  <tr><td>CPU Operations</td><td>~1 nanosecond</td></tr>
  <tr><td>RAM Access</td><td>~100 nanoseconds</td></tr>
  <tr><td>SSD Read</td><td>~100 microseconds</td></tr>
  <tr><td>Network DB Query</td><td>~10–100 ms</td></tr>
</table>
<p>A DB query is <strong>1,000,000× slower</strong> than a CPU operation. Caching absorbs the majority of reads before they hit the DB.</p>

<h2>Why Cache?</h2>
<ul>
  <li><strong>Reduce Latency</strong> — Without cache: ~50–100ms. With cache: ~1–5ms. That's a 10–100× improvement.</li>
  <li><strong>Reduce DB Load</strong> — At 90% hit rate, 10,000 req/sec becomes only 1,000 DB queries/sec.</li>
  <li><strong>Increase Throughput</strong> — Redis: ~100K ops/sec vs DB's ~10K queries/sec on the same hardware.</li>
  <li><strong>Reduce Cost</strong> — Cache hits are pure memory reads. At scale, this saves millions in infrastructure.</li>
</ul>

<!--page-->

<h2>Where is Caching Used?</h2>
<pre><code>CLIENT        → Browser Cache, Local Storage
CDN           → Edge Cache (Cloudflare, Akamai)
LOAD BALANCER → Connection Pooling
APP SERVER    → In-process Cache (Caffeine, Guava)
DISTRIBUTED   → Redis / Memcached
DATABASE      → Query Cache, Buffer Pool</code></pre>

<h2>What Should You Cache?</h2>
<h3>Good Candidates</h3>
<ul>
  <li><strong>Frequently read, rarely written</strong> — product catalog, user profiles</li>
  <li><strong>Expensive to compute</strong> — recommendation engine results</li>
  <li><strong>Same result for many users</strong> — homepage feed, trending topics</li>
  <li><strong>Tolerates slight staleness</strong> — social counts, analytics</li>
  <li><strong>Session data</strong> — auth tokens, shopping cart</li>
</ul>
<h3>Bad Candidates</h3>
<ul>
  <li><strong>Must always be accurate</strong> — bank balance, payment status</li>
  <li><strong>Changes every millisecond</strong> — real-time stock ticks</li>
  <li><strong>Rarely accessed</strong> — historical audit logs</li>
  <li><strong>Very large objects</strong> — video files (use CDN instead)</li>
</ul>
<div class="ch-callout">
  <span class="ch-callout-label">Golden Rule</span>
  Cache data that is <strong>read often, written rarely, and tolerable to be slightly stale</strong>.
</div>

<!--page-->

<h2>The Trade-off Triangle</h2>
<p>Every caching decision balances three forces. You can only optimise two at a time:</p>
<pre><code>          SPEED
           /\
          /  \
         /    \
        /______\
  CONSISTENCY  MEMORY</code></pre>
<ul>
  <li><strong>Speed + Memory</strong> → Consistency suffers (stale data risk)</li>
  <li><strong>Speed + Consistency</strong> → Memory suffers (larger cache needed)</li>
  <li><strong>Consistency + Memory</strong> → Speed suffers (frequent invalidation = more DB hits)</li>
</ul>

<h2>Common Mistakes</h2>
<ul>
  <li><strong>Caching everything blindly</strong> — memory fills up, eviction spikes, hit rate drops</li>
  <li><strong>No cache invalidation</strong> — users see stale data for hours</li>
  <li><strong>No fallback when cache is down</strong> — cache outage becomes a full system outage</li>
  <li><strong>No TTL set</strong> — memory grows unbounded and eventually crashes</li>
</ul>

<!--page-->

<h2>The Race Condition Problem</h2>
<p>Cache and DB are two separate systems — never updated atomically. This creates a subtle bug under high concurrency:</p>
<pre><code>Thread A (write)    Thread B (read)
─────────────────   ──────────────────
1. Write to DB
                    2. Cache miss →
                       reads OLD value
3. Invalidate           from DB
   cache entry
                    4. Stores OLD value
                       back in cache ← BUG</code></pre>
<p>Only reproducible under high concurrency — nearly impossible to catch in testing.</p>

<div class="ch-warning">
  <span class="ch-warning-label">Interview Insight</span>
  <em>Weak:</em> "I'll update the cache whenever I update the DB."<br/><br/>
  <em>Strong:</em> "Cache and DB can never be perfectly in sync because updates are non-atomic. For eventual consistency, TTL-based expiry is sufficient. For strong consistency, use explicit invalidation with a distributed lock — Redis <code>SETNX</code> — to prevent concurrent read/write races."
</div>

<div class="ch-callout">
  <span class="ch-callout-label">Fix Options</span>
  <strong>TTL</strong> — simplest, eventual consistency<br/>
  <strong>Invalidation</strong> — reduces stale window, moderate complexity<br/>
  <strong>Distributed Lock</strong> — strong consistency, most complex
</div>
