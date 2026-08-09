import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { GOVERNANCE_STAGE_ORDER, nextStage } from '@/features/governance/service';
import type { GovernanceEntityType, GovernanceRecord, GovernanceStage } from '@/types';

/**
 * Maker-Checker governance state, keyed by "entityType:entityId".
 * PROTOTYPE storage: local AsyncStorage. A production GovernanceService
 * would persist this server-side with authenticated actor identity and
 * audit trail, behind the same record shape.
 */

function keyFor(entityType: GovernanceEntityType, entityId: string): string {
  return `${entityType}:${entityId}`;
}

interface GovernanceState {
  records: Record<string, GovernanceRecord>;
  getRecord: (entityType: GovernanceEntityType, entityId: string) => GovernanceRecord;
  advance: (entityType: GovernanceEntityType, entityId: string, actor: string, note?: string) => GovernanceStage | null;
  reset: (entityType: GovernanceEntityType, entityId: string) => void;
}

function emptyRecord(entityType: GovernanceEntityType, entityId: string): GovernanceRecord {
  return {
    entityType,
    entityId,
    stage: GOVERNANCE_STAGE_ORDER[0],
    history: [{ stage: GOVERNANCE_STAGE_ORDER[0], actor: 'system', timestamp: new Date().toISOString() }],
  };
}

export const useGovernanceStore = create<GovernanceState>()(
  persist(
    (set, get) => ({
      records: {},
      getRecord: (entityType, entityId) => {
        const key = keyFor(entityType, entityId);
        return get().records[key] ?? emptyRecord(entityType, entityId);
      },
      advance: (entityType, entityId, actor, note) => {
        const key = keyFor(entityType, entityId);
        const current = get().records[key] ?? emptyRecord(entityType, entityId);
        const next = nextStage(current.stage);
        if (!next) return null;
        const updated: GovernanceRecord = {
          ...current,
          stage: next,
          history: [...current.history, { stage: next, actor, timestamp: new Date().toISOString(), note }],
        };
        set((state) => ({ records: { ...state.records, [key]: updated } }));
        return next;
      },
      reset: (entityType, entityId) => {
        const key = keyFor(entityType, entityId);
        set((state) => ({ records: { ...state.records, [key]: emptyRecord(entityType, entityId) } }));
      },
    }),
    {
      name: STORAGE_KEYS.governance,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
