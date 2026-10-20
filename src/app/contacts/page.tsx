'use client';
import { useState } from 'react';
import { useContacts } from '@/lib/hooks/useContacts';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { ContactForm } from '@/components/contacts/ContactForm';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import type { Contact } from '@/lib/supabase/types';
import { Plus, Users, Search, Mail, Phone, Edit2, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export default function ContactsPage() {
  const { contacts, loading, create, update } = useContacts();
  const { accounts } = useAccounts();
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [search, setSearch] = useState('');

  const filtered = contacts.filter((c) =>
    !search ||
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.role?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async (values: Partial<Contact>) => {
    await create(values as Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'account'>);
    setShowNew(false);
  };

  const handleEdit = async (values: Partial<Contact>) => {
    if (!editing) return;
    await update(editing.id, values);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Contacts"
        description={`${contacts.length} people`}
        action={<Button size="sm" onClick={() => setShowNew(true)}><Plus size={14} /> Add Contact</Button>}
      />

      <div className="relative max-w-xs mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input className="pl-8" placeholder="Search contacts…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No contacts found" description="Add people from your client companies." action={<Button size="sm" onClick={() => setShowNew(true)}><Plus size={14} /> Add Contact</Button>} />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filtered.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={contact.full_name} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{contact.full_name}</p>
                        {contact.role && <p className="text-xs text-slate-400 dark:text-slate-500">{contact.role}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {contact.account ? (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Building2 size={12} className="text-slate-400" />
                        {contact.account.company_name}
                      </div>
                    ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-400 hover:underline">
                        <Mail size={12} /> {contact.email}
                      </a>
                    ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {contact.phone ? (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Phone size={12} /> {contact.phone}
                      </div>
                    ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-3 py-3.5">
                    <button
                      onClick={() => setEditing(contact)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Add Contact">
        <ContactForm accounts={accounts} onSubmit={handleCreate} onCancel={() => setShowNew(false)} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Contact">
        {editing && <ContactForm initial={editing} accounts={accounts} onSubmit={handleEdit} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
