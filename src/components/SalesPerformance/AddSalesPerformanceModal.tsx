@@ .. @@
 import React, { useState } from 'react';
 import { X, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
 import { SalesPerformance } from '../../types';
+import { useAuth } from '../../context/AuthContext';

 interface AddSalesPerformanceModalProps {
   isOpen: boolean;
@@ .. @@
 }) => {
+  const { user } = useAuth();
   const [formData, setFormData] = useState({
-    salesId: '',
-    salesName: '',
+    salesId: user?.role === 'sales' ? user.id : '',
+    salesName: user?.role === 'sales' ? user.name : '',
     teamId: '',
     teamName: '',
     traffic: 0,
@@ .. @@
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 销售员 *
               </label>
-              <select
-                required
-                value={formData.salesId}
-                onChange={(e) => {
-                  const selectedUser = users.find(u => u.id === e.target.value);
-                  setFormData(prev => ({
-                    ...prev,
-                    salesId: e.target.value,
-                    salesName: selectedUser?.name || '',
-                    teamId: selectedUser?.teamId || '',
-                    teamName: teams.find(t => t.id === selectedUser?.teamId)?.name || ''
-                  }));
-                }}
-                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
-              >
-                <option value="">请选择销售员</option>
-                {users.filter(u => u.role === 'sales' && u.isActive).map(user => (
-                  <option key={user.id} value={user.id}>
-                    {user.name}
-                  </option>
-                ))}
-              </select>
+              {user?.role === 'admin' ? (
+                <select
+                  required
+                  value={formData.salesId}
+                  onChange={(e) => {
+                    const selectedUser = users.find(u => u.id === e.target.value);
+                    setFormData(prev => ({
+                      ...prev,
+                      salesId: e.target.value,
+                      salesName: selectedUser?.name || '',
+                      teamId: selectedUser?.teamId || '',
+                      teamName: teams.find(t => t.id === selectedUser?.teamId)?.name || ''
+                    }));
+                  }}
+                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
+                >
+                  <option value="">请选择销售员</option>
+                  {users.filter(u => u.role === 'sales' && u.isActive).map(user => (
+                    <option key={user.id} value={user.id}>
+                      {user.name}
+                    </option>
+                  ))}
+                </select>
+              ) : (
+                <input
+                  type="text"
+                  value={formData.salesName}
+                  disabled
+                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
+                />
+              )}
             </div>