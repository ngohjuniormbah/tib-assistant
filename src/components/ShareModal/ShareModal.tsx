'use client';

import {
  faCheck,
  faCopy,
  faGear,
  faGlobe,
  faLock,
  faShareNodes,
  faTrash,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Avatar,
  Button,
  Checkbox,
  Chip,
  Input,
  Label,
  ListBox,
  Modal,
  ScrollShadow,
  Select,
  TextField,
  toast,
} from '@heroui/react';
import { FormEvent, useEffect, useState } from 'react';

import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';
import {
  createWorkspaceSnapshot,
  generateShareUrl,
  getStoredCollaborators,
  saveStoredCollaborators,
} from '@/lib/shareUtils';
import {
  Collaborator,
  CollaboratorRole,
  GeneralAccessLevel,
} from '@/types/share';

export type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  assistantId: string;
};

export default function ShareModal({
  isOpen,
  onClose,
  assistantId,
}: ShareModalProps) {
  const { asset: paperTitleAsset } = useIndexedDbStore({
    assetId: 'paper.title',
  });

  const projectTitle =
    paperTitleAsset && paperTitleAsset.length > 0
      ? paperTitleAsset[0].replace(/^#+\s*/, '').trim()
      : `Research Project (${assistantId.toUpperCase()})`;

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [inviteInput, setInviteInput] = useState('');
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>('editor');
  const [generalAccess, setGeneralAccess] =
    useState<GeneralAccessLevel>('anyone_with_link');
  const [generalRole, setGeneralRole] = useState<CollaboratorRole>('viewer');
  const [copyRole, setCopyRole] = useState<CollaboratorRole>('viewer');
  const [isCopied, setIsCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editorsCanShare, setEditorsCanShare] = useState(true);
  const [viewersCanExport, setViewersCanExport] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setCollaborators(getStoredCollaborators());
      setIsCopied(false);
    }
  }, [isOpen]);

  const handleAddCollaborator = (e: FormEvent) => {
    e.preventDefault();
    const cleanInvite = inviteInput.trim();
    if (!cleanInvite) return;

    const newCollaborator: Collaborator = {
      id: `collab-${Date.now()}`,
      name: cleanInvite.includes('@')
        ? cleanInvite.split('@')[0]
        : cleanInvite,
      email: cleanInvite.includes('@')
        ? cleanInvite
        : `${cleanInvite.toLowerCase().replace(/\s+/g, '.')}@tib.eu`,
      role: inviteRole,
      addedAt: new Date().toISOString(),
    };

    const updated = [...collaborators, newCollaborator];
    setCollaborators(updated);
    saveStoredCollaborators(updated);
    setInviteInput('');
    toast.success(`Access granted to ${newCollaborator.name} as ${inviteRole.toUpperCase()}`);
  };

  const handleRoleChange = (id: string, newRole: CollaboratorRole) => {
    const updated = collaborators.map((c) =>
      c.id === id ? { ...c, role: newRole } : c
    );
    setCollaborators(updated);
    saveStoredCollaborators(updated);
    toast.success('Permissions updated');
  };

  const handleRemoveCollaborator = (id: string) => {
    const updated = collaborators.filter((c) => c.id !== id);
    setCollaborators(updated);
    saveStoredCollaborators(updated);
    toast.success('Collaborator access removed');
  };

  const handleCopyLink = async () => {
    try {
      const snapshot = await createWorkspaceSnapshot({
        projectId: `proj-${assistantId}`,
        projectTitle,
        generalAccess,
        generalRole,
        collaborators,
      });

      const shareLink = generateShareUrl(snapshot, copyRole);
      await navigator.clipboard.writeText(shareLink);
      setIsCopied(true);
      toast.success(`Share link copied with ${copyRole.toUpperCase()} permissions!`);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error(err);
      toast.danger('Failed to copy share link');
    }
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center justify-between w-full pr-6">
                <div className="flex items-center gap-2 min-w-0">
                  <FontAwesomeIcon icon={faShareNodes} className="text-muted" />
                  <span className="truncate">
                    Share &quot;{projectTitle}&quot;
                  </span>
                </div>
                <Button
                  size="sm"
                  isIconOnly
                  variant="ghost"
                  aria-label="Sharing settings"
                  onPress={() => setShowSettings(!showSettings)}
                >
                  <FontAwesomeIcon
                    icon={faGear}
                    className={`text-muted transition-transform ${
                      showSettings ? 'rotate-90' : ''
                    }`}
                  />
                </Button>
              </div>
            </Modal.Heading>
          </Modal.Header>

          <Modal.Body className="space-y-4">
            {showSettings && (
              <div className="p-3.5 rounded-2xl bg-surface-secondary border border-border space-y-2.5">
                <span className="text-xs font-bold text-foreground">
                  Sharing Permissions & Governance:
                </span>
                <div className="space-y-2 text-xs">
                  <Checkbox
                    isSelected={editorsCanShare}
                    onChange={setEditorsCanShare}
                  >
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      Editors can change permissions and share with others
                    </Checkbox.Content>
                  </Checkbox>
                  <Checkbox
                    isSelected={viewersCanExport}
                    onChange={setViewersCanExport}
                  >
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      Viewers and commenters can download and export research assets
                    </Checkbox.Content>
                  </Checkbox>
                </div>
              </div>
            )}

            {/* Section 1: Add People and Groups */}
            <form onSubmit={handleAddCollaborator} className="space-y-2">
              <div className="flex gap-2 items-end">
                <TextField className="flex-1 flex flex-col gap-1">
                  <Label className="text-xs font-semibold text-foreground">
                    Add people, email addresses, or ORCID
                  </Label>
                  <Input
                    placeholder="e.g. colleague@tib.eu or 0000-0002-1825-0097"
                    value={inviteInput}
                    onChange={(e) => setInviteInput(e.target.value)}
                  />
                </TextField>

                <div className="w-32 flex flex-col gap-1">
                  <Label className="text-xs font-semibold text-foreground">
                    Role
                  </Label>
                  <Select
                    selectedKey={inviteRole}
                    onSelectionChange={(key) =>
                      setInviteRole(key as CollaboratorRole)
                    }
                    aria-label="Collaborator role"
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item id="viewer" textValue="Viewer">
                          Viewer
                        </ListBox.Item>
                        <ListBox.Item id="commenter" textValue="Commenter">
                          Commenter
                        </ListBox.Item>
                        <ListBox.Item id="editor" textValue="Editor">
                          Editor
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={!inviteInput.trim()}
                  className="gap-1.5 shrink-0"
                >
                  <FontAwesomeIcon icon={faUserPlus} size="sm" />
                  <span>Invite</span>
                </Button>
              </div>
            </form>

            {/* Section 2: People with Access */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-foreground">
                People with access ({collaborators.length})
              </span>

              <ScrollShadow className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-surface-secondary/40 border border-border gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar size="sm">
                        <Avatar.Fallback className="bg-default text-xs font-bold">
                          {collab.name.charAt(0).toUpperCase()}
                        </Avatar.Fallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">
                          {collab.name}
                        </span>
                        <span className="text-[11px] text-muted truncate">
                          {collab.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {collab.role === 'owner' ? (
                        <Chip size="sm">Owner</Chip>
                      ) : (
                        <>
                          <Select
                            selectedKey={collab.role}
                            onSelectionChange={(key) =>
                              handleRoleChange(collab.id, key as CollaboratorRole)
                            }
                            className="w-28 text-xs"
                            aria-label={`Change role for ${collab.name}`}
                          >
                            <Select.Trigger className="h-7 text-xs">
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                <ListBox.Item id="viewer" textValue="Viewer">
                                  Viewer
                                </ListBox.Item>
                                <ListBox.Item id="commenter" textValue="Commenter">
                                  Commenter
                                </ListBox.Item>
                                <ListBox.Item id="editor" textValue="Editor">
                                  Editor
                                </ListBox.Item>
                              </ListBox>
                            </Select.Popover>
                          </Select>
                          <Button
                            size="sm"
                            isIconOnly
                            variant="ghost"
                            aria-label={`Remove ${collab.name}`}
                            onPress={() => handleRemoveCollaborator(collab.id)}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="text-muted text-xs"
                            />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollShadow>
            </div>

            {/* Section 3: General Access (Google Drive model) */}
            <div className="p-3.5 rounded-2xl bg-surface-secondary/50 border border-border space-y-2">
              <span className="text-xs font-bold text-foreground">
                General access
              </span>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="size-8 rounded-full bg-default flex items-center justify-center shrink-0">
                    <FontAwesomeIcon
                      icon={
                        generalAccess === 'anyone_with_link'
                          ? faGlobe
                          : faLock
                      }
                      className="text-xs text-foreground"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <Select
                      selectedKey={generalAccess}
                      onSelectionChange={(key) =>
                        setGeneralAccess(key as GeneralAccessLevel)
                      }
                      className="w-48 text-xs font-semibold"
                      aria-label="General access level"
                    >
                      <Select.Trigger className="h-7 text-xs border-0 bg-transparent p-0">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item id="restricted" textValue="Restricted">
                            Restricted
                          </ListBox.Item>
                          <ListBox.Item
                            id="anyone_with_link"
                            textValue="Anyone with the link"
                          >
                            Anyone with the link
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    <span className="text-[11px] text-muted">
                      {generalAccess === 'anyone_with_link'
                        ? 'Anyone on the internet with this link can access'
                        : 'Only invited collaborators can access'}
                    </span>
                  </div>
                </div>

                {generalAccess === 'anyone_with_link' && (
                  <div className="w-28 shrink-0">
                    <Select
                      selectedKey={generalRole}
                      onSelectionChange={(key) =>
                        setGeneralRole(key as CollaboratorRole)
                      }
                      className="text-xs"
                      aria-label="Role for anyone with link"
                    >
                      <Select.Trigger className="h-7 text-xs">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          <ListBox.Item id="viewer" textValue="Viewer">
                            Viewer
                          </ListBox.Item>
                          <ListBox.Item id="editor" textValue="Editor">
                            Editor
                          </ListBox.Item>
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select
                selectedKey={copyRole}
                onSelectionChange={(key) =>
                  setCopyRole(key as CollaboratorRole)
                }
                className="w-28 text-xs"
                aria-label="Role for copied link"
              >
                <Select.Trigger className="h-8 text-xs">
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="viewer" textValue="Viewer">
                      As Viewer
                    </ListBox.Item>
                    <ListBox.Item id="editor" textValue="As Editor">
                      As Editor
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>

              <Button
                variant="secondary"
                size="sm"
                className="gap-2"
                onPress={handleCopyLink}
              >
                <FontAwesomeIcon icon={isCopied ? faCheck : faCopy} />
                <span>{isCopied ? 'Link Copied!' : 'Copy Link'}</span>
              </Button>
            </div>

            <Button variant="primary" onPress={onClose}>
              Done
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
