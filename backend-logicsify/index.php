<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
echo json_encode([
    'success' => true,
    'service' => 'Logicsify API',
    'status' => 'online',
    'api' => 'https://backend.logicsify.com/api',
    'admin' => 'https://logicsify.com/admin/login',
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
