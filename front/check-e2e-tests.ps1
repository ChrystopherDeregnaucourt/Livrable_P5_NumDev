# Script de vérification des tests E2E
# Ce script affiche un résumé de tous les tests créés

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Tests E2E - Application Yoga Studio" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Cypress est installé
Write-Host "Verification de l'installation..." -ForegroundColor Yellow
if (Test-Path ".\node_modules\cypress") {
    Write-Host "[OK] Cypress installe" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] Cypress non installe - Executez 'npm install'" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Fichiers de tests E2E trouvés:" -ForegroundColor Yellow
Write-Host ""

$testFiles = Get-ChildItem -Path ".\cypress\e2e" -Filter "*.cy.ts" -File

$totalTests = 0
foreach ($file in $testFiles) {
    Write-Host "  * $($file.Name)" -ForegroundColor Cyan
    $content = Get-Content $file.FullName -Raw
    $describeMatches = [regex]::Matches($content, 'describe\(')
    $itMatches = [regex]::Matches($content, 'it\(')
    Write-Host "     - Suites: $($describeMatches.Count)" -ForegroundColor Gray
    Write-Host "     - Tests: $($itMatches.Count)" -ForegroundColor Gray
    $totalTests += $itMatches.Count
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Total: $($testFiles.Count) fichiers - $totalTests tests" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Commandes disponibles:" -ForegroundColor Yellow
Write-Host "  npm run cypress:open    - Mode interactif" -ForegroundColor White
Write-Host "  npm run cypress:run     - Mode headless" -ForegroundColor White
Write-Host "  npm run cypress:test    - Avec serveur auto" -ForegroundColor White
Write-Host ""

Write-Host "Tests par catégorie:" -ForegroundColor Yellow
Write-Host "  • Authentification: login, register, logout" -ForegroundColor White
Write-Host "  • Sessions: création, modification, suppression, participation" -ForegroundColor White
Write-Host "  • Profil: affichage, suppression de compte" -ForegroundColor White
Write-Host "  • Navigation: routing, guards, 404" -ForegroundColor White
Write-Host "  • Workflows: parcours complets utilisateur/admin" -ForegroundColor White
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  • cypress/e2e/README.md - Guide détaillé des tests" -ForegroundColor White
Write-Host "  • TESTS_E2E_GUIDE.md - Guide d'utilisation" -ForegroundColor White
Write-Host "  • RESUME_TESTS_E2E.md - Résumé complet" -ForegroundColor White
Write-Host ""

# Demander si l'utilisateur veut lancer les tests
Write-Host "Voulez-vous lancer les tests maintenant? (O/N)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "O" -or $response -eq "o") {
    Write-Host ""
    Write-Host "Lancement du Test Runner Cypress..." -ForegroundColor Green
    npm run cypress:open
}
