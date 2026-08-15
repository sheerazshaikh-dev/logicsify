/* eslint-disable */

// @ts-nocheck

// Generated from src/routes. Do not edit manually.

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as SlugRouteImport } from './routes/$slug'
import { Route as AboutRouteImport } from './routes/about'
import { Route as AdminIndexRouteImport } from './routes/admin/index'
import { Route as AdminAccountRouteImport } from './routes/admin/account'
import { Route as AdminAdministratorsRouteImport } from './routes/admin/administrators'
import { Route as AdminAuditLogsRouteImport } from './routes/admin/audit-logs'
import { Route as AdminBookingsRouteImport } from './routes/admin/bookings'
import { Route as AdminCareersRouteImport } from './routes/admin/careers'
import { Route as AdminCaseStudiesRouteImport } from './routes/admin/case-studies'
import { Route as AdminComparisonsRouteImport } from './routes/admin/comparisons'
import { Route as AdminConnectProfilesRouteImport } from './routes/admin/connect-profiles'
import { Route as AdminDashboardRouteImport } from './routes/admin/dashboard'
import { Route as AdminEngagementModelsRouteImport } from './routes/admin/engagement-models'
import { Route as AdminGlobalStylingRouteImport } from './routes/admin/global-styling'
import { Route as AdminGuidesRouteImport } from './routes/admin/guides'
import { Route as AdminIndustriesRouteImport } from './routes/admin/industries'
import { Route as AdminInsightsRouteImport } from './routes/admin/insights'
import { Route as AdminIntegrationsRouteImport } from './routes/admin/integrations'
import { Route as AdminLeadsRouteImport } from './routes/admin/leads'
import { Route as AdminLoginRouteImport } from './routes/admin/login'
import { Route as AdminMediaRouteImport } from './routes/admin/media'
import { Route as AdminMenusRouteImport } from './routes/admin/menus'
import { Route as AdminPagesRouteImport } from './routes/admin/pages'
import { Route as AdminPortfolioRouteImport } from './routes/admin/portfolio'
import { Route as AdminResourcesRouteImport } from './routes/admin/resources'
import { Route as AdminSecurityRouteImport } from './routes/admin/security'
import { Route as AdminServicesRouteImport } from './routes/admin/services'
import { Route as AdminSettingsRouteImport } from './routes/admin/settings'
import { Route as AdminSiteHealthRouteImport } from './routes/admin/site-health'
import { Route as AdminTeamRouteImport } from './routes/admin/team'
import { Route as AdminTeamConnectRouteImport } from './routes/admin/team-connect'
import { Route as AdminTestimonialsRouteImport } from './routes/admin/testimonials'
import { Route as AdminTrashRouteImport } from './routes/admin/trash'
import { Route as AutomationLabRouteImport } from './routes/automation-lab'
import { Route as BookACallRouteImport } from './routes/book-a-call'
import { Route as CareersRouteImport } from './routes/careers'
import { Route as CompanyProfileRouteImport } from './routes/company-profile'
import { Route as ComparisonsIndexRouteImport } from './routes/comparisons/index'
import { Route as ComparisonsSlugRouteImport } from './routes/comparisons/$slug'
import { Route as ConnectSlugRouteImport } from './routes/connect/$slug'
import { Route as ContactRouteImport } from './routes/contact'
import { Route as ControlAdminSlugSplatRouteImport } from './routes/control/$adminSlug/$'
import { Route as EngagementModelsRouteImport } from './routes/engagement-models'
import { Route as GuidesIndexRouteImport } from './routes/guides/index'
import { Route as GuidesSlugRouteImport } from './routes/guides/$slug'
import { Route as IndustriesIndexRouteImport } from './routes/industries/index'
import { Route as IndustriesSlugRouteImport } from './routes/industries/$slug'
import { Route as InsightsIndexRouteImport } from './routes/insights/index'
import { Route as InsightsSlugRouteImport } from './routes/insights/$slug'
import { Route as IntegrationsRouteImport } from './routes/integrations'
import { Route as PortfolioIndexRouteImport } from './routes/portfolio/index'
import { Route as PortfolioSlugRouteImport } from './routes/portfolio/$slug'
import { Route as PrivacyRouteImport } from './routes/privacy'
import { Route as ProcessRouteImport } from './routes/process'
import { Route as ProjectEstimatorRouteImport } from './routes/project-estimator'
import { Route as ResourcesIndexRouteImport } from './routes/resources/index'
import { Route as ResourcesSlugRouteImport } from './routes/resources/$slug'
import { Route as ServicesIndexRouteImport } from './routes/services/index'
import { Route as ServicesSlugRouteImport } from './routes/services/$slug'
import { Route as TeamRouteImport } from './routes/team'
import { Route as TechnicalRoadmapRouteImport } from './routes/technical-roadmap'
import { Route as TechnologyRouteImport } from './routes/technology'
import { Route as TermsRouteImport } from './routes/terms'
import { Route as TestimonialsRouteImport } from './routes/testimonials'
import { Route as WorkIndexRouteImport } from './routes/work/index'
import { Route as WorkSlugRouteImport } from './routes/work/$slug'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)

const SlugRoute = SlugRouteImport.update({
  id: '/$slug',
  path: '/$slug',
  getParentRoute: () => rootRouteImport,
} as any)

const AboutRoute = AboutRouteImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminIndexRoute = AdminIndexRouteImport.update({
  id: '/admin/',
  path: '/admin/',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminAccountRoute = AdminAccountRouteImport.update({
  id: '/admin/account',
  path: '/admin/account',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminAdministratorsRoute = AdminAdministratorsRouteImport.update({
  id: '/admin/administrators',
  path: '/admin/administrators',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminAuditLogsRoute = AdminAuditLogsRouteImport.update({
  id: '/admin/audit-logs',
  path: '/admin/audit-logs',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminBookingsRoute = AdminBookingsRouteImport.update({
  id: '/admin/bookings',
  path: '/admin/bookings',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminCareersRoute = AdminCareersRouteImport.update({
  id: '/admin/careers',
  path: '/admin/careers',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminCaseStudiesRoute = AdminCaseStudiesRouteImport.update({
  id: '/admin/case-studies',
  path: '/admin/case-studies',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminComparisonsRoute = AdminComparisonsRouteImport.update({
  id: '/admin/comparisons',
  path: '/admin/comparisons',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminConnectProfilesRoute = AdminConnectProfilesRouteImport.update({
  id: '/admin/connect-profiles',
  path: '/admin/connect-profiles',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminDashboardRoute = AdminDashboardRouteImport.update({
  id: '/admin/dashboard',
  path: '/admin/dashboard',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminEngagementModelsRoute = AdminEngagementModelsRouteImport.update({
  id: '/admin/engagement-models',
  path: '/admin/engagement-models',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminGlobalStylingRoute = AdminGlobalStylingRouteImport.update({
  id: '/admin/global-styling',
  path: '/admin/global-styling',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminGuidesRoute = AdminGuidesRouteImport.update({
  id: '/admin/guides',
  path: '/admin/guides',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminIndustriesRoute = AdminIndustriesRouteImport.update({
  id: '/admin/industries',
  path: '/admin/industries',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminInsightsRoute = AdminInsightsRouteImport.update({
  id: '/admin/insights',
  path: '/admin/insights',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminIntegrationsRoute = AdminIntegrationsRouteImport.update({
  id: '/admin/integrations',
  path: '/admin/integrations',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminLeadsRoute = AdminLeadsRouteImport.update({
  id: '/admin/leads',
  path: '/admin/leads',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminLoginRoute = AdminLoginRouteImport.update({
  id: '/admin/login',
  path: '/admin/login',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminMediaRoute = AdminMediaRouteImport.update({
  id: '/admin/media',
  path: '/admin/media',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminMenusRoute = AdminMenusRouteImport.update({
  id: '/admin/menus',
  path: '/admin/menus',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminPagesRoute = AdminPagesRouteImport.update({
  id: '/admin/pages',
  path: '/admin/pages',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminPortfolioRoute = AdminPortfolioRouteImport.update({
  id: '/admin/portfolio',
  path: '/admin/portfolio',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminResourcesRoute = AdminResourcesRouteImport.update({
  id: '/admin/resources',
  path: '/admin/resources',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminSecurityRoute = AdminSecurityRouteImport.update({
  id: '/admin/security',
  path: '/admin/security',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminServicesRoute = AdminServicesRouteImport.update({
  id: '/admin/services',
  path: '/admin/services',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminSettingsRoute = AdminSettingsRouteImport.update({
  id: '/admin/settings',
  path: '/admin/settings',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminSiteHealthRoute = AdminSiteHealthRouteImport.update({
  id: '/admin/site-health',
  path: '/admin/site-health',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminTeamRoute = AdminTeamRouteImport.update({
  id: '/admin/team',
  path: '/admin/team',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminTeamConnectRoute = AdminTeamConnectRouteImport.update({
  id: '/admin/team-connect',
  path: '/admin/team-connect',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminTestimonialsRoute = AdminTestimonialsRouteImport.update({
  id: '/admin/testimonials',
  path: '/admin/testimonials',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminTrashRoute = AdminTrashRouteImport.update({
  id: '/admin/trash',
  path: '/admin/trash',
  getParentRoute: () => rootRouteImport,
} as any)

const AutomationLabRoute = AutomationLabRouteImport.update({
  id: '/automation-lab',
  path: '/automation-lab',
  getParentRoute: () => rootRouteImport,
} as any)

const BookACallRoute = BookACallRouteImport.update({
  id: '/book-a-call',
  path: '/book-a-call',
  getParentRoute: () => rootRouteImport,
} as any)

const CareersRoute = CareersRouteImport.update({
  id: '/careers',
  path: '/careers',
  getParentRoute: () => rootRouteImport,
} as any)

const CompanyProfileRoute = CompanyProfileRouteImport.update({
  id: '/company-profile',
  path: '/company-profile',
  getParentRoute: () => rootRouteImport,
} as any)

const ComparisonsIndexRoute = ComparisonsIndexRouteImport.update({
  id: '/comparisons/',
  path: '/comparisons/',
  getParentRoute: () => rootRouteImport,
} as any)

const ComparisonsSlugRoute = ComparisonsSlugRouteImport.update({
  id: '/comparisons/$slug',
  path: '/comparisons/$slug',
  getParentRoute: () => rootRouteImport,
} as any)

const ConnectSlugRoute = ConnectSlugRouteImport.update({
  id: '/connect/$slug',
  path: '/connect/$slug',
  getParentRoute: () => rootRouteImport,
} as any)

const ContactRoute = ContactRouteImport.update({
  id: '/contact',
  path: '/contact',
  getParentRoute: () => rootRouteImport,
} as any)

const ControlAdminSlugSplatRoute = ControlAdminSlugSplatRouteImport.update({
  id: '/control/$adminSlug/$',
  path: '/control/$adminSlug/$',
  getParentRoute: () => rootRouteImport,
} as any)

const EngagementModelsRoute = EngagementModelsRouteImport.update({
  id: '/engagement-models',
  path: '/engagement-models',
  getParentRoute: () => rootRouteImport,
} as any)

const GuidesIndexRoute = GuidesIndexRouteImport.update({
  id: '/guides/',
  path: '/guides/',
  getParentRoute: () => rootRouteImport,
} as any)

const GuidesSlugRoute = GuidesSlugRouteImport.update({
  id: '/guides/$slug',
  path: '/guides/$slug',
  getParentRoute: () => rootRouteImport,
} as any)

const IndustriesIndexRoute = IndustriesIndexRouteImport.update({
  id: '/industries/',
  path: '/industries/',
  getParentRoute: () => rootRouteImport,
} as any)

const IndustriesSlugRoute = IndustriesSlugRouteImport.update({
  id: '/industries/$slug',
  path: '/industries/$slug',
  getParentRoute: () => rootRouteImport,
} as any)

const InsightsIndexRoute = InsightsIndexRouteImport.update({
  id: '/insights/',
  path: '/insights/',
  getParentRoute: () => rootRouteImport,
} as any)

const InsightsSlugRoute = InsightsSlugRouteImport.update({
  id: '/insights/$slug',
  path: '/insights/$slug',
  getParentRoute: () => rootRouteImport,
} as any)

const IntegrationsRoute = IntegrationsRouteImport.update({
  id: '/integrations',
  path: '/integrations',
  getParentRoute: () => rootRouteImport,
} as any)

const PortfolioIndexRoute = PortfolioIndexRouteImport.update({
  id: '/portfolio/',
  path: '/portfolio/',
  getParentRoute: () => rootRouteImport,
} as any)

const PortfolioSlugRoute = PortfolioSlugRouteImport.update({
  id: '/portfolio/$slug',
  path: '/portfolio/$slug',
  getParentRoute: () => rootRouteImport,
} as any)

const PrivacyRoute = PrivacyRouteImport.update({
  id: '/privacy',
  path: '/privacy',
  getParentRoute: () => rootRouteImport,
} as any)

const ProcessRoute = ProcessRouteImport.update({
  id: '/process',
  path: '/process',
  getParentRoute: () => rootRouteImport,
} as any)

const ProjectEstimatorRoute = ProjectEstimatorRouteImport.update({
  id: '/project-estimator',
  path: '/project-estimator',
  getParentRoute: () => rootRouteImport,
} as any)

const ResourcesIndexRoute = ResourcesIndexRouteImport.update({
  id: '/resources/',
  path: '/resources/',
  getParentRoute: () => rootRouteImport,
} as any)

const ResourcesSlugRoute = ResourcesSlugRouteImport.update({
  id: '/resources/$slug',
  path: '/resources/$slug',
  getParentRoute: () => rootRouteImport,
} as any)

const ServicesIndexRoute = ServicesIndexRouteImport.update({
  id: '/services/',
  path: '/services/',
  getParentRoute: () => rootRouteImport,
} as any)

const ServicesSlugRoute = ServicesSlugRouteImport.update({
  id: '/services/$slug',
  path: '/services/$slug',
  getParentRoute: () => rootRouteImport,
} as any)

const TeamRoute = TeamRouteImport.update({
  id: '/team',
  path: '/team',
  getParentRoute: () => rootRouteImport,
} as any)

const TechnicalRoadmapRoute = TechnicalRoadmapRouteImport.update({
  id: '/technical-roadmap',
  path: '/technical-roadmap',
  getParentRoute: () => rootRouteImport,
} as any)

const TechnologyRoute = TechnologyRouteImport.update({
  id: '/technology',
  path: '/technology',
  getParentRoute: () => rootRouteImport,
} as any)

const TermsRoute = TermsRouteImport.update({
  id: '/terms',
  path: '/terms',
  getParentRoute: () => rootRouteImport,
} as any)

const TestimonialsRoute = TestimonialsRouteImport.update({
  id: '/testimonials',
  path: '/testimonials',
  getParentRoute: () => rootRouteImport,
} as any)

const WorkIndexRoute = WorkIndexRouteImport.update({
  id: '/work/',
  path: '/work/',
  getParentRoute: () => rootRouteImport,
} as any)

const WorkSlugRoute = WorkSlugRouteImport.update({
  id: '/work/$slug',
  path: '/work/$slug',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/$slug': typeof SlugRoute
  '/about': typeof AboutRoute
  '/admin/': typeof AdminIndexRoute
  '/admin/account': typeof AdminAccountRoute
  '/admin/administrators': typeof AdminAdministratorsRoute
  '/admin/audit-logs': typeof AdminAuditLogsRoute
  '/admin/bookings': typeof AdminBookingsRoute
  '/admin/careers': typeof AdminCareersRoute
  '/admin/case-studies': typeof AdminCaseStudiesRoute
  '/admin/comparisons': typeof AdminComparisonsRoute
  '/admin/connect-profiles': typeof AdminConnectProfilesRoute
  '/admin/dashboard': typeof AdminDashboardRoute
  '/admin/engagement-models': typeof AdminEngagementModelsRoute
  '/admin/global-styling': typeof AdminGlobalStylingRoute
  '/admin/guides': typeof AdminGuidesRoute
  '/admin/industries': typeof AdminIndustriesRoute
  '/admin/insights': typeof AdminInsightsRoute
  '/admin/integrations': typeof AdminIntegrationsRoute
  '/admin/leads': typeof AdminLeadsRoute
  '/admin/login': typeof AdminLoginRoute
  '/admin/media': typeof AdminMediaRoute
  '/admin/menus': typeof AdminMenusRoute
  '/admin/pages': typeof AdminPagesRoute
  '/admin/portfolio': typeof AdminPortfolioRoute
  '/admin/resources': typeof AdminResourcesRoute
  '/admin/security': typeof AdminSecurityRoute
  '/admin/services': typeof AdminServicesRoute
  '/admin/settings': typeof AdminSettingsRoute
  '/admin/site-health': typeof AdminSiteHealthRoute
  '/admin/team': typeof AdminTeamRoute
  '/admin/team-connect': typeof AdminTeamConnectRoute
  '/admin/testimonials': typeof AdminTestimonialsRoute
  '/admin/trash': typeof AdminTrashRoute
  '/automation-lab': typeof AutomationLabRoute
  '/book-a-call': typeof BookACallRoute
  '/careers': typeof CareersRoute
  '/company-profile': typeof CompanyProfileRoute
  '/comparisons/': typeof ComparisonsIndexRoute
  '/comparisons/$slug': typeof ComparisonsSlugRoute
  '/connect/$slug': typeof ConnectSlugRoute
  '/contact': typeof ContactRoute
  '/control/$adminSlug/$': typeof ControlAdminSlugSplatRoute
  '/engagement-models': typeof EngagementModelsRoute
  '/guides/': typeof GuidesIndexRoute
  '/guides/$slug': typeof GuidesSlugRoute
  '/industries/': typeof IndustriesIndexRoute
  '/industries/$slug': typeof IndustriesSlugRoute
  '/insights/': typeof InsightsIndexRoute
  '/insights/$slug': typeof InsightsSlugRoute
  '/integrations': typeof IntegrationsRoute
  '/portfolio/': typeof PortfolioIndexRoute
  '/portfolio/$slug': typeof PortfolioSlugRoute
  '/privacy': typeof PrivacyRoute
  '/process': typeof ProcessRoute
  '/project-estimator': typeof ProjectEstimatorRoute
  '/resources/': typeof ResourcesIndexRoute
  '/resources/$slug': typeof ResourcesSlugRoute
  '/services/': typeof ServicesIndexRoute
  '/services/$slug': typeof ServicesSlugRoute
  '/team': typeof TeamRoute
  '/technical-roadmap': typeof TechnicalRoadmapRoute
  '/technology': typeof TechnologyRoute
  '/terms': typeof TermsRoute
  '/testimonials': typeof TestimonialsRoute
  '/work/': typeof WorkIndexRoute
  '/work/$slug': typeof WorkSlugRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/$slug': typeof SlugRoute
  '/about': typeof AboutRoute
  '/admin': typeof AdminIndexRoute
  '/admin/account': typeof AdminAccountRoute
  '/admin/administrators': typeof AdminAdministratorsRoute
  '/admin/audit-logs': typeof AdminAuditLogsRoute
  '/admin/bookings': typeof AdminBookingsRoute
  '/admin/careers': typeof AdminCareersRoute
  '/admin/case-studies': typeof AdminCaseStudiesRoute
  '/admin/comparisons': typeof AdminComparisonsRoute
  '/admin/connect-profiles': typeof AdminConnectProfilesRoute
  '/admin/dashboard': typeof AdminDashboardRoute
  '/admin/engagement-models': typeof AdminEngagementModelsRoute
  '/admin/global-styling': typeof AdminGlobalStylingRoute
  '/admin/guides': typeof AdminGuidesRoute
  '/admin/industries': typeof AdminIndustriesRoute
  '/admin/insights': typeof AdminInsightsRoute
  '/admin/integrations': typeof AdminIntegrationsRoute
  '/admin/leads': typeof AdminLeadsRoute
  '/admin/login': typeof AdminLoginRoute
  '/admin/media': typeof AdminMediaRoute
  '/admin/menus': typeof AdminMenusRoute
  '/admin/pages': typeof AdminPagesRoute
  '/admin/portfolio': typeof AdminPortfolioRoute
  '/admin/resources': typeof AdminResourcesRoute
  '/admin/security': typeof AdminSecurityRoute
  '/admin/services': typeof AdminServicesRoute
  '/admin/settings': typeof AdminSettingsRoute
  '/admin/site-health': typeof AdminSiteHealthRoute
  '/admin/team': typeof AdminTeamRoute
  '/admin/team-connect': typeof AdminTeamConnectRoute
  '/admin/testimonials': typeof AdminTestimonialsRoute
  '/admin/trash': typeof AdminTrashRoute
  '/automation-lab': typeof AutomationLabRoute
  '/book-a-call': typeof BookACallRoute
  '/careers': typeof CareersRoute
  '/company-profile': typeof CompanyProfileRoute
  '/comparisons': typeof ComparisonsIndexRoute
  '/comparisons/$slug': typeof ComparisonsSlugRoute
  '/connect/$slug': typeof ConnectSlugRoute
  '/contact': typeof ContactRoute
  '/control/$adminSlug/$': typeof ControlAdminSlugSplatRoute
  '/engagement-models': typeof EngagementModelsRoute
  '/guides': typeof GuidesIndexRoute
  '/guides/$slug': typeof GuidesSlugRoute
  '/industries': typeof IndustriesIndexRoute
  '/industries/$slug': typeof IndustriesSlugRoute
  '/insights': typeof InsightsIndexRoute
  '/insights/$slug': typeof InsightsSlugRoute
  '/integrations': typeof IntegrationsRoute
  '/portfolio': typeof PortfolioIndexRoute
  '/portfolio/$slug': typeof PortfolioSlugRoute
  '/privacy': typeof PrivacyRoute
  '/process': typeof ProcessRoute
  '/project-estimator': typeof ProjectEstimatorRoute
  '/resources': typeof ResourcesIndexRoute
  '/resources/$slug': typeof ResourcesSlugRoute
  '/services': typeof ServicesIndexRoute
  '/services/$slug': typeof ServicesSlugRoute
  '/team': typeof TeamRoute
  '/technical-roadmap': typeof TechnicalRoadmapRoute
  '/technology': typeof TechnologyRoute
  '/terms': typeof TermsRoute
  '/testimonials': typeof TestimonialsRoute
  '/work': typeof WorkIndexRoute
  '/work/$slug': typeof WorkSlugRoute
}

export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/$slug': typeof SlugRoute
  '/about': typeof AboutRoute
  '/admin/': typeof AdminIndexRoute
  '/admin/account': typeof AdminAccountRoute
  '/admin/administrators': typeof AdminAdministratorsRoute
  '/admin/audit-logs': typeof AdminAuditLogsRoute
  '/admin/bookings': typeof AdminBookingsRoute
  '/admin/careers': typeof AdminCareersRoute
  '/admin/case-studies': typeof AdminCaseStudiesRoute
  '/admin/comparisons': typeof AdminComparisonsRoute
  '/admin/connect-profiles': typeof AdminConnectProfilesRoute
  '/admin/dashboard': typeof AdminDashboardRoute
  '/admin/engagement-models': typeof AdminEngagementModelsRoute
  '/admin/global-styling': typeof AdminGlobalStylingRoute
  '/admin/guides': typeof AdminGuidesRoute
  '/admin/industries': typeof AdminIndustriesRoute
  '/admin/insights': typeof AdminInsightsRoute
  '/admin/integrations': typeof AdminIntegrationsRoute
  '/admin/leads': typeof AdminLeadsRoute
  '/admin/login': typeof AdminLoginRoute
  '/admin/media': typeof AdminMediaRoute
  '/admin/menus': typeof AdminMenusRoute
  '/admin/pages': typeof AdminPagesRoute
  '/admin/portfolio': typeof AdminPortfolioRoute
  '/admin/resources': typeof AdminResourcesRoute
  '/admin/security': typeof AdminSecurityRoute
  '/admin/services': typeof AdminServicesRoute
  '/admin/settings': typeof AdminSettingsRoute
  '/admin/site-health': typeof AdminSiteHealthRoute
  '/admin/team': typeof AdminTeamRoute
  '/admin/team-connect': typeof AdminTeamConnectRoute
  '/admin/testimonials': typeof AdminTestimonialsRoute
  '/admin/trash': typeof AdminTrashRoute
  '/automation-lab': typeof AutomationLabRoute
  '/book-a-call': typeof BookACallRoute
  '/careers': typeof CareersRoute
  '/company-profile': typeof CompanyProfileRoute
  '/comparisons/': typeof ComparisonsIndexRoute
  '/comparisons/$slug': typeof ComparisonsSlugRoute
  '/connect/$slug': typeof ConnectSlugRoute
  '/contact': typeof ContactRoute
  '/control/$adminSlug/$': typeof ControlAdminSlugSplatRoute
  '/engagement-models': typeof EngagementModelsRoute
  '/guides/': typeof GuidesIndexRoute
  '/guides/$slug': typeof GuidesSlugRoute
  '/industries/': typeof IndustriesIndexRoute
  '/industries/$slug': typeof IndustriesSlugRoute
  '/insights/': typeof InsightsIndexRoute
  '/insights/$slug': typeof InsightsSlugRoute
  '/integrations': typeof IntegrationsRoute
  '/portfolio/': typeof PortfolioIndexRoute
  '/portfolio/$slug': typeof PortfolioSlugRoute
  '/privacy': typeof PrivacyRoute
  '/process': typeof ProcessRoute
  '/project-estimator': typeof ProjectEstimatorRoute
  '/resources/': typeof ResourcesIndexRoute
  '/resources/$slug': typeof ResourcesSlugRoute
  '/services/': typeof ServicesIndexRoute
  '/services/$slug': typeof ServicesSlugRoute
  '/team': typeof TeamRoute
  '/technical-roadmap': typeof TechnicalRoadmapRoute
  '/technology': typeof TechnologyRoute
  '/terms': typeof TermsRoute
  '/testimonials': typeof TestimonialsRoute
  '/work/': typeof WorkIndexRoute
  '/work/$slug': typeof WorkSlugRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    '/'
    | '/$slug'
    | '/about'
    | '/admin/'
    | '/admin/account'
    | '/admin/administrators'
    | '/admin/audit-logs'
    | '/admin/bookings'
    | '/admin/careers'
    | '/admin/case-studies'
    | '/admin/comparisons'
    | '/admin/connect-profiles'
    | '/admin/dashboard'
    | '/admin/engagement-models'
    | '/admin/global-styling'
    | '/admin/guides'
    | '/admin/industries'
    | '/admin/insights'
    | '/admin/integrations'
    | '/admin/leads'
    | '/admin/login'
    | '/admin/media'
    | '/admin/menus'
    | '/admin/pages'
    | '/admin/portfolio'
    | '/admin/resources'
    | '/admin/security'
    | '/admin/services'
    | '/admin/settings'
    | '/admin/site-health'
    | '/admin/team'
    | '/admin/team-connect'
    | '/admin/testimonials'
    | '/admin/trash'
    | '/automation-lab'
    | '/book-a-call'
    | '/careers'
    | '/company-profile'
    | '/comparisons/'
    | '/comparisons/$slug'
    | '/connect/$slug'
    | '/contact'
    | '/control/$adminSlug/$'
    | '/engagement-models'
    | '/guides/'
    | '/guides/$slug'
    | '/industries/'
    | '/industries/$slug'
    | '/insights/'
    | '/insights/$slug'
    | '/integrations'
    | '/portfolio/'
    | '/portfolio/$slug'
    | '/privacy'
    | '/process'
    | '/project-estimator'
    | '/resources/'
    | '/resources/$slug'
    | '/services/'
    | '/services/$slug'
    | '/team'
    | '/technical-roadmap'
    | '/technology'
    | '/terms'
    | '/testimonials'
    | '/work/'
    | '/work/$slug'
  fileRoutesByTo: FileRoutesByTo
  to:
    '/'
    | '/$slug'
    | '/about'
    | '/admin'
    | '/admin/account'
    | '/admin/administrators'
    | '/admin/audit-logs'
    | '/admin/bookings'
    | '/admin/careers'
    | '/admin/case-studies'
    | '/admin/comparisons'
    | '/admin/connect-profiles'
    | '/admin/dashboard'
    | '/admin/engagement-models'
    | '/admin/global-styling'
    | '/admin/guides'
    | '/admin/industries'
    | '/admin/insights'
    | '/admin/integrations'
    | '/admin/leads'
    | '/admin/login'
    | '/admin/media'
    | '/admin/menus'
    | '/admin/pages'
    | '/admin/portfolio'
    | '/admin/resources'
    | '/admin/security'
    | '/admin/services'
    | '/admin/settings'
    | '/admin/site-health'
    | '/admin/team'
    | '/admin/team-connect'
    | '/admin/testimonials'
    | '/admin/trash'
    | '/automation-lab'
    | '/book-a-call'
    | '/careers'
    | '/company-profile'
    | '/comparisons'
    | '/comparisons/$slug'
    | '/connect/$slug'
    | '/contact'
    | '/control/$adminSlug/$'
    | '/engagement-models'
    | '/guides'
    | '/guides/$slug'
    | '/industries'
    | '/industries/$slug'
    | '/insights'
    | '/insights/$slug'
    | '/integrations'
    | '/portfolio'
    | '/portfolio/$slug'
    | '/privacy'
    | '/process'
    | '/project-estimator'
    | '/resources'
    | '/resources/$slug'
    | '/services'
    | '/services/$slug'
    | '/team'
    | '/technical-roadmap'
    | '/technology'
    | '/terms'
    | '/testimonials'
    | '/work'
    | '/work/$slug'
  id:
    '__root__'
    | '/'
    | '/$slug'
    | '/about'
    | '/admin/'
    | '/admin/account'
    | '/admin/administrators'
    | '/admin/audit-logs'
    | '/admin/bookings'
    | '/admin/careers'
    | '/admin/case-studies'
    | '/admin/comparisons'
    | '/admin/connect-profiles'
    | '/admin/dashboard'
    | '/admin/engagement-models'
    | '/admin/global-styling'
    | '/admin/guides'
    | '/admin/industries'
    | '/admin/insights'
    | '/admin/integrations'
    | '/admin/leads'
    | '/admin/login'
    | '/admin/media'
    | '/admin/menus'
    | '/admin/pages'
    | '/admin/portfolio'
    | '/admin/resources'
    | '/admin/security'
    | '/admin/services'
    | '/admin/settings'
    | '/admin/site-health'
    | '/admin/team'
    | '/admin/team-connect'
    | '/admin/testimonials'
    | '/admin/trash'
    | '/automation-lab'
    | '/book-a-call'
    | '/careers'
    | '/company-profile'
    | '/comparisons/'
    | '/comparisons/$slug'
    | '/connect/$slug'
    | '/contact'
    | '/control/$adminSlug/$'
    | '/engagement-models'
    | '/guides/'
    | '/guides/$slug'
    | '/industries/'
    | '/industries/$slug'
    | '/insights/'
    | '/insights/$slug'
    | '/integrations'
    | '/portfolio/'
    | '/portfolio/$slug'
    | '/privacy'
    | '/process'
    | '/project-estimator'
    | '/resources/'
    | '/resources/$slug'
    | '/services/'
    | '/services/$slug'
    | '/team'
    | '/technical-roadmap'
    | '/technology'
    | '/terms'
    | '/testimonials'
    | '/work/'
    | '/work/$slug'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  SlugRoute: typeof SlugRoute
  AboutRoute: typeof AboutRoute
  AdminIndexRoute: typeof AdminIndexRoute
  AdminAccountRoute: typeof AdminAccountRoute
  AdminAdministratorsRoute: typeof AdminAdministratorsRoute
  AdminAuditLogsRoute: typeof AdminAuditLogsRoute
  AdminBookingsRoute: typeof AdminBookingsRoute
  AdminCareersRoute: typeof AdminCareersRoute
  AdminCaseStudiesRoute: typeof AdminCaseStudiesRoute
  AdminComparisonsRoute: typeof AdminComparisonsRoute
  AdminConnectProfilesRoute: typeof AdminConnectProfilesRoute
  AdminDashboardRoute: typeof AdminDashboardRoute
  AdminEngagementModelsRoute: typeof AdminEngagementModelsRoute
  AdminGlobalStylingRoute: typeof AdminGlobalStylingRoute
  AdminGuidesRoute: typeof AdminGuidesRoute
  AdminIndustriesRoute: typeof AdminIndustriesRoute
  AdminInsightsRoute: typeof AdminInsightsRoute
  AdminIntegrationsRoute: typeof AdminIntegrationsRoute
  AdminLeadsRoute: typeof AdminLeadsRoute
  AdminLoginRoute: typeof AdminLoginRoute
  AdminMediaRoute: typeof AdminMediaRoute
  AdminMenusRoute: typeof AdminMenusRoute
  AdminPagesRoute: typeof AdminPagesRoute
  AdminPortfolioRoute: typeof AdminPortfolioRoute
  AdminResourcesRoute: typeof AdminResourcesRoute
  AdminSecurityRoute: typeof AdminSecurityRoute
  AdminServicesRoute: typeof AdminServicesRoute
  AdminSettingsRoute: typeof AdminSettingsRoute
  AdminSiteHealthRoute: typeof AdminSiteHealthRoute
  AdminTeamRoute: typeof AdminTeamRoute
  AdminTeamConnectRoute: typeof AdminTeamConnectRoute
  AdminTestimonialsRoute: typeof AdminTestimonialsRoute
  AdminTrashRoute: typeof AdminTrashRoute
  AutomationLabRoute: typeof AutomationLabRoute
  BookACallRoute: typeof BookACallRoute
  CareersRoute: typeof CareersRoute
  CompanyProfileRoute: typeof CompanyProfileRoute
  ComparisonsIndexRoute: typeof ComparisonsIndexRoute
  ComparisonsSlugRoute: typeof ComparisonsSlugRoute
  ConnectSlugRoute: typeof ConnectSlugRoute
  ContactRoute: typeof ContactRoute
  ControlAdminSlugSplatRoute: typeof ControlAdminSlugSplatRoute
  EngagementModelsRoute: typeof EngagementModelsRoute
  GuidesIndexRoute: typeof GuidesIndexRoute
  GuidesSlugRoute: typeof GuidesSlugRoute
  IndustriesIndexRoute: typeof IndustriesIndexRoute
  IndustriesSlugRoute: typeof IndustriesSlugRoute
  InsightsIndexRoute: typeof InsightsIndexRoute
  InsightsSlugRoute: typeof InsightsSlugRoute
  IntegrationsRoute: typeof IntegrationsRoute
  PortfolioIndexRoute: typeof PortfolioIndexRoute
  PortfolioSlugRoute: typeof PortfolioSlugRoute
  PrivacyRoute: typeof PrivacyRoute
  ProcessRoute: typeof ProcessRoute
  ProjectEstimatorRoute: typeof ProjectEstimatorRoute
  ResourcesIndexRoute: typeof ResourcesIndexRoute
  ResourcesSlugRoute: typeof ResourcesSlugRoute
  ServicesIndexRoute: typeof ServicesIndexRoute
  ServicesSlugRoute: typeof ServicesSlugRoute
  TeamRoute: typeof TeamRoute
  TechnicalRoadmapRoute: typeof TechnicalRoadmapRoute
  TechnologyRoute: typeof TechnologyRoute
  TermsRoute: typeof TermsRoute
  TestimonialsRoute: typeof TestimonialsRoute
  WorkIndexRoute: typeof WorkIndexRoute
  WorkSlugRoute: typeof WorkSlugRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/$slug': {
      id: '/$slug'
      path: '/$slug'
      fullPath: '/$slug'
      preLoaderRoute: typeof SlugRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/about': {
      id: '/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/': {
      id: '/admin/'
      path: '/admin'
      fullPath: '/admin/'
      preLoaderRoute: typeof AdminIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/account': {
      id: '/admin/account'
      path: '/admin/account'
      fullPath: '/admin/account'
      preLoaderRoute: typeof AdminAccountRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/administrators': {
      id: '/admin/administrators'
      path: '/admin/administrators'
      fullPath: '/admin/administrators'
      preLoaderRoute: typeof AdminAdministratorsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/audit-logs': {
      id: '/admin/audit-logs'
      path: '/admin/audit-logs'
      fullPath: '/admin/audit-logs'
      preLoaderRoute: typeof AdminAuditLogsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/bookings': {
      id: '/admin/bookings'
      path: '/admin/bookings'
      fullPath: '/admin/bookings'
      preLoaderRoute: typeof AdminBookingsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/careers': {
      id: '/admin/careers'
      path: '/admin/careers'
      fullPath: '/admin/careers'
      preLoaderRoute: typeof AdminCareersRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/case-studies': {
      id: '/admin/case-studies'
      path: '/admin/case-studies'
      fullPath: '/admin/case-studies'
      preLoaderRoute: typeof AdminCaseStudiesRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/comparisons': {
      id: '/admin/comparisons'
      path: '/admin/comparisons'
      fullPath: '/admin/comparisons'
      preLoaderRoute: typeof AdminComparisonsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/connect-profiles': {
      id: '/admin/connect-profiles'
      path: '/admin/connect-profiles'
      fullPath: '/admin/connect-profiles'
      preLoaderRoute: typeof AdminConnectProfilesRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/dashboard': {
      id: '/admin/dashboard'
      path: '/admin/dashboard'
      fullPath: '/admin/dashboard'
      preLoaderRoute: typeof AdminDashboardRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/engagement-models': {
      id: '/admin/engagement-models'
      path: '/admin/engagement-models'
      fullPath: '/admin/engagement-models'
      preLoaderRoute: typeof AdminEngagementModelsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/global-styling': {
      id: '/admin/global-styling'
      path: '/admin/global-styling'
      fullPath: '/admin/global-styling'
      preLoaderRoute: typeof AdminGlobalStylingRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/guides': {
      id: '/admin/guides'
      path: '/admin/guides'
      fullPath: '/admin/guides'
      preLoaderRoute: typeof AdminGuidesRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/industries': {
      id: '/admin/industries'
      path: '/admin/industries'
      fullPath: '/admin/industries'
      preLoaderRoute: typeof AdminIndustriesRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/insights': {
      id: '/admin/insights'
      path: '/admin/insights'
      fullPath: '/admin/insights'
      preLoaderRoute: typeof AdminInsightsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/integrations': {
      id: '/admin/integrations'
      path: '/admin/integrations'
      fullPath: '/admin/integrations'
      preLoaderRoute: typeof AdminIntegrationsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/leads': {
      id: '/admin/leads'
      path: '/admin/leads'
      fullPath: '/admin/leads'
      preLoaderRoute: typeof AdminLeadsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/login': {
      id: '/admin/login'
      path: '/admin/login'
      fullPath: '/admin/login'
      preLoaderRoute: typeof AdminLoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/media': {
      id: '/admin/media'
      path: '/admin/media'
      fullPath: '/admin/media'
      preLoaderRoute: typeof AdminMediaRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/menus': {
      id: '/admin/menus'
      path: '/admin/menus'
      fullPath: '/admin/menus'
      preLoaderRoute: typeof AdminMenusRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/pages': {
      id: '/admin/pages'
      path: '/admin/pages'
      fullPath: '/admin/pages'
      preLoaderRoute: typeof AdminPagesRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/portfolio': {
      id: '/admin/portfolio'
      path: '/admin/portfolio'
      fullPath: '/admin/portfolio'
      preLoaderRoute: typeof AdminPortfolioRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/resources': {
      id: '/admin/resources'
      path: '/admin/resources'
      fullPath: '/admin/resources'
      preLoaderRoute: typeof AdminResourcesRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/security': {
      id: '/admin/security'
      path: '/admin/security'
      fullPath: '/admin/security'
      preLoaderRoute: typeof AdminSecurityRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/services': {
      id: '/admin/services'
      path: '/admin/services'
      fullPath: '/admin/services'
      preLoaderRoute: typeof AdminServicesRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/settings': {
      id: '/admin/settings'
      path: '/admin/settings'
      fullPath: '/admin/settings'
      preLoaderRoute: typeof AdminSettingsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/site-health': {
      id: '/admin/site-health'
      path: '/admin/site-health'
      fullPath: '/admin/site-health'
      preLoaderRoute: typeof AdminSiteHealthRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/team': {
      id: '/admin/team'
      path: '/admin/team'
      fullPath: '/admin/team'
      preLoaderRoute: typeof AdminTeamRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/team-connect': {
      id: '/admin/team-connect'
      path: '/admin/team-connect'
      fullPath: '/admin/team-connect'
      preLoaderRoute: typeof AdminTeamConnectRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/testimonials': {
      id: '/admin/testimonials'
      path: '/admin/testimonials'
      fullPath: '/admin/testimonials'
      preLoaderRoute: typeof AdminTestimonialsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin/trash': {
      id: '/admin/trash'
      path: '/admin/trash'
      fullPath: '/admin/trash'
      preLoaderRoute: typeof AdminTrashRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/automation-lab': {
      id: '/automation-lab'
      path: '/automation-lab'
      fullPath: '/automation-lab'
      preLoaderRoute: typeof AutomationLabRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/book-a-call': {
      id: '/book-a-call'
      path: '/book-a-call'
      fullPath: '/book-a-call'
      preLoaderRoute: typeof BookACallRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/careers': {
      id: '/careers'
      path: '/careers'
      fullPath: '/careers'
      preLoaderRoute: typeof CareersRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/company-profile': {
      id: '/company-profile'
      path: '/company-profile'
      fullPath: '/company-profile'
      preLoaderRoute: typeof CompanyProfileRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/comparisons/': {
      id: '/comparisons/'
      path: '/comparisons'
      fullPath: '/comparisons/'
      preLoaderRoute: typeof ComparisonsIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/comparisons/$slug': {
      id: '/comparisons/$slug'
      path: '/comparisons/$slug'
      fullPath: '/comparisons/$slug'
      preLoaderRoute: typeof ComparisonsSlugRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/connect/$slug': {
      id: '/connect/$slug'
      path: '/connect/$slug'
      fullPath: '/connect/$slug'
      preLoaderRoute: typeof ConnectSlugRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/contact': {
      id: '/contact'
      path: '/contact'
      fullPath: '/contact'
      preLoaderRoute: typeof ContactRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/control/$adminSlug/$': {
      id: '/control/$adminSlug/$'
      path: '/control/$adminSlug/$'
      fullPath: '/control/$adminSlug/$'
      preLoaderRoute: typeof ControlAdminSlugSplatRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/engagement-models': {
      id: '/engagement-models'
      path: '/engagement-models'
      fullPath: '/engagement-models'
      preLoaderRoute: typeof EngagementModelsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/guides/': {
      id: '/guides/'
      path: '/guides'
      fullPath: '/guides/'
      preLoaderRoute: typeof GuidesIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/guides/$slug': {
      id: '/guides/$slug'
      path: '/guides/$slug'
      fullPath: '/guides/$slug'
      preLoaderRoute: typeof GuidesSlugRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/industries/': {
      id: '/industries/'
      path: '/industries'
      fullPath: '/industries/'
      preLoaderRoute: typeof IndustriesIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/industries/$slug': {
      id: '/industries/$slug'
      path: '/industries/$slug'
      fullPath: '/industries/$slug'
      preLoaderRoute: typeof IndustriesSlugRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/insights/': {
      id: '/insights/'
      path: '/insights'
      fullPath: '/insights/'
      preLoaderRoute: typeof InsightsIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/insights/$slug': {
      id: '/insights/$slug'
      path: '/insights/$slug'
      fullPath: '/insights/$slug'
      preLoaderRoute: typeof InsightsSlugRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/integrations': {
      id: '/integrations'
      path: '/integrations'
      fullPath: '/integrations'
      preLoaderRoute: typeof IntegrationsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/portfolio/': {
      id: '/portfolio/'
      path: '/portfolio'
      fullPath: '/portfolio/'
      preLoaderRoute: typeof PortfolioIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/portfolio/$slug': {
      id: '/portfolio/$slug'
      path: '/portfolio/$slug'
      fullPath: '/portfolio/$slug'
      preLoaderRoute: typeof PortfolioSlugRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/privacy': {
      id: '/privacy'
      path: '/privacy'
      fullPath: '/privacy'
      preLoaderRoute: typeof PrivacyRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/process': {
      id: '/process'
      path: '/process'
      fullPath: '/process'
      preLoaderRoute: typeof ProcessRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/project-estimator': {
      id: '/project-estimator'
      path: '/project-estimator'
      fullPath: '/project-estimator'
      preLoaderRoute: typeof ProjectEstimatorRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/resources/': {
      id: '/resources/'
      path: '/resources'
      fullPath: '/resources/'
      preLoaderRoute: typeof ResourcesIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/resources/$slug': {
      id: '/resources/$slug'
      path: '/resources/$slug'
      fullPath: '/resources/$slug'
      preLoaderRoute: typeof ResourcesSlugRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/services/': {
      id: '/services/'
      path: '/services'
      fullPath: '/services/'
      preLoaderRoute: typeof ServicesIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/services/$slug': {
      id: '/services/$slug'
      path: '/services/$slug'
      fullPath: '/services/$slug'
      preLoaderRoute: typeof ServicesSlugRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/team': {
      id: '/team'
      path: '/team'
      fullPath: '/team'
      preLoaderRoute: typeof TeamRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/technical-roadmap': {
      id: '/technical-roadmap'
      path: '/technical-roadmap'
      fullPath: '/technical-roadmap'
      preLoaderRoute: typeof TechnicalRoadmapRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/technology': {
      id: '/technology'
      path: '/technology'
      fullPath: '/technology'
      preLoaderRoute: typeof TechnologyRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/terms': {
      id: '/terms'
      path: '/terms'
      fullPath: '/terms'
      preLoaderRoute: typeof TermsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/testimonials': {
      id: '/testimonials'
      path: '/testimonials'
      fullPath: '/testimonials'
      preLoaderRoute: typeof TestimonialsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/work/': {
      id: '/work/'
      path: '/work'
      fullPath: '/work/'
      preLoaderRoute: typeof WorkIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/work/$slug': {
      id: '/work/$slug'
      path: '/work/$slug'
      fullPath: '/work/$slug'
      preLoaderRoute: typeof WorkSlugRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute,
  SlugRoute,
  AboutRoute,
  AdminIndexRoute,
  AdminAccountRoute,
  AdminAdministratorsRoute,
  AdminAuditLogsRoute,
  AdminBookingsRoute,
  AdminCareersRoute,
  AdminCaseStudiesRoute,
  AdminComparisonsRoute,
  AdminConnectProfilesRoute,
  AdminDashboardRoute,
  AdminEngagementModelsRoute,
  AdminGlobalStylingRoute,
  AdminGuidesRoute,
  AdminIndustriesRoute,
  AdminInsightsRoute,
  AdminIntegrationsRoute,
  AdminLeadsRoute,
  AdminLoginRoute,
  AdminMediaRoute,
  AdminMenusRoute,
  AdminPagesRoute,
  AdminPortfolioRoute,
  AdminResourcesRoute,
  AdminSecurityRoute,
  AdminServicesRoute,
  AdminSettingsRoute,
  AdminSiteHealthRoute,
  AdminTeamRoute,
  AdminTeamConnectRoute,
  AdminTestimonialsRoute,
  AdminTrashRoute,
  AutomationLabRoute,
  BookACallRoute,
  CareersRoute,
  CompanyProfileRoute,
  ComparisonsIndexRoute,
  ComparisonsSlugRoute,
  ConnectSlugRoute,
  ContactRoute,
  ControlAdminSlugSplatRoute,
  EngagementModelsRoute,
  GuidesIndexRoute,
  GuidesSlugRoute,
  IndustriesIndexRoute,
  IndustriesSlugRoute,
  InsightsIndexRoute,
  InsightsSlugRoute,
  IntegrationsRoute,
  PortfolioIndexRoute,
  PortfolioSlugRoute,
  PrivacyRoute,
  ProcessRoute,
  ProjectEstimatorRoute,
  ResourcesIndexRoute,
  ResourcesSlugRoute,
  ServicesIndexRoute,
  ServicesSlugRoute,
  TeamRoute,
  TechnicalRoadmapRoute,
  TechnologyRoute,
  TermsRoute,
  TestimonialsRoute,
  WorkIndexRoute,
  WorkSlugRoute,
}

export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
