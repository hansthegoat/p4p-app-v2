// src/lib/p4p/workflow-engine.ts
// Pure functions that drive a workflow instance through its stages.
// No React. No Supabase. No side effects. Just state transitions.

import { newId } from "./defaults";
import type {
  Employee,
  Workflow,
  WorkflowStage,
  WorkflowInstance,
  WorkflowHistoryEntry,
} from "./types";

// ============================================
// TYPES
// ============================================

export interface Actor {
  id: string;
  name: string;
}

export interface AdvanceResult {
  instance: WorkflowInstance;
  /** Actors who should now act. Empty if completed or rejected. */
  nextActors: Actor[];
  /** True if this action finished the workflow */
  completed: boolean;
  /** True if this action was a rejection */
  rejected: boolean;
}

// ============================================
// STAGE RESOLUTION
// ============================================

/**
 * Given a stage, resolve who can actually act on it.
 * Returns an empty array if no one can act (supervisor missing,
 * no HR users, HOD not found, etc.) — the caller should skip the stage.
 */
export function resolveStageActors(
  stage: WorkflowStage,
  employee: Employee,
  allEmployees: Employee[]
): Actor[] {
  switch (stage.actorRole) {
    case "supervisor": {
      if (!employee.supervisorId) return [];
      const sup = allEmployees.find((e) => e.id === employee.supervisorId);
      return sup ? [{ id: sup.id, name: sup.name }] : [];
    }

    case "hod": {
      // v0: find an active employee in the same department whose
      // role string includes "Head of Department". If none, skip.
      const hod = allEmployees.find(
        (e) =>
          e.department === employee.department &&
          e.id !== employee.id &&
          /head of department/i.test(e.role)
      );
      return hod ? [{ id: hod.id, name: hod.name }] : [];
    }

    case "hr": {
      const hrs = allEmployees.filter((e) => e.roleType === "hr");
      return hrs.map((e) => ({ id: e.id, name: e.name }));
    }

    case "specific": {
      if (!stage.actorId) return [];
      const target = allEmployees.find((e) => e.id === stage.actorId);
      return target ? [{ id: target.id, name: target.name }] : [];
    }

    default:
      return [];
  }
}

/**
 * Has the given actor already approved an earlier stage?
 * Used for dedupe — if the same person is supervisor AND HR, they
 * shouldn't have to approve twice.
 */
function hasAlreadyActed(
  history: WorkflowHistoryEntry[],
  actorId: string
): boolean {
  return history.some(
    (h) => h.actorId === actorId && h.action === "approved"
  );
}

// ============================================
// INSTANCE LIFECYCLE
// ============================================

/**
 * Create a fresh instance for a business entity and compute the
 * first actionable stage. If every stage is skippable (e.g.,
 * employee has no supervisor and org has no HR), the instance
 * is marked completed immediately.
 */
export function startInstance(
  workflow: Workflow,
  entityType: string,
  entityId: string,
  employee: Employee,
  allEmployees: Employee[]
): { instance: WorkflowInstance; firstActors: Actor[]; skipped: boolean } {
  const now = new Date().toISOString();

  const instance: WorkflowInstance = {
    id: newId(),
    orgId: workflow.orgId,
    workflowId: workflow.id,
    entityType,
    entityId,
    currentStageIndex: 0,
    stagesSnapshot: workflow.stages.map((s) => ({ ...s })),
    status: "active",
    history: [
      {
        stageIndex: -1,
        stageName: "Workflow started",
        actorId: "",
        actorName: "",
        action: "started",
        actedAt: now,
      },
    ],
    startedAt: now,
  };

  // Walk forward past any stages that resolve to nobody.
  const first = findNextActionableStage(
    instance,
    employee,
    allEmployees
  );

  return {
    instance: first.instance,
    firstActors: first.actors,
    skipped: first.skippedAny,
  };
}

/**
 * Given the current state, walk forward through stages until we
 * land on one where at least one actor can act. Skips:
 *   - stages with no resolvable actors
 *   - stages whose only actors already approved earlier
 * Appends "skipped" entries to history for every stage we pass.
 * Returns { instance, actors, skippedAny }.
 */
function findNextActionableStage(
  instance: WorkflowInstance,
  employee: Employee,
  allEmployees: Employee[]
): { instance: WorkflowInstance; actors: Actor[]; skippedAny: boolean } {
  let current = instance;
  let index = current.currentStageIndex;
  let skippedAny = false;

  while (index < current.stagesSnapshot.length) {
    const stage = current.stagesSnapshot[index];
    const resolved = resolveStageActors(stage, employee, allEmployees);

    // Actors who have already acted on an earlier stage are filtered out.
    const filtered = resolved.filter(
      (a) => !hasAlreadyActed(current.history, a.id)
    );

    if (filtered.length > 0) {
      // Found a stage to stop on.
      return {
        instance: { ...current, currentStageIndex: index, status: "active" },
        actors: filtered,
        skippedAny,
      };
    }

    // Nothing to do here — log the skip and move on.
    const reason =
      resolved.length === 0
        ? "No actor could be resolved"
        : "Same actor already approved an earlier stage";

    current = {
      ...current,
      history: [
        ...current.history,
        {
          stageIndex: index,
          stageName: stage.name,
          actorId: "",
          actorName: "",
          action: "skipped",
          comment: reason,
          actedAt: new Date().toISOString(),
        },
      ],
    };
    skippedAny = true;
    index++;
  }

  // Ran off the end — nothing to do, mark completed.
  return {
    instance: {
      ...current,
      status: "completed",
      currentStageIndex: index,
      completedAt: new Date().toISOString(),
    },
    actors: [],
    skippedAny,
  };
}

// ============================================
// ADVANCE
// ============================================

/**
 * Record an action from an actor on the current stage and return
 * the updated instance plus the next set of actors.
 *
 * Supported actions: "approved" | "rejected".
 */
export function advanceInstance(
  instance: WorkflowInstance,
  actorId: string,
  actorName: string,
  action: "approved" | "rejected",
  employee: Employee,
  allEmployees: Employee[],
  comment?: string
): AdvanceResult {
  if (instance.status !== "active") {
    throw new Error(`Cannot advance instance with status "${instance.status}"`);
  }

  const stageIndex = instance.currentStageIndex;
  const stage = instance.stagesSnapshot[stageIndex];
  if (!stage) {
    throw new Error("Instance is on a stage that no longer exists");
  }

  const now = new Date().toISOString();

  const historyEntry: WorkflowHistoryEntry = {
    stageIndex,
    stageName: stage.name,
    actorId,
    actorName,
    action,
    comment,
    actedAt: now,
  };

  const withHistory: WorkflowInstance = {
    ...instance,
    history: [...instance.history, historyEntry],
  };

  // ── Rejection ends the workflow ──
  if (action === "rejected") {
    return {
      instance: {
        ...withHistory,
        status: "rejected",
        completedAt: now,
      },
      nextActors: [],
      completed: false,
      rejected: true,
    };
  }

  // ── Approval advances to the next actionable stage ──
  const advanced: WorkflowInstance = {
    ...withHistory,
    currentStageIndex: stageIndex + 1,
  };

  const next = findNextActionableStage(advanced, employee, allEmployees);

  return {
    instance: next.instance,
    nextActors: next.actors,
    completed: next.instance.status === "completed",
    rejected: false,
  };
}

// ============================================
// QUERIES (read-only helpers)
// ============================================

/**
 * The stage the instance is currently parked on.
 * Returns null if completed / rejected / cancelled.
 */
export function getCurrentStage(
  instance: WorkflowInstance
): WorkflowStage | null {
  if (instance.status !== "active") return null;
  return instance.stagesSnapshot[instance.currentStageIndex] ?? null;
}

/**
 * Can the given actor act on the current stage?
 */
export function canActorAct(
  instance: WorkflowInstance,
  actorId: string,
  employee: Employee,
  allEmployees: Employee[]
): boolean {
  const stage = getCurrentStage(instance);
  if (!stage) return false;

  const resolved = resolveStageActors(stage, employee, allEmployees);
  if (!resolved.some((a) => a.id === actorId)) return false;

  // Same person can't approve twice
  if (hasAlreadyActed(instance.history, actorId)) return false;

  return true;
}

/**
 * Human-readable summary of the current stage for UI display.
 * e.g. "Waiting on Sarah Supervisor (Review)"
 */
export function describeCurrentStage(
  instance: WorkflowInstance,
  employee: Employee,
  allEmployees: Employee[]
): string {
  const stage = getCurrentStage(instance);
  if (!stage) {
    if (instance.status === "completed") return "Completed";
    if (instance.status === "rejected") return "Rejected";
    if (instance.status === "cancelled") return "Cancelled";
    return "Unknown";
  }

  const actors = resolveStageActors(stage, employee, allEmployees);
  const names = actors.map((a) => a.name).join(", ");
  return `Waiting on ${names || "…"} (${stage.name})`;
}