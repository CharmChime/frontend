import React, { useEffect, useState } from 'react';
import { Plus, Save, Shield, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { ParentSidebar } from '../components/ParentSidebar';
import { ParentThemeToggle } from '../components/ParentThemeToggle';
import { ChildAvatar } from '../components/ChildAvatar';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { LogoutConfirmation } from '../components/LogoutConfirmation';
import { api, type Child } from '../services/api';
import { avatarPresets } from '../services/avatar';
import { ParentPageLoader } from '../components/PageLoaders';

interface ParentChildrenScreenProps {
  childName: string;
  childAvatar?: string;
  parentName?: string;
  children?: Child[];
  selectedChildId?: string;
  onSelectChild?: (childId: string) => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => Promise<void>;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onChildrenChanged?: (children: Child[]) => void;
}

type EditableChild = {
  name: string;
  nickname: string;
  age: string;
  avatar: string;
  notificationsEnabled: boolean;
  shareMoodEnabled: boolean;
  preferredCharacter: string;
};

const toEditableChild = (child: Child): EditableChild => ({
  name: child.name || '',
  nickname: child.nickname || '',
  age: child.age ? String(child.age) : '',
  avatar: child.avatar || 'sunny-spark',
  notificationsEnabled: child.preferences?.notificationsEnabled !== false,
  shareMoodEnabled: child.preferences?.shareMoodEnabled !== false,
  preferredCharacter: typeof child.preferences?.preferredCharacter === 'string' ? String(child.preferences.preferredCharacter) : 'Chime',
});

export function ParentChildrenScreen({
  childName,
  childAvatar,
  parentName,
  children: sidebarChildren,
  selectedChildId,
  onSelectChild,
  theme = 'light',
  onThemeToggle,
  onNavigate,
  onLogout,
  onChildrenChanged,
}: ParentChildrenScreenProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [drafts, setDrafts] = useState<Record<string, EditableChild>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [savingChildId, setSavingChildId] = useState('');
  const [deletingChildId, setDeletingChildId] = useState('');
  const [newChild, setNewChild] = useState({
    name: '',
    email: '',
    age: '',
    pin: '',
    confirmPin: '',
  });

  const loadChildren = async () => {
    setIsLoading(true);
    try {
      const { children: nextChildren } = await api.parents.children();
      setChildren(nextChildren);
      setDrafts(Object.fromEntries(nextChildren.map((child) => [child.id, toEditableChild(child)])));
      onChildrenChanged?.(nextChildren);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load children.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const updateDraft = (childId: string, updates: Partial<EditableChild>) => {
    setDrafts((current) => ({
      ...current,
      [childId]: {
        ...current[childId],
        ...updates,
      },
    }));
  };

  const handleSaveChild = async (child: Child) => {
    const draft = drafts[child.id];
    if (!draft) return;

    const age = Number(draft.age);
    if (!Number.isInteger(age) || age < 6 || age > 18) {
      toast.error('Child age must be between 6 and 18.');
      return;
    }

    setSavingChildId(child.id);
    try {
      const { child: savedChild } = await api.parents.updateChild(child.id, {
        name: draft.name.trim(),
        nickname: draft.nickname.trim() || draft.name.trim(),
        age,
        avatar: draft.avatar,
        preferences: {
          ...(child.preferences || {}),
          notificationsEnabled: draft.notificationsEnabled,
          shareMoodEnabled: draft.shareMoodEnabled,
          preferredCharacter: draft.preferredCharacter,
        },
      });
      const nextChildren = children.map((item) => (item.id === savedChild.id ? savedChild : item));
      setChildren(nextChildren);
      setDrafts((current) => ({ ...current, [savedChild.id]: toEditableChild(savedChild) }));
      onChildrenChanged?.(nextChildren);
      toast.success(`${savedChild.nickname || savedChild.name}'s settings saved.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save child settings.');
    } finally {
      setSavingChildId('');
    }
  };

  const handleDeleteChild = async (child: Child) => {
    const confirmed = window.confirm(`Delete ${child.nickname || child.name}'s child account? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingChildId(child.id);
    try {
      await api.parents.deleteChild(child.id);
      const nextChildren = children.filter((item) => item.id !== child.id);
      setChildren(nextChildren);
      setDrafts(Object.fromEntries(nextChildren.map((item) => [item.id, toEditableChild(item)])));
      onChildrenChanged?.(nextChildren);
      toast.success('Child account deleted.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete child account.');
    } finally {
      setDeletingChildId('');
    }
  };

  const handleAddChild = async () => {
    if (newChild.pin !== newChild.confirmPin) {
      toast.error('PINs do not match.');
      return;
    }

    const age = Number(newChild.age);
    if (!Number.isInteger(age) || age < 6 || age > 18) {
      toast.error('Child age must be between 6 and 18.');
      return;
    }

    try {
      await api.auth.childSignup({
        name: newChild.name,
        email: newChild.email,
        age: newChild.age,
        pin: newChild.pin,
        confirmPin: newChild.confirmPin,
      });
      setNewChild({ name: '', email: '', age: '', pin: '', confirmPin: '' });
      setShowAddForm(false);
      await loadChildren();
      toast.success('Child added. Ask the family to verify the OTP sent to the email.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not add child.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--parent-bg)] flex">
      <ParentSidebar
        childName={childName}
        childAvatar={childAvatar}
        parentName={parentName}
        children={sidebarChildren}
        selectedChildId={selectedChildId}
        onSelectChild={onSelectChild}
        activeItem="children"
        onNavigate={onNavigate}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[#2d3748] text-xl sm:text-2xl lg:text-3xl">Children</h1>
                <p className="text-[#64748b] mt-1 text-sm sm:text-base">Edit linked child settings, privacy, and account access</p>
              </div>
              <div className="flex items-center gap-3">
                <ParentThemeToggle theme={theme} onThemeToggle={onThemeToggle} />
                <Button variant="parent-teal" icon={<Plus className="h-4 w-4" />} onClick={() => setShowAddForm((value) => !value)}>
                  Add Child
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {showAddForm && (
            <Card variant="parent">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--parent-teal)]/10 text-[var(--parent-teal)]">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[#2d3748] text-lg sm:text-xl">Add Child Account</h2>
                  <p className="text-sm text-[#64748b]">A verification OTP will be sent to the email address.</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[#2d3748]" placeholder="Child name" value={newChild.name} onChange={(event) => setNewChild({ ...newChild, name: event.target.value })} />
                <input className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[#2d3748]" placeholder="Child or guardian email" type="email" value={newChild.email} onChange={(event) => setNewChild({ ...newChild, email: event.target.value })} />
                <input className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[#2d3748]" placeholder="Age 6-18" type="number" min={6} max={18} value={newChild.age} onChange={(event) => setNewChild({ ...newChild, age: event.target.value })} />
                <input className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[#2d3748]" placeholder="4-digit PIN" type="password" maxLength={4} value={newChild.pin} onChange={(event) => setNewChild({ ...newChild, pin: event.target.value })} />
                <input className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[#2d3748] md:col-span-2" placeholder="Confirm PIN" type="password" maxLength={4} value={newChild.confirmPin} onChange={(event) => setNewChild({ ...newChild, confirmPin: event.target.value })} />
              </div>
              <div className="mt-5 flex justify-end">
                <Button variant="parent-teal" onClick={handleAddChild}>Create Child</Button>
              </div>
            </Card>
          )}

          <div className="grid gap-5">
            {isLoading ? (
              <ParentPageLoader
                title="Loading linked children"
                message="Fetching child profiles, privacy settings, and account details."
              />
            ) : children.length ? children.map((child) => {
              const draft = drafts[child.id] || toEditableChild(child);
              return (
                <Card key={child.id} variant="parent">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <ChildAvatar avatar={draft.avatar} name={draft.nickname || draft.name || child.name} size="large" />
                        <div>
                          <h2 className="text-[#2d3748] text-lg sm:text-xl">{draft.nickname || draft.name}</h2>
                          <p className="text-sm text-[#64748b]">{child.email || 'No email'} · Age {draft.age || 'not set'}</p>
                          <Badge variant={child.isVerified === false ? 'parent-slate' : 'parent-teal'}>
                            {child.isVerified === false ? 'Pending OTP' : 'Active'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="parent-teal" size="small" icon={<Save className="h-4 w-4" />} onClick={() => handleSaveChild(child)} disabled={savingChildId === child.id}>
                          {savingChildId === child.id ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="parent-slate" size="small" icon={<Trash2 className="h-4 w-4" />} onClick={() => handleDeleteChild(child)} disabled={deletingChildId === child.id}>
                          {deletingChildId === child.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <input className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[#2d3748]" value={draft.name} onChange={(event) => updateDraft(child.id, { name: event.target.value })} />
                      <input className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[#2d3748]" value={draft.nickname} placeholder="Nickname" onChange={(event) => updateDraft(child.id, { nickname: event.target.value })} />
                      <input className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[#2d3748]" type="number" min={6} max={18} value={draft.age} onChange={(event) => updateDraft(child.id, { age: event.target.value })} />
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-medium text-[#4a5568]">Avatar</p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {avatarPresets.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => updateDraft(child.id, { avatar: preset.id })}
                            className={`rounded-xl border p-3 text-center transition-all ${draft.avatar === preset.id ? 'border-[var(--parent-teal)] bg-[var(--parent-teal)]/10' : 'border-gray-200 bg-gray-50'}`}
                          >
                            <ChildAvatar avatar={preset.id} name={draft.name || child.name} size="medium" className="mx-auto mb-2" />
                            <span className="text-xs text-[#64748b]">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      {[
                        { key: 'notificationsEnabled', label: 'Child Notifications' },
                        { key: 'shareMoodEnabled', label: 'Share Mood With Parent' },
                      ].map((item) => {
                        const enabled = Boolean(draft[item.key as keyof EditableChild]);
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => updateDraft(child.id, { [item.key]: !enabled } as Partial<EditableChild>)}
                            className="flex items-center justify-between rounded-xl bg-gray-50 p-4 text-left"
                          >
                            <span className="text-sm text-[#2d3748]">{item.label}</span>
                            <span className={`h-8 w-14 rounded-full transition-colors ${enabled ? 'bg-[var(--parent-teal)]' : 'bg-gray-300'}`}>
                              <span className={`block h-6 w-6 rounded-full bg-white shadow-md transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                            </span>
                          </button>
                        );
                      })}
                      <div className="rounded-xl bg-gray-50 p-4">
                        <label className="mb-2 block text-sm text-[#2d3748]">Preferred Character</label>
                        <input className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[#2d3748]" value={draft.preferredCharacter} onChange={(event) => updateDraft(child.id, { preferredCharacter: event.target.value })} />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            }) : (
              <Card variant="parent">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-[var(--parent-teal)]" />
                  <p className="text-sm text-[#64748b]">No linked children yet. Use Add Child to create one.</p>
                </div>
              </Card>
            )}
          </div>

          <Card variant="parent">
            <div className="flex items-start gap-3">
              <Shield className="mt-1 h-5 w-5 text-[var(--parent-teal)]" />
              <p className="text-sm text-[#64748b]">
                Parent edits respect child privacy settings. Journal content remains private unless an existing feature explicitly shares summaries.
              </p>
            </div>
          </Card>
        </div>
      </main>

      <LogoutConfirmation
        isOpen={showLogoutConfirm}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
        variant="parent"
      />
    </div>
  );
}
