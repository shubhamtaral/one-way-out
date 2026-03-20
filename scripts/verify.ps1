# verify.ps1 - Local DevOps Validation Script
# This script mimics the CI/CD pipeline locally.

Write-Host "🚀 Starting Local DevOps Validation..." -ForegroundColor Cyan

# 1. Linting
Write-Host "`n🧹 Step 1: Running Lint Check..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Linting failed! Please fix formatting/syntax issues." -ForegroundColor Red
    exit 1
}

# 2. Testing
Write-Host "`n🧪 Step 2: Running Unit Tests..." -ForegroundColor Yellow
npm run test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tests failed! Fix failing test cases before pushing." -ForegroundColor Red
    exit 1
}

# 3. Security Audit
Write-Host "`n🛡️ Step 3: Running Security Audit (npm audit)..." -ForegroundColor Yellow
npm audit --audit-level=high
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Security vulnerabilities found (High+). Please review!" -ForegroundColor Magenta
    # We won't exit 1 here if it's just a warning, but you should review it
}

# 4. Build Check
Write-Host "`n🏗️ Step 4: Verifying Production Build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Production bundle is broken." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Local Validation Complete! You are ready to push." -ForegroundColor Green
