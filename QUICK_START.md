# Быстрый старт - Публикация на GitHub

## Вариант 1: Через веб-интерфейс (самый простой)

1. Откройте https://github.com/new
2. Название: `kanban-game`
3. Выберите Public или Private
4. **НЕ** добавляйте README, .gitignore, лицензию
5. Нажмите "Create repository"
6. Выполните команды, которые покажет GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/kanban-game.git
git branch -M main
git push -u origin main
```

## Вариант 2: Через PowerShell скрипт (автоматически)

1. Создайте GitHub Personal Access Token:
   - Перейдите на https://github.com/settings/tokens
   - Нажмите "Generate new token (classic)"
   - Выберите права `repo` (полный доступ к репозиториям)
   - Скопируйте токен

2. Запустите скрипт:

```powershell
.\create_repo.ps1 -Token "ваш_токен_здесь"
```

Скрипт автоматически:
- Создаст репозиторий на GitHub
- Подключит локальный репозиторий
- Загрузит весь код

## Вариант 3: Через GitHub CLI (если установлен)

```bash
gh repo create kanban-game --public --source=. --remote=origin --push
```

## Текущий статус проекта

✅ Git репозиторий инициализирован  
✅ Все файлы закоммичены  
✅ README.md создан  
✅ Готов к публикации

