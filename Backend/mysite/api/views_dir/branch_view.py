from rest_framework import status
from rest_framework.views import APIView, Response
from ..models import Branch
from ..serializer_dir.branch_serializer import BranchSerializers



class BranchViewClass(APIView):
    def get_user_role(self, user):
        return "SUPER_ADMIN" if user.is_superuser else getattr(user, "user_type", "")
    def post(self, request):
        role = self.get_user_role(request.user)

        if role not in ["SUPER_ADMIN","ADMIN"]:
            return Response(
                    {
                        "success": False,
                        "message": "You don't have permission to create Branch.",
                        },
                    status=status.HTTP_403_FORBIDDEN,
                    )

        if role in ["SUPER_ADMIN","ADMIN"]:
            new_name = request.data.get("name", "").strip()
            if not new_name:
                return Response(
                        {
                            "success": False,
                            "message": "Branch name is required.",
                            },
                        status=status.HTTP_400_BAD_REQUEST,
                        )

            if Branch.objects.filter(
                    name__iexact=new_name
                    ).exists():
                return Response(
                        {
                            "success": False,
                            "message": f"A Branch named '{new_name}' already exists ",
                            },
                        status=status.HTTP_409_CONFLICT,
                        )

            data = request.data.copy()
            serializer = BranchSerializers(data=data, context={"request": request})


            if serializer.is_valid():
                serializer.save()
                return Response(
                        {
                            "success": True,
                            "message": "Branch created successfully",
                            "data": serializer.data,
                            },
                        status=status.HTTP_201_CREATED,
                        )
            else:
                return Response(
                        {
                            "success": False,
                            "errors": serializer.errors,
                            "message": "Validation failed",
                            },
                        status=status.HTTP_400_BAD_REQUEST,
                        )







