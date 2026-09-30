from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Task


class TaskCRUDTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="taskowner", email="owner@example.com", password="Xk9$mPq2vL"
        )
        self.other_user = User.objects.create_user(
            username="someoneelse", email="other@example.com", password="Xk9$mPq2vL"
        )

        login_res = self.client.post("/api/auth/login/", {
            "username": "taskowner",
            "password": "Xk9$mPq2vL",
        })
        self.access = login_res.data["access"]
        self.auth_header = {"HTTP_AUTHORIZATION": f"Bearer {self.access}"}

    def test_list_requires_authentication(self):
        res = self.client.get("/api/tasks/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_task_assigns_current_user(self):
        res = self.client.post("/api/tasks/", {
            "title": "Write tests",
            "description": "Cover the API",
            "status": "pending",
            "priority": "high",
        }, **self.auth_header)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        task = Task.objects.get(id=res.data["id"])
        self.assertEqual(task.user, self.user)

    def test_list_only_returns_own_tasks(self):
        Task.objects.create(user=self.user, title="Mine")
        Task.objects.create(user=self.other_user, title="Not mine")

        res = self.client.get("/api/tasks/", **self.auth_header)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        titles = [t["title"] for t in res.data["results"]]
        self.assertIn("Mine", titles)
        self.assertNotIn("Not mine", titles)

    def test_cannot_retrieve_another_users_task(self):
        other_task = Task.objects.create(user=self.other_user, title="Not mine")

        res = self.client.get(f"/api/tasks/{other_task.id}/", **self.auth_header)
        # filtered queryset means it looks like it doesn't exist, not a 403
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_update_another_users_task(self):
        other_task = Task.objects.create(user=self.other_user, title="Not mine")

        res = self.client.put(f"/api/tasks/{other_task.id}/", {
            "title": "Hacked",
            "status": "completed",
            "priority": "low",
        }, **self.auth_header)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        other_task.refresh_from_db()
        self.assertEqual(other_task.title, "Not mine")

    def test_cannot_delete_another_users_task(self):
        other_task = Task.objects.create(user=self.other_user, title="Not mine")

        res = self.client.delete(f"/api/tasks/{other_task.id}/", **self.auth_header)
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Task.objects.filter(id=other_task.id).exists())

    def test_update_own_task(self):
        task = Task.objects.create(user=self.user, title="Original", status="pending", priority="low")

        res = self.client.put(f"/api/tasks/{task.id}/", {
            "title": "Updated",
            "status": "completed",
            "priority": "high",
        }, **self.auth_header)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.title, "Updated")
        self.assertEqual(task.status, "completed")

    def test_delete_own_task(self):
        task = Task.objects.create(user=self.user, title="Delete me")

        res = self.client.delete(f"/api/tasks/{task.id}/", **self.auth_header)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=task.id).exists())

    def test_search_filters_by_title(self):
        Task.objects.create(user=self.user, title="Fix login bug")
        Task.objects.create(user=self.user, title="Write documentation")

        res = self.client.get("/api/tasks/?search=login", **self.auth_header)
        titles = [t["title"] for t in res.data["results"]]
        self.assertIn("Fix login bug", titles)
        self.assertNotIn("Write documentation", titles)

    def test_status_filter(self):
        Task.objects.create(user=self.user, title="Done task", status="completed")
        Task.objects.create(user=self.user, title="Pending task", status="pending")

        res = self.client.get("/api/tasks/?status=completed", **self.auth_header)
        titles = [t["title"] for t in res.data["results"]]
        self.assertIn("Done task", titles)
        self.assertNotIn("Pending task", titles)

    def test_pagination_page_size(self):
        for i in range(8):
            Task.objects.create(user=self.user, title=f"Task {i}")

        res = self.client.get("/api/tasks/?page=1", **self.auth_header)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["results"]), 6)  # PAGE_SIZE = 6
        self.assertEqual(res.data["count"], 8)