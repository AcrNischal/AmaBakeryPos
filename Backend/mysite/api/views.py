from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import User
from .serializers import UsersSerializers

# def users(request):
#     if request.method == "GET":
#         print("This is search item->>> ", request.GET.get("search"))
#         data = {"name": "Binod", "post": "Developer"}
#         return Response(data)
#
#     elif request.method == "POST":
#         data = request.data
#         print("**************")
#         print("This is post method data comming-> ", data["work"])
#         return Response({"sucess": True})


@api_view(["GET", "POST", "DELETE"])
def users(request, id=None):
    if request.method == "GET":
        objs = User.objects.all()
        serizers = UsersSerializers(objs, many=True)
        return Response(serizers.data)

    elif request.method == "POST":
        data = request.data
        serizers = UsersSerializers(data=data)
        if serizers.is_valid():
            serizers.save()
            return Response(
                {
                    "success": True,
                    "message": "User Created Successfully!",
                    "user": serizers.data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"sucess": False, "errors": serizers.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    elif request.method == "DELETE":
        if id:
            try:
                user = User.objects.get(id=id)
            except User.DoesNotExist:
                return Response(
                    {
                        "success": False,
                        "errors": "user_id",
                        "message": "User Id not Found!",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            username = user.username
            user.delete()
            return Response(
                {
                    "success": True,
                    "message": f"{username} Deleted Successfully!",
                },
                status=status.HTTP_204_NO_CONTENT,
            )
        return Response(
            {"error": "User Id Not Passed!"},
            status=status.HTTP_400_BAD_REQUEST,
        )
