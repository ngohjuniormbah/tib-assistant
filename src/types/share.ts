export type CollaboratorRole = 'viewer' | 'commenter' | 'editor';

export type GeneralAccessLevel = 'restricted' | 'anyone_with_link';

export type Collaborator = {
  id: string;
  name: string;
  email: string;
  role: CollaboratorRole | 'owner';
  avatar?: string;
  addedAt: string;
};

export type SharedWorkspacePayload = {
  version: string;
  projectId: string;
  projectTitle: string;
  owner: {
    name: string;
    email: string;
  };
  generalAccess: GeneralAccessLevel;
  generalRole: CollaboratorRole;
  collaborators: Collaborator[];
  assets: Record<string, string[]>;
  timestamp: string;
};
