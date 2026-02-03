from django.db import transaction
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Invoice
from ..serializer_dir.invoice_serializer import (
    InvoiceResponseSerializer,
    InvoiceSerializer,
)


class InvoiceViewClass(APIView):
    def get_user_role(self, user):
        return "SUPER_ADMIN" if user.is_superuser else getattr(user, "user_type", "")

    def get_branch_filter(self, user, role):
        if role in ["ADMIN", "SUPER_ADMIN"]:
            return {}
        elif user.branch:
            return {"branch": user.branch}
        return {"branch__isnull": True}

    def get(self, request, id=None):
        role = self.get_user_role(request.user)
        my_branch = request.user.branch

        if id:
            try:
                # Apply branch filter for non-admin users
                filter_kwargs = {"id": id}
                if role not in ["ADMIN", "SUPER_ADMIN"] and my_branch:
                    filter_kwargs["branch"] = my_branch

                invoice = Invoice.objects.get(**filter_kwargs)
                serializer = InvoiceResponseSerializer(invoice)
                return Response({"success": True, "data": serializer.data})
            except Invoice.DoesNotExist:
                return Response(
                    {"success": False, "error": "Invoice not found"}, status=404
                )
        else:
            filters = self.get_branch_filter(request.user, role)

            # Apply query params filters
            invoice_type = request.GET.get("type")
            if invoice_type:
                filters["invoice_type"] = invoice_type

            payment_status = request.GET.get("status")
            if payment_status:
                filters["payment_status"] = payment_status

            start_date = request.GET.get("start_date")
            end_date = request.GET.get("end_date")
            if start_date and end_date:
                filters["order_date__range"] = [start_date, end_date]

            invoices = Invoice.objects.filter(**filters).order_by("-order_date")
            serializer = InvoiceResponseSerializer(invoices, many=True)
            return Response({"success": True, "data": serializer.data})

    # ------------------ POST (Create) ------------------
    @transaction.atomic
    def post(self, request):
        """Create new invoice"""
        role = self.get_user_role(request.user)

        # Check permissions
        if role not in ["ADMIN", "SUPER_ADMIN", "COUNTER", "WAITER"]:
            return Response(
                {"success": False, "error": "Permission denied"}, status=403
            )

        serializer = InvoiceSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            try:
                invoice = serializer.save()
                response_serializer = InvoiceResponseSerializer(invoice)
                return Response(
                    {"success": True, "data": response_serializer.data}, status=201
                )
            except Exception as e:
                return Response({"success": False, "error": str(e)}, status=400)

        return Response({"success": False, "errors": serializer.errors}, status=400)

    # ------------------ PATCH (Update) ------------------
    @transaction.atomic
    def patch(self, request, id):
        """Update invoice partially"""
        role = self.get_user_role(request.user)
        my_branch = request.user.branch

        try:
            # Apply branch filter for non-admin users
            filter_kwargs = {"id": id}
            if role not in ["ADMIN", "SUPER_ADMIN"] and my_branch:
                filter_kwargs["branch"] = my_branch

            invoice = Invoice.objects.get(**filter_kwargs)
        except Invoice.DoesNotExist:
            return Response(
                {"success": False, "error": "Invoice not found"}, status=404
            )

        # Only allow updating safe fields
        allowed_fields = ["notes", "invoice_description", "is_active"]
        if role in ["ADMIN", "SUPER_ADMIN"]:
            allowed_fields.extend(["tax_amount", "discount", "payment_status"])

        data = {k: v for k, v in request.data.items() if k in allowed_fields}

        serializer = InvoiceResponseSerializer(invoice, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "data": serializer.data})

        return Response({"success": False, "errors": serializer.errors}, status=400)

    # ------------------ DELETE ------------------
    def delete(self, request, id):
        """Delete invoice"""
        role = self.get_user_role(request.user)
        my_branch = request.user.branch

        if role not in ["ADMIN", "SUPER_ADMIN"]:
            return Response(
                {"success": False, "error": "Permission denied"}, status=403
            )

        try:
            # Apply branch filter for non-admin users
            filter_kwargs = {"id": id}
            if role not in ["ADMIN", "SUPER_ADMIN"] and my_branch:
                filter_kwargs["branch"] = my_branch

            invoice = Invoice.objects.get(**filter_kwargs)

            # Don't delete paid invoices
            if invoice.payment_status == "PAID":
                return Response(
                    {"success": False, "error": "Cannot delete paid invoice"},
                    status=400,
                )

            invoice.delete()
            return Response({"success": True, "message": "Invoice deleted"}, status=204)

        except Invoice.DoesNotExist:
            return Response(
                {"success": False, "error": "Invoice not found"}, status=404
            )
    @transaction.atomic
    def add_payment(self, request, id):
        if request.method != 'POST':
            return Response(
                {"success": False, "error": "Method not allowed"}, 
                status=405
            )
        
        try:
            invoice = Invoice.objects.get(id=id)
        except Invoice.DoesNotExist:
            return Response(
                {"success": False, "error": "Invoice not found"}, 
                status=404
            )
        
        # Extract payment data
        amount = Decimal(str(request.data.get('amount', 0)))
        payment_method = request.data.get('payment_method', 'CASH')
        
        if amount <= 0:
            return Response(
                {"success": False, "error": "Payment amount must be greater than 0"},
                status=400
            )
        
        # Check if payment exceeds total
        if amount > invoice.total_amount:
            return Response(
                {"success": False, "error": "Payment amount exceeds invoice total"},
                status=400
            )
        
        # Create payment record
        payment = Payment.objects.create(
            invoice=invoice,
            amount=amount,
            payment_method=payment_method,
            transaction_id=request.data.get('transaction_id'),
            notes=request.data.get('notes'),
            received_by=request.user
        )
        
        # Update invoice
        invoice.paid_amount += amount
        
        # Update payment status
        if invoice.paid_amount >= invoice.total_amount:
            invoice.payment_status = "PAID"
        elif invoice.paid_amount > 0:
            invoice.payment_status = "PARTIAL"
        
        invoice.save()
        
        return Response({
            "success": True,
            "message": "Payment added successfully",
            "data": {
                "payment_id": payment.id,
                "invoice_id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "amount_paid": float(amount),
                "total_paid": float(invoice.paid_amount),
                "due_amount": float(invoice.total_amount - invoice.paid_amount),
                "payment_status": invoice.payment_status
            }
        }, status=201)
