import { Settings, Server, Lock, Bell, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function SuperAdminSettings() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Platform Settings</h1>
                    <p className="text-sm text-muted-foreground font-medium">Configure global system parameters and preferences.</p>
                </div>
                <Button variant="outline" className="border-slate-200">
                    Reset Defaults
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-elevated p-6 border-2 border-slate-50 rounded-[2rem] space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                            <Server className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-lg">System Configuration</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-semibold text-slate-900">Maintenance Mode</label>
                                <p className="text-xs text-slate-500">Disable access for all non-admin users</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-semibold text-slate-900">Debug Logging</label>
                                <p className="text-xs text-slate-500">Enable verbose error reporting</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-semibold text-slate-900">API Rate Limiting</label>
                                <p className="text-xs text-slate-500">Throttling for external requests</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </div>

                <div className="card-elevated p-6 border-2 border-slate-50 rounded-[2rem] space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                            <Palette className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-lg">Branding & Appearance</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-semibold text-slate-900">Global Dark Mode</label>
                                <p className="text-xs text-slate-500">Force dark theme across all branches</p>
                            </div>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-semibold text-slate-900">Custom Branch Logos</label>
                                <p className="text-xs text-slate-500">Allow branches to upload own branding</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
