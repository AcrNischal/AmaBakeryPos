import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { users } from "@/lib/mockData";

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Find user by username and password
        const user = users.find(
            u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );

        if (user) {
            // Store user in localStorage for session management
            localStorage.setItem('currentUser', JSON.stringify(user));

            toast.success("Login Successful", {
                description: `Welcome, ${user.name}!`,
            });

            // Route user to appropriate interface based on role
            switch (user.role) {
                case 'superadmin':
                    navigate('/super-admin/dashboard');
                    break;
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                case 'waiter':
                    localStorage.setItem('currentWaiter', JSON.stringify(user));
                    navigate('/waiter/tables');
                    break;
                case 'counter':
                    navigate('/counter/pos');
                    break;
                case 'kitchen':
                    navigate('/kitchen/display');
                    break;
                default:
                    navigate('/');
            }
        } else {
            setError("Invalid credentials. Please try again.");
            toast.error("Login Failed", {
                description: "Invalid username or password",
            });
        }
    };

    return (
        <div className="min-h-screen flex overflow-hidden">
            {/* Left Side - Branding Banner */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary/90 to-primary overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
                    <div className="max-w-md text-center space-y-8">
                        {/* Logo */}
                        <div className="inline-flex items-center justify-center h-32 w-32 rounded-[2rem] bg-white shadow-2xl p-2 overflow-hidden mb-8">
                            <img
                                src="/logos/logo1white.jfif"
                                alt="Ama Bakery Logo"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Brand Name */}
                        <div className="space-y-2">
                            <h1 className="text-5xl font-rockwell font-bold tracking-tight">
                                Ama Bakery
                            </h1>
                            <p className="text-white/80 text-sm font-bold uppercase tracking-[0.3em]">
                                Management Suite
                            </p>
                        </div>

                        {/* Tagline */}
                        <div className="pt-8 space-y-4">
                            <p className="text-xl font-medium text-white/90">
                                Streamline your bakery operations with our comprehensive point-of-sale and management system.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-white/60 text-xs font-black uppercase tracking-widest">
                                <div className="h-px w-12 bg-white/30" />
                                <span>Secure Access Portal</span>
                                <div className="h-px w-12 bg-white/30" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gradient-cream">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo - Only shows on small screens */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-white shadow-warm mb-4 p-1 overflow-hidden border-2 border-primary/10">
                            <img src="/logos/logo1white.jfif" alt="Ama Bakery" className="h-full w-full object-cover" />
                        </div>
                        <h1 className="text-2xl font-rockwell font-bold text-slate-800">Ama Bakery</h1>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-[2rem] shadow-xl border-4 border-white p-8 md:p-10">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome Back</h2>
                            <p className="text-slate-500 font-medium">Sign in to access your account</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-5">
                                {/* Username Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                        Username
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <Input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="pl-12 h-14 bg-slate-50 border-2 border-slate-100 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-400 text-base"
                                            placeholder="Enter your username"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <Input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-12 h-14 bg-slate-50 border-2 border-slate-100 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary focus:bg-white transition-all font-bold text-slate-800 font-mono placeholder:text-slate-400 text-base"
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}

                            {/* Login Button */}
                            <Button
                                type="submit"
                                className="w-full h-14 rounded-xl text-base font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 gradient-warm text-white"
                            >
                                Sign In
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                        </form>

                        {/* Footer Note */}
                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-400 font-medium">
                                Secure authentication for all staff members
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
