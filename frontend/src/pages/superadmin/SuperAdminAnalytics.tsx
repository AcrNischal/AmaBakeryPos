import { BarChart3, TrendingUp, Calendar } from "lucide-react";

export default function SuperAdminAnalytics() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Global Analytics</h1>
                    <p className="text-sm text-muted-foreground font-medium">Performance insights across the entire enterprise.</p>
                </div>
            </div>

            <div className="card-elevated p-12 border-2 border-slate-50 rounded-[2rem] flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <BarChart3 className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Analytics Dashboard Coming Soon</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                    We are building comprehensive reporting tools to help you visualize revenue streams, product performance, and customer acquisition across all branches.
                </p>
                <div className="flex gap-2">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Revenue</span>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Growth</span>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Forecasting</span>
                </div>
            </div>
        </div>
    );
}
