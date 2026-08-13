# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Imported Claude Cowork project instructions

# MILLENNIUM DIGITAL — FINAL PARTNER EVALUATION CONTEXT

You are working on an existing Millennium Digital digital-commerce application.

IMPORTANT:
This is NOT a greenfield project.

The application has already been developed based on an earlier product-design and engineering instruction. The existing codebase, UI, components, assets, product data, navigation, authentication, e-commerce flows, and architecture are the current baseline.

Your responsibility from this point forward is to EVOLVE and STRENGTHEN the existing application based on the client's latest final partner-evaluation expectations.

Do NOT unnecessarily rebuild the application from scratch.

Do NOT discard working functionality simply to introduce a new architecture.

First understand the existing implementation, identify what already works, identify gaps against the new client expectations, and then implement improvements incrementally.

============================================================
1. CLIENT
============================================================

Client:

MILLENNIUM DIGITAL

The platform is intended to become a modern digital commerce ecosystem for electronics, semiconductors, engineering components, suppliers, procurement teams, engineers, and enterprise buyers.

This must NOT feel like a generic consumer e-commerce website.

It must feel like:

- A premium electronics marketplace
- A B2B digital commerce platform
- An engineering procurement platform
- A supplier ecosystem
- A technically credible semiconductor commerce experience
- An enterprise-ready digital platform

The final experience must communicate:

- Trust
- Technical credibility
- Product authenticity
- Engineering expertise
- Procurement efficiency
- Supplier credibility
- Availability
- Pricing transparency
- Security
- Enterprise readiness
- Scalability
- Innovation

============================================================
2. EXISTING PROJECT BASELINE
============================================================

The project already contains:

@assets/

Product images

Manufacturer logos

@assets/data/products.json

The Millennium Digital logo already exists and must remain the primary brand identity.

Do NOT replace the Millennium Digital logo.

Do NOT redesign the logo.

Do NOT create a fictional alternative logo.

Use the existing brand identity as the foundation for the visual system.

The existing products.json is the primary product catalog data source for the prototype.

Always inspect and respect the actual product data before creating product experiences.

Do not invent product information when the data already exists.

If a future feature requires additional information that does not exist in products.json, use clearly identified mock/demo data or create an extensible model without corrupting the original product data.

============================================================
3. EXISTING TECHNOLOGY DIRECTION
============================================================

The application is being developed as a cross-platform digital commerce experience using:

- React Native
- TypeScript
- React Native Web
- Responsive Web
- Android
- iOS

Maintain the existing technology direction unless there is a compelling technical reason to change it.

The application must provide:

Desktop Web experience
Tablet experience
Mobile Web experience
Android experience
iOS experience

Do not treat mobile as a shrunk desktop.

Do not treat desktop as an enlarged mobile screen.

Use adaptive layouts and platform-appropriate interaction patterns.

============================================================
4. NEW CLIENT EXPECTATION — FINAL PARTNER EVALUATION
============================================================

Millennium Digital has entered the FINAL STAGE of its partner evaluation process.

The final demonstration will be reviewed by management for partner selection and approval.

Therefore, the application is no longer being evaluated merely as an attractive e-commerce UI.

It must demonstrate:

1. UI/UX excellence
2. Electronics / semiconductor industry workflow depth
3. Practical execution readiness
4. Architecture and integration readiness
5. AI and modern technology capability
6. Security
7. Reliability
8. Scalability
9. Enterprise commerce readiness
10. Governance readiness
11. Supplier ecosystem capability
12. B2B procurement capability
13. Innovation
14. Long-term digital commerce vision

The application should communicate:

"Millennium Digital can use this platform as the foundation of a serious digital electronics commerce ecosystem."

============================================================
5. REQUIRED ENGINEERING-GRADE LANDING EXPERIENCES
============================================================

The final application must demonstrate at least three strong engineering-grade landing experiences.

At minimum, support these concepts:

A. PARAMETRIC CATEGORY EXPERIENCE

This must be significantly more advanced than a normal e-commerce category listing.

It should allow engineers to discover products using technical parameters.

Examples may include:

- Manufacturer
- Product Type
- Technology
- Mounting Style
- Package
- Voltage-related parameters where supported
- Current-related parameters where supported
- Availability
- Stock
- RoHS
- Lifecycle
- Other technically meaningful attributes available from the product data

Do not invent technical parameters that are not supported by the available data.

The experience should feel like an engineering component discovery platform.

B. SUPPLIER / MANUFACTURER EXPERIENCE

Create a premium supplier/manufacturer experience.

It should communicate:

- Supplier identity
- Manufacturer credibility
- Manufacturer logo
- Product portfolio
- Categories
- Availability
- Technical documentation
- Product count
- Supplier-related information
- Relevant commerce actions

Use actual manufacturer information from the existing product data and assets where possible.

C. DESIGN REQUEST EXPERIENCE

Create a design-request entry point for engineers.

The experience should allow a user to communicate what they are designing or what components they require.

Potential inputs:

- Design/project name
- Application
- Technical requirement
- Target quantity
- Target cost
- Required date
- BOM upload
- Additional requirements

The experience should be designed as an intelligent engineering workflow rather than a generic contact form.

============================================================
6. B2B ELECTRONICS COMMERCE IS THE CORE DIRECTION
============================================================

The application must evolve beyond basic:

Browse → Product → Cart → Checkout

It must demonstrate B2B electronics workflows.

Important workflows to support or architect:

- Parametric search
- Engineering product discovery
- BOM upload
- BOM parsing
- Component matching
- Alternative component identification
- RFQ
- Quote management
- Supplier enablement
- Supplier product management
- Pricing governance
- Volume pricing
- Procurement workflow
- Sample-to-volume journey
- Inventory visibility
- ERP integration readiness
- Warehouse integration readiness
- Logistics tracking
- Drop-shipping readiness
- Order tracking
- Enterprise payment / purchase order readiness

Not every future capability must be fully production-integrated in the prototype.

However, the architecture and UX should make it clear that these capabilities can be added without major rewrites.

============================================================
7. PRIORITY END-TO-END WORKFLOWS
============================================================

The final demo should prioritize 1–2 highly polished end-to-end workflows.

PRIORITY WORKFLOW 1:

BOM → Component Matching → RFQ → Quote → Pricing Governance → Cart → Checkout → Order

Example journey:

1. Buyer uploads BOM
2. System parses BOM
3. Components are identified
4. Exact matches are found
5. Alternative matches are suggested where appropriate
6. Availability is shown
7. Buyer selects required components
8. Buyer requests quotation
9. Supplier / commercial pricing is generated
10. Pricing rules are applied
11. Governed price is presented
12. Approved items move to cart
13. Buyer checks out
14. Order is created
15. Order tracking is available

This workflow should feel like a real electronics procurement process.

PRIORITY WORKFLOW 2:

Engineering Requirement → AI Assistance → Component Recommendation → Comparison → RFQ / Cart

Example:

A user describes an engineering requirement in natural language.

The platform:

1. Understands the requirement
2. Converts the requirement into searchable criteria
3. Identifies relevant product attributes
4. Finds suitable products
5. Explains why they are relevant
6. Allows comparison
7. Allows RFQ or cart action

Do NOT implement AI merely as a decorative chatbot.

AI must solve meaningful commerce or engineering problems.

============================================================
8. AI VALUE PROPOSITION
============================================================

AI is an explicit evaluation dimension.

Use AI where it adds meaningful business value.

Priority AI use cases:

1. Natural-language engineering search
2. BOM intelligence
3. Component matching
4. Alternative component recommendations
5. Product recommendation
6. Technical product assistant
7. RFQ assistance
8. Supplier intelligence
9. Procurement assistance

Example:

User:

"Find a 100V MOSFET suitable for automotive applications with low RDS(on), SMD package and availability above 500."

The platform should conceptually convert the natural-language requirement into structured search criteria and present relevant products.

For prototype implementation:

- Mock AI services are acceptable
- AI service interfaces must be separated from UI
- Do not hardcode AI logic inside components
- Design the architecture so a real AI platform/API can replace the mock implementation

Never claim a real AI integration exists if it is only simulated.

Clearly distinguish:

PROTOTYPE / DEMO

from:

PRODUCTION TARGET ARCHITECTURE

============================================================
9. AR / VR VALUE ADD
============================================================

The client has asked for examples of AR / VR / AI value adds.

AR/VR should be treated as innovation opportunities, not as the core platform.

Possible future/demo concepts:

- AR component identification
- Camera-based component recognition
- Visual component lookup
- 3D product visualization
- Interactive engineering component visualization
- Warehouse / logistics visualization
- Immersive supplier/product experience

Do not spend excessive implementation effort on AR/VR if it compromises the core B2B commerce workflows.

A polished conceptual/demo experience is preferable to an unreliable AR implementation.

============================================================
10. SUPPLIER / SELLER EXPERIENCE
============================================================

The existing Admin experience must evolve toward a professional:

SUPPLIER COMMERCE PORTAL

The supplier side should feel like an enterprise platform, not a basic CRUD admin page.

Core areas:

- Supplier dashboard
- Product management
- Product creation
- Product editing
- Product publishing
- Inventory
- Pricing
- RFQs
- Quotes
- Orders
- Customers
- Documents
- Manufacturer information
- Analytics
- Supplier profile

The supplier should be able to:

- Add products
- Upload product images
- Upload datasheets
- Configure pricing
- Configure inventory
- Manage technical attributes
- Manage product status
- Submit products for review
- View RFQs
- Respond to RFQs
- Manage orders

============================================================
11. GOVERNANCE — MAKER / CHECKER MODEL
============================================================

This is a critical part of the Millennium Digital evaluation.

The Millennium Digital governance framework defines a two-partner Maker-Checker model.

MAKER:

Responsible for:

- Architecture
- Core platform build
- Third-party integrations
- Infrastructure deployment
- CI/CD
- Performance hardening
- Rollback
- Hypercare stabilization
- End-to-end technical execution

CHECKER:

Responsible for:

- Independent UAT
- Quality Control
- Cross-functional validation
- Test governance
- Feature assurance
- Release-readiness certification
- Defect governance
- Feature-based billing validation

The Checker must remain independent from core development.

The Maker must not independently certify its own release readiness.

Final Go/No-Go decisions remain with Millennium Digital governance.

This governance model must influence the prototype and presentation.

Where appropriate, demonstrate workflow states such as:

Draft
Submitted
Maker Validated
Checker Validated
Business Approved
Published

Use this concept for appropriate areas such as:

- Product publishing
- Supplier onboarding
- Pricing approval
- Workflow approval
- Release readiness

Do not create a fake governance system that contradicts the client's framework.

============================================================
12. MILLENNIUM DIGITAL ROADMAP
============================================================

The client governance framework defines these stages:

STAGE 1A
Joint Commercial Qualification / Proposal Evaluation

Expected artifacts include:

- AI platform credentials
- Functional dummy
- Commercial proposal
- TAT
- Ways of working

This is proposal evaluation and is non-billable.

STAGE 1B
Board Review / Green Flag / Commercial Start Approval

STAGE 1C
MVP-POC Alignment, Build & Supplier Showcase

Expected:

- MVP-POC
- Showcase environment
- Supplier demonstration
- Feedback capture
- UAT readiness

STAGE 2A
Soft Launch Readiness & Controlled Rollout

Expected:

- Core workflows
- Initial integrations
- Controlled SKU loading
- Release readiness
- Rollback readiness
- Hypercare

STAGE 2B
Mega Launch / Scale-Up / Category Expansion

Expected:

- Large catalog
- High traffic
- Infrastructure scaling
- HA/DR
- Performance validation
- Category expansion
- Mass SKU loading
- Hypercare

The product strategy and architecture should be capable of growing through these stages.

============================================================
13. IMPORTANT GOVERNANCE SUCCESS METRICS
============================================================

The governance framework identifies important target metrics.

These should influence the architecture and presentation.

Functional dummy:
100% of agreed baseline workflows operational

CI/CD:
>95% build success rate

Defect leakage:
<2% of total logged defects for Critical/High post-release

Planned test execution:
95% of approved test plan per sprint

Defect retest:
24–48 hours from fix deployment

Category/SKU load accuracy:
>99%

Pricing rule accuracy:
Within 0.1% variance under dynamic testing

Stock synchronization:
<5 minutes between ERP and web platform

Stage 2 uptime:
99.9%

Hypercare exit:
Zero open High/Critical defects

Do NOT falsely claim that these targets are already achieved.

Use them as target architecture / delivery goals unless actual measurements exist.

============================================================
14. ERP / WMS / SUPPLIER / LOGISTICS INTEGRATION READINESS
============================================================

The client expects enterprise integration readiness.

Design service boundaries for:

- ERP
- Warehouse Management System
- Supplier APIs
- Inventory APIs
- Pricing APIs
- Logistics APIs
- Payment systems
- Authentication systems
- AI services

Do not tightly couple UI components to APIs.

Use service/repository abstractions.

Example:

ProductService
InventoryService
SupplierService
PricingService
RFQService
OrderService
LogisticsService
AIService
GovernanceService

The current prototype may use mock implementations.

The architecture must allow real services to replace mock implementations.

============================================================
15. PRICING GOVERNANCE
============================================================

Pricing is not just a product-card field.

The platform should be designed to support:

- Base price
- Volume pricing
- Supplier pricing
- Contract pricing
- Discounts
- Promotions
- Bulk pricing
- Customer-specific pricing
- Purchase orders
- Enterprise pricing rules

The final demo should preferably demonstrate a governed pricing flow.

Example:

Base Price
→ Volume Rule
→ Supplier Rule
→ Contract Rule
→ Approved Price
→ Customer Cart

Do not hardcode arbitrary commercial rules as if they are official Millennium Digital rules.

Clearly identify prototype/demo pricing rules.

============================================================
16. INVENTORY / STOCK
============================================================

Inventory is a critical enterprise capability.

The application should communicate:

- Availability
- Stock status
- Quantity
- Low stock
- Out of stock
- Inventory synchronization
- Supplier inventory
- ERP inventory readiness

The governance target is stock sync within 5 minutes between ERP and Web Platform.

Treat this as a target integration requirement, not an existing capability unless actually implemented.

============================================================
17. LOGISTICS
============================================================

The platform should be architected for:

- Shipment creation
- Supplier fulfillment
- Warehouse fulfillment
- Drop shipping
- Logistics API
- Tracking
- Delivery status
- Estimated delivery

Create a professional tracking timeline.

Example:

Order Placed
→ Payment Confirmed
→ Supplier Processing
→ Packed
→ Shipped
→ In Transit
→ Delivered

Mock logistics data is acceptable for the prototype.

Do not claim a real logistics API is integrated unless it actually is.

============================================================
18. 21-DAY FUNCTIONAL DEMO REQUIREMENT
============================================================

The client expects a functional prototype/demo environment accessible to the evaluation panel for at least 21 calendar days.

The application must therefore be demonstrable, stable, and understandable without requiring the developer to explain every screen.

Provide clear demo journeys where appropriate:

Buyer Journey
Supplier Journey
AI Journey
BOM/RFQ Journey
Governance Journey

Avoid dead-end prototype screens.

If a feature is not fully implemented, make its prototype state intentional and clear.

============================================================
19. UI / UX EXPECTATION
============================================================

The visual quality must remain WORLD CLASS.

The client is explicitly evaluating:

- UI/UX
- Landing page craft
- Industry workflow depth
- Innovation
- Brand fit

Design principles:

- Premium
- Clean
- Rich
- Sophisticated
- Enterprise
- Technical
- Trustworthy
- High information density without clutter
- Strong whitespace
- Clear hierarchy
- Excellent typography
- Strong data visualization where useful
- Meaningful microinteractions
- Excellent responsive behavior

Do NOT create:

- Clumsy layouts
- Excessive cards
- Excessive gradients
- Excessive glassmorphism
- Excessive rounded containers
- Excessive shadows
- Excessive animations
- Generic SaaS dashboards
- Generic Amazon clones
- Generic fashion e-commerce layouts

The platform must have a unique Millennium Digital identity.

============================================================
20. BRAND DIRECTION
============================================================

Continue using the Millennium Digital logo.

Primary visual direction:

- Deep burgundy / plum
- Graphite / charcoal
- White
- Light neutral backgrounds
- Sophisticated gray
- Professional green for success
- Amber for warning
- Controlled red for errors

Use the existing logo as the visual source of truth.

Avoid excessive purple.

Avoid neon colors.

Avoid childish visual language.

============================================================
21. INFORMATION DENSITY
============================================================

Electronics commerce requires significantly more information than normal consumer commerce.

Use:

- Progressive disclosure
- Tabs
- Accordions
- Technical specification sections
- Tooltips
- Bottom sheets
- Expandable information
- Comparison layouts
- Structured tables

Do not display every technical attribute everywhere.

Prioritize:

1. Part number
2. Manufacturer
3. Availability
4. Price
5. Key technical attributes
6. Datasheet
7. Ordering information

============================================================
22. PRODUCT DATA RULES
============================================================

The existing products.json remains the primary source for actual product information.

Respect fields such as:

- id
- mouserPartNumber
- manufacturerPartNumber
- manufacturer
- manufacturerLogo
- title
- description
- datasheet
- productUrl
- availability
- stockStatus
- price
- currency
- rohs
- lifecycle
- productType
- technology
- mountingStyle
- package
- quantity
- category
- stockType
- image
- tags

Never invent technical specifications when they are absent.

When a demo workflow requires data that is not present, use clearly defined mock/demo data.

============================================================
23. ARCHITECTURAL PRINCIPLES
============================================================

Maintain clean separation between:

UI
Navigation
State
Services
Repositories
Models
Mock APIs
Authentication
Commerce
AI
Supplier
Inventory
Pricing
RFQ
Orders
Logistics
Governance

Business logic must not be buried inside UI components.

Use reusable components.

Use reusable hooks.

Use centralized constants.

Use a consistent theme/design system.

Avoid unnecessary architectural rewrites.

============================================================
24. PROTOTYPE VS PRODUCTION HONESTY
============================================================

This is critical.

Never represent a mocked feature as a production integration.

Always distinguish between:

LIVE / IMPLEMENTED

MOCKED / PROTOTYPE

TARGET PRODUCTION ARCHITECTURE

For example:

"Inventory synchronization — prototype simulation"

is acceptable.

"Real-time ERP inventory synchronization"

is NOT acceptable unless it actually exists.

The final presentation must build trust, not create false claims.

============================================================
25. WHAT MANAGEMENT SHOULD FEEL AFTER THE DEMO
============================================================

The final product should leave management with these impressions:

"This partner understands electronics commerce."

"This partner understands B2B procurement."

"This partner understands engineers."

"This partner understands suppliers."

"This partner understands enterprise integrations."

"This partner understands AI beyond a chatbot."

"This partner understands governance."

"This partner can actually execute."

"This platform can scale beyond the prototype."

"This is a credible long-term digital commerce partner."

============================================================
26. DEVELOPMENT BEHAVIOR
============================================================

Before modifying code:

1. Inspect the current implementation.
2. Understand existing architecture.
3. Identify reusable components.
4. Identify existing flows.
5. Identify what already satisfies the requirement.
6. Identify gaps.
7. Implement incrementally.

Do NOT recreate existing functionality unnecessarily.

Do NOT create duplicate components when an existing reusable component can be extended.

Do NOT introduce unnecessary dependencies.

Do NOT break working buyer flows while implementing supplier/governance functionality.

After implementation:

- Check navigation
- Check responsive behavior
- Check TypeScript
- Check data usage
- Check empty states
- Check loading states
- Check error states
- Check accessibility
- Check mobile behavior
- Check desktop behavior
- Check existing flows for regressions

============================================================
27. PRIORITY ORDER FOR FINAL EVALUATION
============================================================

When deciding what to implement first, prioritize:

P0 — MUST DEMONSTRATE

1. Premium Millennium Digital landing experience
2. Parametric engineering category
3. Supplier/manufacturer experience
4. Design request
5. BOM upload and processing experience
6. BOM component matching
7. RFQ
8. Pricing-governed cart
9. Supplier portal
10. Maker-Checker governance
11. Order tracking
12. AI-powered engineering experience

P1 — IMPORTANT

13. Product comparison
14. Advanced technical filtering
15. Inventory management
16. Supplier product management
17. Logistics
18. Customer management
19. Analytics
20. Notifications

P2 — FUTURE / ROADMAP

21. AR
22. VR
23. Advanced AI
24. Enterprise procurement
25. Purchase orders
26. Corporate accounts
27. Advanced ERP/WMS integrations
28. Advanced supplier network
29. Advanced pricing engine

Do not spend all development time on P2 while P0 workflows remain incomplete.

============================================================
28. FINAL RULE
============================================================

You are not simply building screens.

You are evolving an existing Millennium Digital prototype into a compelling demonstration of a future:

INTELLIGENT
B2B
ELECTRONICS
DIGITAL COMMERCE
PLATFORM.

Every implementation decision should answer:

"Will this help Millennium Digital believe that this partner is capable of delivering the real platform?"

If yes, prioritize it.

If it is merely visual decoration with no business value, deprioritize it.
