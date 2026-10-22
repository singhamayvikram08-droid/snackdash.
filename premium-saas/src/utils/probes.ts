/**
 * NexGen AI PRO — Cloud-Native Kubernetes & Microservice Health Probes
 * 
 * Standard Probe Definitions:
 * - Liveness Probe: Determines if the process is alive. Failed probe triggers container restart.
 * - Readiness Probe: Determines if the service is ready for traffic. Failed probe removes pod from endpoints.
 * - Startup Probe: Determines if initial bootstrap completed. Protects slow-starting containers.
 */

export interface ProbeMemoryTelemetry {
  heapUsedMB: number;
  heapTotalMB: number;
  rssMB: number;
  heapUtilizationPct: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface LivenessProbeResult {
  status: 'UP' | 'DOWN';
  probe: 'liveness';
  statusCode: number;
  timestamp: string;
  uptimeSeconds: number;
  checks: {
    process: 'RUNNING' | 'HALTED';
    eventLoopLagMs: number;
    memory: ProbeMemoryTelemetry;
  };
}

export interface ReadinessProbeResult {
  status: 'READY' | 'DRAINING' | 'NOT_READY';
  probe: 'readiness';
  statusCode: number;
  timestamp: string;
  acceptingTraffic: boolean;
  dependencies: {
    aiGateway: 'HEALTHY' | 'DEGRADED';
    rateLimiter: 'INITIALIZED' | 'UNHEALTHY';
    zeroTrustRbac: 'ACTIVE' | 'INACTIVE';
    storage: 'CONNECTED' | 'DISCONNECTED';
  };
}

export interface StartupProbeResult {
  status: 'STARTED' | 'BOOTSTRAPPING';
  probe: 'startup';
  statusCode: number;
  timestamp: string;
  bootDurationMs: number;
  subsystems: {
    name: string;
    initialized: boolean;
  }[];
}

export interface AggregatedHealthResult {
  status: 'UP' | 'DEGRADED' | 'DOWN';
  timestamp: string;
  uptimeSeconds: number;
  probes: {
    liveness: LivenessProbeResult;
    readiness: ReadinessProbeResult;
    startup: StartupProbeResult;
  };
  environment: string;
  version: string;
}

/**
 * Fetch Liveness Probe from the server (/live or /api/health/liveness)
 */
export async function fetchLivenessProbe(): Promise<LivenessProbeResult> {
  const res = await fetch('/api/health/liveness');
  return res.json();
}

/**
 * Fetch Readiness Probe from the server (/ready or /api/health/readiness)
 */
export async function fetchReadinessProbe(): Promise<ReadinessProbeResult> {
  const res = await fetch('/api/health/readiness');
  return res.json();
}

/**
 * Fetch Startup Probe from the server (/startup or /api/health/startup)
 */
export async function fetchStartupProbe(): Promise<StartupProbeResult> {
  const res = await fetch('/api/health/startup');
  return res.json();
}

/**
 * Fetch Aggregated Health status encompassing all three probes (/health or /api/health)
 */
export async function fetchAggregatedHealth(): Promise<AggregatedHealthResult> {
  const res = await fetch('/api/health');
  return res.json();
}

/**
 * Toggle readiness state (simulate draining traffic / maintenance mode)
 */
export async function toggleTrafficDrain(drain?: boolean): Promise<{ acceptingTraffic: boolean; status: string }> {
  const res = await fetch('/api/health/toggle-ready', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ drain }),
  });
  return res.json();
}
