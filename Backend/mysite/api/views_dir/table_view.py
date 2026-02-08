from rest_framework import status
from rest_framework.views import APIView, Response

from ..models import Table
from ..serializer_dir.table_serializer import TableSerializer


class TableViewClass(APIView):
    def get_user_role(self, user):
        return "SUPER_ADMIN" if user.is_superuser else getattr(user, "user_type", "")

    def get(self, request, table_id=None):
        role = self.get_user_role(request.user)
        my_branch = request.user.branch

        if role not in [
            "SUPER_ADMIN",
            "ADMIN",
            "BRANCH_MANAGER",
            "COUNTER",
            "WAITER",
            "KITCHEN",
        ]:
            return Response(
                {"success": False, "message": "User Type not found"}, status=400
            )

        if table_id:
            if my_branch:
                table = Table.objects.get(id=table_id)
                serilizers = TableSerializer(table)
                return Response({"success": True, "data": serilizers.data})
        else:
            if my_branch:
                table = Table.objects.filter(branch=my_branch)
                serilizers = TableSerializer(table, many=True)
                tablecount = Table.objects.filter(branch=my_branch)
                print(f"Total table in {my_branch} is {tablecount.count()}")
                return Response({"success": True, "data": serilizers.data})

            table = Table.objects.all()
            serilizers = TableSerializer(table, many=True)

            return Response({"success": True, "data": serilizers.data})

    def post(self, request):
        role = self.get_user_role(request.user)
        my_branch = request.user.branch

        if role not in [
            "SUPER_ADMIN",
            "ADMIN",
            "BRANCH_MANAGER",
        ]:
            return Response(
                {
                    "success": False,
                    "message": "You don't have Permission to add Table!",
                },
                status=400,
            )

        if role == "BRANCH_MANAGER":
            if my_branch:
                comming_branch = request.data.get("branch")
                if comming_branch and comming_branch.id != my_branch.id:
                    return Response(
                        {
                            "error": "Permission denied",
                            "message": "You can only modify data for your own branch",
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )
                data = request.data.copy()
                data["branch"] = my_branch.id

                serializer = TableSerializer(data=data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(
                        {
                            "success": True,
                            "message": "Table created successfully",
                            "data": serializer.data,
                        },
                        status=status.HTTP_201_CREATED,
                    )

        if role in ["SUPER_ADMIN", "ADMIN"]:
            data = request.data.copy()
            serializer = TableSerializer(data=data)

            if serializer.is_valid():
                serializer.save()
                return Response(
                    {
                        "success": True,
                        "message": "Table created successfully",
                        "data": serializer.data,
                    },
                    status=status.HTTP_201_CREATED,
                )
            else:
                return Response(
                    {
                        "success": False,
                        "message": "Validation error",
                        "errors": serializer.errors,  # Include actual errors
                    },
                    status=status.HTTP_400_BAD_REQUEST,  # Changed to 400
                )
