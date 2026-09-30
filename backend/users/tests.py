from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status


class RegisterTests(APITestCase):
    url = "/api/users/register/"

    def test_register_success(self):
        res = self.client.post(self.url, {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "Xk9$mPq2vL",
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())
        # password should never come back in the response
        self.assertNotIn("password", res.data)

    def test_register_duplicate_email_rejected(self):
        User.objects.create_user(
            username="existing", email="dupe@example.com", password="Xk9$mPq2vL"
        )
        res = self.client.post(self.url, {
            "username": "another",
            "email": "dupe@example.com",
            "password": "Xk9$mPq2vL",
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", res.data)

    def test_register_common_password_rejected(self):
        res = self.client.post(self.url, {
            "username": "someone",
            "email": "someone@example.com",
            "password": "password123",
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", res.data)

    def test_register_password_too_similar_to_username_rejected(self):
        res = self.client.post(self.url, {
            "username": "johnsmith",
            "email": "john@example.com",
            "password": "johnsmith1",
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", res.data)

    def test_register_numeric_password_rejected(self):
        res = self.client.post(self.url, {
            "username": "numguy",
            "email": "numguy@example.com",
            "password": "48291057",
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", res.data)


class AuthFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="authuser", email="auth@example.com", password="Xk9$mPq2vL"
        )

    def test_login_returns_access_and_refresh(self):
        res = self.client.post("/api/auth/login/", {
            "username": "authuser",
            "password": "Xk9$mPq2vL",
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("access", res.data)
        self.assertIn("refresh", res.data)

    def test_login_wrong_password_rejected(self):
        res = self.client.post("/api/auth/login/", {
            "username": "authuser",
            "password": "wrongpassword",
        })
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token_returns_new_access(self):
        login_res = self.client.post("/api/auth/login/", {
            "username": "authuser",
            "password": "Xk9$mPq2vL",
        })
        refresh_token = login_res.data["refresh"]

        refresh_res = self.client.post("/api/auth/refresh/", {
            "refresh": refresh_token,
        })
        self.assertEqual(refresh_res.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_res.data)

    def test_profile_requires_authentication(self):
        res = self.client.get("/api/users/profile/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_returns_current_user(self):
        login_res = self.client.post("/api/auth/login/", {
            "username": "authuser",
            "password": "Xk9$mPq2vL",
        })
        access = login_res.data["access"]

        res = self.client.get(
            "/api/users/profile/",
            HTTP_AUTHORIZATION=f"Bearer {access}",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["username"], "authuser")