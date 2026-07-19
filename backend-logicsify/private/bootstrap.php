<?php
declare(strict_types=1);

$config = require __DIR__ . '/config.php';
date_default_timezone_set($config['app']['timezone']);

function config(?string $path = null, mixed $default = null): mixed
{
    global $config;
    if ($path === null) return $config;
    $value = $config;
    foreach (explode('.', $path) as $segment) {
        if (!is_array($value) || !array_key_exists($segment, $value)) return $default;
        $value = $value[$segment];
    }
    return $value;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $cfg = config('database');
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $cfg['host'], $cfg['port'], $cfg['name'], $cfg['charset']);
    $pdo = new PDO($dsn, $cfg['user'], $cfg['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

function json_response(mixed $data = null, int $status = 200, array $meta = []): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => $status < 400, 'data' => $data, 'meta' => (object)$meta], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(string $message, int $status = 400, array $errors = []): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => $message, 'errors' => (object)$errors], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function request_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') return $_POST ?: [];
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) fail('Invalid JSON request body.', 422);
    return $decoded;
}

function bearer_token(): ?string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.+)/i', $header, $m)) return trim($m[1]);
    return null;
}

function current_admin(bool $required = true): ?array
{
    $token = bearer_token();
    if (!$token) {
        if ($required) fail('Authentication required.', 401);
        return null;
    }
    $hash = hash('sha256', $token);
    $sql = "SELECT a.id, a.name, a.email, a.role, a.status
            FROM auth_tokens t JOIN administrators a ON a.id=t.administrator_id
            WHERE t.token_hash=? AND t.expires_at>NOW() AND a.deleted_at IS NULL LIMIT 1";
    $stmt = db()->prepare($sql);
    $stmt->execute([$hash]);
    $admin = $stmt->fetch();
    if (!$admin || $admin['status'] !== 'active') {
        if ($required) fail('Session expired or invalid.', 401);
        return null;
    }
    return $admin;
}

function require_super_admin(): array
{
    $admin = current_admin();
    if (($admin['role'] ?? '') !== 'super_admin') fail('Super Admin access required.', 403);
    return $admin;
}

function slugify(string $value): string
{
    $value = trim(mb_strtolower($value));
    $value = preg_replace('/[^a-z0-9]+/u', '-', $value) ?? '';
    return trim($value, '-');
}

function clean_string(mixed $value, int $max = 65535): string
{
    $value = trim((string)$value);
    return mb_substr($value, 0, $max);
}

function rate_limit(string $bucket, int $maxAttempts = 8, int $windowSeconds = 900): void
{
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $key = hash('sha256', $bucket . '|' . $ip);
    $directory = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'logicsify-rate-limits';
    if (!is_dir($directory)) @mkdir($directory, 0700, true);
    $file = $directory . DIRECTORY_SEPARATOR . $key . '.json';
    $now = time();
    $record = ['started_at' => $now, 'attempts' => 0];
    $handle = @fopen($file, 'c+');
    if (!$handle) return;
    try {
        if (!flock($handle, LOCK_EX)) return;
        $raw = stream_get_contents($handle);
        if ($raw) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) $record = array_merge($record, $decoded);
        }
        if ($now - (int)$record['started_at'] >= $windowSeconds) $record = ['started_at' => $now, 'attempts' => 0];
        if ((int)$record['attempts'] >= $maxAttempts) {
            $retry = max(1, $windowSeconds - ($now - (int)$record['started_at']));
            header('Retry-After: ' . $retry);
            fail('Too many requests. Please try again later.', 429);
        }
        $record['attempts'] = (int)$record['attempts'] + 1;
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($record));
        fflush($handle);
        flock($handle, LOCK_UN);
    } finally {
        fclose($handle);
    }
}

function json_field(mixed $value, array $fallback = []): string
{
    if (is_string($value)) {
        $decoded = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE) $value = $decoded;
    }
    if (!is_array($value)) $value = $fallback;
    return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

function decode_row(array $row): array
{
    foreach (['content_json', 'seo_json', 'metadata_json', 'value_json'] as $field) {
        if (array_key_exists($field, $row) && is_string($row[$field])) {
            $decoded = json_decode($row[$field], true);
            $row[$field] = is_array($decoded) ? $decoded : [];
        }
    }
    return $row;
}

function audit(string $action, string $entityType, ?int $entityId = null, array $details = []): void
{
    $admin = current_admin(false);
    $stmt = db()->prepare('INSERT INTO audit_logs (administrator_id, action, entity_type, entity_id, details_json, ip_address, created_at) VALUES (?,?,?,?,?,?,NOW())');
    $stmt->execute([
        $admin['id'] ?? null,
        $action,
        $entityType,
        $entityId,
        json_encode($details, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        $_SERVER['REMOTE_ADDR'] ?? null,
    ]);
}

function setting(string $group, string $key, mixed $default = null): mixed
{
    try {
        $stmt = db()->prepare('SELECT value_json FROM settings WHERE setting_group=? AND setting_key=? LIMIT 1');
        $stmt->execute([$group, $key]);
        $row = $stmt->fetch();
        if (!$row) return $default;
        $decoded = json_decode($row['value_json'], true);
        return $decoded ?? $default;
    } catch (Throwable) {
        return $default;
    }
}

function upsert_setting(string $group, string $key, mixed $value): void
{
    $stmt = db()->prepare('INSERT INTO settings (setting_group, setting_key, value_json, updated_at) VALUES (?,?,?,NOW()) ON DUPLICATE KEY UPDATE value_json=VALUES(value_json), updated_at=NOW()');
    $stmt->execute([$group, $key, json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)]);
}

function smtp_read_response($socket): string
{
    $response = '';
    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (strlen($line) < 4 || $line[3] === ' ') break;
    }
    return $response;
}

function smtp_expect($socket, array $codes): string
{
    $response = smtp_read_response($socket);
    $code = (int)substr($response, 0, 3);
    if (!in_array($code, $codes, true)) {
        throw new RuntimeException('SMTP error: ' . trim($response));
    }
    return $response;
}

function smtp_command($socket, string $command, array $codes): string
{
    fwrite($socket, $command . "\r\n");
    return smtp_expect($socket, $codes);
}

function smtp_send(string $to, string $subject, string $html, string $from, string $fromName, ?string $replyTo = null): bool
{
    $host = (string)setting('email', 'smtp_host', '');
    $port = (int)setting('email', 'smtp_port', 587);
    $username = (string)setting('email', 'smtp_username', '');
    $password = (string)setting('email', 'smtp_password', '');
    $encryption = strtolower((string)setting('email', 'smtp_encryption', 'tls'));
    if ($host === '' || $port <= 0) return false;

    $transport = $encryption === 'ssl' ? 'ssl://' : 'tcp://';
    $socket = @stream_socket_client($transport . $host . ':' . $port, $errno, $error, 15, STREAM_CLIENT_CONNECT);
    if (!$socket) throw new RuntimeException('SMTP connection failed: ' . $error . ' (' . $errno . ')');
    stream_set_timeout($socket, 15);

    try {
        smtp_expect($socket, [220]);
        $hostname = $_SERVER['SERVER_NAME'] ?? 'backend.logicsify.com';
        smtp_command($socket, 'EHLO ' . $hostname, [250]);

        if ($encryption === 'tls') {
            smtp_command($socket, 'STARTTLS', [220]);
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('Could not enable SMTP TLS encryption.');
            }
            smtp_command($socket, 'EHLO ' . $hostname, [250]);
        }

        if ($username !== '') {
            smtp_command($socket, 'AUTH LOGIN', [334]);
            smtp_command($socket, base64_encode($username), [334]);
            smtp_command($socket, base64_encode($password), [235]);
        }

        smtp_command($socket, 'MAIL FROM:<' . $from . '>', [250]);
        smtp_command($socket, 'RCPT TO:<' . $to . '>', [250, 251]);
        smtp_command($socket, 'DATA', [354]);

        $headers = [
            'Date: ' . date(DATE_RFC2822),
            'From: ' . $fromName . ' <' . $from . '>',
            'To: <' . $to . '>',
            'Subject: ' . '=?UTF-8?B?' . base64_encode($subject) . '?=',
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
        ];
        if ($replyTo) $headers[] = 'Reply-To: <' . $replyTo . '>';
        $body = preg_replace('/^\./m', '..', str_replace(["\r\n", "\r"], "\n", $html)) ?? $html;
        fwrite($socket, implode("\r\n", $headers) . "\r\n\r\n" . str_replace("\n", "\r\n", $body) . "\r\n.\r\n");
        smtp_expect($socket, [250]);
        smtp_command($socket, 'QUIT', [221]);
        fclose($socket);
        return true;
    } catch (Throwable $e) {
        fclose($socket);
        throw $e;
    }
}

function send_notification(string $subject, string $html, ?string $replyTo = null): bool
{
    $to = (string)setting('email', 'notification_email', 'hello@logicsify.com');
    $from = (string)setting('email', 'from_email', 'hello@logicsify.com');
    $fromName = (string)setting('email', 'from_name', 'Logicsify');
    if ((bool)setting('email', 'smtp_enabled', false)) {
        try {
            return smtp_send($to, $subject, $html, $from, $fromName, $replyTo);
        } catch (Throwable $e) {
            error_log('[Logicsify CMS] SMTP failed: ' . $e->getMessage());
        }
    }
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . $fromName . ' <' . $from . '>',
    ];
    if ($replyTo) $headers[] = 'Reply-To: ' . $replyTo;
    return @mail($to, $subject, $html, implode("\r\n", $headers));
}

function cors_headers(): void
{
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = config('app.allowed_origins', []);
    if ($origin && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
}

cors_headers();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
