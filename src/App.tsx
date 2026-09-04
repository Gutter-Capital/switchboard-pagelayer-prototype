import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BellIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  CircleUserRoundIcon,
  ClipboardCheckIcon,
  ExternalLinkIcon,
  FileSearch2Icon,
  FileTextIcon,
  LayoutDashboardIcon,
  MailIcon,
  PaperclipIcon,
  SearchIcon,
  SendIcon,
  SparklesIcon,
  SettingsIcon,
  StoreIcon,
  XIcon,
} from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  accounts,
  bobAccount,
  currentDateLabel,
  findAccount,
  findOpportunity,
  findQuoteRequest,
  findTask,
  opportunities,
  opportunitiesForAccount,
  quoteRequestsForOpportunity,
  tasks,
  type AccountRecord,
  type OriginKind,
  type OpportunityRecord,
  type QuoteRequestRecord,
  type QuoteRequestStatus,
  type TaskRecord,
} from "@/data"

type TasksCollectionState = {
  tab: "my" | "all"
  dueWindow: "today" | "week" | "upcoming"
  query: string
  selectedTaskId: string
  taskSheetMode: "context" | "action"
  taskSheetOpen: boolean
  scrollTop: number
  returnedFrom?: string
}

type AccountsCollectionState = {
  query: string
  owner: "all" | "a" | "matt"
  industry: "all" | "contractor" | "property" | "manufacturing"
  selectedAccountId: string
  scrollTop: number
  returnedFrom?: string
}

type QuoteRequestsTableState = {
  selectedRequestIds: string[]
}

type QuoteRequestInteractionState = {
  submittedResponses: Record<
    string,
    {
      body: string
      submittedAt: string
      submittedBy: string
    }
  >
}

type TaskOutcome = {
  completedAt: string
  result: string
  status:
    | "Ready to present"
    | "Sent"
    | "Waiting on carrier"
    | "Waiting on client"
}

type TaskInteractionState = {
  drafts: Record<string, string>
  noticeConfirmed: Record<string, boolean>
  outcomes: Record<string, TaskOutcome>
}

type PageLayerOrigin = {
  kind: OriginKind
  closePath: "/tasks" | "/accounts"
  direct: boolean
  historyIndex: number | null
  label: string
  tasksState?: TasksCollectionState
  accountsState?: AccountsCollectionState
}

type LayerLocationState = {
  pageLayerOrigin?: PageLayerOrigin
  activeTaskId?: string
}

type NavDestination = {
  label: string
  path: string
  kind:
    | OriginKind
    | "opportunities"
    | "quotes"
    | "markets"
    | "reports"
    | "settings"
  icon: React.ComponentType
}

const defaultTasksState: TasksCollectionState = {
  tab: "my",
  dueWindow: "upcoming",
  query: "Commercial Property",
  selectedTaskId: "task-bob-requote",
  taskSheetMode: "context",
  taskSheetOpen: false,
  scrollTop: 42,
}

const defaultAccountsState: AccountsCollectionState = {
  query: "a@aol.com",
  owner: "a",
  industry: "all",
  selectedAccountId: bobAccount.id,
  scrollTop: 36,
}

const defaultQuoteRequestsTableState: QuoteRequestsTableState = {
  selectedRequestIds: [
    "qr-bob-chubb-property",
    "qr-bob-cna-property",
    "qr-bob-hiscox-now-property",
  ],
}

const defaultQuoteRequestInteractionState: QuoteRequestInteractionState = {
  submittedResponses: {},
}

const defaultTaskInteractionState: TaskInteractionState = {
  drafts: {
    "task-bob-requote":
      "Hi Bob,\n\nCoterie is reviewing the property coverage for the municipal renovation project and needs a few roof details before they can continue:\n\n- Year the roof was last replaced\n- Roofing material\n- Whether the planned work will be complete before final inspection\n\nCould you send those details by Friday?\n\nThank you,\nAlex",
    "task-botl-info":
      "Hi Dana,\n\nTravelers has issued a cancellation notice for the property policy because the August installment remains unpaid. Payment must be received by September 12 to prevent cancellation on September 15, 2026.\n\nI have attached the carrier notice and payment instructions. Please let me know once payment has been submitted so I can confirm receipt with Travelers.\n\nThank you,\nAlex",
  },
  noticeConfirmed: {},
  outcomes: {},
}

const navDestinations: NavDestination[] = [
  {
    label: "Tasks",
    path: "/tasks",
    kind: "tasks",
    icon: ClipboardCheckIcon,
  },
  {
    label: "Accounts",
    path: "/accounts",
    kind: "accounts",
    icon: Building2Icon,
  },
  {
    label: "Opportunities",
    path: "/opportunities",
    kind: "opportunities",
    icon: BriefcaseBusinessIcon,
  },
  {
    label: "Quotes",
    path: "/quotes",
    kind: "quotes",
    icon: FileTextIcon,
  },
  {
    label: "Markets",
    path: "/markets",
    kind: "markets",
    icon: StoreIcon,
  },
  {
    label: "Reports",
    path: "/reports",
    kind: "reports",
    icon: LayoutDashboardIcon,
  },
  {
    label: "Settings",
    path: "/settings",
    kind: "settings",
    icon: SettingsIcon,
  },
]

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <PrototypeApp />
      </TooltipProvider>
    </BrowserRouter>
  )
}

function PrototypeApp() {
  const [tasksState, setTasksState] =
    useState<TasksCollectionState>(defaultTasksState)
  const [accountsState, setAccountsState] =
    useState<AccountsCollectionState>(defaultAccountsState)
  const [quoteRequestsTableState, setQuoteRequestsTableState] =
    useState<QuoteRequestsTableState>(defaultQuoteRequestsTableState)
  const [quoteRequestInteraction, setQuoteRequestInteraction] =
    useState<QuoteRequestInteractionState>(defaultQuoteRequestInteractionState)
  const [taskInteraction, setTaskInteraction] =
    useState<TaskInteractionState>(defaultTaskInteractionState)

  return (
    <SidebarProvider defaultOpen>
      <AppShell
        accountsState={accountsState}
        quoteRequestInteraction={quoteRequestInteraction}
        quoteRequestsTableState={quoteRequestsTableState}
        setAccountsState={setAccountsState}
        setQuoteRequestInteraction={setQuoteRequestInteraction}
        setQuoteRequestsTableState={setQuoteRequestsTableState}
        setTasksState={setTasksState}
        setTaskInteraction={setTaskInteraction}
        taskInteraction={taskInteraction}
        tasksState={tasksState}
      />
    </SidebarProvider>
  )
}

function AppShell({
  accountsState,
  quoteRequestInteraction,
  quoteRequestsTableState,
  setAccountsState,
  setQuoteRequestInteraction,
  setQuoteRequestsTableState,
  setTasksState,
  setTaskInteraction,
  taskInteraction,
  tasksState,
}: {
  accountsState: AccountsCollectionState
  quoteRequestInteraction: QuoteRequestInteractionState
  quoteRequestsTableState: QuoteRequestsTableState
  setAccountsState: React.Dispatch<React.SetStateAction<AccountsCollectionState>>
  setQuoteRequestInteraction: React.Dispatch<
    React.SetStateAction<QuoteRequestInteractionState>
  >
  setQuoteRequestsTableState: React.Dispatch<
    React.SetStateAction<QuoteRequestsTableState>
  >
  setTasksState: React.Dispatch<React.SetStateAction<TasksCollectionState>>
  setTaskInteraction: React.Dispatch<React.SetStateAction<TaskInteractionState>>
  taskInteraction: TaskInteractionState
  tasksState: TasksCollectionState
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const locationState = (location.state ?? {}) as LayerLocationState
  const isPageLayerOpen = isPageLayerPath(location.pathname)
  const directFallback = fallbackOriginKind(location.pathname)
  const pageLayerOrigin =
    locationState.pageLayerOrigin ??
    (isPageLayerOpen && directFallback
      ? createDirectOrigin(directFallback, tasksState, accountsState)
      : undefined)
  const activeTaskId =
    locationState.activeTaskId ??
    taskIdFromPath(location.pathname) ??
    pageLayerOrigin?.tasksState?.selectedTaskId
  const selectedNav = pageLayerOrigin?.kind ?? selectedRoot(location.pathname)

  const restoreOriginState = useCallback(
    (origin: PageLayerOrigin, returnedFrom: string) => {
      if (origin.kind === "tasks") {
        setTasksState({
          ...(origin.tasksState ?? defaultTasksState),
          returnedFrom,
        })
      } else {
        setAccountsState({
          ...(origin.accountsState ?? defaultAccountsState),
          returnedFrom,
        })
      }
    },
    [setAccountsState, setTasksState]
  )

  const closePageLayer = useCallback(() => {
    if (!pageLayerOrigin) {
      navigate(directFallback === "accounts" ? "/accounts" : "/tasks", {
        replace: true,
      })
      return
    }

    restoreOriginState(
      pageLayerOrigin,
      currentLayerLabel(location.pathname, location.hash)
    )

    if (pageLayerOrigin.direct) {
      navigate(pageLayerOrigin.closePath, { replace: true })
      return
    }

    const currentIndex = historyIndex()
    if (
      currentIndex !== null &&
      pageLayerOrigin.historyIndex !== null &&
      currentIndex > pageLayerOrigin.historyIndex
    ) {
      navigate(pageLayerOrigin.historyIndex - currentIndex)
      return
    }

    navigate(pageLayerOrigin.closePath)
  }, [
    directFallback,
    location.hash,
    location.pathname,
    navigate,
    pageLayerOrigin,
    restoreOriginState,
  ])

  const openTaskWorkspace = useCallback(
    (taskId: string, snapshot: TasksCollectionState) => {
      const origin: PageLayerOrigin = {
        kind: "tasks",
        closePath: "/tasks",
        direct: false,
        historyIndex: historyIndex(),
        label: "My Tasks",
        tasksState: snapshot,
      }

      navigate(`/tasks/${taskId}/workspace`, {
        state: { pageLayerOrigin: origin, activeTaskId: taskId },
      })
    },
    [navigate]
  )

  const openTaskAccountLayer = useCallback(
    (taskId: string, snapshot: TasksCollectionState) => {
      const task = findTask(taskId)
      const origin: PageLayerOrigin = {
        kind: "tasks",
        closePath: "/tasks",
        direct: false,
        historyIndex: historyIndex(),
        label: "My Tasks",
        tasksState: snapshot,
      }

      navigate(`/accounts/${task.accountId}`, {
        state: { pageLayerOrigin: origin, activeTaskId: taskId },
      })
    },
    [navigate]
  )

  const openAccountLayer = useCallback(
    (accountId: string, snapshot: AccountsCollectionState) => {
      const origin: PageLayerOrigin = {
        kind: "accounts",
        closePath: "/accounts",
        direct: false,
        historyIndex: historyIndex(),
        label: "Accounts",
        accountsState: snapshot,
      }

      navigate(`/accounts/${accountId}`, {
        state: { pageLayerOrigin: origin },
      })
    },
    [navigate]
  )

  const navigateInsideLayer = useCallback(
    (path: string, nextActiveTaskId = activeTaskId) => {
      if (!pageLayerOrigin) {
        navigate(path)
        return
      }

      navigate(path, {
        state: {
          pageLayerOrigin,
          ...(nextActiveTaskId ? { activeTaskId: nextActiveTaskId } : {}),
        },
      })
    },
    [activeTaskId, navigate, pageLayerOrigin]
  )

  const handleSidebarDestination = useCallback(
    (destination: NavDestination) => {
      if (
        isPageLayerOpen &&
        pageLayerOrigin &&
        destination.kind === pageLayerOrigin.kind
      ) {
        closePageLayer()
        return
      }

      navigate(destination.path)
    },
    [closePageLayer, isPageLayerOpen, navigate, pageLayerOrigin]
  )

  return (
    <div className="isolate flex min-h-svh w-full bg-background text-foreground">
      <AppSidebar
        onNavigate={handleSidebarDestination}
        selectedNav={selectedNav}
      />
      <SidebarInset className="min-w-0">
        <Routes>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route
            path="/tasks"
            element={
              <TasksCollection
                onOpenAccount={openTaskAccountLayer}
                onOpenWorkspace={openTaskWorkspace}
                setState={setTasksState}
                setTaskInteraction={setTaskInteraction}
                state={tasksState}
                taskInteraction={taskInteraction}
              />
            }
          />
          <Route
            path="/tasks/:taskId/quoting"
            element={
              <TaskQuoteRouteRedirect
                activeTaskId={activeTaskId}
                origin={pageLayerOrigin}
              />
            }
          />
          <Route
            path="/tasks/:taskId/workspace"
            element={
              <TaskWorkspaceLayer
                activeTaskId={activeTaskId}
                navigateInsideLayer={navigateInsideLayer}
                onClose={closePageLayer}
                origin={pageLayerOrigin}
                setTaskInteraction={setTaskInteraction}
                taskInteraction={taskInteraction}
              />
            }
          />
          <Route
            path="/accounts"
            element={
              <AccountsCollection
                onOpenAccount={openAccountLayer}
                setState={setAccountsState}
                state={accountsState}
              />
            }
          />
          <Route
            path="/accounts/:accountId"
            element={
              <AccountLayer
                activeTaskId={activeTaskId}
                navigateInsideLayer={navigateInsideLayer}
                onClose={closePageLayer}
                origin={pageLayerOrigin}
              />
            }
          />
          <Route
            path="/accounts/:accountId/opportunities/:opportunityId"
            element={
              <OpportunityLayer
                activeTaskId={activeTaskId}
                navigateInsideLayer={navigateInsideLayer}
                onClose={closePageLayer}
                origin={pageLayerOrigin}
                quoteRequestInteraction={quoteRequestInteraction}
                quoteRequestsTableState={quoteRequestsTableState}
                setQuoteRequestsTableState={setQuoteRequestsTableState}
              />
            }
          />
          <Route
            path="/accounts/:accountId/opportunities/:opportunityId/quote-requests/:quoteRequestId"
            element={
              <QuoteRequestLayer
                activeTaskId={activeTaskId}
                navigateInsideLayer={navigateInsideLayer}
                onClose={closePageLayer}
                origin={pageLayerOrigin}
                quoteRequestInteraction={quoteRequestInteraction}
                setQuoteRequestInteraction={setQuoteRequestInteraction}
              />
            }
          />
          <Route
            path="/accounts/:accountId/opportunities/:opportunityId/quoting"
            element={
              <AccountQuoteRouteRedirect
                activeTaskId={activeTaskId}
                origin={pageLayerOrigin}
              />
            }
          />
          <Route path="/opportunities" element={<OpportunitiesCollection />} />
          <Route
            path="/quotes"
            element={<PassiveDestination title="Quotes" />}
          />
          <Route
            path="/markets"
            element={<PassiveDestination title="Markets" />}
          />
          <Route
            path="/reports"
            element={<PassiveDestination title="Reports" />}
          />
          <Route
            path="/settings"
            element={<PassiveDestination title="Settings" />}
          />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </SidebarInset>
    </div>
  )
}

function AppSidebar({
  onNavigate,
  selectedNav,
}: {
  onNavigate: (destination: NavDestination) => void
  selectedNav: NavDestination["kind"]
}) {
  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b">
        <InputGroup>
          <InputGroupInput
            aria-label="Search"
            name="global-search"
            placeholder="Search"
          />
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu role="list">
              {navDestinations.map((destination) => {
                const Icon = destination.icon
                const active = selectedNav === destination.kind

                return (
                  <SidebarMenuItem key={destination.path}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link
                        aria-current={active ? "page" : undefined}
                        onClick={(event) => {
                          event.preventDefault()
                          onNavigate(destination)
                        }}
                        to={destination.path}
                      >
                        <Icon />
                        <span>{destination.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu role="list">
          <SidebarMenuItem>
            <SidebarMenuButton>
              <BellIcon />
              <span>Notifications</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <CircleHelpIcon />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <CircleUserRoundIcon />
                  <span>a@aol.com</span>
                  <ChevronDownIcon className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top">
                <DropdownMenuGroup>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Switch user</DropdownMenuItem>
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function TasksCollection({
  onOpenAccount,
  onOpenWorkspace,
  setState,
  setTaskInteraction,
  state,
  taskInteraction,
}: {
  onOpenAccount: (taskId: string, snapshot: TasksCollectionState) => void
  onOpenWorkspace: (taskId: string, snapshot: TasksCollectionState) => void
  setState: React.Dispatch<React.SetStateAction<TasksCollectionState>>
  setTaskInteraction: React.Dispatch<React.SetStateAction<TaskInteractionState>>
  state: TasksCollectionState
  taskInteraction: TaskInteractionState
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const filteredTasks = useMemo(() => {
    const query = state.query.trim().toLowerCase()

    return tasks.filter((task) => {
      const inTab = state.tab === "all" || task.assignee === "a@aol.com"
      const inWindow = state.dueWindow === "upcoming"
      const matchesQuery =
        !query ||
        [
          task.title,
          task.accountName,
          task.opportunityName,
          task.assignee,
          task.line,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)

      return inTab && inWindow && matchesQuery
    })
  }, [state.dueWindow, state.query, state.tab])
  const selectedTask =
    filteredTasks.find((task) => task.id === state.selectedTaskId) ??
    filteredTasks[0] ??
    tasks[0]

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = state.scrollTop
    }
  }, [state.scrollTop])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const isTaskSelectFocused =
        target instanceof Element &&
        Boolean(target.closest("[data-task-select-control]"))
      const isEditing =
        target instanceof Element &&
        !isTaskSelectFocused &&
        Boolean(
          target.closest(
            'input, textarea, select, [contenteditable="true"], [role="checkbox"], [role="textbox"], [role="tab"], [role="radio"]'
          )
        )

      if (
        event.defaultPrevented ||
        (event.key !== "ArrowDown" && event.key !== "ArrowUp") ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        isEditing ||
        !state.taskSheetOpen ||
        state.taskSheetMode !== "context" ||
        filteredTasks.length === 0
      ) {
        return
      }

      const currentIndex = filteredTasks.findIndex(
        (task) => task.id === selectedTask.id
      )

      if (currentIndex < 0) {
        return
      }

      const direction = event.key === "ArrowDown" ? 1 : -1
      const nextIndex = Math.min(
        Math.max(currentIndex + direction, 0),
        filteredTasks.length - 1
      )

      event.preventDefault()

      if (nextIndex === currentIndex) {
        return
      }

      setState((current) => ({
        ...current,
        scrollTop: scrollRef.current?.scrollTop ?? current.scrollTop,
        selectedTaskId: filteredTasks[nextIndex].id,
        taskSheetMode: "context",
      }))
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    filteredTasks,
    selectedTask.id,
    setState,
    state.taskSheetMode,
    state.taskSheetOpen,
  ])

  useLayoutEffect(() => {
    const selectedRow = scrollRef.current?.querySelector<HTMLElement>(
      `[data-task-id="${selectedTask.id}"]`
    )

    selectedRow?.scrollIntoView({ block: "nearest" })
  }, [selectedTask.id])

  const snapshot = () => ({
    ...state,
    selectedTaskId: selectedTask.id,
    scrollTop: scrollRef.current?.scrollTop ?? state.scrollTop,
  })

  return (
    <CollectionLayout
      detail={
        state.taskSheetOpen ? (
          <TaskContextPanel
            interaction={taskInteraction}
            mode={state.taskSheetMode}
            onBack={() =>
              setState((current) => ({
                ...current,
                taskSheetMode: "context",
              }))
            }
            onClose={() =>
              setState((current) => ({
                ...current,
                taskSheetMode: "context",
                taskSheetOpen: false,
              }))
            }
            onOpenAccount={() =>
              onOpenAccount(selectedTask.id, snapshot())
            }
            onOpenTask={() => {
              if (
                taskExperience(selectedTask).workspace === "review-quote" ||
                taskExperience(selectedTask).workspace === "generic"
              ) {
                onOpenWorkspace(selectedTask.id, snapshot())
                return
              }

              setState((current) => ({
                ...current,
                taskSheetMode: "action",
              }))
            }}
            returnedFrom={state.returnedFrom}
            setInteraction={setTaskInteraction}
            task={selectedTask}
          />
        ) : undefined
      }
      detailVariant="workspace"
      title="Tasks"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            onValueChange={(value) =>
              setState((current) => ({
                ...current,
                tab: value as TasksCollectionState["tab"],
              }))
            }
            value={state.tab}
          >
            <TabsList>
              <TabsTrigger value="my">My tasks</TabsTrigger>
              <TabsTrigger value="all">All tasks</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="text-sm text-muted-foreground tabular-nums">
            {currentDateLabel}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup
            onValueChange={(value) => {
              if (value) {
                setState((current) => ({
                  ...current,
                  dueWindow: value as TasksCollectionState["dueWindow"],
                }))
              }
            }}
            type="single"
            value={state.dueWindow}
            variant="outline"
          >
            <ToggleGroupItem value="today">Today</ToggleGroupItem>
            <ToggleGroupItem value="week">This week</ToggleGroupItem>
            <ToggleGroupItem value="upcoming">Upcoming</ToggleGroupItem>
          </ToggleGroup>
          <InputGroup className="max-w-xs">
            <InputGroupInput
              aria-label="Task search"
              name="task-search"
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  query: event.target.value,
                }))
              }
              placeholder="Search tasks"
              value={state.query}
            />
            <InputGroupAddon align="inline-start">
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <Badge variant="secondary">
            Assignee = a@aol.com, due date = Upcoming
          </Badge>
        </div>
        {state.returnedFrom ? (
          <div className="text-sm text-muted-foreground">
            Returned from {state.returnedFrom}
          </div>
        ) : null}
        <div
          className="min-h-0 flex-1 overflow-auto rounded-lg border"
          onScroll={(event) => {
            const scrollTop = event.currentTarget.scrollTop
            setState((current) => ({
              ...current,
              scrollTop,
            }))
          }}
          ref={scrollRef}
        >
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox aria-label="Select all tasks" />
                </TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Account</TableHead>
                <TableHead
                  className={state.taskSheetOpen ? "hidden" : undefined}
                >
                  Reference
                </TableHead>
                <TableHead>Priority</TableHead>
                <TableHead
                  className={state.taskSheetOpen ? "hidden" : undefined}
                >
                  Assignee
                </TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TaskTableRow
                  compact={state.taskSheetOpen}
                  key={task.id}
                  onSelect={() =>
                    setState((current) => ({
                      ...current,
                      selectedTaskId: task.id,
                      taskSheetMode: "context",
                      taskSheetOpen: true,
                    }))
                  }
                  selected={
                    state.taskSheetOpen && task.id === selectedTask.id
                  }
                  status={
                    taskInteraction.outcomes[task.id]?.status ?? task.status
                  }
                  task={task}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </CollectionLayout>
  )
}

function TaskTableRow({
  compact,
  onSelect,
  selected,
  status,
  task,
}: {
  compact: boolean
  onSelect: () => void
  selected: boolean
  status: string
  task: TaskRecord
}) {
  return (
    <TableRow
      aria-selected={selected}
      className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      data-task-id={task.id}
      data-state={selected ? "selected" : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onSelect()
        }
      }}
      tabIndex={0}
    >
      <TableCell>
        <Checkbox
          aria-label={`Select ${task.title}`}
          checked={selected}
          data-task-select-control
          onCheckedChange={onSelect}
        />
      </TableCell>
      <TableCell className="tabular-nums">{task.due}</TableCell>
      <TableCell className="max-w-48 whitespace-normal">
        {task.title}
      </TableCell>
      <TableCell>{task.accountName}</TableCell>
      <TableCell
        className={cn("max-w-56 whitespace-normal", compact && "hidden")}
      >
        {task.opportunityName}
      </TableCell>
      <TableCell>{task.priority}</TableCell>
      <TableCell className={cn(compact && "hidden")}>{task.assignee}</TableCell>
      <TableCell>
        <Badge variant={status === "Open" ? "outline" : "secondary"}>
          {status}
        </Badge>
      </TableCell>
    </TableRow>
  )
}

type TaskExperience = {
  actionLabel: string
  sourceExcerpt: string
  sourceLabel: string
  summary: string
  title: string
  workspace: "collect-information" | "review-quote" | "send-notice" | "generic"
}

const taskExperiences: Partial<Record<string, TaskExperience>> = {
  "task-bob-requote": {
    actionLabel: "Draft client request",
    sourceExcerpt:
      "Please confirm the roof replacement year, material, and whether the work will be completed before final inspection.",
    sourceLabel: "Coterie underwriting email - Aug 27, 2026",
    summary:
      "Coterie cannot finish reviewing the property submission until the roof details are confirmed.",
    title: "Coterie underwriting information request",
    workspace: "collect-information",
  },
  "task-bottle-review": {
    actionLabel: "Review renewal quote",
    sourceExcerpt:
      "The Hartford renewal proposal is ready for review. Premium and water-damage terms changed from the expiring policy.",
    sourceLabel: "Hartford renewal email - Aug 26, 2026",
    summary:
      "The renewal arrived with material coverage and premium changes that need a broker decision before it is presented.",
    title: "Hartford renewal quote",
    workspace: "review-quote",
  },
  "task-botl-info": {
    actionLabel: "Prepare client notice",
    sourceExcerpt:
      "Payment must be received by Sep 12 to prevent cancellation effective Sep 15, 2026.",
    sourceLabel: "Travelers cancellation notice - Aug 27, 2026",
    summary:
      "BOTL needs to receive the cancellation warning and payment instructions before the carrier deadline.",
    title: "Travelers cancellation notice",
    workspace: "send-notice",
  },
}

function taskExperience(task: TaskRecord): TaskExperience {
  return (
    taskExperiences[task.id] ?? {
      actionLabel: "Open task workspace",
      sourceExcerpt: `New activity requires follow-up on ${task.opportunityName}.`,
      sourceLabel: `Carrier activity - ${currentDateLabel}`,
      summary: `${task.title} is the next step needed to move this opportunity forward.`,
      title: task.title,
      workspace: "generic",
    }
  )
}

function TaskContextPanel({
  interaction,
  mode,
  onBack,
  onClose,
  onOpenAccount,
  onOpenTask,
  returnedFrom,
  setInteraction,
  task,
}: {
  interaction: TaskInteractionState
  mode: TasksCollectionState["taskSheetMode"]
  onBack: () => void
  onClose: () => void
  onOpenAccount: () => void
  onOpenTask: () => void
  returnedFrom?: string
  setInteraction: React.Dispatch<React.SetStateAction<TaskInteractionState>>
  task: TaskRecord
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const experience = taskExperience(task)
  const outcome = interaction.outcomes[task.id]
  const draft = interaction.drafts[task.id] ?? ""
  const noticeConfirmed = interaction.noticeConfirmed[task.id] ?? false

  const updateDraft = (value: string) => {
    setInteraction((current) => ({
      ...current,
      drafts: { ...current.drafts, [task.id]: value },
    }))
  }

  useLayoutEffect(() => {
    contentRef.current?.focus()
  }, [mode, task.id])

  const completeMessageTask = () => {
    const isInformationRequest = experience.workspace === "collect-information"

    setInteraction((current) => ({
      ...current,
      outcomes: {
        ...current.outcomes,
        [task.id]: {
          completedAt: "Aug 27, 2026, 2:18 PM",
          result: isInformationRequest
            ? "Client request sent to bob@bscbuilders.com"
            : "Cancellation notice and payment instructions sent to dana@botl.com",
          status: isInformationRequest ? "Waiting on client" : "Sent",
        },
      },
    }))
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const isEditing =
        target instanceof Element &&
        Boolean(
          target.closest(
            'a, button, input, textarea, select, [contenteditable="true"], [role="button"], [role="checkbox"], [role="textbox"]'
          )
        )

      if (
        event.defaultPrevented ||
        event.key !== "Enter" ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        mode !== "context" ||
        isEditing
      ) {
        return
      }

      event.preventDefault()
      onOpenTask()
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [mode, onOpenTask])

  return (
    <aside
      aria-label={`${experience.title} task view`}
      className="flex h-full min-h-0 flex-col bg-background outline-none"
      ref={contentRef}
      tabIndex={-1}
    >
      <header className="border-b p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          {mode === "action" ? (
            <Button
              className="w-fit"
              onClick={onBack}
              size="sm"
              type="button"
              variant="ghost"
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Back to task
            </Button>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              Task view
            </span>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Close task view"
                onClick={onClose}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <XIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close task view</TooltipContent>
          </Tooltip>
        </div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant={task.priority === "High" ? "default" : "secondary"}>
            {task.priority} priority
          </Badge>
          <span className="text-sm text-muted-foreground tabular-nums">
            Due {task.due}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-balance">
          {mode === "action" ? experience.actionLabel : experience.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          {task.accountName} / {task.opportunityName}
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {mode === "context" ? (
          <TaskContextOverview
            experience={experience}
            outcome={outcome}
            returnedFrom={returnedFrom}
            task={task}
          />
        ) : (
          <TaskMessageWorkspace
            draft={draft}
            experience={experience}
            noticeConfirmed={noticeConfirmed}
            onNoticeConfirmed={(checked) =>
              setInteraction((current) => ({
                ...current,
                noticeConfirmed: {
                  ...current.noticeConfirmed,
                  [task.id]: checked,
                },
              }))
            }
            outcome={outcome}
            task={task}
            updateDraft={updateDraft}
          />
        )}
      </div>

      <footer className="flex flex-col gap-2 border-t p-5">
        <Button onClick={onOpenAccount} type="button" variant="outline">
          <ExternalLinkIcon data-icon="inline-start" />
          Open account
        </Button>
        {mode === "context" ? (
          <Button
            aria-keyshortcuts="Enter"
            className="w-full justify-between"
            onClick={onOpenTask}
            type="button"
          >
            <span className="min-w-0 truncate">{experience.actionLabel}</span>
            <kbd className="rounded border border-primary-foreground/40 bg-primary-foreground/10 px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary-foreground/90">
              ENT
            </kbd>
          </Button>
        ) : outcome ? (
          <Button onClick={onBack} type="button">
            <CheckIcon data-icon="inline-start" />
            Back to task
          </Button>
        ) : (
          <Button
            disabled={
              draft.trim().length === 0 ||
              (experience.workspace === "send-notice" && !noticeConfirmed)
            }
            onClick={completeMessageTask}
            type="button"
          >
            <SendIcon data-icon="inline-start" />
            {experience.workspace === "collect-information"
              ? "Send request and wait for client"
              : "Send and record delivery"}
          </Button>
        )}
      </footer>
    </aside>
  )
}

function TaskContextOverview({
  experience,
  outcome,
  returnedFrom,
  task,
}: {
  experience: TaskExperience
  outcome?: TaskOutcome
  returnedFrom?: string
  task: TaskRecord
}) {
  return (
    <div className="flex flex-col gap-6">
      {outcome ? (
        <Alert>
          <CheckIcon />
          <AlertTitle>{outcome.status}</AlertTitle>
          <AlertDescription>
            {outcome.result}. Updated {outcome.completedAt}.
          </AlertDescription>
        </Alert>
      ) : returnedFrom ? (
        <Alert>
          <CircleHelpIcon />
          <AlertTitle>Returned from {returnedFrom}</AlertTitle>
          <AlertDescription>
            Your selected task and place in the list were preserved.
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="flex flex-col gap-2">
        <h3 className="font-medium">Why this task</h3>
        <p className="text-sm leading-6 text-muted-foreground text-pretty">
          {experience.summary}
        </p>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h3 className="font-medium">Account context</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
          <ContextItem label="Account" value={task.accountName} />
          <ContextItem label="Line" value={task.line} />
          <ContextItem label="Stage" value={task.stage} />
          <ContextItem label="Effective date" value={task.effectiveDate} />
        </dl>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <MailIcon />
          <h3 className="font-medium">Source</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {experience.sourceLabel}
        </p>
        <blockquote className="border-l-2 pl-4 text-sm leading-6 text-muted-foreground text-pretty">
          {experience.sourceExcerpt}
        </blockquote>
      </section>
    </div>
  )
}

function TaskMessageWorkspace({
  draft,
  experience,
  noticeConfirmed,
  onNoticeConfirmed,
  outcome,
  task,
  updateDraft,
}: {
  draft: string
  experience: TaskExperience
  noticeConfirmed: boolean
  onNoticeConfirmed: (checked: boolean) => void
  outcome?: TaskOutcome
  task: TaskRecord
  updateDraft: (value: string) => void
}) {
  const isInformationRequest = experience.workspace === "collect-information"

  if (outcome) {
    return (
      <div className="flex flex-col gap-6">
        <Alert>
          <CheckIcon />
          <AlertTitle>{outcome.status}</AlertTitle>
          <AlertDescription>{outcome.result}</AlertDescription>
        </Alert>
        <ContextItem label="Completed" value={outcome.completedAt} />
        <ContextItem label="Message" value={draft} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {isInformationRequest ? (
        <Alert>
          <CircleHelpIcon />
          <AlertTitle>Coterie needs three roof details</AlertTitle>
          <AlertDescription>
            Replacement year, roofing material, and completion timing are not in
            the current submission.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <CircleHelpIcon />
          <AlertTitle>Cancellation scheduled for Sep 15, 2026</AlertTitle>
          <AlertDescription>
            Travelers must receive payment by Sep 12 to prevent cancellation.
          </AlertDescription>
        </Alert>
      )}

      <section className="flex flex-col gap-3">
        <h3 className="font-medium">
          {isInformationRequest ? "Information needed" : "Notice package"}
        </h3>
        <ul className="divide-y border-y text-sm">
          {(isInformationRequest
            ? [
                "Roof replacement year",
                "Roofing material",
                "Completion before final inspection",
              ]
            : [
                "Travelers cancellation notice",
                "Online payment instructions",
                "Agency contact information",
              ]
          ).map((item) => (
            <li className="flex items-center justify-between gap-4 py-3" key={item}>
              <span>{item}</span>
              <Badge variant="secondary">
                {isInformationRequest ? "Missing" : "Attached"}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <SparklesIcon />
          <h3 className="font-medium">AI-prepared message</h3>
        </div>
        <FieldGroup>
          <Field>
            <FieldLabel>To</FieldLabel>
            <InputGroup>
              <InputGroupInput
                readOnly
                value={isInformationRequest ? "bob@bscbuilders.com" : "dana@botl.com"}
              />
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel>Subject</FieldLabel>
            <InputGroup>
              <InputGroupInput
                readOnly
                value={
                  isInformationRequest
                    ? "Roof details needed for Coterie"
                    : "Action required: Travelers cancellation notice"
                }
              />
            </InputGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor={`task-message-${task.id}`}>Message</FieldLabel>
            <Textarea
              className="min-h-56 resize-y"
              id={`task-message-${task.id}`}
              onChange={(event) => updateDraft(event.target.value)}
              value={draft}
            />
            <FieldDescription>
              Review the AI draft before sending it to the client.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </section>

      {!isInformationRequest ? (
        <FieldSet>
          <FieldLegend>Before sending</FieldLegend>
          <FieldGroup>
            <Field orientation="horizontal">
              <Checkbox
                checked={noticeConfirmed}
                id="confirm-cancellation-notice"
                onCheckedChange={(checked) => onNoticeConfirmed(checked === true)}
              />
              <FieldLabel htmlFor="confirm-cancellation-notice">
                I verified the cancellation date, client recipient, and attached
                carrier notice.
              </FieldLabel>
            </Field>
          </FieldGroup>
        </FieldSet>
      ) : null}
    </div>
  )
}

function AccountsCollection({
  onOpenAccount,
  setState,
  state,
}: {
  onOpenAccount: (accountId: string, snapshot: AccountsCollectionState) => void
  setState: React.Dispatch<React.SetStateAction<AccountsCollectionState>>
  state: AccountsCollectionState
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollSnapshotRef = useRef(state.scrollTop)
  const scrollCommitTimeoutRef = useRef<number | undefined>(undefined)
  const filteredAccounts = useMemo(() => {
    const query = state.query.trim().toLowerCase()

    return accounts.filter((account) => {
      const ownerMatch =
        state.owner === "all" ||
        (state.owner === "a" && account.owner === "a@aol.com") ||
        (state.owner === "matt" && account.owner === "matt@aol.com")
      const industryMatch =
        state.industry === "all" ||
        account.industry.toLowerCase().includes(state.industry)
      const queryMatch =
        !query ||
        [
          account.name,
          account.dba,
          account.industry,
          account.businessType,
          account.owner,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)

      return ownerMatch && industryMatch && queryMatch
    })
  }, [state.industry, state.owner, state.query])
  const selectedAccount =
    filteredAccounts.find((account) => account.id === state.selectedAccountId) ??
    filteredAccounts[0] ??
    bobAccount

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = state.scrollTop
    }
  }, [state.scrollTop])

  const snapshotFor = (accountId: string) => ({
    ...state,
    selectedAccountId: accountId,
    scrollTop: scrollSnapshotRef.current,
  })

  return (
    <CollectionLayout title="Accounts">
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="segments">Segments</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="text-sm text-muted-foreground tabular-nums">
            {currentDateLabel}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <InputGroup className="max-w-xs">
            <InputGroupInput
              aria-label="Account search"
              name="account-search"
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  query: event.target.value,
                }))
              }
              placeholder="Search accounts"
              value={state.query}
            />
            <InputGroupAddon align="inline-start">
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <Select
            onValueChange={(value) =>
              setState((current) => ({
                ...current,
                owner: value as AccountsCollectionState["owner"],
              }))
            }
            value={state.owner}
          >
            <SelectTrigger aria-label="Owner filter">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Owner: All</SelectItem>
                <SelectItem value="a">Owner: a@aol.com</SelectItem>
                <SelectItem value="matt">Owner: matt@aol.com</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              setState((current) => ({
                ...current,
                industry: value as AccountsCollectionState["industry"],
              }))
            }
            value={state.industry}
          >
            <SelectTrigger aria-label="Industry filter">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Industry: All</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {state.returnedFrom ? (
          <div className="text-sm text-muted-foreground">
            Returned from {state.returnedFrom}
          </div>
        ) : null}
        <div
          className="min-h-0 flex-1 overflow-auto rounded-lg border"
          onScroll={(event) => {
            const scrollTop = event.currentTarget.scrollTop
            if (scrollCommitTimeoutRef.current !== undefined) {
              window.clearTimeout(scrollCommitTimeoutRef.current)
            }
            scrollCommitTimeoutRef.current = window.setTimeout(() => {
              scrollSnapshotRef.current = scrollTop
            }, 120)
            setState((current) => ({
              ...current,
              scrollTop,
            }))
          }}
          ref={scrollRef}
        >
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>DBA</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Business type</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow
                  data-state={
                    account.id === selectedAccount.id ? "selected" : undefined
                  }
                  key={account.id}
                  onClick={() =>
                    setState((current) => ({
                      ...current,
                      selectedAccountId: account.id,
                    }))
                  }
                >
                  <TableCell>
                    <Link
                      className="block rounded-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={(event) => {
                        event.preventDefault()
                        onOpenAccount(account.id, snapshotFor(account.id))
                      }}
                      to={`/accounts/${account.id}`}
                    >
                      {account.name}
                    </Link>
                  </TableCell>
                  <TableCell>{account.dba}</TableCell>
                  <TableCell>{account.industry}</TableCell>
                  <TableCell>{account.businessType}</TableCell>
                  <TableCell>{account.owner}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </CollectionLayout>
  )
}

function OpportunitiesCollection() {
  const [selectedId, setSelectedId] = useState(opportunities[0].id)
  const selected = findOpportunity(selectedId)

  return (
    <CollectionLayout
      detail={<OpportunityDetails opportunity={selected} />}
      title="Opportunities"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="text-sm text-muted-foreground tabular-nums">
            {currentDateLabel}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <InputGroup className="max-w-xs">
            <InputGroupInput
              aria-label="Opportunity search"
              name="opportunity-search"
              placeholder="Search opportunities"
            />
            <InputGroupAddon align="inline-start">
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <Select defaultValue="all">
            <SelectTrigger aria-label="Opportunity owner filter">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Owner: All</SelectItem>
                <SelectItem value="a">Owner: a@aol.com</SelectItem>
                <SelectItem value="matt">Owner: matt@aol.com</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger aria-label="Opportunity stage filter">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Stage: All</SelectItem>
                <SelectItem value="quoting">Quoting in progress</SelectItem>
                <SelectItem value="preparing">Preparing application</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="min-h-0 flex-1 overflow-auto rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>Account / Opportunity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Effective date</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Quoting progress</TableHead>
                <TableHead>Next action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow
                  data-state={
                    selected.id === opportunity.id ? "selected" : undefined
                  }
                  key={opportunity.id}
                  onClick={() => setSelectedId(opportunity.id)}
                >
                  <TableCell className="max-w-64 whitespace-normal">
                    <div className="flex flex-col gap-1">
                      <span>{opportunity.accountName}</span>
                      <span className="text-muted-foreground">
                        {opportunity.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{opportunity.type}</TableCell>
                  <TableCell>{opportunity.stage}</TableCell>
                  <TableCell className="tabular-nums">
                    {opportunity.effectiveDate}
                  </TableCell>
                  <TableCell>{opportunity.owner}</TableCell>
                  <TableCell className="max-w-64 whitespace-normal">
                    {opportunity.quotingProgress}
                  </TableCell>
                  <TableCell>{opportunity.nextAction}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </CollectionLayout>
  )
}

function PassiveDestination({ title }: { title: string }) {
  return (
    <div className="flex min-h-svh flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-2xl font-semibold text-balance">{title}</h1>
        </div>
        <div className="text-sm text-muted-foreground tabular-nums">
          {currentDateLabel}
        </div>
      </div>
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        No rows in this prototype.
      </div>
    </div>
  )
}

function CollectionLayout({
  children,
  detail,
  detailVariant = "rail",
  title,
}: {
  children: ReactNode
  detail?: ReactNode
  detailVariant?: "rail" | "workspace"
  title: string
}) {
  const hasWorkspaceDetail = Boolean(detail && detailVariant === "workspace")

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col",
        hasWorkspaceDetail ? "min-h-svh xl:h-svh" : "h-svh"
      )}
    >
      <div
        className={cn(
          "grid min-h-0 flex-1 grid-cols-1",
          detail &&
            (hasWorkspaceDetail
              ? "xl:grid-cols-[minmax(0,3fr)_minmax(28rem,2fr)]"
              : "xl:grid-cols-[minmax(0,1fr)_20rem]")
        )}
      >
        <main
          className={cn(
            "flex min-h-0 min-w-0 flex-col gap-6 p-4 sm:p-6",
            hasWorkspaceDetail && "min-h-[34rem] xl:min-h-0"
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-2xl font-semibold text-balance">{title}</h1>
          </div>
          {children}
        </main>
        {detail ? (
          <aside
            className={cn(
              "min-h-0 border-t xl:border-l xl:border-t-0",
              hasWorkspaceDetail
                ? "min-h-[32rem] overflow-hidden"
                : "p-4 sm:p-6"
            )}
          >
            {detail}
          </aside>
        ) : null}
      </div>
    </div>
  )
}

function DetailRail({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <h2 className="text-lg font-semibold text-balance">{title}</h2>
      <div className="flex flex-col gap-4 text-sm">{children}</div>
    </div>
  )
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="font-medium">{label}</div>
      <div className="text-muted-foreground">{value}</div>
    </div>
  )
}

type LayerRouteProps = {
  activeTaskId?: string
  breadcrumb?: ReactNode
  navigateInsideLayer: (path: string, activeTaskId?: string) => void
  onClose: () => void
  origin?: PageLayerOrigin
}

type OpportunityLayerProps = LayerRouteProps & {
  quoteRequestInteraction: QuoteRequestInteractionState
  quoteRequestsTableState: QuoteRequestsTableState
  setQuoteRequestsTableState: React.Dispatch<
    React.SetStateAction<QuoteRequestsTableState>
  >
}

type QuoteRequestLayerProps = LayerRouteProps & {
  quoteRequestInteraction: QuoteRequestInteractionState
  setQuoteRequestInteraction: React.Dispatch<
    React.SetStateAction<QuoteRequestInteractionState>
  >
}

type TaskWorkspaceLayerProps = LayerRouteProps & {
  setTaskInteraction: React.Dispatch<React.SetStateAction<TaskInteractionState>>
  taskInteraction: TaskInteractionState
}

const renewalComparisonRows = [
  {
    change: "+$5,080",
    expiring: "$42,180",
    label: "Annual premium",
    renewal: "$47,260",
    tone: "material",
  },
  {
    change: "+$400,000",
    expiring: "$5,000,000",
    label: "Building limit",
    renewal: "$5,400,000",
    tone: "positive",
  },
  {
    change: "No change",
    expiring: "$10,000",
    label: "All other perils deductible",
    renewal: "$10,000",
    tone: "neutral",
  },
  {
    change: "+$15,000",
    expiring: "$10,000",
    label: "Wind / hail deductible",
    renewal: "$25,000",
    tone: "material",
  },
  {
    change: "Reduced",
    expiring: "Full limit",
    label: "Water damage",
    renewal: "$250,000 sublimit",
    tone: "material",
  },
]

function TaskWorkspaceLayer(props: TaskWorkspaceLayerProps) {
  const { taskId } = useParams()
  const task = findTask(taskId ?? props.activeTaskId)
  const account = findAccount(task.accountId)
  const opportunity = findOpportunity(task.opportunityId)
  const experience = taskExperience(task)
  const outcome = props.taskInteraction.outcomes[task.id]

  const completeReview = (
    status: TaskOutcome["status"],
    result: string
  ) => {
    props.setTaskInteraction((current) => ({
      ...current,
      outcomes: {
        ...current.outcomes,
        [task.id]: {
          completedAt: "Aug 27, 2026, 2:24 PM",
          result,
          status,
        },
      },
    }))
  }

  if (experience.workspace !== "review-quote") {
    return (
      <PageLayerFrame
        {...props}
        breadcrumb={
          <ObjectBreadcrumb
            activeTaskId={task.id}
            items={[{ current: true, label: task.title }]}
            navigateInsideLayer={props.navigateInsideLayer}
          />
        }
      >
        <section className="flex max-w-3xl flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Badge className="w-fit" variant="outline">
              Task workspace
            </Badge>
            <h1 className="text-2xl font-semibold text-balance">{task.title}</h1>
            <p className="text-sm text-muted-foreground text-pretty">
              {experience.summary}
            </p>
          </div>
          <div className="grid gap-4 border-y py-4 md:grid-cols-4">
            <ContextItem label="Account" value={task.accountName} />
            <ContextItem label="Line" value={task.line} />
            <ContextItem label="Due" value={task.due} />
            <ContextItem label="Assignee" value={task.assignee} />
          </div>
          <Button
            className="w-fit"
            onClick={() =>
              props.navigateInsideLayer(`/accounts/${account.id}`, task.id)
            }
            type="button"
          >
            <ExternalLinkIcon data-icon="inline-start" />
            Open account
          </Button>
        </section>
      </PageLayerFrame>
    )
  }

  return (
    <PageLayerFrame
      {...props}
      breadcrumb={
        <ObjectBreadcrumb
          activeTaskId={task.id}
          items={[
            { label: "My tasks", path: "/tasks" },
            { current: true, label: task.title },
          ]}
          navigateInsideLayer={props.navigateInsideLayer}
        />
      }
    >
      <section className="flex min-w-0 flex-col gap-6">
        <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Renewal quote</Badge>
              <Badge variant="secondary">Review required</Badge>
              <span className="text-sm text-muted-foreground tabular-nums">
                Due {task.due}
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <h1 className="text-2xl font-semibold text-balance">
                Review Hartford renewal quote
              </h1>
              <p className="max-w-[68ch] text-sm text-muted-foreground text-pretty">
                Compare the renewal against the expiring policy and decide what
                should happen before the terms are presented to the client.
              </p>
            </div>
          </div>
          <Button
            onClick={() =>
              props.navigateInsideLayer(`/accounts/${account.id}`, task.id)
            }
            type="button"
            variant="outline"
          >
            <ExternalLinkIcon data-icon="inline-start" />
            Open account
          </Button>
        </div>

        <section className="grid gap-4 border-y py-4 md:grid-cols-5">
          <ContextItem label="Account" value={account.name} />
          <ContextItem label="Opportunity" value={opportunity.name} />
          <ContextItem label="Carrier" value="The Hartford" />
          <ContextItem label="Effective date" value={task.effectiveDate} />
          <ContextItem label="Owner" value={task.assignee} />
        </section>

        {outcome ? (
          <Alert>
            <CheckIcon />
            <AlertTitle>{outcome.status}</AlertTitle>
            <AlertDescription>
              {outcome.result}. Updated {outcome.completedAt}.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <SparklesIcon />
            <AlertTitle>Two changes need attention</AlertTitle>
            <AlertDescription>
              Premium increased 12%, and water damage moved from the full limit
              to a $250,000 sublimit. The wind and hail deductible also increased.
            </AlertDescription>
          </Alert>
        )}

        <section className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-balance">
                Coverage comparison
              </h2>
              <p className="text-sm text-muted-foreground">
                Expiring policy versus the proposed renewal.
              </p>
            </div>
            <div className="overflow-x-auto border-y">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Expiring</TableHead>
                    <TableHead>Renewal</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renewalComparisonRows.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      <TableCell className="tabular-nums">{row.expiring}</TableCell>
                      <TableCell className="tabular-nums">{row.renewal}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.tone === "material" ? "secondary" : "outline"
                          }
                        >
                          {row.change}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <aside className="flex min-w-0 flex-col gap-6 lg:border-l lg:pl-6">
            <section className="flex flex-col gap-3">
              <h2 className="font-semibold">Client priorities</h2>
              <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <ChevronRightIcon className="shrink-0" />
                  Keep annual property premium below $50,000.
                </li>
                <li className="flex gap-2">
                  <ChevronRightIcon className="shrink-0" />
                  Avoid a restricted water-damage limit.
                </li>
                <li className="flex gap-2">
                  <ChevronRightIcon className="shrink-0" />
                  Deductibles up to $25,000 are acceptable.
                </li>
              </ul>
            </section>
            <Separator />
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <PaperclipIcon />
                <h2 className="font-semibold">Source</h2>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <span className="font-medium">Hartford renewal proposal.pdf</span>
                <span className="text-muted-foreground">18 pages / received Aug 26</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSearch2Icon />
                Extracted terms checked against the source document
              </div>
            </section>
          </aside>
        </section>

        <section className="flex flex-wrap items-center justify-end gap-2 border-t pt-5">
          <Button
            onClick={() =>
              completeReview(
                "Waiting on carrier",
                "Revision request prepared for the Hartford underwriter"
              )
            }
            type="button"
            variant="outline"
          >
            Request changes
          </Button>
          <Button
            onClick={() =>
              completeReview(
                "Ready to present",
                "Renewal terms approved for the client proposal"
              )
            }
            type="button"
          >
            Prepare client proposal
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </section>
      </section>
    </PageLayerFrame>
  )
}

function TaskQuoteRouteRedirect({
  activeTaskId,
  origin,
}: Pick<LayerRouteProps, "activeTaskId" | "origin">) {
  const { taskId } = useParams()
  const task = findTask(taskId ?? activeTaskId)

  return (
    <Navigate
      replace
      state={{
        ...(origin ? { pageLayerOrigin: origin } : {}),
        activeTaskId: task.id,
      }}
      to={taskQuoteDestinationPath(task)}
    />
  )
}

function AccountQuoteRouteRedirect({
  activeTaskId,
  origin,
}: Pick<LayerRouteProps, "activeTaskId" | "origin">) {
  const { accountId, opportunityId } = useParams()
  const account = findAccount(accountId)
  const opportunity = findOpportunity(opportunityId)

  return (
    <Navigate
      replace
      state={{
        ...(origin ? { pageLayerOrigin: origin } : {}),
        ...(activeTaskId ? { activeTaskId } : {}),
      }}
      to={`/accounts/${account.id}/opportunities/${opportunity.id}#quote-requests`}
    />
  )
}

function AccountLayer(props: LayerRouteProps) {
  const { accountId } = useParams()
  const account = findAccount(accountId)
  const accountOpportunities = opportunitiesForAccount(account.id)
  const primaryOpportunity = accountOpportunities[0]
  const activePolicy =
    account.id === "acct-bob-smith-construction"
      ? {
          carrier: "The Hartford E&S Binding",
          name: "Bob Smith Construction search demo policy",
          number: "POL-BSC-2026-RENOVATION",
        }
      : account.id === "acct-bottle-bay"
        ? {
            carrier: "The Hartford",
            name: "Bottle Bay commercial property policy",
            number: "POL-BBP-2026-1048",
          }
        : {
            carrier: "Current carrier",
            name: `${account.name} active policy`,
            number: "Policy on file",
          }

  return (
    <PageLayerFrame {...props}>
      <section className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-balance">
            {account.name}
          </h1>
          <div className="grid gap-4 border-y py-4 md:grid-cols-4">
            <ContextItem label="DBA" value={account.dba} />
            <ContextItem label="Industry" value={account.industry} />
            <ContextItem label="Business type" value={account.businessType} />
            <ContextItem label="Owner" value={account.owner} />
          </div>
        </div>
        <Tabs defaultValue="current-work">
          <TabsList>
            <TabsTrigger value="current-work">Opportunities</TabsTrigger>
            <TabsTrigger value="activity">Recent activity</TabsTrigger>
          </TabsList>
        </Tabs>
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-balance">
                Opportunities
              </h2>
              <p className="text-sm text-muted-foreground text-pretty">
                {accountOpportunities.length} open opportunities across the
                account.
              </p>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Effective date</TableHead>
                <TableHead>Win probability</TableHead>
                <TableHead>Next action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountOpportunities.map((opportunity, index) => (
                <TableRow
                  data-state={index === 0 ? "selected" : undefined}
                  key={opportunity.id}
                >
                  <TableCell className="max-w-72 whitespace-normal">
                    <Link
                      className="block rounded-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onClick={(event) => {
                        event.preventDefault()
                        props.navigateInsideLayer(
                          `/accounts/${account.id}/opportunities/${opportunity.id}`
                        )
                      }}
                      to={`/accounts/${account.id}/opportunities/${opportunity.id}`}
                    >
                      {opportunity.name}
                    </Link>
                  </TableCell>
                  <TableCell>{opportunity.type}</TableCell>
                  <TableCell>{opportunity.stage}</TableCell>
                  <TableCell className="tabular-nums">
                    {opportunity.effectiveDate}
                  </TableCell>
                  <TableCell>{opportunity.winProbability}</TableCell>
                  <TableCell className="max-w-64 whitespace-normal">
                    {opportunity.nextAction}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
        <section className="grid gap-4 border-t pt-4 md:grid-cols-3">
          <ContextItem label="Active policy" value={activePolicy.name} />
          <ContextItem label="Carrier" value={activePolicy.carrier} />
          <ContextItem label="Policy number" value={activePolicy.number} />
        </section>
        <section className="grid gap-4 border-t pt-4 md:grid-cols-3">
          <ContextItem
            label="Primary follow-up"
            value={primaryOpportunity.nextAction}
          />
          <ContextItem label="Priority stage" value={primaryOpportunity.stage} />
          <ContextItem
            label="Upcoming effective date"
            value={primaryOpportunity.effectiveDate}
          />
        </section>
      </section>
    </PageLayerFrame>
  )
}

function OpportunityLayer(props: OpportunityLayerProps) {
  const { accountId, opportunityId } = useParams()
  const location = useLocation()
  const account = findAccount(accountId)
  const opportunity = findOpportunity(opportunityId)
  const opportunityQuoteRequests = quoteRequestsForOpportunity(opportunity.id)
  const quotingSummary = quoteRequestSummaryText(
    opportunityQuoteRequests,
    props.quoteRequestInteraction
  )

  useLayoutEffect(() => {
    if (location.hash !== "#quote-requests") {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById("quote-requests")
        ?.scrollIntoView({ block: "start" })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [location.hash, opportunity.id])

  return (
    <PageLayerFrame
      {...props}
      breadcrumb={
        <ObjectBreadcrumb
          activeTaskId={props.activeTaskId}
          items={[
            {
              label: account.name,
              path: `/accounts/${account.id}`,
            },
            {
              current: true,
              label: opportunity.name,
            },
          ]}
          navigateInsideLayer={props.navigateInsideLayer}
        />
      }
    >
      <section className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-balance">
            {opportunity.name}
          </h1>
          <p className="max-w-[68ch] text-sm text-muted-foreground text-pretty">
            {account.name} is working through {opportunity.line ?? "coverage"}{" "}
            for {opportunity.effectiveDate}:{" "}
            {quotingSummary || opportunity.quotingProgress}.
          </p>
        </div>
        <div className="grid gap-4 border-y py-4 md:grid-cols-6">
          <ContextItem label="Account" value={account.name} />
          <ContextItem
            label="Line"
            value={opportunity.line ?? "Commercial Property"}
          />
          <ContextItem label="Stage" value={opportunity.stage} />
          <ContextItem
            label="Effective date"
            value={opportunity.effectiveDate}
          />
          <ContextItem label="Owner" value={opportunity.owner} />
          <ContextItem
            label="Win probability"
            value={opportunity.winProbability}
          />
        </div>
        <QuoteRequestsSection
          account={account}
          activeTaskId={props.activeTaskId}
          navigateInsideLayer={props.navigateInsideLayer}
          opportunity={opportunity}
          quoteRequestInteraction={props.quoteRequestInteraction}
          quoteRequestsTableState={props.quoteRequestsTableState}
          setQuoteRequestsTableState={props.setQuoteRequestsTableState}
        />
      </section>
    </PageLayerFrame>
  )
}

function QuoteRequestLayer(props: QuoteRequestLayerProps) {
  const { accountId, opportunityId, quoteRequestId } = useParams()
  const account = findAccount(accountId)
  const opportunity = findOpportunity(opportunityId)
  const quoteRequest = findQuoteRequest(quoteRequestId)
  const submittedResponse =
    props.quoteRequestInteraction.submittedResponses[quoteRequest.id]
  const status = effectiveQuoteRequestStatus(
    quoteRequest,
    props.quoteRequestInteraction
  )
  const [draftResponses, setDraftResponses] = useState<Record<string, string>>(
    {}
  )
  const [attemptedSubmitIds, setAttemptedSubmitIds] = useState<string[]>([])
  const responseText =
    draftResponses[quoteRequest.id] ?? submittedResponse?.body ?? ""
  const attemptedSubmit = attemptedSubmitIds.includes(quoteRequest.id)
  const responseIsInvalid = attemptedSubmit && responseText.trim().length === 0
  const opportunityPath = `/accounts/${account.id}/opportunities/${opportunity.id}#quote-requests`

  const updateResponse = (value: string) => {
    setDraftResponses((current) => ({
      ...current,
      [quoteRequest.id]: value,
    }))
  }

  const submitResponse = () => {
    const trimmed = responseText.trim()

    if (!trimmed) {
      setAttemptedSubmitIds((current) =>
        current.includes(quoteRequest.id) ? current : [...current, quoteRequest.id]
      )
      return
    }

    setAttemptedSubmitIds((current) =>
      current.filter((id) => id !== quoteRequest.id)
    )
    setDraftResponses((current) => ({
      ...current,
      [quoteRequest.id]: trimmed,
    }))
    props.setQuoteRequestInteraction((current) => ({
      ...current,
      submittedResponses: {
        ...current.submittedResponses,
        [quoteRequest.id]: {
          body: trimmed,
          submittedAt: "Aug 27, 2026, 2:06 PM",
          submittedBy: "a@aol.com",
        },
      },
    }))
  }

  return (
    <PageLayerFrame
      {...props}
      breadcrumb={
        <ObjectBreadcrumb
          activeTaskId={props.activeTaskId}
          items={[
            {
              label: account.name,
              path: `/accounts/${account.id}`,
            },
            {
              label: opportunity.name,
              path: `/accounts/${account.id}/opportunities/${opportunity.id}`,
            },
            {
              current: true,
              label: quoteRequest.carrier,
            },
          ]}
          navigateInsideLayer={props.navigateInsideLayer}
        />
      }
    >
      <section className="flex min-w-0 flex-col gap-6">
        <QuoteRequestIdentityHeader
          onBackToOpportunity={() =>
            props.navigateInsideLayer(opportunityPath, props.activeTaskId)
          }
          quoteRequest={quoteRequest}
          status={status}
        />
        <OpportunityContextStrip account={account} opportunity={opportunity} />
        <CurrentWorkSection
          onSubmitResponse={submitResponse}
          quoteRequest={quoteRequest}
          responseIsInvalid={responseIsInvalid}
          responseText={responseText}
          status={status}
          submittedResponse={submittedResponse}
          updateResponse={updateResponse}
        />
        {quoteRequest.options.length > 0 ? (
          <ReturnedOptionsSection quoteRequest={quoteRequest} />
        ) : null}
        <section className="grid min-w-0 gap-6 border-t pt-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <SubmissionSection quoteRequest={quoteRequest} />
          <ActivityHistorySection
            quoteRequest={quoteRequest}
            submittedResponse={submittedResponse}
          />
        </section>
        <SupportingMetadataSection quoteRequest={quoteRequest} />
      </section>
    </PageLayerFrame>
  )
}

function QuoteRequestIdentityHeader({
  onBackToOpportunity,
  quoteRequest,
  status,
}: {
  onBackToOpportunity: () => void
  quoteRequest: QuoteRequestRecord
  status: QuoteRequestStatus
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Quote request</Badge>
            <Badge variant={carrierStatusVariant(status)}>{status}</Badge>
            <span className="text-sm text-muted-foreground tabular-nums">
              Last activity {quoteRequest.lastActivity}
            </span>
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              {quoteRequest.carrier} - {quoteRequest.line}
            </h1>
            <p className="max-w-[68ch] text-base text-muted-foreground text-pretty sm:text-sm">
              {quoteRequest.channel} request. {quoteRequest.workflowState}.
            </p>
          </div>
        </div>
        <Button onClick={onBackToOpportunity} type="button" variant="outline">
          <ArrowLeftIcon data-icon="inline-start" />
          Back to opportunity
        </Button>
      </div>
    </section>
  )
}

function OpportunityContextStrip({
  account,
  opportunity,
}: {
  account: AccountRecord
  opportunity: OpportunityRecord
}) {
  return (
    <section className="grid gap-4 border-y py-4 md:grid-cols-5">
      <ContextItem label="Account" value={account.name} />
      <ContextItem label="Opportunity" value={opportunity.name} />
      <ContextItem label="Stage" value={opportunity.stage} />
      <ContextItem label="Effective date" value={opportunity.effectiveDate} />
      <ContextItem label="Owner" value={opportunity.owner} />
    </section>
  )
}

function CurrentWorkSection({
  onSubmitResponse,
  quoteRequest,
  responseIsInvalid,
  responseText,
  status,
  submittedResponse,
  updateResponse,
}: {
  onSubmitResponse: () => void
  quoteRequest: QuoteRequestRecord
  responseIsInvalid: boolean
  responseText: string
  status: QuoteRequestStatus
  submittedResponse?: QuoteRequestInteractionState["submittedResponses"][string]
  updateResponse: (value: string) => void
}) {
  if (submittedResponse) {
    return (
      <section className="flex min-w-0 flex-col gap-4 border-t pt-6">
        <SectionHeader
          title="Current work"
          value={`${quoteRequest.assignee} sent the broker response.`}
        />
        <Alert>
          <CircleHelpIcon />
          <AlertTitle>Waiting on Coterie</AlertTitle>
          <AlertDescription>
            Response sent {submittedResponse.submittedAt}. Status moved to{" "}
            {status}.
          </AlertDescription>
        </Alert>
        <ContextItem label="Response" value={submittedResponse.body} />
      </section>
    )
  }

  if (quoteRequest.status === "Missing information" && quoteRequest.question) {
    return (
      <section className="flex min-w-0 flex-col gap-4 border-t pt-6">
        <SectionHeader
          title="Current work"
          value={`${quoteRequest.assignee} owns this by ${quoteRequest.due}.`}
        />
        <Alert>
          <CircleHelpIcon />
          <AlertTitle>Coterie needs an answer</AlertTitle>
          <AlertDescription>{quoteRequest.question.prompt}</AlertDescription>
        </Alert>
        <form
          className="flex max-w-3xl flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmitResponse()
          }}
        >
          <FieldSet>
            <FieldGroup>
              <Field data-invalid={responseIsInvalid || undefined}>
                <FieldLabel htmlFor="coterie-response">
                  Broker response
                </FieldLabel>
                <Textarea
                  aria-invalid={responseIsInvalid || undefined}
                  id="coterie-response"
                  name="coterie-response"
                  onChange={(event) => updateResponse(event.target.value)}
                  placeholder="Roof replacement will be completed before final inspection."
                  value={responseText}
                />
                <FieldDescription>
                  This response is added to the request history.
                </FieldDescription>
                {responseIsInvalid ? (
                  <FieldError>Enter the response before sending.</FieldError>
                ) : null}
              </Field>
            </FieldGroup>
          </FieldSet>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit">
              <ArrowRightIcon data-icon="inline-start" />
              Send response
            </Button>
            <Button type="button" variant="outline">
              Save draft
            </Button>
          </div>
        </form>
      </section>
    )
  }

  if (quoteRequest.status === "Declined") {
    return (
      <section className="flex min-w-0 flex-col gap-4 border-t pt-6">
        <SectionHeader
          title="Current work"
          value={quoteRequest.nextAction}
        />
        <Alert variant="destructive">
          <CircleHelpIcon />
          <AlertTitle>{quoteRequest.reason}</AlertTitle>
          <AlertDescription>
            Building TIV is above this carrier's property appetite.
          </AlertDescription>
        </Alert>
        <SubmittedValuesGrid values={quoteRequest.submittedValues.slice(0, 2)} />
      </section>
    )
  }

  return (
    <section className="flex min-w-0 flex-col gap-4 border-t pt-6">
      <SectionHeader title="Current work" value={quoteRequest.nextAction} />
      <Alert>
        <CircleHelpIcon />
        <AlertTitle>{quoteRequest.workflowState}</AlertTitle>
        <AlertDescription>
          {quoteRequest.reason === "-" ? quoteRequest.nextAction : quoteRequest.reason}
        </AlertDescription>
      </Alert>
    </section>
  )
}

function ReturnedOptionsSection({
  quoteRequest,
}: {
  quoteRequest: QuoteRequestRecord
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4 border-t pt-6">
      <SectionHeader
        title="Returned options"
        value={`${quoteRequest.options.length} option returned`}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Option</TableHead>
            <TableHead>Total premium</TableHead>
            <TableHead>Deductible</TableHead>
            <TableHead>Limit</TableHead>
            <TableHead>Conditions</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quoteRequest.options.map((option) => (
            <TableRow
              data-state={option.selected ? "selected" : undefined}
              key={option.id}
            >
              <TableCell className="font-medium">
                <div className="flex flex-col gap-1">
                  <span>{option.label}</span>
                  {option.selected ? (
                    <Badge variant="secondary">Preferred</Badge>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="tabular-nums">
                {option.totalPremium}
              </TableCell>
              <TableCell className="tabular-nums">
                {option.deductible}
              </TableCell>
              <TableCell className="tabular-nums">{option.limit}</TableCell>
              <TableCell className="max-w-64 whitespace-normal">
                {option.conditions}
              </TableCell>
              <TableCell>{option.sourceDocument}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

function SubmissionSection({
  quoteRequest,
}: {
  quoteRequest: QuoteRequestRecord
}) {
  const currentAttempt = quoteRequest.attempts[quoteRequest.attempts.length - 1]

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHeader
        title="Submission"
        value={`${currentAttempt.label}: ${currentAttempt.outcome}`}
      />
      <SubmittedValuesGrid values={quoteRequest.submittedValues} />
      <div className="flex flex-col gap-2 border-t pt-4">
        <ContextItem label="Method" value={currentAttempt.method} />
        <ContextItem label="Submitted" value={currentAttempt.submittedAt} />
        <ContextItem label="Summary" value={currentAttempt.summary} />
      </div>
    </section>
  )
}

function ActivityHistorySection({
  quoteRequest,
  submittedResponse,
}: {
  quoteRequest: QuoteRequestRecord
  submittedResponse?: QuoteRequestInteractionState["submittedResponses"][string]
}) {
  const activity = submittedResponse
    ? [
        ...quoteRequest.activity,
        {
          id: `${quoteRequest.id}-submitted-response`,
          timestamp: submittedResponse.submittedAt,
          actor: submittedResponse.submittedBy,
          title: "Response sent",
          detail: submittedResponse.body,
        },
      ]
    : quoteRequest.activity

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHeader title="Activity" value={`${activity.length} events`} />
      <ScrollArea className="h-72 pr-3">
        <ol className="flex flex-col gap-4">
          {activity.map((event) => (
            <li className="grid gap-1 border-l pl-3" key={event.id}>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="font-medium">{event.title}</span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {event.timestamp}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {event.actor}
              </div>
              <p className="text-base text-muted-foreground text-pretty sm:text-sm">
                {event.detail}
              </p>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </section>
  )
}

function SupportingMetadataSection({
  quoteRequest,
}: {
  quoteRequest: QuoteRequestRecord
}) {
  return (
    <section className="grid gap-4 border-t pt-6 md:grid-cols-4">
      <ContextItem label="Request owner" value={quoteRequest.owner} />
      <ContextItem label="Underwriter" value={quoteRequest.underwriter} />
      <ContextItem label="External ID" value={quoteRequest.externalId} />
      <ContextItem label="Submission method" value={quoteRequest.submissionMethod} />
    </section>
  )
}

function SectionHeader({ title, value }: { title: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <h2 className="text-xl font-semibold text-balance">{title}</h2>
      <div className="text-base text-muted-foreground text-pretty sm:text-sm">
        {value}
      </div>
    </div>
  )
}

function SubmittedValuesGrid({
  values,
}: {
  values: QuoteRequestRecord["submittedValues"]
}) {
  return (
    <dl className="grid gap-4 md:grid-cols-2">
      {values.map((item) => (
        <div className="flex min-w-0 flex-col gap-1" key={item.label}>
          <dt className="text-sm font-medium">{item.label}</dt>
          <dd className="break-words text-sm text-muted-foreground">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

type BreadcrumbItemData = {
  current?: boolean
  label: string
  path?: string
}

function PageLayerFrame({
  activeTaskId,
  breadcrumb,
  children,
  navigateInsideLayer,
  onClose,
  origin,
}: LayerRouteProps & { children: ReactNode }) {
  const taskIndex = tasks.findIndex((task) => task.id === activeTaskId)
  const taskPosition = taskIndex >= 0 ? taskIndex + 1 : 1
  const previousTask = taskIndex > 0 ? tasks[taskIndex - 1] : undefined
  const nextTask =
    taskIndex >= 0 && taskIndex < tasks.length - 1
      ? tasks[taskIndex + 1]
      : undefined

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== "Escape") {
        return
      }

      event.preventDefault()
      onClose()
    }

    document.addEventListener("keydown", handleKeyDown, true)

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [onClose])

  return (
    <div className="flex h-svh min-w-0 flex-col bg-background">
      <header className="shrink-0 border-b bg-background">
        <div className="flex min-h-14 min-w-0 items-center gap-2 px-3 py-2 sm:px-5">
          <SidebarTrigger className="md:hidden" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-keyshortcuts="Escape"
                aria-label="Close"
                onClick={onClose}
                size="icon"
                type="button"
                variant="ghost"
              >
                <XIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span className="flex items-center gap-2">
                <span>Close</span>
                <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
                  ESC
                </kbd>
              </span>
            </TooltipContent>
          </Tooltip>
          {origin?.kind === "tasks" ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label="Previous task"
                    disabled={!previousTask}
                    onClick={() => {
                      if (previousTask) {
                        navigateInsideLayer(
                          taskQuoteDestinationPath(previousTask),
                          previousTask.id
                        )
                      }
                    }}
                    size="icon-sm"
                    type="button"
                    variant="outline"
                  >
                    <ArrowLeftIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous task</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label="Next task"
                    disabled={!nextTask}
                    onClick={() => {
                      if (nextTask) {
                        navigateInsideLayer(
                          taskQuoteDestinationPath(nextTask),
                          nextTask.id
                        )
                      }
                    }}
                    size="icon-sm"
                    type="button"
                    variant="outline"
                  >
                    <ArrowRightIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next task</TooltipContent>
              </Tooltip>
              <div className="min-w-0 truncate text-sm text-muted-foreground tabular-nums">
                {taskPosition} of {tasks.length} in My Tasks
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
              Accounts collection
            </div>
          )}
          <div className="ml-auto hidden text-sm text-muted-foreground tabular-nums sm:block">
            {currentDateLabel}
          </div>
        </div>
        {breadcrumb ? (
          <div className="border-t px-4 py-3 sm:px-6">{breadcrumb}</div>
        ) : null}
      </header>
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex min-w-0 flex-col gap-6 p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

function ObjectBreadcrumb({
  activeTaskId,
  items,
  navigateInsideLayer,
}: {
  activeTaskId?: string
  items: BreadcrumbItemData[]
  navigateInsideLayer: (path: string, activeTaskId?: string) => void
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const targetPath = item.path

          return (
            <Fragment key={item.label}>
              <BreadcrumbItem>
                {item.current || !targetPath ? (
                  <BreadcrumbPage className="max-w-[34rem] truncate">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <BreadcrumbLink asChild>
                        <Link
                          className="max-w-[calc(100vw-4rem)] truncate sm:max-w-72"
                          onClick={(event) => {
                            event.preventDefault()
                            navigateInsideLayer(targetPath, activeTaskId)
                          }}
                          to={targetPath}
                        >
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    </TooltipTrigger>
                    <TooltipContent>{item.label}</TooltipContent>
                  </Tooltip>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 ? <BreadcrumbSeparator /> : null}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function QuoteRequestsSection({
  account,
  activeTaskId,
  navigateInsideLayer,
  opportunity,
  quoteRequestInteraction,
  quoteRequestsTableState,
  setQuoteRequestsTableState,
}: {
  account: AccountRecord
  activeTaskId?: string
  navigateInsideLayer: (path: string, activeTaskId?: string) => void
  opportunity: OpportunityRecord
  quoteRequestInteraction: QuoteRequestInteractionState
  quoteRequestsTableState: QuoteRequestsTableState
  setQuoteRequestsTableState: React.Dispatch<
    React.SetStateAction<QuoteRequestsTableState>
  >
}) {
  const requests = quoteRequestsForOpportunity(opportunity.id)
  const counts = quoteRequestCounts(requests, quoteRequestInteraction)
  const line = activeTaskId
    ? findTask(activeTaskId).line
    : opportunity.line ?? "Commercial Property"

  const toggleRequest = (requestId: string) => {
    setQuoteRequestsTableState((current) => ({
      ...current,
      selectedRequestIds: current.selectedRequestIds.includes(requestId)
        ? current.selectedRequestIds.filter((id) => id !== requestId)
        : [...current.selectedRequestIds, requestId],
    }))
  }

  return (
    <section
      className="scroll-mt-24 border-t pt-6 focus-visible:outline-none"
      id="quote-requests"
      tabIndex={-1}
    >
      <div className="flex min-w-0 max-w-full flex-col gap-2">
        <h2 className="text-xl font-semibold text-balance">Quote requests</h2>
        <p className="max-w-full text-sm text-muted-foreground text-pretty sm:max-w-[72ch]">
          {account.name} is reviewing market responses for {line} on{" "}
          {opportunity.name}.
        </p>
      </div>
      <section className="mt-6 flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="tabular-nums">{requests.length} requests</span>
          <Separator orientation="vertical" />
          <span className="tabular-nums">{counts.declined} declined</span>
          <Separator orientation="vertical" />
          <span className="tabular-nums">
            {counts.pendingReview} pending review
          </span>
          <Separator orientation="vertical" />
          <span className="tabular-nums">{counts.quoted} quoted</span>
          <Separator orientation="vertical" />
          <span className="tabular-nums">
            {counts.missingInformation} needs information
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox aria-label="Select all carrier requests" />
              </TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason / needed input</TableHead>
              <TableHead>Last activity</TableHead>
              <TableHead>Best premium</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const status = effectiveQuoteRequestStatus(
                request,
                quoteRequestInteraction
              )

              return (
                <QuoteRequestRow
                  key={request.id}
                  onOpen={() =>
                    navigateInsideLayer(
                      quoteRequestPath(account.id, opportunity.id, request.id),
                      activeTaskId
                    )
                  }
                  onToggle={() => toggleRequest(request.id)}
                  request={request}
                  selected={quoteRequestsTableState.selectedRequestIds.includes(
                    request.id
                  )}
                  status={status}
                />
              )
            })}
          </TableBody>
        </Table>
      </section>
    </section>
  )
}

function QuoteRequestRow({
  onOpen,
  onToggle,
  request,
  selected,
  status,
}: {
  onOpen: () => void
  onToggle: () => void
  request: QuoteRequestRecord
  selected: boolean
  status: QuoteRequestStatus
}) {
  return (
    <TableRow
      aria-label={`Open ${request.carrier} quote request`}
      className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      data-state={selected ? "selected" : undefined}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpen()
        }
      }}
      role="link"
      tabIndex={0}
    >
      <TableCell
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <Checkbox
          aria-label={`Select ${request.carrier}`}
          checked={selected}
          onCheckedChange={onToggle}
        />
      </TableCell>
      <TableCell className="font-medium">{request.carrier}</TableCell>
      <TableCell>{request.channel}</TableCell>
      <TableCell>
        <Badge variant={carrierStatusVariant(status)}>{status}</Badge>
      </TableCell>
      <TableCell>{request.reason}</TableCell>
      <TableCell className="tabular-nums">{request.lastActivity}</TableCell>
      <TableCell className="tabular-nums">{request.bestPremium}</TableCell>
    </TableRow>
  )
}

function OpportunityDetails({
  opportunity,
}: {
  opportunity: OpportunityRecord
}) {
  return (
    <DetailRail title="Opportunity details">
      <DetailItem label="Account" value={opportunity.accountName} />
      <DetailItem label="Opportunity" value={opportunity.name} />
      <Separator />
      <DetailItem label="Type" value={opportunity.type} />
      <DetailItem label="Stage" value={opportunity.stage} />
      <DetailItem label="Effective date" value={opportunity.effectiveDate} />
      <DetailItem label="Owner" value={opportunity.owner} />
      <DetailItem label="Win probability" value={opportunity.winProbability} />
      <Separator />
      <DetailItem label="Quoting summary" value={opportunity.quotingProgress} />
      <Button disabled type="button" variant="outline">
        Open account
      </Button>
    </DetailRail>
  )
}

function ContextItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="text-sm font-medium">{label}</div>
      <div className="break-words text-sm text-muted-foreground">{value}</div>
    </div>
  )
}

function carrierStatusVariant(status: QuoteRequestStatus) {
  if (status === "Declined") {
    return "destructive"
  }

  if (status === "Quoted") {
    return "outline"
  }

  return "secondary"
}

function createDirectOrigin(
  kind: OriginKind,
  tasksState: TasksCollectionState,
  accountsState: AccountsCollectionState
): PageLayerOrigin {
  if (kind === "tasks") {
    return {
      closePath: "/tasks",
      direct: true,
      historyIndex: null,
      kind,
      label: "Tasks",
      tasksState,
    }
  }

  return {
    accountsState,
    closePath: "/accounts",
    direct: true,
    historyIndex: null,
    kind,
    label: "Accounts",
  }
}

function fallbackOriginKind(pathname: string): OriginKind | undefined {
  if (/^\/tasks\/[^/]+\/(quoting|workspace)$/.test(pathname)) {
    return "tasks"
  }

  if (/^\/accounts\/[^/]+/.test(pathname)) {
    return "accounts"
  }

  return undefined
}

function isPageLayerPath(pathname: string) {
  return Boolean(fallbackOriginKind(pathname))
}

function selectedRoot(pathname: string): NavDestination["kind"] {
  if (pathname.startsWith("/accounts")) {
    return "accounts"
  }

  if (pathname.startsWith("/opportunities")) {
    return "opportunities"
  }

  if (pathname.startsWith("/quotes")) {
    return "quotes"
  }

  if (pathname.startsWith("/markets")) {
    return "markets"
  }

  if (pathname.startsWith("/reports")) {
    return "reports"
  }

  if (pathname.startsWith("/settings")) {
    return "settings"
  }

  return "tasks"
}

function historyIndex() {
  const state = window.history.state as { idx?: unknown } | null
  return typeof state?.idx === "number" ? state.idx : null
}

function taskIdFromPath(pathname: string) {
  return pathname.match(/^\/tasks\/([^/]+)\/(quoting|workspace)$/)?.[1]
}

function quoteRequestIdFromPath(pathname: string) {
  return pathname.match(/\/quote-requests\/([^/]+)$/)?.[1]
}

function quoteRequestPath(
  accountId: string,
  opportunityId: string,
  quoteRequestId: string
) {
  return `/accounts/${accountId}/opportunities/${opportunityId}/quote-requests/${quoteRequestId}`
}

function opportunityQuoteSectionPath(task: TaskRecord) {
  return `/accounts/${task.accountId}/opportunities/${task.opportunityId}#quote-requests`
}

function taskQuoteDestinationPath(task: TaskRecord) {
  if (!task.quoteRequestId) {
    return opportunityQuoteSectionPath(task)
  }

  return quoteRequestPath(task.accountId, task.opportunityId, task.quoteRequestId)
}

function effectiveQuoteRequestStatus(
  request: QuoteRequestRecord,
  interaction: QuoteRequestInteractionState
): QuoteRequestStatus {
  if (
    request.status === "Missing information" &&
    interaction.submittedResponses[request.id]
  ) {
    return "Pending review"
  }

  return request.status
}

function quoteRequestCounts(
  requests: QuoteRequestRecord[],
  interaction: QuoteRequestInteractionState
) {
  return requests.reduce(
    (counts, request) => {
      const status = effectiveQuoteRequestStatus(request, interaction)

      if (status === "Declined") {
        counts.declined += 1
      } else if (status === "Pending review") {
        counts.pendingReview += 1
      } else if (status === "Quoted") {
        counts.quoted += 1
      } else if (status === "Missing information") {
        counts.missingInformation += 1
      }

      return counts
    },
    {
      declined: 0,
      missingInformation: 0,
      pendingReview: 0,
      quoted: 0,
    }
  )
}

function quoteRequestSummaryText(
  requests: QuoteRequestRecord[],
  interaction: QuoteRequestInteractionState
) {
  if (requests.length === 0) {
    return ""
  }

  const counts = quoteRequestCounts(requests, interaction)
  const segments = [
    counts.quoted ? `${counts.quoted} quoted` : "",
    counts.pendingReview ? `${counts.pendingReview} pending review` : "",
    counts.missingInformation
      ? `${counts.missingInformation} needs information`
      : "",
    counts.declined ? `${counts.declined} declined` : "",
  ].filter(Boolean)

  return segments.join(", ")
}

function currentLayerLabel(pathname: string, hash = "") {
  const taskId = taskIdFromPath(pathname)
  if (taskId) {
    const task = findTask(taskId)
    return pathname.endsWith("/workspace")
      ? task.title
      : `${task.accountName} / Quote requests`
  }

  const quoteRequestId = quoteRequestIdFromPath(pathname)
  if (quoteRequestId) {
    const quoteRequest = findQuoteRequest(quoteRequestId)
    return `${quoteRequest.carrier} quote request`
  }

  const accountMatch = pathname.match(/^\/accounts\/([^/]+)/)
  const opportunityMatch = pathname.match(/\/opportunities\/([^/]+)/)
  if (
    opportunityMatch &&
    (pathname.endsWith("/quoting") || hash === "#quote-requests")
  ) {
    const opportunity = findOpportunity(opportunityMatch[1])
    return `${opportunity.accountName} / Quote requests`
  }

  if (opportunityMatch) {
    return findOpportunity(opportunityMatch[1]).name
  }

  if (accountMatch) {
    return findAccount(accountMatch[1]).name
  }

  return "PageLayer"
}

export default App
