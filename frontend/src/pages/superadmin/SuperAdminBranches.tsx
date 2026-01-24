import { Store, MapPin, Search, Filter, Plus } from "lucide-react";
import { branches } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SuperAdminBranches() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">All Branches</h1>
                    <p className="text-sm text-muted-foreground font-medium">Manage your {branches.length} locations worldwide.</p>
                </div>
                <Button className="gradient-warm text-white font-black uppercase tracking-widest text-xs h-10 px-4 rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    New Location
                </Button>
            </div>

            <div className="card-elevated p-4 md:p-6 border-2 border-slate-50 rounded-[2rem]">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find a branch..."
                            className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl"
                        />
                    </div>
                    <Button variant="outline" className="h-11 rounded-xl border-slate-200">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {branches.map(branch => (
                        <div key={branch.id} className="group relative bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer">
                            <div className="absolute top-4 right-4">
                                <Badge className={branch.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-slate-100 text-slate-500'}>
                                    {branch.status}
                                </Badge>
                            </div>

                            <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                <Store className="h-6 w-6" />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1">{branch.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mb-4">
                                <MapPin className="h-4 w-4 mr-1" />
                                {branch.location}
                            </div>

                            <div className="flex items-center justify-between text-sm py-3 border-t border-slate-50">
                                <div>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Manager</p>
                                    <p className="font-semibold text-slate-700">{branch.manager}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Revenue</p>
                                    <p className="font-semibold text-slate-700">Rs. {branch.revenue.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
