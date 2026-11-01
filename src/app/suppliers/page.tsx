'use client';
import { useState } from 'react';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { useSupplierProducts } from '@/lib/hooks/useSupplierProducts';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import { ProductForm } from '@/components/suppliers/ProductForm';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Supplier, SupplierProduct } from '@/lib/supabase/types';
import { Plus, Truck, Package, Phone, Mail, MapPin, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function SuppliersPage() {
  const { suppliers, loading, create: createSupplier, update: updateSupplier, remove: removeSupplier } = useSuppliers();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const { products, create: createProduct, update: updateProduct, remove: removeProduct } = useSupplierProducts(selectedSupplier?.id);

  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupplierProduct | null>(null);

  const handleCreateSupplier = async (values: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    const s = await createSupplier(values);
    setShowNewSupplier(false);
    setSelectedSupplier(s);
  };

  const handleEditSupplier = async (values: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingSupplier) return;
    await updateSupplier(editingSupplier.id, values);
    setEditingSupplier(null);
  };

  const handleCreateProduct = async (values: Omit<SupplierProduct, 'id' | 'created_at' | 'updated_at' | 'supplier'>) => {
    await createProduct(values);
    setShowNewProduct(false);
  };

  const handleEditProduct = async (values: Omit<SupplierProduct, 'id' | 'created_at' | 'updated_at' | 'supplier'>) => {
    if (!editingProduct) return;
    await updateProduct(editingProduct.id, values);
    setEditingProduct(null);
  };

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description="Manage your print, signage, and production suppliers with cost and markup pricing."
        action={<Button size="sm" onClick={() => setShowNewSupplier(true)}><Plus size={14} /> Add Supplier</Button>}
      />

      <div className="flex gap-5 min-h-[calc(100vh-200px)]">
        {/* Supplier list */}
        <div className="w-72 flex-shrink-0 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : suppliers.length === 0 ? (
            <EmptyState icon={Truck} title="No suppliers yet" description="Add your first supplier." />
          ) : (
            suppliers.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSupplier(s)}
                className={cn(
                  'w-full text-left p-4 rounded-2xl border transition-all',
                  selectedSupplier?.id === s.id
                    ? 'bg-white dark:bg-gray-900 border-brand-300 dark:border-brand-700 shadow-sm'
                    : 'bg-white/60 dark:bg-gray-900/60 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600',
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Truck size={14} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{s.company_name}</p>
                </div>
                {s.contact_person && <p className="text-xs text-gray-500 dark:text-gray-400 ml-10">{s.contact_person}</p>}
                {s.location && (
                  <div className="flex items-center gap-1 ml-10 mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                    <MapPin size={10} />
                    <span>{s.location}</span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Product detail panel */}
        <div className="flex-1">
          {!selectedSupplier ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Package size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Select a supplier to view products</p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              {/* Supplier header */}
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedSupplier.company_name}</h2>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      {selectedSupplier.contact_person && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{selectedSupplier.contact_person}</span>
                      )}
                      {selectedSupplier.whatsapp && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Phone size={10} />{selectedSupplier.whatsapp}
                        </span>
                      )}
                      {selectedSupplier.email && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Mail size={10} />{selectedSupplier.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingSupplier(selectedSupplier)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Remove ${selectedSupplier.company_name}?`)) return;
                        await removeSupplier(selectedSupplier.id);
                        setSelectedSupplier(null);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <Button size="sm" onClick={() => setShowNewProduct(true)}>
                      <Plus size={13} /> Add Product
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products table */}
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Package size={24} className="text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">No products yet</p>
                  <button onClick={() => setShowNewProduct(true)} className="mt-3 text-xs text-brand-600 dark:text-brand-400 hover:underline">
                    + Add first product
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50 dark:border-gray-800">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Markup</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Client Price</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {products.map((p) => {
                      const clientPrice = p.cost_price * (1 + p.markup_percent / 100);
                      const profit = clientPrice - p.cost_price;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group">
                          <td className="px-6 py-3.5">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.product_name}</p>
                            {p.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[200px]">{p.notes}</p>}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400">{p.category ?? '—'}</td>
                          <td className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400">{p.unit}</td>
                          <td className="px-4 py-3.5 text-right text-sm text-gray-700 dark:text-gray-300">${p.cost_price.toFixed(2)}</td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                              <TrendingUp size={10} />{p.markup_percent}%
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div>
                              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${clientPrice.toFixed(2)}</p>
                              <p className="text-[10px] text-emerald-500 dark:text-emerald-500">+${profit.toFixed(2)}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingProduct(p)} className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <Edit2 size={12} />
                              </button>
                              <button onClick={() => removeProduct(p.id)} className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Supplier modals */}
      <Modal open={showNewSupplier} onClose={() => setShowNewSupplier(false)} title="Add Supplier" size="md">
        <SupplierForm onSubmit={handleCreateSupplier} onCancel={() => setShowNewSupplier(false)} />
      </Modal>

      <Modal open={!!editingSupplier} onClose={() => setEditingSupplier(null)} title="Edit Supplier" size="md">
        {editingSupplier && (
          <SupplierForm initial={editingSupplier} onSubmit={handleEditSupplier} onCancel={() => setEditingSupplier(null)} />
        )}
      </Modal>

      {/* Product modals */}
      {selectedSupplier && (
        <>
          <Modal open={showNewProduct} onClose={() => setShowNewProduct(false)} title={`Add Product — ${selectedSupplier.company_name}`} size="md">
            <ProductForm supplierId={selectedSupplier.id} onSubmit={handleCreateProduct} onCancel={() => setShowNewProduct(false)} />
          </Modal>

          <Modal open={!!editingProduct} onClose={() => setEditingProduct(null)} title="Edit Product" size="md">
            {editingProduct && (
              <ProductForm supplierId={selectedSupplier.id} initial={editingProduct} onSubmit={handleEditProduct} onCancel={() => setEditingProduct(null)} />
            )}
          </Modal>
        </>
      )}
    </div>
  );
}
