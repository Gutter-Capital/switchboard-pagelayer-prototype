export type OriginKind = "tasks" | "accounts"

export type TaskRecord = {
  id: string
  due: string
  title: string
  accountId: string
  accountName: string
  opportunityId: string
  opportunityName: string
  quoteRequestId?: string
  priority: "High" | "Medium" | "Low"
  assignee: string
  status: "Open" | "Done"
  line: string
  stage: string
  effectiveDate: string
}

export type AccountRecord = {
  id: string
  name: string
  dba: string
  industry: string
  businessType: string
  owner: string
  selected?: boolean
}

export type OpportunityRecord = {
  id: string
  accountId: string
  accountName: string
  name: string
  type: string
  stage: string
  effectiveDate: string
  line?: string
  owner: string
  winProbability: string
  quotingProgress: string
  nextAction: string
}

export type QuoteRequestStatus =
  | "Declined"
  | "Pending review"
  | "Quoted"
  | "Missing information"

export type QuoteRequestAttempt = {
  id: string
  label: string
  submittedAt: string
  submittedBy: string
  method: string
  outcome: string
  summary: string
  changes?: string[]
}

export type QuoteOption = {
  id: string
  label: string
  premium: string
  totalPremium: string
  deductible: string
  limit: string
  conditions: string
  quoteNumber: string
  underwriter: string
  sourceDocument: string
  reviewStatus: string
  selected?: boolean
}

export type QuoteRequestActivity = {
  id: string
  timestamp: string
  actor: string
  title: string
  detail: string
}

export type QuoteRequestRecord = {
  id: string
  accountId: string
  opportunityId: string
  carrier: string
  channel: "Direct" | "Wholesale"
  line: string
  status: QuoteRequestStatus
  workflowState: string
  reason: string
  lastActivity: string
  bestPremium: string
  nextAction: string
  assignee: string
  due: string
  owner: string
  underwriter: string
  submissionMethod: string
  externalId: string
  question?: {
    prompt: string
    requestedBy: string
    requestedAt: string
  }
  submittedValues: Array<{
    label: string
    value: string
  }>
  attempts: QuoteRequestAttempt[]
  options: QuoteOption[]
  activity: QuoteRequestActivity[]
}

export const currentDateLabel = "Aug 27, 2026"

export const bobAccount: AccountRecord = {
  id: "acct-bob-smith-construction",
  name: "Bob Smith Construction",
  dba: "BSC Builders",
  industry: "General Contractor",
  businessType: "Construction",
  owner: "a@aol.com",
}

export const accounts: AccountRecord[] = [
  bobAccount,
  {
    id: "acct-bottle-bay",
    name: "Bottle Bay Properties",
    dba: "Bottle Bay",
    industry: "Property Owner",
    businessType: "Real estate",
    owner: "a@aol.com",
  },
  {
    id: "acct-botl",
    name: "BOTL",
    dba: "BOTL Manufacturing",
    industry: "Bottling",
    businessType: "Manufacturing",
    owner: "a@aol.com",
  },
  {
    id: "acct-new-life",
    name: "New Life Church Outreach Center of Wichita",
    dba: "New Life Outreach",
    industry: "Religious organization",
    businessType: "Nonprofit",
    owner: "a@aol.com",
  },
  {
    id: "acct-seabag",
    name: "Seabag2services",
    dba: "Seabag Marine",
    industry: "Marine contractor",
    businessType: "Contractor",
    owner: "a@aol.com",
  },
  {
    id: "acct-acme-construction",
    name: "Acme Construction LLC",
    dba: "Acme Construction",
    industry: "General Contractor",
    businessType: "Construction",
    owner: "a@aol.com",
  },
  {
    id: "acct-valley-medical",
    name: "Valley Medical Center",
    dba: "Valley Medical",
    industry: "Healthcare",
    businessType: "Medical center",
    owner: "matt@aol.com",
  },
  {
    id: "acct-riverside",
    name: "Riverside Manufacturing",
    dba: "Riverside",
    industry: "Industrial manufacturing",
    businessType: "Manufacturing",
    owner: "a@aol.com",
  },
  {
    id: "acct-harbor-craft",
    name: "Harbor Craft Services",
    dba: "Harbor Craft",
    industry: "Marine services",
    businessType: "Services",
    owner: "a@aol.com",
  },
  {
    id: "acct-prairie-labs",
    name: "Prairie Testing Labs",
    dba: "Prairie Labs",
    industry: "Laboratory",
    businessType: "Professional services",
    owner: "matt@aol.com",
  },
  {
    id: "acct-canyon-electric",
    name: "Canyon Electric Cooperative",
    dba: "Canyon Electric",
    industry: "Utilities",
    businessType: "Cooperative",
    owner: "a@aol.com",
  },
  {
    id: "acct-summit-freight",
    name: "Summit Freight & Storage",
    dba: "Summit Freight",
    industry: "Logistics",
    businessType: "Transportation",
    owner: "matt@aol.com",
  },
  {
    id: "acct-lakeview-school",
    name: "Lakeview Charter School",
    dba: "Lakeview",
    industry: "Education",
    businessType: "School",
    owner: "a@aol.com",
  },
  {
    id: "acct-brightline-printing",
    name: "Brightline Printing Cooperative",
    dba: "Brightline Printing",
    industry: "Commercial printing",
    businessType: "Manufacturing",
    owner: "a@aol.com",
  },
  {
    id: "acct-northstar-plumbing",
    name: "Northstar Plumbing Group",
    dba: "Northstar Plumbing",
    industry: "Plumbing contractor",
    businessType: "Contractor",
    owner: "a@aol.com",
  },
  {
    id: "acct-metro-foods",
    name: "Metro Foods Distribution",
    dba: "Metro Foods",
    industry: "Food distribution",
    businessType: "Wholesale",
    owner: "a@aol.com",
  },
  {
    id: "acct-golden-pipe",
    name: "Golden Pipe Fabrication",
    dba: "Golden Pipe",
    industry: "Metal fabrication",
    businessType: "Manufacturing",
    owner: "a@aol.com",
  },
  {
    id: "acct-clearwater-hvac",
    name: "Clearwater HVAC Services",
    dba: "Clearwater HVAC",
    industry: "Mechanical contractor",
    businessType: "Contractor",
    owner: "a@aol.com",
  },
  {
    id: "acct-civic-stone",
    name: "Civic Stone & Tile",
    dba: "Civic Stone",
    industry: "Construction materials",
    businessType: "Retail and installation",
    owner: "a@aol.com",
  },
  {
    id: "acct-hillcrest-dental",
    name: "Hillcrest Dental Partners",
    dba: "Hillcrest Dental",
    industry: "Dental practice",
    businessType: "Healthcare",
    owner: "a@aol.com",
  },
  {
    id: "acct-ridgeway-glass",
    name: "Ridgeway Glass Works",
    dba: "Ridgeway Glass",
    industry: "Glass contractor",
    businessType: "Contractor",
    owner: "a@aol.com",
  },
  {
    id: "acct-pine-hollow",
    name: "Pine Hollow Apartments",
    dba: "Pine Hollow",
    industry: "Property Owner",
    businessType: "Real estate",
    owner: "a@aol.com",
  },
  {
    id: "acct-union-warehouse",
    name: "Union Warehouse Cooperative",
    dba: "Union Warehouse",
    industry: "Warehousing",
    businessType: "Storage",
    owner: "a@aol.com",
  },
  {
    id: "acct-western-aggregate",
    name: "Western Aggregate Supply",
    dba: "Western Aggregate",
    industry: "Construction materials",
    businessType: "Supplier",
    owner: "a@aol.com",
  },
]

export const opportunities: OpportunityRecord[] = [
  {
    id: "opp-bob-renovation",
    accountId: bobAccount.id,
    accountName: bobAccount.name,
    name: "Bob Smith municipal renovation package",
    type: "New business",
    stage: "Quoting in progress",
    effectiveDate: "Oct 3, 2026",
    line: "Commercial Property",
    owner: "a@aol.com",
    winProbability: "Very good",
    quotingProgress: "2 quoted, 1 pending review, 1 needs information, 3 declined",
    nextAction: "Answer Coterie underwriting question",
  },
  {
    id: "opp-bob-general-liability-renewal",
    accountId: bobAccount.id,
    accountName: bobAccount.name,
    name: "Bob Smith general liability renewal",
    type: "Renewal",
    stage: "Preparing application",
    effectiveDate: "Oct 3, 2026",
    line: "General Liability",
    owner: "a@aol.com",
    winProbability: "Very good",
    quotingProgress: "Payroll, revenue, and subcontractor costs under review",
    nextAction: "Confirm updated subcontractor exposure",
  },
  {
    id: "opp-bob-workers-comp-renewal",
    accountId: bobAccount.id,
    accountName: bobAccount.name,
    name: "Bob Smith workers compensation renewal",
    type: "Renewal",
    stage: "Market selection",
    effectiveDate: "Jan 1, 2027",
    line: "Workers Compensation",
    owner: "a@aol.com",
    winProbability: "Good",
    quotingProgress: "Class codes, loss runs, and experience mod being checked",
    nextAction: "Verify payroll split by class code",
  },
  {
    id: "opp-bob-commercial-auto-fleet",
    accountId: bobAccount.id,
    accountName: bobAccount.name,
    name: "Bob Smith commercial auto fleet renewal",
    type: "Renewal",
    stage: "Awaiting underwriting",
    effectiveDate: "Nov 15, 2026",
    line: "Commercial Auto",
    owner: "a@aol.com",
    winProbability: "Good",
    quotingProgress: "Driver schedule and vehicle list submitted to markets",
    nextAction: "Review MVR follow-ups",
  },
  {
    id: "opp-bob-contractors-equipment",
    accountId: bobAccount.id,
    accountName: bobAccount.name,
    name: "Bob Smith contractors equipment floater",
    type: "Cross-sell",
    stage: "Preparing application",
    effectiveDate: "Oct 3, 2026",
    line: "Contractors Equipment",
    owner: "a@aol.com",
    winProbability: "Medium",
    quotingProgress: "Equipment schedule missing leased equipment values",
    nextAction: "Confirm cranes, lifts, and rented equipment",
  },
  {
    id: "opp-bottle-office",
    accountId: "acct-bottle-bay",
    accountName: "Bottle Bay Properties",
    name: "Bottle Bay office expansion",
    type: "New business",
    stage: "Quoting in progress",
    effectiveDate: "Oct 3, 2026",
    owner: "a@aol.com",
    winProbability: "Good",
    quotingProgress: "1 pending review",
    nextAction: "Review results",
  },
  {
    id: "opp-botl-warehouse",
    accountId: "acct-botl",
    accountName: "BOTL",
    name: "BOTL warehouse renovation",
    type: "New business",
    stage: "Quoting in progress",
    effectiveDate: "Oct 3, 2026",
    owner: "a@aol.com",
    winProbability: "Good",
    quotingProgress: "2 quoted",
    nextAction: "Review results",
  },
  {
    id: "opp-new-life-community",
    accountId: "acct-new-life",
    accountName: "New Life Church Outreach Center of Wichita",
    name: "New Life Church community center",
    type: "New business",
    stage: "Quoting in progress",
    effectiveDate: "Oct 3, 2026",
    owner: "a@aol.com",
    winProbability: "Good",
    quotingProgress: "1 quoted, 1 referred",
    nextAction: "Review results",
  },
  {
    id: "opp-seabag-facility",
    accountId: "acct-seabag",
    accountName: "Seabag2services",
    name: "Seabag2services facility expansion",
    type: "New business",
    stage: "Quoting in progress",
    effectiveDate: "Oct 3, 2026",
    owner: "a@aol.com",
    winProbability: "Medium",
    quotingProgress: "1 pending review, 1 declined",
    nextAction: "Review results",
  },
  {
    id: "opp-acme-liability",
    accountId: "acct-acme-construction",
    accountName: "Acme Construction LLC",
    name: "Acme Construction general liability renewal",
    type: "New business",
    stage: "Preparing application",
    effectiveDate: "Sep 18, 2026",
    owner: "a@aol.com",
    winProbability: "Medium",
    quotingProgress: "Application in progress",
    nextAction: "Prepare application",
  },
  {
    id: "opp-valley-renewal",
    accountId: "acct-valley-medical",
    accountName: "Valley Medical Center",
    name: "Valley Medical Center renewal",
    type: "New business",
    stage: "Quoting in progress",
    effectiveDate: "Oct 18, 2026",
    owner: "matt@aol.com",
    winProbability: "Good",
    quotingProgress: "2 quoted, 1 pending review",
    nextAction: "Review results",
  },
  {
    id: "opp-riverside-competitive",
    accountId: "acct-riverside",
    accountName: "Riverside Manufacturing",
    name: "Riverside Manufacturing plant upgrade",
    type: "New business",
    stage: "Not assigned",
    effectiveDate: "Oct 3, 2026",
    owner: "Not assigned",
    winProbability: "Unknown",
    quotingProgress: "Quoted: Business Owners Policy; Employment Practices Liability",
    nextAction: "Assign and review",
  },
]

const taskSeeds: TaskRecord[] = [
  {
    id: "task-bob-requote",
    due: "Sep 1, 2026",
    title: "Answer Coterie underwriting question",
    accountId: bobAccount.id,
    accountName: bobAccount.name,
    opportunityId: "opp-bob-renovation",
    opportunityName: "Bob Smith municipal renovation package",
    quoteRequestId: "qr-bob-coterie-property",
    priority: "High",
    assignee: "a@aol.com",
    status: "Open",
    line: "Commercial Property",
    stage: "Quoting in progress",
    effectiveDate: "Oct 3, 2026",
  },
  {
    id: "task-bottle-review",
    due: "Sep 3, 2026",
    title: "Review submitted quote",
    accountId: "acct-bottle-bay",
    accountName: "Bottle Bay Properties",
    opportunityId: "opp-bottle-office",
    opportunityName: "Bottle Bay office expansion",
    priority: "Medium",
    assignee: "a@aol.com",
    status: "Open",
    line: "Commercial Property",
    stage: "Quoting in progress",
    effectiveDate: "Oct 3, 2026",
  },
  {
    id: "task-botl-info",
    due: "Sep 4, 2026",
    title: "Request additional information",
    accountId: "acct-botl",
    accountName: "BOTL",
    opportunityId: "opp-botl-warehouse",
    opportunityName: "BOTL warehouse renovation",
    priority: "Medium",
    assignee: "a@aol.com",
    status: "Open",
    line: "Commercial Property",
    stage: "Quoting in progress",
    effectiveDate: "Oct 3, 2026",
  },
  {
    id: "task-new-life-marketing",
    due: "Sep 8, 2026",
    title: "Prepare marketing submission",
    accountId: "acct-new-life",
    accountName: "New Life Church Outreach Center of Wichita",
    opportunityId: "opp-new-life-community",
    opportunityName: "New Life Church community center",
    priority: "High",
    assignee: "a@aol.com",
    status: "Open",
    line: "Commercial Property",
    stage: "Quoting in progress",
    effectiveDate: "Oct 3, 2026",
  },
  {
    id: "task-seabag-decline",
    due: "Sep 9, 2026",
    title: "Follow up on underwriting declination",
    accountId: "acct-seabag",
    accountName: "Seabag2services",
    opportunityId: "opp-seabag-facility",
    opportunityName: "Seabag2services facility expansion",
    priority: "High",
    assignee: "a@aol.com",
    status: "Open",
    line: "Commercial Property",
    stage: "Quoting in progress",
    effectiveDate: "Oct 3, 2026",
  },
  {
    id: "task-valley-requote",
    due: "Sep 11, 2026",
    title: "Requote declined markets",
    accountId: "acct-valley-medical",
    accountName: "Valley Medical Center",
    opportunityId: "opp-valley-renewal",
    opportunityName: "Valley Medical Center pediatrics addition",
    priority: "Medium",
    assignee: "a@aol.com",
    status: "Open",
    line: "Commercial Property",
    stage: "Quoting in progress",
    effectiveDate: "Oct 18, 2026",
  },
  {
    id: "task-riverside-info",
    due: "Sep 15, 2026",
    title: "Collect outstanding information",
    accountId: "acct-riverside",
    accountName: "Riverside Manufacturing",
    opportunityId: "opp-riverside-competitive",
    opportunityName: "Riverside Manufacturing plant upgrade",
    priority: "Medium",
    assignee: "a@aol.com",
    status: "Open",
    line: "Commercial Property",
    stage: "Not assigned",
    effectiveDate: "Oct 3, 2026",
  },
  {
    id: "task-bottle-renewal",
    due: "Sep 17, 2026",
    title: "Prepare renewal quote",
    accountId: "acct-bottle-bay",
    accountName: "Bottle Bay Properties",
    opportunityId: "opp-bottle-office",
    opportunityName: "Bottle Bay property renewal",
    priority: "Low",
    assignee: "a@aol.com",
    status: "Open",
    line: "Commercial Property",
    stage: "Quoting in progress",
    effectiveDate: "Oct 3, 2026",
  },
  {
    id: "task-botl-marketing",
    due: "Sep 18, 2026",
    title: "Marketing follow up",
    accountId: "acct-botl",
    accountName: "BOTL",
    opportunityId: "opp-botl-warehouse",
    opportunityName: "BOTL equipment expansion",
    priority: "Low",
    assignee: "a@aol.com",
    status: "Open",
    line: "Commercial Property",
    stage: "Quoting in progress",
    effectiveDate: "Oct 3, 2026",
  },
  {
    id: "task-new-life-confirm",
    due: "Sep 22, 2026",
    title: "Confirm submission requirements",
    accountId: "acct-new-life",
    accountName: "New Life Church Outreach Center of Wichita",
    opportunityId: "opp-new-life-community",
    opportunityName: "New Life Church youth center",
    priority: "Low",
    assignee: "a@aol.com",
    status: "Open",
    line: "Commercial Property",
    stage: "Quoting in progress",
    effectiveDate: "Oct 3, 2026",
  },
]

const followUpDueDates = [
  "Sep 23, 2026",
  "Sep 24, 2026",
  "Sep 25, 2026",
  "Sep 28, 2026",
  "Sep 29, 2026",
  "Sep 30, 2026",
  "Oct 1, 2026",
  "Oct 2, 2026",
  "Oct 5, 2026",
  "Oct 6, 2026",
  "Oct 7, 2026",
  "Oct 8, 2026",
  "Oct 9, 2026",
]

export const tasks: TaskRecord[] = [
  ...taskSeeds,
  ...Array.from({ length: 13 }, (_, index) => {
    const source = taskSeeds[(index + 1) % taskSeeds.length]
    const priority: TaskRecord["priority"] = index % 3 === 0 ? "Medium" : "Low"

    return {
      ...source,
      id: `task-followup-${index + 11}`,
      due: followUpDueDates[index],
      title:
        index % 2 === 0
          ? "Review quote request follow up"
          : "Check carrier response timing",
      priority,
    }
  }),
]

export const quoteRequests: QuoteRequestRecord[] = [
  {
    id: "qr-bob-chubb-property",
    accountId: bobAccount.id,
    opportunityId: "opp-bob-renovation",
    carrier: "Chubb",
    channel: "Direct",
    line: "Commercial Property",
    status: "Declined",
    workflowState: "Closed decline",
    reason: "Outside appetite",
    lastActivity: "Aug 26, 2026",
    bestPremium: "-",
    nextAction: "Review wholesale path",
    assignee: "a@aol.com",
    due: "Sep 1, 2026",
    owner: "a@aol.com",
    underwriter: "Mia Chen",
    submissionMethod: "API submission",
    externalId: "CHB-78241",
    submittedValues: [
      { label: "Building TIV", value: "$6,800,000" },
      { label: "Protection class", value: "4" },
      { label: "Construction type", value: "Masonry non-combustible" },
      { label: "Deductible", value: "$10,000" },
    ],
    attempts: [
      {
        id: "attempt-chubb-1",
        label: "Initial submission",
        submittedAt: "Aug 24, 2026, 9:14 AM",
        submittedBy: "Switchboard agent",
        method: "API submission",
        outcome: "Declined",
        summary: "Carrier declined because the project TIV exceeded appetite.",
      },
    ],
    options: [],
    activity: [
      {
        id: "activity-chubb-created",
        timestamp: "Aug 24, 2026, 9:03 AM",
        actor: "a@aol.com",
        title: "Request created",
        detail: "Commercial Property request prepared for Chubb.",
      },
      {
        id: "activity-chubb-declined",
        timestamp: "Aug 26, 2026, 2:21 PM",
        actor: "Chubb",
        title: "Declined",
        detail: "Outside appetite: building TIV is above the admitted threshold.",
      },
    ],
  },
  {
    id: "qr-bob-cna-property",
    accountId: bobAccount.id,
    opportunityId: "opp-bob-renovation",
    carrier: "CNA",
    channel: "Direct",
    line: "Commercial Property",
    status: "Declined",
    workflowState: "Closed decline",
    reason: "Underwriting declination",
    lastActivity: "Aug 25, 2026",
    bestPremium: "-",
    nextAction: "No action",
    assignee: "a@aol.com",
    due: "Sep 2, 2026",
    owner: "a@aol.com",
    underwriter: "CNA property desk",
    submissionMethod: "Portal form",
    externalId: "CNA-PROP-9182",
    submittedValues: [
      { label: "Building TIV", value: "$6,800,000" },
      { label: "Roof age", value: "18 years" },
      { label: "Occupancy", value: "Municipal renovation site" },
    ],
    attempts: [
      {
        id: "attempt-cna-1",
        label: "Initial submission",
        submittedAt: "Aug 24, 2026, 10:02 AM",
        submittedBy: "Switchboard agent",
        method: "Portal form",
        outcome: "Declined",
        summary: "Carrier declined after underwriting review.",
      },
    ],
    options: [],
    activity: [
      {
        id: "activity-cna-created",
        timestamp: "Aug 24, 2026, 10:02 AM",
        actor: "Switchboard agent",
        title: "Request submitted",
        detail: "Portal application submitted with property schedule.",
      },
      {
        id: "activity-cna-declined",
        timestamp: "Aug 25, 2026, 4:12 PM",
        actor: "CNA",
        title: "Declined",
        detail: "Underwriter declined after reviewing occupancy and TIV.",
      },
    ],
  },
  {
    id: "qr-bob-amwins-property",
    accountId: bobAccount.id,
    opportunityId: "opp-bob-renovation",
    carrier: "Amwins",
    channel: "Wholesale",
    line: "Commercial Property",
    status: "Pending review",
    workflowState: "Waiting on broker",
    reason: "-",
    lastActivity: "Aug 27, 2026",
    bestPremium: "-",
    nextAction: "Check expected response time",
    assignee: "a@aol.com",
    due: "Sep 3, 2026",
    owner: "a@aol.com",
    underwriter: "Jordan Price",
    submissionMethod: "Underwriter email",
    externalId: "AMW-CP-5520",
    submittedValues: [
      { label: "Requested limit", value: "$5,000,000" },
      { label: "Deductible", value: "$25,000" },
      { label: "Submission package", value: "SOV, loss runs, statement of values" },
    ],
    attempts: [
      {
        id: "attempt-amwins-1",
        label: "Initial submission",
        submittedAt: "Aug 27, 2026, 8:48 AM",
        submittedBy: "a@aol.com",
        method: "Underwriter email",
        outcome: "Pending review",
        summary: "Wholesale submission acknowledged by Amwins.",
      },
    ],
    options: [],
    activity: [
      {
        id: "activity-amwins-sent",
        timestamp: "Aug 27, 2026, 8:48 AM",
        actor: "a@aol.com",
        title: "Submitted to wholesale",
        detail: "Package sent to Amwins for broader property appetite.",
      },
    ],
  },
  {
    id: "qr-bob-rt-specialty-property",
    accountId: bobAccount.id,
    opportunityId: "opp-bob-renovation",
    carrier: "RT Specialty",
    channel: "Wholesale",
    line: "Commercial Property",
    status: "Quoted",
    workflowState: "Option review",
    reason: "-",
    lastActivity: "Aug 24, 2026",
    bestPremium: "$41,200",
    nextAction: "Review returned option",
    assignee: "a@aol.com",
    due: "Sep 4, 2026",
    owner: "a@aol.com",
    underwriter: "Nina Alvarez",
    submissionMethod: "Underwriter email",
    externalId: "RTS-99743",
    submittedValues: [
      { label: "Requested limit", value: "$5,000,000" },
      { label: "Deductible", value: "$25,000" },
      { label: "Coverage form", value: "Special form" },
    ],
    attempts: [
      {
        id: "attempt-rt-1",
        label: "Initial submission",
        submittedAt: "Aug 23, 2026, 3:35 PM",
        submittedBy: "a@aol.com",
        method: "Underwriter email",
        outcome: "Quoted",
        summary: "Wholesale option returned with roof limitation endorsement.",
      },
    ],
    options: [
      {
        id: "option-rt-standard",
        label: "Standard deductible",
        premium: "$39,850",
        totalPremium: "$41,200",
        deductible: "$25,000",
        limit: "$5,000,000",
        conditions: "Roof limitation endorsement",
        quoteNumber: "RTS-99743-A",
        underwriter: "Nina Alvarez",
        sourceDocument: "RT Specialty quote.pdf",
        reviewStatus: "Extracted and reviewed",
        selected: true,
      },
    ],
    activity: [
      {
        id: "activity-rt-submitted",
        timestamp: "Aug 23, 2026, 3:35 PM",
        actor: "a@aol.com",
        title: "Request submitted",
        detail: "Submission package sent to RT Specialty.",
      },
      {
        id: "activity-rt-quoted",
        timestamp: "Aug 24, 2026, 11:16 AM",
        actor: "RT Specialty",
        title: "Quote returned",
        detail: "One option returned with a $41,200 total premium.",
      },
    ],
  },
  {
    id: "qr-bob-accident-fund-property",
    accountId: bobAccount.id,
    opportunityId: "opp-bob-renovation",
    carrier: "Accident Fund",
    channel: "Direct",
    line: "Commercial Property",
    status: "Quoted",
    workflowState: "Option review",
    reason: "-",
    lastActivity: "Aug 27, 2026",
    bestPremium: "$38,900",
    nextAction: "Compare option",
    assignee: "a@aol.com",
    due: "Sep 4, 2026",
    owner: "a@aol.com",
    underwriter: "Accident Fund property desk",
    submissionMethod: "API submission",
    externalId: "AF-33091",
    submittedValues: [
      { label: "Requested limit", value: "$5,000,000" },
      { label: "Deductible", value: "$50,000" },
      { label: "Coverage form", value: "Basic form" },
    ],
    attempts: [
      {
        id: "attempt-af-1",
        label: "Initial submission",
        submittedAt: "Aug 27, 2026, 9:20 AM",
        submittedBy: "Switchboard agent",
        method: "API submission",
        outcome: "Quoted",
        summary: "Direct carrier quote returned with higher deductible.",
      },
    ],
    options: [
      {
        id: "option-af-high-deductible",
        label: "High deductible",
        premium: "$37,250",
        totalPremium: "$38,900",
        deductible: "$50,000",
        limit: "$5,000,000",
        conditions: "Protective safeguards endorsement",
        quoteNumber: "AF-33091-B",
        underwriter: "Accident Fund property desk",
        sourceDocument: "Accident Fund quote.pdf",
        reviewStatus: "Extraction needs review",
      },
    ],
    activity: [
      {
        id: "activity-af-submitted",
        timestamp: "Aug 27, 2026, 9:20 AM",
        actor: "Switchboard agent",
        title: "Request submitted",
        detail: "API request submitted with updated property schedule.",
      },
      {
        id: "activity-af-quoted",
        timestamp: "Aug 27, 2026, 10:04 AM",
        actor: "Accident Fund",
        title: "Quote returned",
        detail: "One option returned with a $38,900 total premium.",
      },
    ],
  },
  {
    id: "qr-bob-hiscox-now-property",
    accountId: bobAccount.id,
    opportunityId: "opp-bob-renovation",
    carrier: "Hiscox Now",
    channel: "Direct",
    line: "Commercial Property",
    status: "Declined",
    workflowState: "Closed decline",
    reason: "Coverage not available",
    lastActivity: "Aug 25, 2026",
    bestPremium: "-",
    nextAction: "No action",
    assignee: "a@aol.com",
    due: "Sep 2, 2026",
    owner: "a@aol.com",
    underwriter: "Automated appetite check",
    submissionMethod: "API submission",
    externalId: "HSX-1140",
    submittedValues: [
      { label: "Line", value: "Commercial Property" },
      { label: "Construction class", value: "Renovation exposure" },
    ],
    attempts: [
      {
        id: "attempt-hiscox-1",
        label: "Initial submission",
        submittedAt: "Aug 25, 2026, 9:12 AM",
        submittedBy: "Switchboard agent",
        method: "API submission",
        outcome: "Declined",
        summary: "Carrier does not offer this property coverage for the exposure.",
      },
    ],
    options: [],
    activity: [
      {
        id: "activity-hiscox-declined",
        timestamp: "Aug 25, 2026, 9:13 AM",
        actor: "Hiscox Now",
        title: "Declined",
        detail: "Coverage not available for this exposure.",
      },
    ],
  },
  {
    id: "qr-bob-coterie-property",
    accountId: bobAccount.id,
    opportunityId: "opp-bob-renovation",
    carrier: "Coterie",
    channel: "Direct",
    line: "Commercial Property",
    status: "Missing information",
    workflowState: "Needs broker response",
    reason: "Additional information needed",
    lastActivity: "Aug 27, 2026",
    bestPremium: "-",
    nextAction: "Answer roof update question",
    assignee: "a@aol.com",
    due: "Sep 1, 2026",
    owner: "a@aol.com",
    underwriter: "Automated underwriting",
    submissionMethod: "API submission",
    externalId: "COT-66028",
    question: {
      prompt:
        "Confirm whether the municipal building roof will be fully replaced during the renovation or repaired in sections.",
      requestedBy: "Coterie automated underwriting",
      requestedAt: "Aug 27, 2026, 1:38 PM",
    },
    submittedValues: [
      { label: "Building TIV", value: "$6,800,000" },
      { label: "Roof age", value: "18 years" },
      { label: "Renovation scope", value: "Interior renovation and roof repairs" },
      { label: "Requested limit", value: "$5,000,000" },
    ],
    attempts: [
      {
        id: "attempt-coterie-1",
        label: "Initial submission",
        submittedAt: "Aug 27, 2026, 11:07 AM",
        submittedBy: "Switchboard agent",
        method: "API submission",
        outcome: "Missing information",
        summary: "Carrier requested clarification about roof replacement scope.",
      },
    ],
    options: [],
    activity: [
      {
        id: "activity-coterie-created",
        timestamp: "Aug 27, 2026, 11:07 AM",
        actor: "Switchboard agent",
        title: "Request submitted",
        detail: "Commercial Property request sent to Coterie.",
      },
      {
        id: "activity-coterie-question",
        timestamp: "Aug 27, 2026, 1:38 PM",
        actor: "Coterie",
        title: "Question received",
        detail: "Coterie requested roof replacement details before continuing.",
      },
    ],
  },
]

export function findTask(taskId?: string) {
  return tasks.find((task) => task.id === taskId) ?? tasks[0]
}

export function findAccount(accountId?: string) {
  return accounts.find((account) => account.id === accountId) ?? bobAccount
}

export function findOpportunity(opportunityId?: string) {
  return (
    opportunities.find((opportunity) => opportunity.id === opportunityId) ??
    opportunities[0]
  )
}

export function opportunityForAccount(accountId?: string) {
  return (
    opportunities.find((opportunity) => opportunity.accountId === accountId) ??
    opportunities[0]
  )
}

export function opportunitiesForAccount(accountId?: string) {
  const matches = opportunities.filter(
    (opportunity) => opportunity.accountId === accountId
  )

  return matches.length > 0 ? matches : [opportunities[0]]
}

export function quoteRequestsForOpportunity(opportunityId?: string) {
  return quoteRequests.filter((request) => request.opportunityId === opportunityId)
}

export function findQuoteRequest(quoteRequestId?: string) {
  return (
    quoteRequests.find((request) => request.id === quoteRequestId) ??
    quoteRequests[0]
  )
}
