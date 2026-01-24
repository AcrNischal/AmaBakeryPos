import { Users, Shield, Key } from "lucide-react";
import { users, branches } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";

export default function SuperAdminAccess() {
    const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'superadmin');

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Admin Access & Security</h1>
                    <p className="text-sm text-muted-foreground font-medium">Manage privilege levels and secure access for branch managers.</p>
                </div>
            </div>

            <div className="card-elevated p-6 border-2 border-slate-50 rounded-[2rem]">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4">Active Administrators</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/80 text-slate-400">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Administrator</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Role</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Assigned Branch</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Username</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {adminUsers.map((user) => {
                                const branchName = branches.find(b => b.id === user.branchId)?.name || 'Global HQ';
                                return (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="font-bold text-slate-900">{user.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {user.role === 'superadmin' ? <Shield className="h-4 w-4 text-primary" /> : <Key className="h-4 w-4 text-slate-400" />}
                                                <span className="text-sm font-medium capitalize">{user.role.replace('superadmin', 'Super Admin')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{branchName}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded inline-block">{user.username}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100">
                                                Active
                                            </Badge>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
