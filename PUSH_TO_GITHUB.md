# Инструкция по публикации на GitHub

## Шаг 1: Создайте репозиторий на GitHub

1. Откройте: https://github.com/new
2. Название репозитория: `kanban-game`
3. Выберите **Public** или **Private**
4. **НЕ** добавляйте README, .gitignore или лицензию (они уже есть в проекте)
5. Нажмите **"Create repository"**

## Шаг 2: Подключите и загрузите код

После создания репозитория выполните эти команды:

```bash
git remote add origin https://github.com/privetatlz1-cell/kanban-game.git
git push -u origin main
```

## Альтернатива: Если репозиторий уже создан

Если вы уже создали репозиторий, просто выполните:

```bash
git remote add origin https://github.com/privetatlz1-cell/kanban-game.git
git branch -M main
git push -u origin main
```

## После успешной загрузки

Репозиторий будет доступен по адресу:
**https://github.com/privetatlz1-cell/kanban-game**

---

**Примечание:** Текущий токен не имеет прав на создание репозиториев. 
Для автоматического создания нужен токен с правами `repo` (полный доступ к репозиториям).

