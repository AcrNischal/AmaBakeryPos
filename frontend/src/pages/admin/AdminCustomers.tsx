import { useState } from "react";
import {
    Users,
    Search,
    Plus,
    Mail,
    Phone,
    ShoppingBag,
    Calendar,
    ChevronRight,
    MoreVertical,
    Download,
    Filter,
    Eye
} from "lucide-react";
import { customers, sampleOrders, Customer } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";

export default function AdminCustomers() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Customers</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Manage your customer database and purchase history.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Customer
                    </Button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email or phone..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                    <div className="h-8 w-[1px] bg-border hidden md:block mx-2" />
                    <p className="text-sm text-muted-foreground whitespace-nowrap">
                        Showing <span className="font-medium text-foreground">{filteredCustomers.length}</span> customers
                    </p>
                </div>
            </div>

            {/* Customer Table */}
            <div className="card-elevated p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/40 text-muted-foreground uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Total Orders</th>
                                <th className="px-6 py-4">Total Spent</th>
                                <th className="px-6 py-4">Last Activity</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredCustomers.map((customer) => (
                                <tr
                                    key={customer.id}
                                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                                    onClick={() => setSelectedCustomer(customer)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                {customer.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="font-semibold text-foreground">{customer.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-xs space-y-1">
                                            <span className="text-foreground flex items-center gap-1">
                                                <Mail className="h-3 w-3 text-muted-foreground" /> {customer.email}
                                            </span>
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3 text-muted-foreground" /> {customer.phone}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                            {customer.totalOrders} orders
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-foreground">
                                        Rs.{customer.totalSpent.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground truncate">
                                        {customer.lastOrderDate}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Detail Sheet */}
            <Sheet open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
                <SheetContent className="sm:max-w-xl overflow-y-auto">
                    {selectedCustomer && (
                        <div className="space-y-8 py-6">
                            <SheetHeader>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                                        {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <SheetTitle className="text-2xl">{selectedCustomer.name}</SheetTitle>
                                        <SheetDescription>{selectedCustomer.email}</SheetDescription>
                                    </div>
                                </div>
                            </SheetHeader>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/50 p-6 rounded-xl text-center">
                                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Total Revenue</p>
                                    <p className="font-bold text-2xl text-primary">Rs.{selectedCustomer.totalSpent.toLocaleString()}</p>
                                </div>
                                <div className="bg-muted/50 p-6 rounded-xl text-center">
                                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Successful Orders</p>
                                    <p className="font-bold text-2xl text-foreground">{selectedCustomer.totalOrders}</p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                    <Users className="h-4 w-4 text-primary" />
                                    Contact Information
                                </h4>
                                <div className="grid gap-3 p-4 border border-border rounded-xl bg-card">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="h-4 w-4 text-primary/70" />
                                        <span>{selectedCustomer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="h-4 w-4 text-primary/70" />
                                        <span>{selectedCustomer.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="h-4 w-4 text-primary/70" />
                                        <span>Last active: {selectedCustomer.lastOrderDate}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order History */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold flex items-center gap-2 text-foreground">
                                        <ShoppingBag className="h-4 w-4 text-primary" />
                                        Order History
                                    </h4>
                                    <Button variant="link" size="sm" className="text-primary font-semibold p-0">
                                        View All
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {sampleOrders
                                        .filter(order => order.customerId === selectedCustomer.id)
                                        .map((order) => (
                                            <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors bg-card group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                        <ShoppingBag className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">Order #{order.id.slice(-4)}</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-foreground">Rs.{order.total}</p>
                                                    <StatusBadge status={order.status} className="h-5 text-[10px]" />
                                                </div>
                                            </div>
                                        ))}
                                    {sampleOrders.filter(order => order.customerId === selectedCustomer.id).length === 0 && (
                                        <div className="text-center py-8 border border-dashed border-border rounded-xl">
                                            <ShoppingBag className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                            <p className="text-sm text-muted-foreground">No orders found for this customer.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button className="flex-1 shadow-md">Edit Profile</Button>
                                <Button variant="outline" className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">Archive</Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Add Customer Modal (Static UI) */}
            <Sheet open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <SheetContent side="right" className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Add New Customer</SheetTitle>
                        <SheetDescription>Create a new profile to track customer orders and history.</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-6 py-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <Input type="email" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <Input placeholder="+977 98XXXXXXX" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Address (Optional)</label>
                                <Input placeholder="Enter street address" />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button className="flex-1" onClick={() => setIsAddModalOpen(false)}>Save Customer</Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
