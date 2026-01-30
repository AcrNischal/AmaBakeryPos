from rest_framework import serializers
from ..models import Branch

class BranchSerializers(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ["id", "name", "location"]
