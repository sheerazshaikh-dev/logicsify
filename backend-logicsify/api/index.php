<?php
declare(strict_types=1);
require dirname(__DIR__) . '/private/bootstrap.php';

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$route = trim((string)($_GET['route'] ?? ''), '/');
if ($route === '') {
    $uriPath = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '';
    $route = trim((string)preg_replace('#^/api/?#', '', $uriPath), '/');
}
$segments = $route === '' ? [] : explode('/', $route);

function require_fields(array $data, array $fields): void
{
    $errors = [];
    foreach ($fields as $field => $label) {
        $key = is_int($field) ? $label : $field;
        $name = is_int($field) ? ucfirst(str_replace('_', ' ', $label)) : $label;
        if (!isset($data[$key]) || trim((string)$data[$key]) === '') $errors[$key] = $name . ' is required.';
    }
    if ($errors) fail('Please check the required fields.', 422, $errors);
}

function pagination(): array
{
    $page = max(1, (int)($_GET['page'] ?? 1));
    $perPage = min(100, max(5, (int)($_GET['per_page'] ?? 25)));
    return [$page, $perPage, ($page - 1) * $perPage];
}

function save_revision(int $id, ?int $adminId): void
{
    $stmt = db()->prepare('SELECT * FROM content_items WHERE id=? LIMIT 1');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) return;
    $insert = db()->prepare('INSERT INTO content_revisions (content_item_id,snapshot_json,created_by) VALUES (?,?,?)');
    $insert->execute([$id, json_encode(decode_row($row), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), $adminId]);
    db()->prepare('DELETE FROM content_revisions WHERE content_item_id=? AND id NOT IN (SELECT id FROM (SELECT id FROM content_revisions WHERE content_item_id=? ORDER BY created_at DESC LIMIT 20) x)')->execute([$id,$id]);
}

function content_payload(array $data, ?array $existing = null): array
{
    $title = clean_string($data['title'] ?? ($existing['title'] ?? ''), 255);
    if ($title === '') fail('Title is required.', 422, ['title' => 'Title is required.']);
    $type = clean_string($data['content_type'] ?? ($existing['content_type'] ?? 'page'), 40);
    $allowedTypes = ['page','service','industry','case_study','insight','career','testimonial','team'];
    if (!in_array($type, $allowedTypes, true)) fail('Invalid content type.', 422);
    $slug = slugify(clean_string($data['slug'] ?? ($existing['slug'] ?? $title), 255));
    if ($slug === '') fail('Slug is required.', 422, ['slug' => 'Slug is required.']);
    $status = clean_string($data['status'] ?? ($existing['status'] ?? 'draft'), 20);
    if (!in_array($status, ['draft','published','scheduled','archived'], true)) $status = 'draft';
    $publishedAt = $data['published_at'] ?? ($existing['published_at'] ?? null);
    if ($status === 'published' && !$publishedAt) $publishedAt = date('Y-m-d H:i:s');
    return [
        'content_type' => $type,
        'title' => $title,
        'slug' => $slug,
        'status' => $status,
        'featured' => !empty($data['featured']) ? 1 : 0,
        'excerpt' => clean_string($data['excerpt'] ?? ($existing['excerpt'] ?? ''), 10000),
        'featured_image' => clean_string($data['featured_image'] ?? ($existing['featured_image'] ?? ''), 500),
        'content_json' => json_field($data['content_json'] ?? ($existing['content_json'] ?? [])),
        'seo_json' => json_field($data['seo_json'] ?? ($existing['seo_json'] ?? [])),
        'published_at' => $publishedAt ?: null,
        'sort_order' => (int)($data['sort_order'] ?? ($existing['sort_order'] ?? 0)),
    ];
}

function get_content_item(int $id, bool $includeDeleted = false): array
{
    $sql = 'SELECT * FROM content_items WHERE id=?' . ($includeDeleted ? '' : ' AND deleted_at IS NULL') . ' LIMIT 1';
    $stmt = db()->prepare($sql);
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) fail('Content item not found.', 404);
    return decode_row($row);
}

// Health
if ($method === 'GET' && ($route === '' || $route === 'health')) {
    try {
        db()->query('SELECT 1');
        json_response(['service' => 'Logicsify CMS API', 'status' => 'ok', 'time' => date(DATE_ATOM)]);
    } catch (Throwable $e) {
        fail('Database connection failed.', 500, ['database' => $e->getMessage()]);
    }
}

// Authentication
if ($method === 'POST' && $route === 'auth/login') {
    $data = request_body();
    require_fields($data, ['email','password']);
    $stmt = db()->prepare('SELECT * FROM administrators WHERE email=? AND deleted_at IS NULL LIMIT 1');
    $stmt->execute([mb_strtolower(clean_string($data['email'], 190))]);
    $admin = $stmt->fetch();
    if (!$admin || $admin['status'] !== 'active' || !password_verify((string)$data['password'], $admin['password_hash'])) {
        fail('Invalid email or password.', 401);
    }
    $token = bin2hex(random_bytes(32));
    $expires = (new DateTimeImmutable())->modify('+' . (int)config('app.token_ttl_hours', 168) . ' hours')->format('Y-m-d H:i:s');
    db()->prepare('INSERT INTO auth_tokens (administrator_id,token_hash,expires_at) VALUES (?,?,?)')->execute([$admin['id'],hash('sha256',$token),$expires]);
    db()->prepare('UPDATE administrators SET last_login_at=NOW() WHERE id=?')->execute([$admin['id']]);
    audit('login','administrator',(int)$admin['id']);
    json_response(['token'=>$token,'expires_at'=>$expires,'administrator'=>['id'=>(int)$admin['id'],'name'=>$admin['name'],'email'=>$admin['email'],'role'=>$admin['role']]]);
}

if ($method === 'GET' && $route === 'auth/me') {
    json_response(current_admin());
}

if ($method === 'POST' && $route === 'auth/logout') {
    current_admin();
    $token = bearer_token();
    db()->prepare('DELETE FROM auth_tokens WHERE token_hash=?')->execute([hash('sha256',(string)$token)]);
    json_response(['logged_out'=>true]);
}

// Public contact submission
if ($method === 'POST' && $route === 'public/contact') {
    rate_limit('public-contact', 6, 900);
    $data = request_body();
    if (!empty($data['honey'])) fail('Invalid submission.', 422);
    require_fields($data, ['name'=>'Full name','email'=>'Email','service'=>'Service','budget'=>'Budget','description'=>'Project description']);
    $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) fail('Enter a valid email address.', 422, ['email'=>'Enter a valid email address.']);
    $description = clean_string($data['description'], 4000);
    if (mb_strlen($description) < 20) fail('Tell us a little more about the project.', 422, ['description'=>'Minimum 20 characters.']);
    $stmt = db()->prepare('INSERT INTO contact_submissions (name,email,phone,company,website,service,budget,timeline,description,source,status,ip_address,user_agent) VALUES (?,?,?,?,?,?,?,?,?,?,\'new\',?,?)');
    $stmt->execute([
        clean_string($data['name'],120), mb_strtolower((string)$email), clean_string($data['phone'] ?? '',60) ?: null,
        clean_string($data['company'] ?? '',160) ?: null, clean_string($data['website'] ?? '',255) ?: null,
        clean_string($data['service'],160), clean_string($data['budget'],100), clean_string($data['timeline'] ?? '',120) ?: null,
        $description, clean_string($data['source'] ?? '',160) ?: null, $_SERVER['REMOTE_ADDR'] ?? null, clean_string($_SERVER['HTTP_USER_AGENT'] ?? '',500)
    ]);
    $id = (int)db()->lastInsertId();
    send_notification('New Logicsify project inquiry from ' . clean_string($data['name'],120), '<h2>New project inquiry</h2><p><strong>Name:</strong> '.htmlspecialchars(clean_string($data['name'],120)).'</p><p><strong>Email:</strong> '.htmlspecialchars((string)$email).'</p><p><strong>Service:</strong> '.htmlspecialchars(clean_string($data['service'],160)).'</p><p><strong>Budget:</strong> '.htmlspecialchars(clean_string($data['budget'],100)).'</p><p>'.nl2br(htmlspecialchars($description)).'</p>', (string)$email);
    json_response(['id'=>$id,'message'=>'Thanks — your project inquiry has been received.'], 201);
}

// Public availability
if ($method === 'GET' && $route === 'public/availability') {
    $dateString = clean_string($_GET['date'] ?? '', 10);
    $date = DateTimeImmutable::createFromFormat('Y-m-d', $dateString);
    if (!$date || $date->format('Y-m-d') !== $dateString) fail('A valid date is required.', 422);
    $today = new DateTimeImmutable('today');
    $window = (int)setting('calendar','booking_window_days',60);
    if ($date < $today || $date > $today->modify('+' . $window . ' days')) json_response(['date'=>$dateString,'available'=>false,'slots'=>[]]);
    $blocked = db()->prepare('SELECT id FROM blocked_dates WHERE blocked_date=? LIMIT 1');
    $blocked->execute([$dateString]);
    if ($blocked->fetch()) json_response(['date'=>$dateString,'available'=>false,'slots'=>[]]);
    $weekday = (int)$date->format('w');
    $stmt = db()->prepare('SELECT * FROM availability_rules WHERE weekday=? AND enabled=1 LIMIT 1');
    $stmt->execute([$weekday]);
    $rule = $stmt->fetch();
    if (!$rule) json_response(['date'=>$dateString,'available'=>false,'slots'=>[]]);
    $takenStmt = db()->prepare("SELECT start_time FROM bookings WHERE meeting_date=? AND status IN ('pending','confirmed') AND deleted_at IS NULL");
    $takenStmt->execute([$dateString]);
    $taken = array_map(fn($r)=>substr((string)$r['start_time'],0,5), $takenStmt->fetchAll());
    $duration = max(15,(int)$rule['slot_minutes']);
    $buffer = max(0,(int)$rule['buffer_minutes']);
    $start = new DateTimeImmutable($dateString . ' ' . $rule['start_time']);
    $end = new DateTimeImmutable($dateString . ' ' . $rule['end_time']);
    $noticeHours = (int)setting('calendar','booking_notice_hours',4);
    $earliest = (new DateTimeImmutable())->modify('+' . $noticeHours . ' hours');
    $slots = [];
    for ($cursor=$start; $cursor->modify('+' . $duration . ' minutes') <= $end; $cursor=$cursor->modify('+' . ($duration+$buffer) . ' minutes')) {
        $key = $cursor->format('H:i');
        if ($cursor < $earliest || in_array($key,$taken,true)) continue;
        $slots[] = ['time'=>$key,'label'=>$cursor->format('g:i A'),'end'=>$cursor->modify('+' . $duration . ' minutes')->format('H:i')];
    }
    json_response(['date'=>$dateString,'available'=>count($slots)>0,'slots'=>$slots,'timezone'=>setting('site','timezone','Asia/Karachi')]);
}

// Public booking
if ($method === 'POST' && $route === 'public/bookings') {
    rate_limit('public-booking', 8, 900);
    $data = request_body();
    if (!empty($data['honey'])) fail('Invalid submission.', 422);
    require_fields($data, ['name','email','meeting_date'=>'Date','start_time'=>'Time']);
    $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
    if (!$email) fail('Enter a valid email address.',422,['email'=>'Enter a valid email address.']);
    $dateString = clean_string($data['meeting_date'],10);
    $timeString = clean_string($data['start_time'],5);
    $_GET['date'] = $dateString;
    $date = DateTimeImmutable::createFromFormat('Y-m-d H:i', $dateString.' '.$timeString);
    if (!$date || $date <= new DateTimeImmutable()) fail('Choose a future time.',422);
    $today = new DateTimeImmutable('today');
    $bookingWindow = (int)setting('calendar','booking_window_days',60);
    if ($date < $today || $date > $today->modify('+' . $bookingWindow . ' days')) fail('That date is outside the booking window.',409);
    $noticeHours = (int)setting('calendar','booking_notice_hours',4);
    if ($date < (new DateTimeImmutable())->modify('+' . $noticeHours . ' hours')) fail('That time is too soon. Please choose a later slot.',409);
    $blockedStmt = db()->prepare('SELECT id FROM blocked_dates WHERE blocked_date=? LIMIT 1');
    $blockedStmt->execute([$dateString]);
    if ($blockedStmt->fetch()) fail('That date is not available.',409);

    $weekday = (int)$date->format('w');
    $ruleStmt = db()->prepare('SELECT * FROM availability_rules WHERE weekday=? AND enabled=1 LIMIT 1');
    $ruleStmt->execute([$weekday]);
    $rule = $ruleStmt->fetch();
    if (!$rule) fail('That date is not available.',409);
    $duration = max(15,(int)$rule['slot_minutes']);
    $buffer = max(0,(int)$rule['buffer_minutes']);
    $ruleStart = new DateTimeImmutable($dateString . ' ' . $rule['start_time']);
    $ruleEnd = new DateTimeImmutable($dateString . ' ' . $rule['end_time']);
    $stepMinutes = $duration + $buffer;
    $differenceMinutes = (int)(($date->getTimestamp() - $ruleStart->getTimestamp()) / 60);
    if ($date < $ruleStart || $date->modify('+' . $duration . ' minutes') > $ruleEnd || $differenceMinutes < 0 || $differenceMinutes % $stepMinutes !== 0) {
        fail('That time is not an available booking slot.',409);
    }
    $endTime = $date->modify('+' . $duration . ' minutes')->format('H:i:s');
    try {
        $stmt = db()->prepare('INSERT INTO bookings (name,email,phone,company,service,meeting_date,start_time,end_time,timezone,notes,status) VALUES (?,?,?,?,?,?,?,?,?,?,\'pending\')');
        $stmt->execute([
            clean_string($data['name'],120), mb_strtolower((string)$email), clean_string($data['phone'] ?? '',60) ?: null,
            clean_string($data['company'] ?? '',160) ?: null, clean_string($data['service'] ?? '',160) ?: null,
            $dateString, $timeString.':00', $endTime, clean_string($data['timezone'] ?? setting('site','timezone','Asia/Karachi'),100), clean_string($data['notes'] ?? '',2000) ?: null
        ]);
    } catch (PDOException $e) {
        if ((int)($e->errorInfo[1] ?? 0) === 1062) fail('That time was just booked. Please choose another slot.',409);
        throw $e;
    }
    $id=(int)db()->lastInsertId();
    send_notification('New Logicsify strategy call request', '<h2>New strategy call request</h2><p><strong>Name:</strong> '.htmlspecialchars(clean_string($data['name'],120)).'</p><p><strong>Email:</strong> '.htmlspecialchars((string)$email).'</p><p><strong>Date:</strong> '.htmlspecialchars($dateString).'</p><p><strong>Time:</strong> '.htmlspecialchars($date->format('g:i A')).'</p>', (string)$email);
    json_response(['id'=>$id,'message'=>setting('calendar','confirmation_message','Your booking request has been received.')],201);
}

// Public CMS content
if ($method === 'GET' && isset($segments[0],$segments[1]) && $segments[0] === 'public' && $segments[1] === 'content') {
    $type = $segments[2] ?? '';
    $slug = $segments[3] ?? null;
    if ($type === '') fail('Content type is required.',422);
    if ($slug) {
        $stmt=db()->prepare("SELECT * FROM content_items WHERE content_type=? AND slug=? AND (status='published' OR (status='scheduled' AND published_at<=NOW())) AND deleted_at IS NULL LIMIT 1");
        $stmt->execute([$type,$slug]);
        $row=$stmt->fetch();
        if (!$row) fail('Content not found.',404);
        json_response(decode_row($row));
    }
    $stmt=db()->prepare("SELECT * FROM content_items WHERE content_type=? AND (status='published' OR (status='scheduled' AND published_at<=NOW())) AND deleted_at IS NULL ORDER BY featured DESC, sort_order ASC, published_at DESC, id DESC");
    $stmt->execute([$type]);
    json_response(array_map('decode_row',$stmt->fetchAll()));
}

// Public menus
if ($method === 'GET' && isset($segments[0], $segments[1]) && $segments[0] === 'public' && $segments[1] === 'menus') {
    $location = clean_string($segments[2] ?? 'header', 80);
    $stmt = db()->prepare('SELECT id,name,location FROM menus WHERE location=? LIMIT 1');
    $stmt->execute([$location]);
    $menu = $stmt->fetch();
    if (!$menu) json_response(['location'=>$location,'items'=>[]]);
    $itemsStmt = db()->prepare("SELECT mi.id,mi.parent_id,mi.label,mi.external_url,mi.is_external,mi.target_blank,mi.coming_soon,mi.sort_order,ci.slug page_slug,ci.status page_status,ci.published_at page_published_at
        FROM menu_items mi LEFT JOIN content_items ci ON ci.id=mi.page_id
        WHERE mi.menu_id=? ORDER BY mi.sort_order ASC,mi.id ASC");
    $itemsStmt->execute([$menu['id']]);
    $items = [];
    foreach ($itemsStmt->fetchAll() as $item) {
        if (!(int)$item['is_external'] && $item['page_slug']) {
            $isPublished = $item['page_status'] === 'published';
            $isDueScheduled = $item['page_status'] === 'scheduled'
                && !empty($item['page_published_at'])
                && strtotime((string)$item['page_published_at']) <= time();
            if (!$isPublished && !$isDueScheduled) continue;
        }
        $slug = (string)($item['page_slug'] ?? '');
        $url = (int)$item['is_external'] ? (string)$item['external_url'] : ($slug === 'home' ? '/' : '/' . ltrim($slug, '/'));
        $items[] = [
            'id'=>(int)$item['id'], 'parent_id'=>$item['parent_id'] ? (int)$item['parent_id'] : null, 'label'=>$item['label'], 'url'=>$url,
            'is_external'=>(bool)$item['is_external'], 'target_blank'=>(bool)$item['target_blank'],
            'coming_soon'=>(bool)$item['coming_soon'], 'sort_order'=>(int)$item['sort_order'],
        ];
    }
    json_response(['location'=>$location,'items'=>$items]);
}

// Public site and integration settings used by the website runtime.
if ($method === 'GET' && $route === 'public/settings/integrations') {
    $allowed = ['tracking_enabled','gtm_id','ga4_id','meta_pixel_id','linkedin_partner_id','tiktok_pixel_id','clarity_id','hotjar_id','hubspot_portal_id','crisp_website_id','intercom_app_id','google_site_verification','bing_site_verification','head_code','body_code'];
    $placeholders = implode(',', array_fill(0, count($allowed), '?'));
    $stmt = db()->prepare("SELECT setting_key,value_json FROM settings WHERE setting_group='integrations' AND setting_key IN ($placeholders)");
    $stmt->execute($allowed);
    $out = [];
    foreach ($stmt->fetchAll() as $row) $out[$row['setting_key']] = json_decode((string)$row['value_json'], true);
    json_response($out);
}

// Public site settings used by branding and footer components.
if ($method === 'GET' && $route === 'public/settings/site') {
    $allowed = ['site_name','tagline','contact_email','phone','site_url','timezone','logo_dark','logo_light','linkedin_url','instagram_url','facebook_url','x_url','default_seo_title','default_seo_description','default_og_image'];
    $placeholders = implode(',', array_fill(0, count($allowed), '?'));
    $stmt = db()->prepare("SELECT setting_key,value_json FROM settings WHERE setting_group='site' AND setting_key IN ($placeholders)");
    $stmt->execute($allowed);
    $out = [];
    foreach ($stmt->fetchAll() as $row) $out[$row['setting_key']] = json_decode((string)$row['value_json'], true);
    json_response($out);
}

// Everything below requires authentication.
$admin = current_admin();

if ($method === 'GET' && $route === 'dashboard') {
    $counts=[];
    foreach (['page','service','industry','case_study','insight','career'] as $type) {
        $stmt=db()->prepare("SELECT status,COUNT(*) total FROM content_items WHERE content_type=? AND deleted_at IS NULL GROUP BY status");
        $stmt->execute([$type]);
        $counts[$type]=['total'=>0,'published'=>0,'draft'=>0,'scheduled'=>0,'archived'=>0];
        foreach($stmt->fetchAll() as $row){$counts[$type][$row['status']]=(int)$row['total'];$counts[$type]['total']+=(int)$row['total'];}
    }
    $summary=[
        'content'=>$counts,
        'new_leads'=>(int)db()->query("SELECT COUNT(*) FROM contact_submissions WHERE status='new' AND deleted_at IS NULL")->fetchColumn(),
        'upcoming_bookings'=>(int)db()->query("SELECT COUNT(*) FROM bookings WHERE meeting_date>=CURDATE() AND status IN ('pending','confirmed') AND deleted_at IS NULL")->fetchColumn(),
        'media'=>(int)db()->query("SELECT COUNT(*) FROM media WHERE deleted_at IS NULL")->fetchColumn(),
        'trash'=>(int)db()->query("SELECT (SELECT COUNT(*) FROM content_items WHERE deleted_at IS NOT NULL)+(SELECT COUNT(*) FROM contact_submissions WHERE deleted_at IS NOT NULL)+(SELECT COUNT(*) FROM bookings WHERE deleted_at IS NOT NULL)+(SELECT COUNT(*) FROM media WHERE deleted_at IS NOT NULL)")->fetchColumn(),
    ];
    $recentLeads=db()->query('SELECT id,name,email,service,status,created_at FROM contact_submissions WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 6')->fetchAll();
    $recentBookings=db()->query('SELECT id,name,email,meeting_date,start_time,status FROM bookings WHERE deleted_at IS NULL ORDER BY meeting_date DESC,start_time DESC LIMIT 6')->fetchAll();
    json_response(['summary'=>$summary,'recent_leads'=>$recentLeads,'recent_bookings'=>$recentBookings]);
}

if ($method === 'GET' && $route === 'content') {
    [$page,$perPage,$offset]=pagination();
    $where=['deleted_at IS NULL'];$params=[];
    if(!empty($_GET['type'])){$where[]='content_type=?';$params[]=clean_string($_GET['type'],40);}
    if(!empty($_GET['status']) && $_GET['status']!=='all'){$where[]='status=?';$params[]=clean_string($_GET['status'],20);}
    if(!empty($_GET['search'])){$where[]='(title LIKE ? OR slug LIKE ? OR excerpt LIKE ?)';$q='%'.clean_string($_GET['search'],120).'%';array_push($params,$q,$q,$q);}
    $whereSql=implode(' AND ',$where);
    $count=db()->prepare("SELECT COUNT(*) FROM content_items WHERE $whereSql");$count->execute($params);$total=(int)$count->fetchColumn();
    $sql="SELECT * FROM content_items WHERE $whereSql ORDER BY sort_order ASC, updated_at DESC LIMIT $perPage OFFSET $offset";
    $stmt=db()->prepare($sql);$stmt->execute($params);
    $items=array_map('decode_row',$stmt->fetchAll());
    $counterSql='SELECT status,COUNT(*) total FROM content_items WHERE deleted_at IS NULL'.(!empty($_GET['type'])?' AND content_type=?':'').' GROUP BY status';
    $counter=db()->prepare($counterSql);$counter->execute(!empty($_GET['type'])?[clean_string($_GET['type'],40)]:[]);
    $counters=['all'=>0,'published'=>0,'draft'=>0,'scheduled'=>0,'archived'=>0];foreach($counter->fetchAll() as $r){$counters[$r['status']]=(int)$r['total'];$counters['all']+=(int)$r['total'];}
    json_response($items,200,['page'=>$page,'per_page'=>$perPage,'total'=>$total,'pages'=>(int)ceil($total/$perPage),'counters'=>$counters]);
}

if ($method === 'POST' && $route === 'content') {
    $data=request_body();$payload=content_payload($data);
    $stmt=db()->prepare('INSERT INTO content_items (content_type,title,slug,status,featured,excerpt,featured_image,content_json,seo_json,published_at,sort_order,created_by,updated_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
    try{$stmt->execute([$payload['content_type'],$payload['title'],$payload['slug'],$payload['status'],$payload['featured'],$payload['excerpt'],$payload['featured_image']?:null,$payload['content_json'],$payload['seo_json'],$payload['published_at'],$payload['sort_order'],$admin['id'],$admin['id']]);}
    catch(PDOException $e){if((int)($e->errorInfo[1]??0)===1062)fail('That slug is already in use for this content type.',409,['slug'=>'Choose a unique slug.']);throw $e;}
    $id=(int)db()->lastInsertId();audit('create','content',$id,['type'=>$payload['content_type']]);json_response(get_content_item($id),201);
}

if (isset($segments[0],$segments[1]) && $segments[0]==='content' && ctype_digit($segments[1])) {
    $id=(int)$segments[1];
    if ($method==='GET' && count($segments)===2) json_response(get_content_item($id));
    if (($method==='PUT'||$method==='PATCH') && count($segments)===2) {
        $existing=get_content_item($id);save_revision($id,(int)$admin['id']);$payload=content_payload(request_body(),$existing);
        $stmt=db()->prepare('UPDATE content_items SET content_type=?,title=?,slug=?,status=?,featured=?,excerpt=?,featured_image=?,content_json=?,seo_json=?,published_at=?,sort_order=?,updated_by=?,updated_at=NOW() WHERE id=?');
        try{$stmt->execute([$payload['content_type'],$payload['title'],$payload['slug'],$payload['status'],$payload['featured'],$payload['excerpt'],$payload['featured_image']?:null,$payload['content_json'],$payload['seo_json'],$payload['published_at'],$payload['sort_order'],$admin['id'],$id]);}
        catch(PDOException $e){if((int)($e->errorInfo[1]??0)===1062)fail('That slug is already in use.',409,['slug'=>'Choose a unique slug.']);throw $e;}
        audit('update','content',$id);json_response(get_content_item($id));
    }
    if ($method==='DELETE' && count($segments)===2) {
        db()->prepare('UPDATE content_items SET deleted_at=NOW(),updated_by=? WHERE id=?')->execute([$admin['id'],$id]);audit('delete','content',$id);json_response(['deleted'=>true]);
    }
    if ($method==='POST' && ($segments[2]??'')==='duplicate') {
        $item=get_content_item($id);$base=$item['slug'].'-copy';$slug=$base;$i=2;
        while(true){$check=db()->prepare('SELECT id FROM content_items WHERE content_type=? AND slug=? AND deleted_at IS NULL');$check->execute([$item['content_type'],$slug]);if(!$check->fetch())break;$slug=$base.'-'.$i++;}
        $stmt=db()->prepare('INSERT INTO content_items (content_type,title,slug,status,featured,excerpt,featured_image,content_json,seo_json,sort_order,created_by,updated_by) VALUES (?,?,?,\'draft\',0,?,?,?,?,?,?,?)');
        $stmt->execute([$item['content_type'],$item['title'].' (Copy)',$slug,$item['excerpt'],$item['featured_image'],$item['content_json']?json_encode($item['content_json']):'{}',$item['seo_json']?json_encode($item['seo_json']):'{}',$item['sort_order'],$admin['id'],$admin['id']]);
        $newId=(int)db()->lastInsertId();audit('duplicate','content',$newId,['source_id'=>$id]);json_response(get_content_item($newId),201);
    }
    if ($method==='GET' && ($segments[2]??'')==='revisions') {
        $stmt=db()->prepare('SELECT id,snapshot_json,created_by,created_at FROM content_revisions WHERE content_item_id=? ORDER BY created_at DESC LIMIT 20');$stmt->execute([$id]);$rows=$stmt->fetchAll();foreach($rows as &$r){$r['snapshot']=json_decode($r['snapshot_json'],true);unset($r['snapshot_json']);}json_response($rows);
    }
    if ($method==='POST' && ($segments[2]??'')==='restore-revision' && ctype_digit($segments[3]??'')) {
        $rev=(int)$segments[3];$stmt=db()->prepare('SELECT snapshot_json FROM content_revisions WHERE id=? AND content_item_id=?');$stmt->execute([$rev,$id]);$snap=$stmt->fetchColumn();if(!$snap)fail('Revision not found.',404);$payload=content_payload(json_decode((string)$snap,true)?:[]);save_revision($id,(int)$admin['id']);$up=db()->prepare('UPDATE content_items SET title=?,slug=?,status=?,featured=?,excerpt=?,featured_image=?,content_json=?,seo_json=?,published_at=?,sort_order=?,updated_by=? WHERE id=?');$up->execute([$payload['title'],$payload['slug'],$payload['status'],$payload['featured'],$payload['excerpt'],$payload['featured_image']?:null,$payload['content_json'],$payload['seo_json'],$payload['published_at'],$payload['sort_order'],$admin['id'],$id]);audit('restore_revision','content',$id,['revision_id'=>$rev]);json_response(get_content_item($id));
    }
}

if ($method==='POST' && $route==='content/bulk') {
    $data=request_body();$ids=array_values(array_filter(array_map('intval',$data['ids']??[])));$action=clean_string($data['action']??'',30);if(!$ids)fail('Select at least one item.',422);$marks=implode(',',array_fill(0,count($ids),'?'));
    if($action==='delete'){$params=array_merge([$admin['id']],$ids);db()->prepare("UPDATE content_items SET deleted_at=NOW(),updated_by=? WHERE id IN ($marks)")->execute($params);}
    elseif(in_array($action,['published','draft','archived'],true)){$params=array_merge([$action,$admin['id']],$ids);db()->prepare("UPDATE content_items SET status=?,updated_by=?,published_at=IF(?='published',COALESCE(published_at,NOW()),published_at) WHERE id IN ($marks)")->execute(array_merge([$action,$admin['id'],$action],$ids));}
    elseif($action==='featured'||$action==='unfeatured'){db()->prepare("UPDATE content_items SET featured=? WHERE id IN ($marks)")->execute(array_merge([$action==='featured'?1:0],$ids));}
    else fail('Invalid bulk action.',422);
    audit('bulk_'.$action,'content',null,['ids'=>$ids]);json_response(['updated'=>count($ids)]);
}

// Leads
if ($method==='GET' && $route==='leads') {
    [$page,$perPage,$offset]=pagination();$where=['deleted_at IS NULL'];$params=[];if(!empty($_GET['status'])&&$_GET['status']!=='all'){$where[]='status=?';$params[]=clean_string($_GET['status'],20);}if(!empty($_GET['search'])){$where[]='(name LIKE ? OR email LIKE ? OR company LIKE ? OR service LIKE ?)';$q='%'.clean_string($_GET['search'],120).'%';array_push($params,$q,$q,$q,$q);} $w=implode(' AND ',$where);$count=db()->prepare("SELECT COUNT(*) FROM contact_submissions WHERE $w");$count->execute($params);$total=(int)$count->fetchColumn();$stmt=db()->prepare("SELECT * FROM contact_submissions WHERE $w ORDER BY created_at DESC LIMIT $perPage OFFSET $offset");$stmt->execute($params);json_response($stmt->fetchAll(),200,['page'=>$page,'per_page'=>$perPage,'total'=>$total,'pages'=>(int)ceil($total/$perPage)]);
}
if(isset($segments[0],$segments[1])&&$segments[0]==='leads'&&ctype_digit($segments[1])){$id=(int)$segments[1];if($method==='PATCH'||$method==='PUT'){$data=request_body();$status=clean_string($data['status']??'new',20);if(!in_array($status,['new','contacted','qualified','won','lost','spam'],true))fail('Invalid status.',422);db()->prepare('UPDATE contact_submissions SET status=?,notes=?,updated_at=NOW() WHERE id=? AND deleted_at IS NULL')->execute([$status,clean_string($data['notes']??'',5000)?:null,$id]);audit('update','lead',$id);$stmt=db()->prepare('SELECT * FROM contact_submissions WHERE id=?');$stmt->execute([$id]);json_response($stmt->fetch());}if($method==='DELETE'){db()->prepare('UPDATE contact_submissions SET deleted_at=NOW() WHERE id=?')->execute([$id]);audit('delete','lead',$id);json_response(['deleted'=>true]);}}

// Bookings
if ($method==='GET' && $route==='bookings') {
    [$page,$perPage,$offset]=pagination();$where=['deleted_at IS NULL'];$params=[];if(!empty($_GET['status'])&&$_GET['status']!=='all'){$where[]='status=?';$params[]=clean_string($_GET['status'],20);}if(!empty($_GET['from'])){$where[]='meeting_date>=?';$params[]=clean_string($_GET['from'],10);}if(!empty($_GET['to'])){$where[]='meeting_date<=?';$params[]=clean_string($_GET['to'],10);} $w=implode(' AND ',$where);$count=db()->prepare("SELECT COUNT(*) FROM bookings WHERE $w");$count->execute($params);$total=(int)$count->fetchColumn();$stmt=db()->prepare("SELECT * FROM bookings WHERE $w ORDER BY meeting_date DESC,start_time DESC LIMIT $perPage OFFSET $offset");$stmt->execute($params);json_response($stmt->fetchAll(),200,['page'=>$page,'per_page'=>$perPage,'total'=>$total,'pages'=>(int)ceil($total/$perPage)]);
}
if(isset($segments[0],$segments[1])&&$segments[0]==='bookings'&&ctype_digit($segments[1])){$id=(int)$segments[1];if($method==='PATCH'||$method==='PUT'){$data=request_body();$status=clean_string($data['status']??'pending',20);if(!in_array($status,['pending','confirmed','completed','cancelled','no_show'],true))fail('Invalid status.',422);db()->prepare('UPDATE bookings SET status=?,admin_notes=?,updated_at=NOW() WHERE id=? AND deleted_at IS NULL')->execute([$status,clean_string($data['admin_notes']??'',5000)?:null,$id]);audit('update','booking',$id);$stmt=db()->prepare('SELECT * FROM bookings WHERE id=?');$stmt->execute([$id]);json_response($stmt->fetch());}if($method==='DELETE'){db()->prepare('UPDATE bookings SET deleted_at=NOW() WHERE id=?')->execute([$id]);audit('delete','booking',$id);json_response(['deleted'=>true]);}}

// Availability management
if($method==='GET'&&$route==='availability-rules'){json_response(['rules'=>db()->query('SELECT * FROM availability_rules ORDER BY weekday')->fetchAll(),'blocked_dates'=>db()->query('SELECT * FROM blocked_dates ORDER BY blocked_date')->fetchAll()]);}
if($method==='PUT'&&$route==='availability-rules'){$data=request_body();$pdo=db();$pdo->beginTransaction();try{$stmt=$pdo->prepare('INSERT INTO availability_rules (weekday,start_time,end_time,slot_minutes,buffer_minutes,enabled) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE start_time=VALUES(start_time),end_time=VALUES(end_time),slot_minutes=VALUES(slot_minutes),buffer_minutes=VALUES(buffer_minutes),enabled=VALUES(enabled)');foreach($data['rules']??[] as $r){$stmt->execute([(int)$r['weekday'],clean_string($r['start_time'],8),clean_string($r['end_time'],8),max(15,(int)$r['slot_minutes']),max(0,(int)$r['buffer_minutes']),!empty($r['enabled'])?1:0]);}$pdo->commit();audit('update','availability');json_response(['saved'=>true]);}catch(Throwable $e){$pdo->rollBack();throw $e;}}
if($method==='POST'&&$route==='blocked-dates'){$data=request_body();require_fields($data,['blocked_date']);db()->prepare('INSERT INTO blocked_dates (blocked_date,reason) VALUES (?,?) ON DUPLICATE KEY UPDATE reason=VALUES(reason)')->execute([clean_string($data['blocked_date'],10),clean_string($data['reason']??'',255)?:null]);json_response(['saved'=>true],201);}
if($method==='DELETE'&&isset($segments[0],$segments[1])&&$segments[0]==='blocked-dates'&&ctype_digit($segments[1])){db()->prepare('DELETE FROM blocked_dates WHERE id=?')->execute([(int)$segments[1]]);json_response(['deleted'=>true]);}

// Media
if($method==='GET'&&$route==='media'){$stmt=db()->query('SELECT * FROM media WHERE deleted_at IS NULL ORDER BY created_at DESC');json_response($stmt->fetchAll());}
if($method==='POST'&&$route==='media'){
    if(empty($_FILES['file'])||!is_uploaded_file($_FILES['file']['tmp_name']))fail('Choose a file to upload.',422);$file=$_FILES['file'];if((int)$file['size']>(int)config('uploads.max_bytes'))fail('File is too large.',413);$finfo=new finfo(FILEINFO_MIME_TYPE);$mime=$finfo->file($file['tmp_name'])?:'application/octet-stream';if(!in_array($mime,config('uploads.allowed_mime',[]),true))fail('This file type is not allowed.',415);$ext=strtolower(pathinfo($file['name'],PATHINFO_EXTENSION));$safe=slugify(pathinfo($file['name'],PATHINFO_FILENAME));$filename=date('Y/m').'/'.($safe?:'file').'-'.bin2hex(random_bytes(5)).($ext?'.'.$ext:'');$directory=rtrim(config('uploads.directory'),'/').'/'.dirname($filename);if(!is_dir($directory)&&!mkdir($directory,0755,true)&&!is_dir($directory))fail('Could not create upload directory.',500);$dest=rtrim(config('uploads.directory'),'/').'/'.$filename;if(!move_uploaded_file($file['tmp_name'],$dest))fail('Upload failed.',500);$url=rtrim(config('uploads.public_url'),'/').'/'.$filename;$stmt=db()->prepare('INSERT INTO media (filename,original_name,mime_type,size_bytes,url,alt_text,uploaded_by) VALUES (?,?,?,?,?,?,?)');$stmt->execute([$filename,clean_string($file['name'],255),$mime,(int)$file['size'],$url,clean_string($_POST['alt_text']??'',255)?:null,$admin['id']]);$id=(int)db()->lastInsertId();audit('upload','media',$id);$stmt=db()->prepare('SELECT * FROM media WHERE id=?');$stmt->execute([$id]);json_response($stmt->fetch(),201);
}
if($method==='DELETE'&&isset($segments[0],$segments[1])&&$segments[0]==='media'&&ctype_digit($segments[1])){db()->prepare('UPDATE media SET deleted_at=NOW() WHERE id=?')->execute([(int)$segments[1]]);audit('delete','media',(int)$segments[1]);json_response(['deleted'=>true]);}

// Menus
if($method==='GET'&&$route==='menus'){$menus=db()->query('SELECT * FROM menus ORDER BY id')->fetchAll();$stmt=db()->prepare('SELECT mi.*,ci.title page_title,ci.slug page_slug FROM menu_items mi LEFT JOIN content_items ci ON ci.id=mi.page_id WHERE mi.menu_id=? ORDER BY mi.parent_id,mi.sort_order,mi.id');foreach($menus as &$menu){$stmt->execute([$menu['id']]);$menu['items']=$stmt->fetchAll();}json_response($menus);}
if($method==='PUT'&&isset($segments[0],$segments[1])&&$segments[0]==='menus'&&ctype_digit($segments[1])){$menuId=(int)$segments[1];$data=request_body();$items=array_values($data['items']??[]);$pdo=db();$pdo->beginTransaction();try{$pdo->prepare('DELETE FROM menu_items WHERE menu_id=?')->execute([$menuId]);$stmt=$pdo->prepare('INSERT INTO menu_items (menu_id,parent_id,label,page_id,external_url,is_external,target_blank,coming_soon,sort_order) VALUES (?,NULL,?,?,?,?,?,?,?)');$inserted=[];foreach($items as $index=>$item){$stmt->execute([$menuId,clean_string($item['label']??'',160),(int)($item['page_id']??0)?:null,clean_string($item['external_url']??'',500)?:null,!empty($item['is_external'])?1:0,!empty($item['target_blank'])?1:0,!empty($item['coming_soon'])?1:0,(int)($item['sort_order']??$index)]);$inserted[$index]=(int)$pdo->lastInsertId();}$parentStmt=$pdo->prepare('UPDATE menu_items SET parent_id=? WHERE id=? AND menu_id=?');foreach($items as $index=>$item){$parentIndex=isset($item['parent_index'])&&$item['parent_index']!==''?(int)$item['parent_index']:-1;if($parentIndex>=0&&$parentIndex!==$index&&isset($inserted[$parentIndex]))$parentStmt->execute([$inserted[$parentIndex],$inserted[$index],$menuId]);}$pdo->commit();audit('update','menu',$menuId);json_response(['saved'=>true]);}catch(Throwable $e){$pdo->rollBack();throw $e;}}

// Settings
if($method==='GET'&&$route==='settings'){if(($admin['role']??'editor')==='editor')fail('Administrator access required.',403);$rows=db()->query('SELECT setting_group,setting_key,value_json FROM settings ORDER BY setting_group,setting_key')->fetchAll();$out=[];foreach($rows as $row){$out[$row['setting_group']][$row['setting_key']]=json_decode($row['value_json'],true);}json_response($out);}
if($method==='PUT'&&isset($segments[0],$segments[1])&&$segments[0]==='settings'){if(($admin['role']??'editor')==='editor')fail('Administrator access required.',403);$group=clean_string($segments[1],80);$allowed=['site','email','integrations','calendar'];if(!in_array($group,$allowed,true))fail('Invalid settings group.',422);$data=request_body();foreach($data as $key=>$value)upsert_setting($group,clean_string($key,120),$value);audit('update','settings',null,['group'=>$group]);json_response(['saved'=>true]);}

// SMTP test uses the currently saved email settings.
if($method==='POST'&&$route==='settings/email/test'){
    if(($admin['role']??'editor')==='editor')fail('Administrator access required.',403);
    $to=(string)setting('email','notification_email',$admin['email']??'');
    if(!$to||!filter_var($to,FILTER_VALIDATE_EMAIL))fail('Save a valid notification email first.',422);
    $sent=send_notification('Logicsify SMTP Test','<h2>Logicsify SMTP is working</h2><p>This test was sent from the Logicsify React administration panel.</p>');
    if(!$sent)fail('The test email could not be sent. Review SMTP settings and server mail logs.',500);
    audit('test','email');
    json_response(['sent'=>true,'message'=>'Test email sent to '.$to.'.']);
}

// Audit logs
if($method==='GET'&&$route==='audit-logs'){
    if(($admin['role']??'editor')==='editor')fail('Administrator access required.',403);
    [$page,$perPage,$offset]=pagination();
    $where=[];$params=[];
    if(!empty($_GET['search'])){
        $q='%'.clean_string($_GET['search'],120).'%';
        $where[]='(al.action LIKE ? OR al.entity_type LIKE ? OR a.name LIKE ? OR a.email LIKE ?)';
        array_push($params,$q,$q,$q,$q);
    }
    $whereSql=$where?'WHERE '.implode(' AND ',$where):'';
    $count=db()->prepare("SELECT COUNT(*) FROM audit_logs al LEFT JOIN administrators a ON a.id=al.administrator_id $whereSql");
    $count->execute($params);$total=(int)$count->fetchColumn();
    $stmt=db()->prepare("SELECT al.*,a.name administrator_name,a.email administrator_email FROM audit_logs al LEFT JOIN administrators a ON a.id=al.administrator_id $whereSql ORDER BY al.created_at DESC LIMIT $perPage OFFSET $offset");
    $stmt->execute($params);$rows=$stmt->fetchAll();
    foreach($rows as &$row){$row['details_json']=$row['details_json']?json_decode((string)$row['details_json'],true):null;}
    json_response($rows,200,['page'=>$page,'per_page'=>$perPage,'total'=>$total,'pages'=>(int)ceil($total/$perPage)]);
}

// Administrators
if($method==='GET'&&$route==='administrators'){require_super_admin();json_response(db()->query('SELECT id,name,email,role,status,last_login_at,created_at,updated_at FROM administrators WHERE deleted_at IS NULL ORDER BY created_at DESC')->fetchAll());}
if($method==='POST'&&$route==='administrators'){$super=require_super_admin();$data=request_body();require_fields($data,['name','email','password']);$email=filter_var($data['email'],FILTER_VALIDATE_EMAIL);if(!$email)fail('Enter a valid email.',422);$role=clean_string($data['role']??'editor',20);if(!in_array($role,['super_admin','admin','editor'],true))$role='editor';try{db()->prepare('INSERT INTO administrators (name,email,password_hash,role,status) VALUES (?,?,?,?,?)')->execute([clean_string($data['name'],120),mb_strtolower((string)$email),password_hash((string)$data['password'],PASSWORD_DEFAULT),$role,'active']);}catch(PDOException $e){if((int)($e->errorInfo[1]??0)===1062)fail('An administrator with that email already exists.',409);throw $e;} $id=(int)db()->lastInsertId();audit('create','administrator',$id);json_response(['id'=>$id],201);}
if(isset($segments[0],$segments[1])&&$segments[0]==='administrators'&&ctype_digit($segments[1])){$super=require_super_admin();$id=(int)$segments[1];if($method==='PUT'||$method==='PATCH'){$data=request_body();$fields=[];$params=[];foreach(['name','email','role','status'] as $field){if(array_key_exists($field,$data)){$fields[]="$field=?";$params[]=clean_string($data[$field],$field==='email'?190:120);}}if(!empty($data['password'])){$fields[]='password_hash=?';$params[]=password_hash((string)$data['password'],PASSWORD_DEFAULT);}if(!$fields)fail('No changes supplied.',422);$params[]=$id;db()->prepare('UPDATE administrators SET '.implode(',',$fields).' WHERE id=? AND deleted_at IS NULL')->execute($params);audit('update','administrator',$id);json_response(['saved'=>true]);}if($method==='DELETE'){if($id===(int)$super['id'])fail('You cannot delete your own account.',409);db()->prepare('UPDATE administrators SET deleted_at=NOW(),status=\'inactive\' WHERE id=?')->execute([$id]);audit('delete','administrator',$id);json_response(['deleted'=>true]);}}

// Trash
if($method==='GET'&&$route==='trash'){$items=[];foreach([['content_items','content'],['contact_submissions','lead'],['bookings','booking'],['media','media']] as [$table,$type]){$rows=db()->query("SELECT * FROM $table WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC LIMIT 100")->fetchAll();foreach($rows as $row){$items[]=['entity_type'=>$type,'id'=>(int)$row['id'],'title'=>$row['title']??$row['name']??$row['original_name']??('Item #'.$row['id']),'subtitle'=>$row['email']??$row['slug']??$row['meeting_date']??'','deleted_at'=>$row['deleted_at']];}}usort($items,fn($a,$b)=>strcmp((string)$b['deleted_at'],(string)$a['deleted_at']));json_response($items);}
if($method==='POST'&&$route==='trash/restore'){$data=request_body();$type=clean_string($data['entity_type']??'',30);$id=(int)($data['id']??0);$map=['content'=>'content_items','lead'=>'contact_submissions','booking'=>'bookings','media'=>'media'];if(!$id||!isset($map[$type]))fail('Invalid item.',422);db()->prepare('UPDATE '.$map[$type].' SET deleted_at=NULL WHERE id=?')->execute([$id]);audit('restore',$type,$id);json_response(['restored'=>true]);}
if($method==='DELETE'&&$route==='trash/permanent'){$super=require_super_admin();$data=request_body();$type=clean_string($data['entity_type']??'',30);$id=(int)($data['id']??0);$map=['content'=>'content_items','lead'=>'contact_submissions','booking'=>'bookings','media'=>'media'];if(!$id||!isset($map[$type]))fail('Invalid item.',422);if($type==='media'){$stmt=db()->prepare('SELECT filename FROM media WHERE id=?');$stmt->execute([$id]);$name=$stmt->fetchColumn();if($name){$path=rtrim(config('uploads.directory'),'/').'/'.$name;if(is_file($path))@unlink($path);}}db()->prepare('DELETE FROM '.$map[$type].' WHERE id=?')->execute([$id]);audit('permanent_delete',$type,$id);json_response(['deleted'=>true]);}

fail('Endpoint not found.',404);
