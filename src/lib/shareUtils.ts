import { Base64 } from 'js-base64';

import { db } from '@/db/db';
import {
  Collaborator,
  CollaboratorRole,
  GeneralAccessLevel,
  SharedWorkspacePayload,
} from '@/types/share';

const COLLABORATORS_STORAGE_KEY = 'tib_workspace_collaborators';
const WORKSPACE_STORAGE_PREFIX = 'tib_shared_workspace_';

export function getStoredCollaborators(): Collaborator[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COLLABORATORS_STORAGE_KEY);
    if (!raw) {
      return [
        {
          id: 'collab-owner',
          name: 'You (Principal Investigator)',
          email: 'researcher@tib.eu',
          role: 'owner',
          addedAt: new Date().toISOString(),
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredCollaborators(collaborators: Collaborator[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      COLLABORATORS_STORAGE_KEY,
      JSON.stringify(collaborators)
    );
  } catch (error) {
    console.error('Failed to persist collaborators:', error);
  }
}

export async function getCurrentAssetsSnapshot(): Promise<Record<string, string[]>> {
  const allDbAssets = await db.assets.toArray();
  const snapshot: Record<string, string[]> = {};
  for (const item of allDbAssets) {
    snapshot[item.assetId] = item.value;
  }
  return snapshot;
}

export async function createWorkspaceSnapshot(options: {
  projectId: string;
  projectTitle: string;
  generalAccess: GeneralAccessLevel;
  generalRole: CollaboratorRole;
  collaborators: Collaborator[];
}): Promise<SharedWorkspacePayload> {
  const assets = await getCurrentAssetsSnapshot();
  return {
    version: '2.3.3',
    projectId: options.projectId,
    projectTitle: options.projectTitle || 'Scientific Manuscript & Research Plan',
    owner: {
      name: 'Lead Researcher',
      email: 'researcher@tib.eu',
    },
    generalAccess: options.generalAccess,
    generalRole: options.generalRole,
    collaborators: options.collaborators,
    assets,
    timestamp: new Date().toISOString(),
  };
}

export function generateShareUrl(
  payload: SharedWorkspacePayload,
  selectedRole: CollaboratorRole
): string {
  if (typeof window === 'undefined') return '';
  const serialized = JSON.stringify(payload);

  try {
    localStorage.setItem(
      `${WORKSPACE_STORAGE_PREFIX}${payload.projectId}`,
      serialized
    );
  } catch {
    // Continue
  }

  const encoded = Base64.encodeURI(serialized);
  const baseUrl = `${window.location.origin}${window.location.pathname}`;

  if (encoded.length < 3500) {
    return `${baseUrl}?share=${encoded}&role=${selectedRole}`;
  }

  return `${baseUrl}?shareSession=${encodeURIComponent(payload.projectId)}&role=${selectedRole}`;
}

export function parseSharedWorkspaceFromUrl(): {
  payload: SharedWorkspacePayload | null;
  role: CollaboratorRole | null;
} {
  if (typeof window === 'undefined') return { payload: null, role: null };

  const urlParams = new URLSearchParams(window.location.search);
  const roleParam = (urlParams.get('role') as CollaboratorRole) || 'viewer';
  const shareParam = urlParams.get('share');
  const sessionParam = urlParams.get('shareSession');

  if (shareParam) {
    try {
      const decoded = Base64.decode(shareParam);
      const parsed = JSON.parse(decoded) as SharedWorkspacePayload;
      return { payload: parsed, role: roleParam };
    } catch (error) {
      console.warn('Could not parse share payload from URL:', error);
    }
  }

  if (sessionParam) {
    try {
      const raw = localStorage.getItem(`${WORKSPACE_STORAGE_PREFIX}${sessionParam}`);
      if (raw) {
        return { payload: JSON.parse(raw), role: roleParam };
      }
    } catch {
      // Continue
    }
  }

  return { payload: null, role: null };
}

export async function applySharedWorkspaceToLocalDb(
  assetsRecord: Record<string, string[]>
): Promise<void> {
  await db.transaction('rw', db.assets, async () => {
    for (const [assetId, value] of Object.entries(assetsRecord)) {
      const existing = await db.assets.where('assetId').equals(assetId).first();
      if (existing) {
        await db.assets.update(existing.id, { value });
      } else {
        await db.assets.add({ assetId, value });
      }
    }
  });
}
