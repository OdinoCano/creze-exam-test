from django.urls import path
from .views import RegisterView, LoginView, LogoutView, MFAValidationView, RegenerateMFASecretView, GetUserInfo, DeleteUserView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('mfa-validate/', MFAValidationView.as_view(), name='mfa_validate'),
    path('get-user-info/', GetUserInfo.as_view(), name='get_user_info'),
    path('delete-user/', DeleteUserView.as_view(), name='delete_user'),
    path('regenerate-mfa/', RegenerateMFASecretView.as_view(), name='regenerate_mfa'),
]
