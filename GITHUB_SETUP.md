# Инструкция по публикации на GitHub

## Шаг 1: Создайте репозиторий на GitHub

1. Откройте https://github.com/new
2. Название репозитория: `kanban-game`
3. Выберите Public или Private
4. **НЕ** добавляйте README, .gitignore или лицензию (они уже есть в проекте)
5. Нажмите "Create repository"

## Шаг 2: Подключите локальный репозиторий к GitHub

После создания репозитория GitHub покажет команды. Выполните:

```bash
git remote add origin https://github.com/YOUR_USERNAME/kanban-game.git
git branch -M main
git push -u origin main
```

Замените `YOUR_USERNAME` на ваш GitHub username.

## Альтернативный способ (через SSH)

Если у вас настроен SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/kanban-game.git
git branch -M main
git push -u origin main
```

## После публикации

Репозиторий будет доступен по адресу:
`https://github.com/YOUR_USERNAME/kanban-game`

