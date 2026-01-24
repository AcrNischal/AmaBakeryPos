import { useState } from "react";
import { menuItems, MenuItem, Category, getCategories } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminMenu() {
  const [items, setItems] = useState<MenuItem[]>(menuItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State for Categories Management
  const [categories, setCategories] = useState<Category[]>(getCategories());
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const updateCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem('categories', JSON.stringify(newCategories));
  };

  const handleToggleAvailability = (itemId: string) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, available: !item.available } : item
    ));
    toast.success("Availability updated");
  };

  const handleDelete = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    toast.success("Item deleted");
  };

  const handleAddCategory = () => {
    if (newCategoryInput.trim()) {
      if (!categories.some(c => c.name === newCategoryInput.trim())) {
        const newCategory: Category = {
          id: `cat-${Date.now()}`,
          name: newCategoryInput.trim(),
          type: 'main' // Default to main
        };
        const updatedCategories = [...categories, newCategory].sort((a, b) => a.name.localeCompare(b.name));
        updateCategories(updatedCategories);
        setNewCategoryInput("");
        toast.success("Category added");
      } else {
        toast.error("Category already exists");
      }
    }
  };

  const handleDeleteCategory = (catName: string) => {
    // Check if category is in use
    const isInUse = items.some(item => item.category === catName);
    if (isInUse) {
      toast.error("Cannot delete category attached to existing items");
      return;
    }
    updateCategories(categories.filter(c => c.name !== catName));
    toast.success("Category deleted");
  };

  const handleUpdateCategoryType = (catId: string, newType: 'main' | 'breakfast') => {
    const updated = categories.map(c => c.id === catId ? { ...c, type: newType } : c);
    updateCategories(updated);
    toast.success("Category kitchen assignment updated");
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Menu Management</h1>
          <p className="text-sm text-muted-foreground">Manage your bakery items and categories</p>
        </div>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
          <TabsList className="grid w-full grid-cols-2 max-w-full sm:max-w-[300px]">
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
              </DialogHeader>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Item Name</Label>
                  <Input id="name" placeholder="Enter item name" defaultValue={editItem?.name} />
                </div>
                <div>
                  <Label htmlFor="price">Price (Rs.)</Label>
                  <Input id="price" type="number" placeholder="0" defaultValue={editItem?.price} />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select defaultValue={editItem?.category || categories[0]?.name}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="available">Available</Label>
                  <Switch id="available" defaultChecked={editItem?.available ?? true} />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => {
                    toast.success(editItem ? "Item updated" : "Item added");
                    setIsDialogOpen(false);
                    setEditItem(null);
                  }}>
                    {editItem ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="items" className="space-y-4 mt-0">

          {/* Filters */}
          <div className="space-y-4">
            <div className="card-elevated p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('all')}
                className="whitespace-nowrap rounded-full"
              >
                All
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={categoryFilter === cat.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(cat.name)}
                  className="whitespace-nowrap rounded-full"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`card-elevated p-4 ${!item.available && 'opacity-60'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">Rs.{item.price}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.available}
                      onCheckedChange={() => handleToggleAvailability(item.id)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.available ? 'Available' : 'Out of stock'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditItem(item);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="card-elevated py-12 text-center text-muted-foreground">
              No items found matching your criteria
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6 mt-6">
          <div className="card-elevated p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Manage Categories</h2>
            <div className="flex gap-4 mb-6">
              <Input
                placeholder="Enter new category name..."
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
              />
              <Button onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-bold text-muted-foreground bg-slate-100/50 rounded-lg">
                <div className="col-span-6">Category Name</div>
                <div className="col-span-4">Kitchen Assignment</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              {categories.map((category) => (
                <div key={category.id} className="grid grid-cols-12 gap-4 items-center p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                  <div className="col-span-6 font-medium">{category.name}</div>
                  <div className="col-span-4">
                    <Select
                      value={category.type}
                      onValueChange={(val: 'main' | 'breakfast') => handleUpdateCategoryType(category.id, val)}
                    >
                      <SelectTrigger className="h-8 text-xs font-bold uppercase tracking-wide bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Kitchen</SelectItem>
                        <SelectItem value="breakfast">Breakfast Kitchen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all h-8 w-8 p-0"
                      onClick={() => handleDeleteCategory(category.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
