from decimal import Decimal
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import Invoice, Payment

class PaymentClassView(APIView):
    @transaction.atomic
    def post(self, request, invoice_id):
        """Add payment to invoice"""
        try:
            invoice = Invoice.objects.get(id=invoice_id)
        except Invoice.DoesNotExist:
            return Response(
                {"success": False, "error": "Invoice not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        amount = Decimal(str(request.data.get('amount', 0)))
        
        if amount <= 0:
            return Response(
                {"success": False, "error": "Payment amount must be greater than 0"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create payment
        payment = Payment.objects.create(
            invoice=invoice,
            amount=amount,
            payment_method=request.data.get('payment_method', 'CASH'),
            transaction_id=request.data.get('transaction_id'),
            notes=request.data.get('notes'),
            received_by=request.user
        )
        
        # Update invoice
        invoice.paid_amount += amount
        if invoice.paid_amount >= invoice.total_amount:
            invoice.payment_status = "PAID"
        elif invoice.paid_amount > 0:
            invoice.payment_status = "PARTIAL"
        invoice.save()
        
        return Response({
            "success": True,
            "message": "Payment added successfully",
            "payment_id": payment.id,
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "amount_paid": float(amount),
            "total_paid": float(invoice.paid_amount),
            "due_amount": float(invoice.total_amount - invoice.paid_amount),
            "payment_status": invoice.payment_status
        }, status=status.HTTP_201_CREATED)
