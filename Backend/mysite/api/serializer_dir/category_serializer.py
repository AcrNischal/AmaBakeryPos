from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from ..models import ProductCategory


class ProductCategorySerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source="branch.name", read_only=True)
    kitchentype_name = serializers.CharField(source="kitchentype.name", read_only=True)
    
    class Meta:
        model = ProductCategory
        fields = ["id", "name", "branch", "branch_name", "kitchentype", "kitchentype_name"]
        read_only_fields = ["branch_name", "kitchentype_name"]
        validators = [
            UniqueTogetherValidator(
                queryset=ProductCategory.objects.all(),
                fields=['branch', 'name']
            )
        ]






