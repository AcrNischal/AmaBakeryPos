import { MenuItem } from "@/lib/mockData";
import { Plus, Minus, ShoppingBag, Hash, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: (item: MenuItem) => void;
  onRemove: (item: MenuItem) => void;
  onSetQuantity: (item: MenuItem, quantity: number) => void;
}

export function MenuItemCard({ item, quantity, onAdd, onRemove, onSetQuantity }: MenuItemCardProps) {
  const [showQtyDialog, setShowQtyDialog] = useState(false);
  const [tempQty, setTempQty] = useState(quantity.toString());

  useEffect(() => {
    setTempQty(quantity > 0 ? quantity.toString() : "");
  }, [quantity, showQtyDialog]);

  const handleConfirmQty = () => {
    const newQty = parseInt(tempQty);
    if (!isNaN(newQty)) {
      onSetQuantity(item, newQty);
    }
    setShowQtyDialog(false);
  };
  return (
    <div className={cn(
      "p-4 flex items-center justify-between gap-4 transition-all duration-200 border rounded-2xl",
      !item.available && "opacity-50",
      quantity > 0
        ? "border-primary bg-primary/[0.02] shadow-sm"
        : "border-slate-100 bg-white"
    )}>
      <div className="flex-1 min-w-0">
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setShowQtyDialog(true)}
        >
          {/* Icon placeholder */}
          <div className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
            quantity > 0 ? "bg-primary/10 border-primary/20 text-primary" : "bg-slate-50 border-slate-100 text-slate-400"
          )}>
            <ShoppingBag className="h-7 w-7" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 truncate text-lg">{item.name}</h3>
            <p className="text-primary font-black text-xl leading-none mt-1">Rs.{item.price}</p>
            {!item.available && (
              <span className="text-[10px] text-destructive font-black bg-destructive/10 px-2 py-0.5 rounded-full inline-block mt-2 uppercase tracking-wider">
                Out of stock
              </span>
            )}
          </div>
        </div>
      </div>

      {item.available && (
        <div className="shrink-0">
          {quantity > 0 ? (
            <div className="flex items-center bg-white rounded-xl border border-primary/20 p-1 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5"
                onClick={() => onRemove(item)}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <button
                onClick={() => setShowQtyDialog(true)}
                className="px-3 h-8 flex flex-col items-center justify-center min-w-[40px]"
              >
                <span className="text-[9px] font-black text-primary/60 uppercase leading-none">Qty</span>
                <span className="text-base font-black text-slate-800 leading-none">{quantity}</span>
              </button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-primary hover:bg-primary/5"
                onClick={() => onAdd(item)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="icon"
              className="h-12 w-12 rounded-2xl gradient-warm shadow-lg shadow-primary/20 active:scale-95 transition-all"
              onClick={() => onAdd(item)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          )}
        </div>
      )}

      {/* Quick Quantity Dialog - Added for bulk quantity entry */}
      <Dialog open={showQtyDialog} onOpenChange={setShowQtyDialog}>
        <DialogContent className="max-w-[320px] rounded-2xl p-6 border-none shadow-2xl">
          <DialogHeader className="items-center text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 border border-primary/20">
              <Hash className="h-7 w-7" />
            </div>
            <DialogTitle className="text-xl font-bold">Set Quantity</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Enter quantity for <span className="text-foreground tracking-tight">{item.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="relative">
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                value={tempQty}
                onChange={(e) => setTempQty(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmQty()}
                className="text-center text-4xl h-20 font-black border-2 border-primary/20 focus:border-primary rounded-2xl shadow-inner bg-slate-50"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="flex-row gap-3">
            <Button
              variant="ghost"
              className="flex-1 h-12 font-bold text-muted-foreground rounded-xl"
              onClick={() => setShowQtyDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-[1.5] h-12 text-base font-bold gradient-warm shadow-lg rounded-xl"
              onClick={handleConfirmQty}
            >
              <Check className="h-5 w-5 mr-2" />
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
