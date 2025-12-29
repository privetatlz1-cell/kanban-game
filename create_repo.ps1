# Скрипт для создания репозитория на GitHub через API
# Требуется: GitHub Personal Access Token с правами repo

param(
    [string]$Token = "",
    [string]$RepoName = "kanban-game",
    [string]$Description = "Professional Construction Kanban Engine - Интерактивная обучающая игра",
    [string]$Visibility = "public"  # или "private"
)

if ([string]::IsNullOrEmpty($Token)) {
    Write-Host "Ошибка: Требуется GitHub Personal Access Token" -ForegroundColor Red
    Write-Host ""
    Write-Host "Инструкция:" -ForegroundColor Yellow
    Write-Host "1. Перейдите на https://github.com/settings/tokens"
    Write-Host "2. Создайте новый token с правами 'repo'"
    Write-Host "3. Запустите скрипт: .\create_repo.ps1 -Token 'ваш_токен'"
    exit 1
}

$headers = @{
    "Authorization" = "token $Token"
    "Accept" = "application/vnd.github.v3+json"
}

$body = @{
    name = $RepoName
    description = $Description
    private = ($Visibility -eq "private")
} | ConvertTo-Json

try {
    Write-Host "Создание репозитория $RepoName на GitHub..." -ForegroundColor Green
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    
    Write-Host "Репозиторий успешно создан!" -ForegroundColor Green
    Write-Host "URL: $($response.html_url)" -ForegroundColor Cyan
    
    # Добавляем remote и пушим код
    Write-Host ""
    Write-Host "Подключение локального репозитория..." -ForegroundColor Green
    
    git remote remove origin 2>$null
    git remote add origin $response.clone_url
    git branch -M main
    git push -u origin main
    
    Write-Host ""
    Write-Host "Готово! Репозиторий доступен по адресу:" -ForegroundColor Green
    Write-Host $response.html_url -ForegroundColor Cyan
    
} catch {
    Write-Host "Ошибка при создании репозитория:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

