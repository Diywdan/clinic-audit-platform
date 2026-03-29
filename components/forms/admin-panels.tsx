"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Clinic = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

type User = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "MANAGER" | "EVALUATOR";
};

type Evaluation = {
  id: string;
  createdAt: string | Date;
  totalPercentage: number;
  criticalCount: number;
  clinic: { name: string };
  user: { email: string };
  photos: { id: string; url: string }[];
};

export function AdminPanels({
  clinics,
  users,
  evaluations
}: {
  clinics: Clinic[];
  users: User[];
  evaluations: Evaluation[];
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  function submitForm(form: HTMLFormElement, endpoint: string, method = "POST") {
    startTransition(async () => {
      setMessage("");
      const payload = Object.fromEntries(new FormData(form).entries());
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const body = await response.json();
      setMessage(response.ok ? "Сохранено" : body.error ?? "Ошибка запроса");
      if (response.ok) {
        form.reset();
        setEditingClinic(null);
        setEditingUser(null);
        window.location.reload();
      }
    });
  }

  function destroy(endpoint: string) {
    startTransition(async () => {
      setMessage("");
      const response = await fetch(endpoint, { method: "DELETE" });
      const body = await response.json();
      setMessage(response.ok ? "Удалено" : body.error ?? "Ошибка удаления");
      if (response.ok) {
        window.location.reload();
      }
    });
  }

  return (
    <div className="stack-lg">
      <div className="dashboard-grid">
        <Card>
          <div className="section-heading">
            <h3>Создать клинику</h3>
            <p>Управление справочником клиник</p>
          </div>
          <form
            key={editingClinic?.id ?? "new-clinic"}
            className="stack-sm"
            onSubmit={(event) => {
              event.preventDefault();
              submitForm(
                event.currentTarget,
                editingClinic ? `/api/admin/clinics/${editingClinic.id}` : "/api/admin/clinics",
                editingClinic ? "PUT" : "POST"
              );
            }}
          >
            <Input name="name" placeholder="Название клиники" required defaultValue={editingClinic?.name ?? ""} />
            <Input name="address" placeholder="Адрес" required defaultValue={editingClinic?.address ?? ""} />
            <Input name="latitude" type="number" step="0.0001" placeholder="Широта" required defaultValue={editingClinic?.latitude ?? ""} />
            <Input name="longitude" type="number" step="0.0001" placeholder="Долгота" required defaultValue={editingClinic?.longitude ?? ""} />
            <Button type="submit" disabled={isPending}>
              {editingClinic ? "Обновить клинику" : "Сохранить клинику"}
            </Button>
            {editingClinic ? (
              <Button type="button" variant="secondary" onClick={() => setEditingClinic(null)}>
                Отменить редактирование
              </Button>
            ) : null}
          </form>
        </Card>
        <Card>
          <div className="section-heading">
            <h3>Создать пользователя</h3>
            <p>Доступ для администраторов, руководителей и оценщиков</p>
          </div>
          <form
            key={editingUser?.id ?? "new-user"}
            className="stack-sm"
            onSubmit={(event) => {
              event.preventDefault();
              submitForm(
                event.currentTarget,
                editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users",
                editingUser ? "PATCH" : "POST"
              );
            }}
          >
            <Input name="name" placeholder="ФИО" required defaultValue={editingUser?.name ?? ""} />
            <Input name="email" type="email" placeholder="user@audit.local" required defaultValue={editingUser?.email ?? ""} />
            <Input name="password" type="password" placeholder="Пароль" required />
            <Select name="role" defaultValue={editingUser?.role ?? "EVALUATOR"}>
              <option value="EVALUATOR">Оценщик</option>
              <option value="MANAGER">Руководитель</option>
              <option value="ADMIN">Администратор</option>
            </Select>
            <Button type="submit" disabled={isPending}>
              {editingUser ? "Обновить пользователя" : "Сохранить пользователя"}
            </Button>
            {editingUser ? (
              <Button type="button" variant="secondary" onClick={() => setEditingUser(null)}>
                Отменить редактирование
              </Button>
            ) : null}
          </form>
        </Card>
      </div>

      {message ? <p className="success-text">{message}</p> : null}

      <div className="dashboard-grid">
        <Card>
          <div className="section-heading">
            <h3>Клиники</h3>
            <p>{clinics.length} клиник в системе</p>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Адрес</th>
                  <th>Координаты</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {clinics.map((clinic) => (
                  <tr key={clinic.id}>
                    <td>{clinic.name}</td>
                    <td>{clinic.address}</td>
                    <td>{clinic.latitude}, {clinic.longitude}</td>
                    <td>
                      <button className="inline-link" type="button" onClick={() => setEditingClinic(clinic)}>
                        Изменить
                      </button>
                      {" "}
                      <button className="inline-link" type="button" onClick={() => destroy(`/api/admin/clinics/${clinic.id}`)}>
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <div className="section-heading">
            <h3>Пользователи</h3>
            <p>{users.length} активных пользователей</p>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name ?? "Без имени"}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <button className="inline-link" type="button" onClick={() => setEditingUser(user)}>
                        Изменить
                      </button>
                      {" "}
                      <button className="inline-link" type="button" onClick={() => destroy(`/api/admin/users/${user.id}`)}>
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card>
        <div className="section-heading">
          <h3>Проверки</h3>
          <p>
            <a href="/api/admin/export" className="inline-link">
              Экспорт CSV
            </a>
          </p>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Клиника</th>
                <th>Оценщик</th>
                <th>Балл</th>
                <th>Критич.</th>
                <th>Фото</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evaluation) => (
                <tr key={evaluation.id}>
                  <td>{new Date(evaluation.createdAt).toLocaleDateString()}</td>
                  <td>{evaluation.clinic.name}</td>
                  <td>{evaluation.user.email}</td>
                  <td>{evaluation.totalPercentage}%</td>
                  <td>{evaluation.criticalCount}</td>
                  <td>
                    <div className="photo-thumb-row">
                      {evaluation.photos.map((photo) => (
                        <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="inline-link">
                          фото
                        </a>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
