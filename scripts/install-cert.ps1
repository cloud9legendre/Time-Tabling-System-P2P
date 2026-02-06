$certPath = "$PSScriptRoot\..\cert.pfx"
$passwordStr = "lab-secure-password"
$password = ConvertTo-SecureString -String $passwordStr -Force -AsPlainText

Write-Host "Installing certificate to Trusted Root (Requires Admin)..."

try {
    Import-PfxCertificate -FilePath $certPath -CertStoreLocation Cert:\LocalMachine\Root -Password $password
    Write-Host "✅ Certificate successfully installed to Trusted Root Certification Authorities."
    Write-Host "You can now run the installer 'Lab Timetable P2P Setup.exe' without warnings."
}
catch {
    Write-Host "❌ Failed to install certificate. Please run this script as Administrator."
    Write-Error $_
}
