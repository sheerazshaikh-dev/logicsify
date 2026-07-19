<?php
declare(strict_types=1);
require __DIR__ . '/private/bootstrap.php';

$provided = (string)($_GET['key'] ?? $_POST['key'] ?? '');
$expected = (string)config('app.setup_key');
$lockFile = __DIR__ . '/private/setup.lock';

if (is_file($lockFile)) {
    http_response_code(410);
    echo '<h1>Logicsify CMS is already installed.</h1><p>Delete <code>private/setup.lock</code> only when you intentionally need to run setup again.</p>';
    exit;
}

if (!hash_equals($expected, $provided)) {
    http_response_code(403);
    echo '<!doctype html><html><head><meta charset="utf-8"><title>Logicsify API Setup</title><style>body{font-family:Inter,Arial;background:#190A2F;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0}.card{width:min(520px,90vw);padding:36px;border:1px solid #ffffff22;border-radius:24px;background:#ffffff0d}input,button{width:100%;box-sizing:border-box;padding:14px;border-radius:12px;margin-top:12px}button{border:0;color:#fff;font-weight:700;background:linear-gradient(135deg,#FE3434,#FDBE02)}</style></head><body><form class="card" method="post"><h1>Logicsify API Setup</h1><p>Enter the setup key from DEPLOYMENT.md.</p><input name="key" type="password" required><button>Install API & CMS Database</button></form></body></html>';
    exit;
}

try {
    $pdo = db();
    $schema = file_get_contents(__DIR__ . '/private/schema.sql');
    if ($schema === false) throw new RuntimeException('Could not read schema.sql');
    $statements = array_filter(array_map('trim', preg_split('/;\s*(?:\r?\n|$)/', $schema) ?: []));
    foreach ($statements as $statement) {
        if ($statement !== '') $pdo->exec($statement);
    }

    $pdo->beginTransaction();

    $adminHash = '$2y$12$mNZhOGS95Dw9R1GFm1OE0OP406TezT.smSwNlDIhM2F2lABZrB.32';
    $stmt = $pdo->prepare("INSERT INTO administrators (name,email,password_hash,role,status) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name), role='super_admin', status='active'");
    $stmt->execute(['Logicsify Admin', 'admin@logicsify.com', $adminHash, 'super_admin', 'active']);

    $availability = [
        [1, '09:00:00', '17:00:00', 30, 0, 1],
        [2, '09:00:00', '17:00:00', 30, 0, 1],
        [3, '09:00:00', '17:00:00', 30, 0, 1],
        [4, '09:00:00', '17:00:00', 30, 0, 1],
        [5, '09:00:00', '15:00:00', 30, 0, 1],
        [6, '09:00:00', '13:00:00', 30, 0, 0],
        [0, '09:00:00', '13:00:00', 30, 0, 0],
    ];
    $stmt = $pdo->prepare('INSERT INTO availability_rules (weekday,start_time,end_time,slot_minutes,buffer_minutes,enabled) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE start_time=VALUES(start_time),end_time=VALUES(end_time),slot_minutes=VALUES(slot_minutes),buffer_minutes=VALUES(buffer_minutes),enabled=VALUES(enabled)');
    foreach ($availability as $row) $stmt->execute($row);

    $menus = [['Main Navigation','header'],['Footer Navigation','footer']];
    $stmt = $pdo->prepare('INSERT INTO menus (name,location) VALUES (?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)');
    foreach ($menus as $row) $stmt->execute($row);

    $settings = [
        ['site','site_name','Logicsify'],
        ['site','site_url','https://logicsify.com'],
        ['site','tagline','Technology, marketing, and automation—logically built for growth.'],
        ['site','contact_email','hello@logicsify.com'],
        ['site','phone',''],
        ['site','timezone','Asia/Karachi'],
        ['site','logo_dark',''],
        ['site','logo_light',''],
        ['site','linkedin_url',''],
        ['site','instagram_url',''],
        ['site','facebook_url',''],
        ['site','x_url',''],
        ['site','default_seo_title','Logicsify | Technology, Marketing & AI Automation'],
        ['site','default_seo_description','Technology, marketing, and automation—logically built for growth.'],
        ['site','default_og_image',''],
        ['email','notification_email','hello@logicsify.com'],
        ['email','from_name','Logicsify'],
        ['email','from_email','hello@logicsify.com'],
        ['email','smtp_enabled',false],
        ['email','smtp_host',''],
        ['email','smtp_port',587],
        ['email','smtp_username',''],
        ['email','smtp_password',''],
        ['email','smtp_encryption','tls'],
        ['email','notify_contact',true],
        ['email','notify_booking',true],
        ['integrations','tracking_enabled',true],
        ['integrations','gtm_id',''],
        ['integrations','ga4_id',''],
        ['integrations','meta_pixel_id',''],
        ['integrations','linkedin_partner_id',''],
        ['integrations','tiktok_pixel_id',''],
        ['integrations','clarity_id',''],
        ['integrations','hotjar_id',''],
        ['integrations','hubspot_portal_id',''],
        ['integrations','crisp_website_id',''],
        ['integrations','intercom_app_id',''],
        ['integrations','google_site_verification',''],
        ['integrations','bing_site_verification',''],
        ['integrations','head_code',''],
        ['integrations','body_code',''],
        ['calendar','meeting_title','30-Minute Strategy Call'],
        ['calendar','timezone','Asia/Karachi'],
        ['calendar','meeting_url',''],
        ['calendar','meeting_duration',30],
        ['calendar','booking_notice_hours',4],
        ['calendar','booking_window_days',60],
        ['calendar','confirmation_message','Your strategy call request has been received. We will confirm it shortly.'],
    ];
    $stmt = $pdo->prepare('INSERT INTO settings (setting_group,setting_key,value_json) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value_json=VALUES(value_json)');
    foreach ($settings as [$group,$key,$value]) {
        $stmt->execute([$group,$key,json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)]);
    }

    $content = [
        ['page','Home','home','published','Technology, marketing, and automation—logically built for growth.'],
        ['page','About','about','published','Meet the senior multidisciplinary team behind Logicsify.'],
        ['page','Services','services','published','Connected digital services for every stage of growth.'],
        ['page','Industries','industries','published','Deep experience in the sectors we serve.'],
        ['page','Work','work','published','Selected technology, AI, and growth work.'],
        ['page','Process','process','published','A clear, collaborative delivery process.'],
        ['page','Technology','technology','published','The tools and platforms we use to build dependable systems.'],
        ['page','Insights','insights','published','Thinking on technology, AI, and growth.'],
        ['page','Careers','careers','published','Build things that actually ship.'],
        ['page','Contact','contact','published','Tell us about your project.'],
        ['page','Book a Strategy Call','book-a-call','published','Book a 30-minute strategy call with Logicsify.'],
        ['page','Privacy Policy','privacy','published','Logicsify privacy policy.'],
        ['page','Terms & Conditions','terms','published','Logicsify terms and conditions.'],
        ['service','Web Design & Development','web-design-development','published','Fast, editorial marketing sites.'],
        ['service','Custom Web Applications','web-applications','published','Business tools built to scale.'],
        ['service','SaaS Product Development','saas-development','published','End-to-end platform engineering.'],
        ['service','Mobile App Development','mobile-apps','published','iOS, Android, and React Native applications.'],
        ['service','E-commerce Development','ecommerce','published','Shopify, headless, and custom commerce stacks.'],
        ['service','UI/UX & Product Design','ui-ux','published','Research-led interface systems.'],
        ['service','AI Automations','ai-automations','published','Practical automation with measurable ROI.'],
        ['service','AI Agents & Chatbots','ai-agents','published','Voice, chat, and knowledge agents.'],
        ['service','CRM & Workflow Automation','crm-automation','published','HubSpot, GoHighLevel, and custom workflows.'],
        ['service','API & Systems Integration','api-integrations','published','Connect the stack you already run.'],
        ['service','Search Engine Optimization','seo','published','Technical and editorial SEO.'],
        ['service','Paid Advertising','paid-advertising','published','Google, Meta, and LinkedIn advertising.'],
        ['service','Social Media Marketing','social-media','published','Content that compounds.'],
        ['service','Content Marketing','content-marketing','published','Editorial engines that rank.'],
        ['service','Branding & Creative Design','branding','published','Identity systems for technology brands.'],
        ['service','Conversion Rate Optimization','cro','published','Experimentation with rigor.'],
        ['service','Website Maintenance','maintenance','published','Uptime, security, and performance.'],
        ['industry','Startups & SaaS','startups-saas','published','MVPs, platform engineering, and marketing engines for venture-backed teams.'],
        ['industry','Professional Services','professional-services','published','Client portals, intake automation, and thought-leadership sites.'],
        ['industry','Home Services','home-services','published','Local SEO, lead qualification, and dispatch integrations.'],
        ['industry','Healthcare','healthcare','published','HIPAA-aware portals, appointment AI, and patient acquisition.'],
        ['industry','E-commerce','ecommerce','published','Shopify Plus, headless storefronts, and lifecycle automation.'],
        ['industry','Real Estate','real-estate','published','IDX, agent portals, and inbound lead automation.'],
        ['industry','Financial Services','financial-services','published','Compliance-minded builds, dashboards, and CRM integrations.'],
        ['case_study','SaaS Intelligence Platform','saas-intelligence-platform','published','A scalable product foundation and unified data model.'],
        ['case_study','Healthcare Operations Portal','healthcare-operations-portal','published','A live operations portal replacing spreadsheet-based scheduling.'],
        ['case_study','E-commerce Growth System','ecommerce-growth-system','published','A unified storefront and growth loop.'],
        ['case_study','AI-Powered Lead Qualification','ai-powered-lead-qualification','published','24/7 qualification and CRM routing.'],
        ['case_study','Multi-Location Marketing Platform','multi-location-marketing-platform','published','A scalable local marketing and reporting system.'],
        ['insight','Where AI automation creates the fastest business value','where-ai-automation-creates-value','published','The highest-ROI automations are the boring ones: qualification, routing, follow-up, reporting.'],
        ['insight','Choosing between a website, web app, and SaaS product','website-vs-web-app-vs-saas','published','Three very different investments. How to know which one you actually need.'],
        ['insight','How to connect marketing data with business operations','connect-marketing-data-with-operations','published','When your CRM, ads, and reporting speak the same language, growth compounds.'],
        ['career','Senior Full-Stack Engineer','senior-full-stack-engineer','published','Remote · Full-time'],
        ['career','Product Designer','product-designer','published','Remote · Full-time'],
        ['career','AI Automation Engineer','ai-automation-engineer','published','Remote · Full-time'],
        ['career','Growth Marketing Lead','growth-marketing-lead','published','Remote · Full-time'],
    ];
    $stmt = $pdo->prepare('INSERT INTO content_items (content_type,title,slug,status,excerpt,content_json,seo_json,published_at) VALUES (?,?,?,?,?,?,?,NOW()) ON DUPLICATE KEY UPDATE title=VALUES(title),excerpt=VALUES(excerpt)');
    foreach ($content as [$type,$title,$slug,$status,$excerpt]) {
        $body = ['body' => '', 'sections' => [], 'category' => '', 'tags' => []];
        $seo = ['title' => $title . ' | Logicsify', 'description' => $excerpt, 'canonical' => ''];
        $stmt->execute([$type,$title,$slug,$status,$excerpt,json_encode($body),json_encode($seo)]);
    }

    $menuSeed = [
        'header' => [['Services','services'],['Industries','industries'],['Work','work'],['About','about'],['Insights','insights']],
        'footer' => [['About','about'],['Process','process'],['Work','work'],['Careers','careers'],['Insights','insights'],['Contact','contact']],
    ];
    foreach ($menuSeed as $location => $links) {
        $menuStmt = $pdo->prepare('SELECT id FROM menus WHERE location=? LIMIT 1');
        $menuStmt->execute([$location]);
        $menuId = (int)$menuStmt->fetchColumn();
        $countStmt = $pdo->prepare('SELECT COUNT(*) FROM menu_items WHERE menu_id=?');
        $countStmt->execute([$menuId]);
        if ((int)$countStmt->fetchColumn() === 0) {
            $itemStmt = $pdo->prepare('INSERT INTO menu_items (menu_id,label,page_id,is_external,target_blank,coming_soon,sort_order) VALUES (?,?,?,0,0,0,?)');
            foreach ($links as $order => [$label,$slug]) {
                $pageStmt = $pdo->prepare("SELECT id FROM content_items WHERE content_type='page' AND slug=? AND deleted_at IS NULL LIMIT 1");
                $pageStmt->execute([$slug]);
                $pageId = (int)$pageStmt->fetchColumn();
                $itemStmt->execute([$menuId,$label,$pageId,$order]);
            }
        }
    }

    $pdo->commit();
    file_put_contents($lockFile, 'Installed at ' . date(DATE_ATOM));

    echo '<!doctype html><html><head><meta charset="utf-8"><title>Installed</title><style>body{font-family:Inter,Arial;background:#190A2F;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0}.card{width:min(640px,90vw);padding:36px;border:1px solid #ffffff22;border-radius:24px;background:#ffffff0d}a{color:#FDBE02}code{background:#ffffff14;padding:3px 7px;border-radius:6px}</style></head><body><div class="card"><h1>Logicsify API and CMS database installed successfully.</h1><p>Admin URL: <a href="https://logicsify.com/admin/login">https://logicsify.com/admin/login</a></p><p>Email: <code>admin@logicsify.com</code></p><p>Temporary password: <code>@IjtYt39D8opoW28UQ</code></p><p>Change the password from Settings → Administrators after your first login.</p></div></body></html>';
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo '<h1>Installation failed</h1><pre>' . htmlspecialchars($e->getMessage(), ENT_QUOTES, 'UTF-8') . '</pre>';
}
