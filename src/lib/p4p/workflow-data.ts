// src/lib/p4p/workflow-data.ts
// Supabase access for the Workflow Engine (v0).
// Two tables: workflows (config) and workflow_instances (runtime).

import { supabase } from "@/lib/supabase";
import { getCurrentOrgId } from "./supabase-data";
import type {
  Workflow,
  WorkflowStage,
  WorkflowInstance,
  WorkflowHistoryEntry,
} from "./types";

// ============================================
// WORKFLOWS (config)
// ============================================

/**
 * Load the active workflow for a process in the current org.
 * Returns null if the org hasn't configured one.
 */
export async function fetchWorkflow(
  processKey: string
): Promise<Workflow | null> {
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("org_id", getCurrentOrgId())
    .eq("process_key", processKey)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("fetchWorkflow error:", error);
    return null;
  }

  return data ? mapWorkflowFromDB(data) : null;
}

/**
 * Load every workflow in the current org. Used by the setup page.
 */
export async function fetchAllWorkflows(): Promise<Workflow[]> {
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("org_id", getCurrentOrgId())
    .order("created_at", { ascending: true });

  if (error) {
    console.error("fetchAllWorkflows error:", error);
    return [];
  }

  return (data || []).map(mapWorkflowFromDB);
}

/**
 * Insert or update a workflow.
 * Conflict target is (org_id, process_key) — one workflow per process per org.
 * Uses upsert with a synthetic id if new.
 */
export async function upsertWorkflow(workflow: Workflow): Promise<Workflow> {
  const row = mapWorkflowToDB(workflow);

  const { data, error } = await supabase
    .from("workflows")
    .upsert(row, { onConflict: "org_id,process_key" })
    .select("*")
    .single();

  if (error) {
    console.error("upsertWorkflow error:", error);
    throw error;
  }

  return mapWorkflowFromDB(data);
}

/**
 * Delete a workflow by id. Instances referencing it will have
 * workflow_id set to NULL via ON DELETE SET NULL.
 */
export async function deleteWorkflow(id: string): Promise<void> {
  const { error } = await supabase
    .from("workflows")
    .delete()
    .eq("org_id", getCurrentOrgId())
    .eq("id", id);

  if (error) {
    console.error("deleteWorkflow error:", error);
    throw error;
  }
}

// ============================================
// WORKFLOW INSTANCES (runtime)
// ============================================

/**
 * Load the runtime instance for one business entity.
 * Returns null if none exists yet.
 */
export async function fetchWorkflowInstance(
  entityType: string,
  entityId: string
): Promise<WorkflowInstance | null> {
  const { data, error } = await supabase
    .from("workflow_instances")
    .select("*")
    .eq("org_id", getCurrentOrgId())
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .maybeSingle();

  if (error) {
    console.error("fetchWorkflowInstance error:", error);
    return null;
  }

  return data ? mapInstanceFromDB(data) : null;
}

/**
 * Load every instance for a set of entity IDs. Used by the
 * appraisals-review screen to show workflow status on each card.
 */
export async function fetchInstancesForEntities(
  entityType: string,
  entityIds: string[]
): Promise<Record<string, WorkflowInstance>> {
  if (entityIds.length === 0) return {};

  const { data, error } = await supabase
    .from("workflow_instances")
    .select("*")
    .eq("org_id", getCurrentOrgId())
    .eq("entity_type", entityType)
    .in("entity_id", entityIds);

  if (error) {
    console.error("fetchInstancesForEntities error:", error);
    return {};
  }

  const result: Record<string, WorkflowInstance> = {};
  for (const row of data || []) {
    result[row.entity_id] = mapInstanceFromDB(row);
  }
  return result;
}

/**
 * Insert or update a workflow instance.
 * Conflict target is (entity_type, entity_id) — one instance per entity.
 */
export async function upsertWorkflowInstance(
  instance: WorkflowInstance
): Promise<void> {
  const row = mapInstanceToDB(instance);

  const { error } = await supabase
    .from("workflow_instances")
    .upsert(row, { onConflict: "entity_type,entity_id" });

  if (error) {
    console.error("upsertWorkflowInstance error:", error);
    throw error;
  }
}

// ============================================
// MAPPERS
// ============================================

function mapWorkflowFromDB(row: any): Workflow {
  return {
    id: row.id,
    orgId: row.org_id,
    processKey: row.process_key,
    name: row.name,
    stages: (row.stages || []) as WorkflowStage[],
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapWorkflowToDB(w: Workflow): any {
  // Fresh workflows from the client have a synthetic id (uuid-like) or
  // no id at all. If no id, Postgres generates one.
  const row: any = {
    org_id: getCurrentOrgId(),
    process_key: w.processKey,
    name: w.name,
    stages: w.stages,
    is_active: w.isActive,
  };
  if (w.id && !w.id.startsWith("tmp-")) {
    row.id = w.id;
  }
  return row;
}

function mapInstanceFromDB(row: any): WorkflowInstance {
  return {
    id: row.id,
    orgId: row.org_id,
    workflowId: row.workflow_id || null,
    entityType: row.entity_type,
    entityId: row.entity_id,
    currentStageIndex: row.current_stage_index ?? 0,
    stagesSnapshot: (row.stages_snapshot || []) as WorkflowStage[],
    status: row.status,
    history: (row.history || []) as WorkflowHistoryEntry[],
    startedAt: row.started_at,
    completedAt: row.completed_at || undefined,
  };
}

function mapInstanceToDB(i: WorkflowInstance): any {
  return {
    id: i.id,
    org_id: getCurrentOrgId(),
    workflow_id: i.workflowId,
    entity_type: i.entityType,
    entity_id: i.entityId,
    current_stage_index: i.currentStageIndex,
    stages_snapshot: i.stagesSnapshot,
    status: i.status,
    history: i.history,
    started_at: i.startedAt,
    completed_at: i.completedAt || null,
  };
}