import { useEffect } from "react";
import { getPublicIntegrations } from "@/lib/logicsify-api";

const injected = new Set<string>();

function addScript(key: string, src?: string, code?: string) {
  if (injected.has(key)) return;
  const script = document.createElement("script");
  script.dataset.logicsifyIntegration = key;
  if (src) {
    script.src = src;
    script.async = true;
  }
  if (code) script.text = code;
  document.head.appendChild(script);
  injected.add(key);
}

function addMeta(key: string, name: string, content?: string) {
  if (!content || injected.has(key)) return;
  const meta = document.createElement("meta");
  meta.name = name;
  meta.content = content;
  meta.dataset.logicsifyIntegration = key;
  document.head.appendChild(meta);
  injected.add(key);
}

function addCustomHtml(key: string, html: string | undefined, target: HTMLElement) {
  if (!html?.trim() || injected.has(key)) return;
  const template = document.createElement("template");
  template.innerHTML = html;
  Array.from(template.content.childNodes).forEach((node) => {
    if (node instanceof HTMLScriptElement) {
      const script = document.createElement("script");
      Array.from(node.attributes).forEach((attribute) =>
        script.setAttribute(attribute.name, attribute.value),
      );
      script.text = node.text;
      target.appendChild(script);
    } else {
      target.appendChild(node.cloneNode(true));
    }
  });
  injected.add(key);
}

export function RuntimeIntegrations() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;
    getPublicIntegrations().then((settings) => {
      if (settings.tracking_enabled === false) return;

      const gtm = settings.gtm_id?.trim();
      if (gtm) {
        addScript("gtm", `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtm)}`);
      }

      const ga4 = settings.ga4_id?.trim();
      if (ga4) {
        addScript(
          "ga4-lib",
          `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`,
        );
        addScript(
          "ga4-config",
          undefined,
          `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${ga4.replace(/'/g, "")}',{anonymize_ip:true});`,
        );
      }

      const meta = settings.meta_pixel_id?.trim();
      if (meta)
        addScript(
          "meta-pixel",
          undefined,
          `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${meta.replace(/'/g, "")}');fbq('track','PageView');`,
        );

      const clarity = settings.clarity_id?.trim();
      if (clarity)
        addScript(
          "clarity",
          undefined,
          `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,'clarity','script','${clarity.replace(/'/g, "")}');`,
        );

      const hotjar = settings.hotjar_id?.trim();
      if (hotjar)
        addScript(
          "hotjar",
          undefined,
          `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${Number(hotjar) || 0},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r)})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
        );

      const hubspot = settings.hubspot_portal_id?.trim();
      if (hubspot)
        addScript("hubspot", `https://js.hs-scripts.com/${encodeURIComponent(hubspot)}.js`);

      const crisp = settings.crisp_website_id?.trim();
      if (crisp)
        addScript(
          "crisp",
          undefined,
          `window.$crisp=[];window.CRISP_WEBSITE_ID='${crisp.replace(/'/g, "")}';(function(){var d=document;var s=d.createElement('script');s.src='https://client.crisp.chat/l.js';s.async=1;d.getElementsByTagName('head')[0].appendChild(s)})();`,
        );

      const intercom = settings.intercom_app_id?.trim();
      if (intercom)
        addScript(
          "intercom",
          undefined,
          `window.intercomSettings={api_base:'https://api-iam.intercom.io',app_id:'${intercom.replace(/'/g, "")}'};(function(){var w=window;var ic=w.Intercom;if(typeof ic==='function'){ic('reattach_activator');ic('update',w.intercomSettings)}else{var d=document;var i=function(){i.c(arguments)};i.q=[];i.c=function(args){i.q.push(args)};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${intercom.replace(/'/g, "")}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x)};if(document.readyState==='complete'){l()}else if(w.attachEvent){w.attachEvent('onload',l)}else{w.addEventListener('load',l,false)}}})();`,
        );

      addMeta("google-verification", "google-site-verification", settings.google_site_verification);
      addMeta("bing-verification", "msvalidate.01", settings.bing_site_verification);
      addCustomHtml("custom-head", settings.head_code, document.head);
      addCustomHtml("custom-body", settings.body_code, document.body);
    });
  }, []);

  return null;
}
