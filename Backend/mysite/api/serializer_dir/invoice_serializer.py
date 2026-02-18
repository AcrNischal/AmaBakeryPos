from decimal import Decimal
from rest_framework import serializers
from ..models import Invoice, InvoiceItem  # adjust import path if needed


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ["product", "quantity", "unit_price", "discount_amount"]


class InvoiceSerializer(serializers.ModelSerializer):
    """
    Used for POST / PATCH / PUT
    - Does NOT accept created_at
    - Handles item creation and totals calculation
    """
    items = InvoiceItemSerializer(many=True)
    paid_amount = serializers.DecimalField(
        max_digits=15,
        decimal_places=2,
        required=False,
        default=Decimal("0.00"),
        min_value=0
    )

    class Meta:
        model = Invoice
        fields = [
            "branch",
            "customer",
            "invoice_type",
            "tax_amount",
            "discount",
            "description",
            "paid_amount",
            "items",
            "invoice_status",
            "floor",
            # Intentionally NO created_at, created_by, subtotal, total_amount, etc.
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        paid_amount = validated_data.pop("paid_amount", Decimal("0.00"))
        request = self.context.get("request")

        # Create invoice skeleton
        invoice = Invoice.objects.create(
            **validated_data,
            created_by=request.user if request else None,
            subtotal=Decimal("0.00"),
            total_amount=Decimal("0.00"),
            paid_amount=paid_amount,
            payment_status="PENDING",
        )

        # Generate invoice number
        invoice.invoice_number = f"INV-{invoice.id:06d}"

        # Create items & calculate subtotal
        subtotal = Decimal("0.00")
        for item_data in items_data:
            item = InvoiceItem.objects.create(
                invoice=invoice,
                **item_data
            )
            line_total = item.quantity * item.unit_price - item.discount_amount
            subtotal += line_total

        # Final totals
        invoice.subtotal = subtotal
        invoice.total_amount = subtotal + (invoice.tax_amount or Decimal("0.00")) - (invoice.discount or Decimal("0.00"))

        # Payment status logic
        if invoice.paid_amount >= invoice.total_amount:
            invoice.payment_status = "PAID"
        elif invoice.paid_amount > 0:
            invoice.payment_status = "PARTIAL"
        else:
            invoice.payment_status = "PENDING"

        invoice.save()
        return invoice

    def update(self, instance, validated_data):
        # For simplicity — you can expand this if partial updates of items are needed
        items_data = validated_data.pop("items", None)
        paid_amount = validated_data.pop("paid_amount", None)

        # Update scalar fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if paid_amount is not None:
            instance.paid_amount = paid_amount

        if items_data is not None:
            # Simple approach: delete old items, create new ones
            instance.bills.all().delete()  # assuming related_name="bills"
            subtotal = Decimal("0.00")
            for item_data in items_data:
                item = InvoiceItem.objects.create(invoice=instance, **item_data)
                subtotal += item.quantity * item.unit_price - item.discount_amount
            instance.subtotal = subtotal
            instance.total_amount = subtotal + (instance.tax_amount or 0) - (instance.discount or 0)

        # Re-evaluate payment status
        if instance.paid_amount >= instance.total_amount:
            instance.payment_status = "PAID"
        elif instance.paid_amount > 0:
            instance.payment_status = "PARTIAL"
        else:
            instance.payment_status = "PENDING"

        instance.save()
        return instance


class InvoiceResponseSerializer(serializers.ModelSerializer):
    """
    Used for GET / list / retrieve
    - Includes read-only fields, names, due_amount, formatted created_at
    - Uses related_name 'bills' for items (adjust if your related_name is different)
    """
    items = InvoiceItemSerializer(many=True, source="bills")
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    floor_name = serializers.CharField(source="floor.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)
    due_amount = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(
        format="%Y-%m-%d %H:%M:%S",
        read_only=True
    )

    class Meta:
        model = Invoice
        fields = [
            "id",
            "invoice_number",
            "invoice_type",
            "customer",
            "customer_name",
            "floor",
            "floor_name",
            "branch",
            "branch_name",
            "created_by",
            "created_at",
            "created_by_name",
            "notes",               # assuming you have this field
            "subtotal",
            "tax_amount",
            "discount",
            "total_amount",
            "paid_amount",
            "due_amount",
            "payment_status",
            "is_active",
            "description",
            "invoice_status",
            "items",
        ]

    def get_due_amount(self, obj):
        return obj.total_amount - obj.paid_amount
