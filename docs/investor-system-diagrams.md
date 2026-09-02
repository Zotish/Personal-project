# ImmigrantConnect

Investor-ready system and data-flow diagrams for the current frontend prototype.

Labels are intentionally short so the product story is readable at a glance.

## Master prompt

```text
Create a clean investor-facing overview diagram for ImmigrantConnect, a newcomer support platform. Keep the full system shallow and readable: User → Entry → Auth → App → five main modules → Data Layer. Use only 1–2 words per node. Show only these main modules: Community, Services, Marketplace, Identity, and Admin. Show only these data sources: Mock Data, Local Store, and Live APIs. Use normal thin 1px arrows, generous spacing, a minimal white canvas, rounded rectangles, and one accent color per module. Do not use bold arrows, thick lines, wedge-shaped connectors, hidden layout links, deep submodules, long labels, paragraphs, metrics, decorative illustrations, or crossing connectors. After the overview, create separate deeper diagrams for each main module using the same short-label rule and visual language.
```

## Full system

![Full system diagram](./full-system.svg)

## Entry

```mermaid
flowchart LR
  E[Entry] --> SP[Splash]
  SP --> LD[Landing]
  LD --> AU[Auth]
  AU --> VE[Verify]
  VE --> ON[Onboarding]
  ON --> FE[Feed]
  AU --> SE[Seller]
  SE --> SD[Seller Dashboard]
```

## Community

```mermaid
flowchart TB
  C[Community] --> F[Feed]
  C --> X[Explore]
  C --> M[Map]
  C --> CM[Communities]
  C --> Q[Q&A]
  C --> MSG[Messages]
  C --> N[Notifications]
  C --> P[Profile]
  C --> SV[Saved]
  C --> R[Reels]
  F --> PS[Posts]
  PS --> LK[Likes]
  PS --> CO[Comments]
  PS --> SH[Shares]
  X --> SR[Search]
  M --> LC[Location]
  CM --> EV[Events]
  Q --> AN[Answers]
  MSG --> CH[Chats]
  P --> FO[Followers]
  C --> LS[Local Store]
  C --> RM[Remote Media]
  M --> LA[Live APIs]
```

## Services

```mermaid
flowchart TB
  V[Services] --> H[Services Hub]
  H --> J[Jobs]
  H --> HO[Housing]
  H --> FD[Food]
  H --> EM[Embassy]
  H --> L[Legal Aid]
  H --> CL[Checklist]
  H --> ED[Education]
  H --> HE[Health]
  H --> WO[Worship]
  H --> GR[Groceries]
  J --> JD[Job Detail]
  HO --> HD[Home Detail]
  FD --> FD2[Food Detail]
  EM --> CS[Consular Services]
  L --> RS[Rights]
  CL --> TS[Task List]
  ED --> EF[Education Finder]
  HE --> HF[Health Finder]
  WO --> WF[Worship Finder]
  GR --> GF[Grocer Finder]
  H --> MD[Mock Data]
  H --> LA[Live APIs]
  H --> LS[Local Store]
```

## Marketplace

```mermaid
flowchart TB
  M[Marketplace] --> SE[Seller]
  M --> BU[Buyer]
  M --> OR[Orders]
  SE --> SD[Seller Dashboard]
  SD --> PR[Products]
  SD --> ST[Store]
  SD --> SM[Seller Messages]
  BU --> SP[Seller Profile]
  SP --> CT[Cart]
  CT --> PAY[Payment]
  PAY --> OR
  OR --> IN[Invoice]
  OR --> DS[Delivery]
  OR --> SEC[Delivery Security]
  M --> MSG[Messages]
  M --> LS[Local Store]
  M --> MD[Mock Data]
```

## Identity

```mermaid
flowchart TB
  I[Identity] --> P[Profile]
  I --> SET[Settings]
  I --> LN[Language]
  I --> SV[Saved]
  P --> PS[Posts]
  P --> FO[Followers]
  P --> OR[Orders]
  SET --> PR[Privacy]
  SET --> NT[Notifications]
  SET --> LO[Location]
  SET --> SA[Safety]
  SET --> DA[Data Export]
  LN --> EN[English]
  LN --> BN[Bengali]
  I --> LS[Local Store]
```

## Admin

```mermaid
flowchart TB
  A[Admin] --> OV[Overview]
  A --> MO[Moderation]
  A --> US[Users]
  A --> VR[Verification]
  A --> AN[Announcements]
  A --> FF[Feature Flags]
  MO --> RP[Reports]
  MO --> CO[Content]
  US --> SE[Search]
  US --> ST[Status]
  VR --> AP[Approvals]
  AN --> SC[Scope]
  FF --> TO[Toggle]
  A --> LS[Local Store]
```

## Data layer

```mermaid
flowchart LR
  D[Data Layer] --> MD[Mock Data]
  D --> LS[Local Store]
  D --> LA[Live APIs]
  D --> RM[Remote Media]
  MD --> J[Jobs]
  MD --> HO[Housing]
  MD --> FD[Food]
  MD --> RE[Religion]
  MD --> EM[Embassy]
  LS --> SV[Saved]
  LS --> MSG[Messages]
  LS --> LN[Language]
  LS --> LOC[Location]
  LA --> MP[Maps]
  LA --> GC[Geocode]
  LA --> RT[Routing]
  LA --> WE[Weather]
  RM --> IM[Images]
  RM --> VI[Videos]
```

## Current scope

```mermaid
flowchart LR
  UI[Frontend] --> ST[Local State]
  ST --> LS[Local Store]
  UI --> MD[Mock Data]
  UI --> LA[Live APIs]
  UI --> RT[Route Graph]
  BE[Backend] -. missing .-> UI
```
