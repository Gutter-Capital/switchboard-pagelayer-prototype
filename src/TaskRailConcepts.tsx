import { useMemo, useState } from "react"
import { Link } from "react-router"
import {
  ChevronRightIcon,
  ExternalLinkIcon,
  MailIcon,
  XIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  bobAccount,
  opportunities,
  quoteRequests,
  type OpportunityRecord,
  type QuoteRequestRecord,
  type QuoteRequestStatus,
} from "@/data"
import { cn } from "@/lib/utils"

type RailVariant = "tree" | "summary" | "attention"

type AccountOpportunityPreview = OpportunityRecord & {
  requests: QuoteRequestRecord[]
}

const concepts: Array<{
  description: string
  label: string
  variant: RailVariant
}> = [
  {
    description: "Preserves the account hierarchy.",
    label: "Opportunity tree",
    variant: "tree",
  },
  {
    description: "Compresses each line into outcomes.",
    label: "Outcome summary",
    variant: "summary",
  },
  {
    description: "Surfaces human attention first.",
    label: "Attention first",
    variant: "attention",
  },
]

const accountOpportunities: AccountOpportunityPreview[] = opportunities
  .filter((opportunity) => opportunity.accountId === bobAccount.id)
  .map((opportunity) => ({
    ...opportunity,
    requests: quoteRequests.filter(
      (request) => request.opportunityId === opportunity.id
    ),
  }))

const accountRequestCount = accountOpportunities.reduce(
  (count, opportunity) => count + opportunity.requests.length,
  0
)

const quotedRequestCount = accountOpportunities.reduce(
  (count, opportunity) =>
    count +
    opportunity.requests.filter((request) => request.status === "Quoted").length,
  0
)

export function TaskRailConceptsPage() {
  return (
    <main className="isolate min-h-svh bg-neutral-50 text-neutral-950 antialiased">
      <header className="border-b border-neutral-950/10 bg-white">
        <div className="mx-auto flex max-w-[100rem] flex-col gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              Task view rail directions
            </h1>
            <p className="max-w-[70ch] text-base text-pretty text-neutral-600 sm:text-sm">
              Three treatments of the same Bob Smith Construction task and
              account activity.
            </p>
          </div>
          <Button asChild className="self-start sm:self-auto" size="sm" variant="outline">
            <Link to="/tasks">Return to tasks</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-[100rem] px-4 py-6 sm:px-6">
        <div className="grid gap-5 xl:grid-cols-3">
          {concepts.map((concept, index) => (
            <div className="flex min-w-0 flex-col gap-3" key={concept.variant}>
              <div className="flex min-w-0 items-baseline justify-between gap-4 px-1">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    {index + 1}. {concept.label}
                  </div>
                  <p className="text-base text-pretty text-neutral-600 sm:text-sm">
                    {concept.description}
                  </p>
                </div>
                <div className="shrink-0 font-mono text-[0.6875rem] text-neutral-500">
                  420 px rail
                </div>
              </div>
              <TaskRailPreview label={concept.label} variant={concept.variant} />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

function TaskRailPreview({
  label,
  variant,
}: {
  label: string
  variant: RailVariant
}) {
  const [workCompletion, setWorkCompletion] = useState("")
  const [drafted, setDrafted] = useState(false)

  return (
    <article
      aria-label={`${label} task view rail`}
      className="flex h-[calc(100svh-10rem)] min-h-[46rem] max-h-[56rem] min-w-0 flex-col overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-neutral-950/10"
    >
      <header className="flex shrink-0 flex-col gap-2 border-b border-neutral-950/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-neutral-500">Task view</div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              asChild
              className="h-7 py-1.5 pr-2.5 pl-1.5 text-xs"
              size="sm"
              variant="outline"
            >
              <a href="mailto:mia@coterieinsurance.com?subject=Coterie%20underwriting%20information%20request">
                <MailIcon className="size-4 shrink-0" />
                Open in Mail
              </a>
            </Button>
            <Button asChild size="icon-sm" variant="ghost">
              <Link aria-label="Close task view" to="/tasks">
                <XIcon className="size-4 shrink-0" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge>High priority</Badge>
          <div className="text-sm tabular-nums text-neutral-500">
            Due Sep 1, 2026
          </div>
        </div>
        <h2 className="text-xl font-semibold text-balance">
          Coterie underwriting information request
        </h2>
        <p className="text-base text-pretty text-neutral-600 sm:text-sm">
          Two requested details were found. One answer still needs broker
          review before the carrier can continue.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <section className="p-4">
          <div className="flex flex-col gap-3 rounded-md border border-neutral-950/10 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-medium">Requested information</h3>
                <p className="text-base text-pretty text-neutral-600 sm:text-sm">
                  Two of three answers were found in the account intake.
                </p>
              </div>
              <Badge className="shrink-0" variant="secondary">
                2 of 3 found
              </Badge>
            </div>

            <div className="divide-y divide-neutral-950/10 border-y border-neutral-950/10">
              <InformationRow
                defaultValue="2019"
                id={`${variant}-roof-year`}
                label="Roof replacement year"
              />
              <InformationRow
                defaultValue="Standing-seam metal"
                id={`${variant}-roof-material`}
                label="Roofing material"
              />
              <InformationRow
                id={`${variant}-work-completion`}
                label="Completed before inspection"
                onChange={setWorkCompletion}
                placeholder="Enter answer"
                value={workCompletion}
              />
            </div>

            <Button
              disabled={workCompletion.trim().length === 0 || drafted}
              onClick={() => setDrafted(true)}
              type="button"
            >
              <MailIcon className="size-4 shrink-0" />
              {drafted ? "Response drafted" : "Draft carrier response"}
            </Button>
          </div>
        </section>

        <section className="flex flex-col gap-3 border-t border-neutral-950/10 py-4">
          <div className="flex items-start justify-between gap-4 px-4">
            <div className="min-w-0">
              <h3 className="font-semibold">Account opportunities</h3>
              <p className="text-base text-pretty text-neutral-600 sm:text-sm">
                Bob Smith Construction
              </p>
            </div>
            <div className="shrink-0 text-right text-[0.6875rem] tabular-nums text-neutral-500">
              {accountOpportunities.length} active · {accountRequestCount} requests ·{" "}
              {quotedRequestCount} quoted
            </div>
          </div>

          {variant === "tree" ? <OpportunityTree /> : null}
          {variant === "summary" ? <OutcomeSummary /> : null}
          {variant === "attention" ? <AttentionFirst /> : null}
        </section>
      </div>

      <footer className="shrink-0 border-t border-neutral-950/10 bg-white p-3">
        <Button asChild className="w-full" variant="outline">
          <Link to={`/accounts/${bobAccount.id}`}>
            <ExternalLinkIcon className="size-4 shrink-0" />
            Open account
          </Link>
        </Button>
      </footer>
    </article>
  )
}

function InformationRow({
  defaultValue,
  id,
  label,
  onChange,
  placeholder,
  value,
}: {
  defaultValue?: string
  id: string
  label: string
  onChange?: (value: string) => void
  placeholder?: string
  value?: string
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(8rem,9rem)] items-center gap-3 py-2.5">
      <label className="min-w-0 text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <Input
        className="h-8 min-w-0 text-sm"
        defaultValue={defaultValue}
        id={id}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={placeholder}
        value={value}
      />
    </div>
  )
}

function OpportunityTree() {
  return (
    <div className="border-y border-neutral-950/10" role="list">
      {accountOpportunities.map((opportunity) => (
        <div
          className="border-b border-neutral-950/10 last:border-b-0"
          key={opportunity.id}
          role="listitem"
        >
          <Link
            className="flex min-w-0 items-start justify-between gap-3 bg-neutral-50 px-4 py-2.5 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-500"
            to={opportunityHref(opportunity)}
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {opportunity.line}
              </div>
              <div className="truncate text-[0.6875rem] text-neutral-500">
                {opportunity.name}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <div className="text-[0.6875rem] tabular-nums text-neutral-500">
                {opportunity.requests.length === 0
                  ? opportunity.stage
                  : `${opportunity.requests.length} requests`}
              </div>
              <ChevronRightIcon className="size-4 shrink-0 stroke-neutral-400" />
            </div>
          </Link>

          {opportunity.requests.length > 0 ? (
            <div className="divide-y divide-neutral-950/10 pl-4">
              {opportunity.requests.map((request) => (
                <RequestRow key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Link
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-2.5 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-500"
              to={opportunityHref(opportunity)}
            >
              <div className="truncate text-sm text-neutral-600">
                {opportunity.nextAction}
              </div>
              <div className="text-[0.6875rem] tabular-nums text-neutral-500">
                {opportunity.effectiveDate}
              </div>
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

function OutcomeSummary() {
  return (
    <div className="divide-y divide-neutral-950/10 border-y border-neutral-950/10">
      {accountOpportunities.map((opportunity) => {
        const groupedRequests = groupRequestsByStatus(opportunity.requests)

        return (
          <section className="flex flex-col gap-2 px-4 py-3" key={opportunity.id}>
            <Link
              className="group flex min-w-0 items-start justify-between gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              to={opportunityHref(opportunity)}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold group-hover:underline">
                  {opportunity.line}
                </div>
                <div className="truncate text-[0.6875rem] text-neutral-500">
                  {opportunity.name}
                </div>
              </div>
              <Badge className="shrink-0" variant="secondary">
                {opportunity.stage}
              </Badge>
            </Link>

            {opportunity.requests.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {groupedRequests.map((group) => (
                  <div
                    className="grid grid-cols-[5.75rem_minmax(0,1fr)] items-baseline gap-2"
                    key={group.status}
                  >
                    <StatusLabel status={group.status} />
                    <div className="min-w-0 text-sm text-neutral-700">
                      {group.requests.map((request) => request.carrier).join(", ")}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 border-t border-neutral-950/10 pt-2">
                  <div className="text-[0.6875rem] text-neutral-500">
                    Best returned premium
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {bestPremium(opportunity.requests)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-[5.75rem_minmax(0,1fr)] gap-2">
                <div className="text-[0.6875rem] font-medium text-neutral-500">
                  Next
                </div>
                <div className="text-sm text-neutral-700">
                  {opportunity.nextAction}
                </div>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function AttentionFirst() {
  const requests = useMemo(
    () => accountOpportunities.flatMap((opportunity) => opportunity.requests),
    []
  )
  const statusSections: Array<{
    label: string
    requests: QuoteRequestRecord[]
    statuses: QuoteRequestStatus[]
  }> = [
    {
      label: "Needs attention",
      requests: requests.filter(
        (request) => request.status === "Missing information"
      ),
      statuses: ["Missing information"],
    },
    {
      label: "Quoted",
      requests: requests.filter((request) => request.status === "Quoted"),
      statuses: ["Quoted"],
    },
    {
      label: "In market",
      requests: requests.filter((request) => request.status === "Pending review"),
      statuses: ["Pending review"],
    },
    {
      label: "Closed",
      requests: requests.filter((request) => request.status === "Declined"),
      statuses: ["Declined"],
    },
  ]
  const notMarketed = accountOpportunities.filter(
    (opportunity) => opportunity.requests.length === 0
  )

  return (
    <div className="border-y border-neutral-950/10">
      {statusSections.map((section) => (
        <section className="border-b border-neutral-950/10" key={section.label}>
          <div className="flex items-center justify-between gap-3 bg-neutral-50 px-4 py-2">
            <div className="text-[0.6875rem] font-semibold text-neutral-700">
              {section.label}
            </div>
            <div className="text-[0.6875rem] tabular-nums text-neutral-500">
              {section.requests.length}
            </div>
          </div>
          <div className="divide-y divide-neutral-950/10 px-4">
            {section.requests.map((request) => (
              <RequestRow key={request.id} request={request} showLine />
            ))}
          </div>
        </section>
      ))}

      <section>
        <div className="flex items-center justify-between gap-3 bg-neutral-50 px-4 py-2">
          <div className="text-[0.6875rem] font-semibold text-neutral-700">
            Not yet marketed
          </div>
          <div className="text-[0.6875rem] tabular-nums text-neutral-500">
            {notMarketed.length}
          </div>
        </div>
        <div className="divide-y divide-neutral-950/10 px-4">
          {notMarketed.map((opportunity) => (
            <Link
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-500"
              key={opportunity.id}
              to={opportunityHref(opportunity)}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {opportunity.line}
                </div>
                <div className="truncate text-[0.6875rem] text-neutral-500">
                  {opportunity.nextAction}
                </div>
              </div>
              <div className="text-[0.6875rem] tabular-nums text-neutral-500">
                {opportunity.effectiveDate}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function RequestRow({
  request,
  showLine = false,
}: {
  request: QuoteRequestRecord
  showLine?: boolean
}) {
  return (
    <Link
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-500"
      to={requestHref(request)}
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{request.carrier}</div>
        {showLine ? (
          <div className="truncate text-[0.6875rem] text-neutral-500">
            {request.line}
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {request.bestPremium !== "-" ? (
          <div className="text-[0.6875rem] font-medium tabular-nums text-neutral-700">
            {compactPremium(request.bestPremium)}
          </div>
        ) : null}
        <StatusLabel status={request.status} />
      </div>
    </Link>
  )
}

function StatusLabel({ status }: { status: QuoteRequestStatus }) {
  const label =
    status === "Missing information"
      ? "Needs info"
      : status === "Pending review"
        ? "Pending"
        : status

  return (
    <div className="flex shrink-0 items-center gap-1.5 text-[0.6875rem] font-medium text-neutral-600">
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          status === "Missing information" && "bg-amber-500",
          status === "Pending review" && "bg-blue-500",
          status === "Quoted" && "bg-emerald-500",
          status === "Declined" && "bg-red-400"
        )}
      />
      <span>{label}</span>
    </div>
  )
}

function groupRequestsByStatus(requests: QuoteRequestRecord[]) {
  const statusOrder: QuoteRequestStatus[] = [
    "Missing information",
    "Quoted",
    "Pending review",
    "Declined",
  ]

  return statusOrder
    .map((status) => ({
      requests: requests.filter((request) => request.status === status),
      status,
    }))
    .filter((group) => group.requests.length > 0)
}

function bestPremium(requests: QuoteRequestRecord[]) {
  const premiums = requests
    .map((request) => Number(request.bestPremium.replace(/[^0-9.]/g, "")))
    .filter((premium) => Number.isFinite(premium) && premium > 0)

  if (premiums.length === 0) {
    return "No quotes yet"
  }

  return `$${Math.min(...premiums).toLocaleString()}`
}

function compactPremium(premium: string) {
  const value = Number(premium.replace(/[^0-9.]/g, ""))
  return Number.isFinite(value) ? `$${(value / 1000).toFixed(1)}k` : premium
}

function opportunityHref(opportunity: OpportunityRecord) {
  return `/accounts/${opportunity.accountId}/opportunities/${opportunity.id}`
}

function requestHref(request: QuoteRequestRecord) {
  return `/accounts/${request.accountId}/opportunities/${request.opportunityId}/quote-requests/${request.id}`
}
