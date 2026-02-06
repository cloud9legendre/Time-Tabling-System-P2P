$certPath = "$PSScriptRoot\..\cert.pfx"
$passwordStr = "lab-secure-password"
$password = ConvertTo-SecureString -String $passwordStr -Force -AsPlainText

if (Test-Path $certPath) {
    Write-Host "Certificate already exists at $certPath"
}
else {
    Write-Host "Generating Self-Signed Certificate..."
    $cert = New-SelfSignedCertificate -CertStoreLocation Cert:\CurrentUser\My -Subject "CN=LabTimetableP2P" -KeySpec Signature -KeyUsage DigitalSignature -Type CodeSigningCert
    Export-PfxCertificate -Cert $cert -FilePath $certPath -Password $password
    Write-Host "Certificate generated at $certPath"
}

Write-Host "`n=== SETUP INSTRUCTIONS ==="
Write-Host "1. The certificate file 'cert.pfx' has been created in the project root."
Write-Host "2. Password: $passwordStr"
Write-Host "3. TO TRUST THIS INSTALLER:"
Write-Host "   - Double-click 'cert.pfx'"
Write-Host "   - Select 'Local Machine'"
Write-Host "   - Enter password: $passwordStr"
Write-Host "   - Choose 'Place all certificates in the following store'"
Write-Host "   - Browse -> 'Trusted Root Certification Authorities'"
Write-Host "   - Finish"
Write-Host "`nOnce done, any installer built with this cert will be trusted on this machine."
