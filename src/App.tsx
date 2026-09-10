import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
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
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleHelpIcon,
  CircleUserRoundIcon,
  ClipboardCheckIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  FileSearch2Icon,
  FileTextIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  MailIcon,
  Maximize2Icon,
  MessageSquareTextIcon,
  MinusIcon,
  Minimize2Icon,
  MoreHorizontalIcon,
  PaperclipIcon,
  PhoneIcon,
  PlusIcon,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
import { TaskRailConceptsPage } from "@/TaskRailConcepts"
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
  taskViewWidth: number
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
    | "Closed"
    | "Held"
    | "Waiting on carrier"
    | "Waiting on client"
}

type TaskInteractionState = {
  drafts: Record<string, string>
  informationAnswers: Record<string, CarrierInformationAnswers>
  noticeConfirmed: Record<string, boolean>
  outcomes: Record<string, TaskOutcome>
}

type CarrierInformationField =
  | "roofReplacementYear"
  | "roofingMaterial"
  | "workCompletion"

type CarrierInformationAnswers = Record<CarrierInformationField, string>

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
  taskViewWidth: 520,
  scrollTop: 42,
}

const defaultAccountsState: AccountsCollectionState = {
  query: "a@aol.com",
  owner: "a",
  industry: "all",
  selectedAccountId: bobAccount.id,
  scrollTop: 36,
}

const defaultQuoteRequestInteractionState: QuoteRequestInteractionState = {
  submittedResponses: {},
}

const defaultTaskInteractionState: TaskInteractionState = {
  drafts: {
    "task-botl-info":
      "Hi Dana,\n\nTravelers has issued a cancellation notice for the property policy because the August installment remains unpaid. Payment must be received by September 12 to prevent cancellation on September 15, 2026.\n\nI have attached the carrier notice and payment instructions. Please let me know once payment has been submitted so I can confirm receipt with Travelers.\n\nThank you,\nAlex",
  },
  informationAnswers: {},
  noticeConfirmed: {},
  outcomes: {},
}

const defaultCarrierInformationAnswers: CarrierInformationAnswers = {
  roofReplacementYear: "2019",
  roofingMaterial: "Standing-seam metal",
  workCompletion: "",
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
  const location = useLocation()
  const [tasksState, setTasksState] =
    useState<TasksCollectionState>(defaultTasksState)
  const [accountsState, setAccountsState] =
    useState<AccountsCollectionState>(defaultAccountsState)
  const [quoteRequestInteraction, setQuoteRequestInteraction] =
    useState<QuoteRequestInteractionState>(defaultQuoteRequestInteractionState)
  const [taskInteraction, setTaskInteraction] =
    useState<TaskInteractionState>(defaultTaskInteractionState)

  if (location.pathname === "/task-rail-concepts") {
    return <TaskRailConceptsPage />
  }

  return (
    <SidebarProvider defaultOpen>
      <AppShell
        accountsState={accountsState}
        quoteRequestInteraction={quoteRequestInteraction}
        setAccountsState={setAccountsState}
        setQuoteRequestInteraction={setQuoteRequestInteraction}
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
  setAccountsState,
  setQuoteRequestInteraction,
  setTasksState,
  setTaskInteraction,
  taskInteraction,
  tasksState,
}: {
  accountsState: AccountsCollectionState
  quoteRequestInteraction: QuoteRequestInteractionState
  setAccountsState: React.Dispatch<React.SetStateAction<AccountsCollectionState>>
  setQuoteRequestInteraction: React.Dispatch<
    React.SetStateAction<QuoteRequestInteractionState>
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

  const openTaskOpportunityLayer = useCallback(
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

      navigate(accountOpportunityDetailsPath(task.accountId, task.opportunityId), {
        state: { pageLayerOrigin: origin, activeTaskId: taskId },
      })
    },
    [navigate]
  )

  const openTaskDestinationLayer = useCallback(
    (
      taskId: string,
      path: string,
      snapshot: TasksCollectionState
    ) => {
      const origin: PageLayerOrigin = {
        kind: "tasks",
        closePath: "/tasks",
        direct: false,
        historyIndex: historyIndex(),
        label: "My Tasks",
        tasksState: snapshot,
      }

      navigate(path, {
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
                onOpenDestination={openTaskDestinationLayer}
                onOpenOpportunity={openTaskOpportunityLayer}
                onOpenWorkspace={openTaskWorkspace}
                presentation="cards"
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
                quoteRequestInteraction={quoteRequestInteraction}
                taskInteraction={taskInteraction}
              />
            }
          />
          <Route
            path="/accounts/:accountId/compare"
            element={
              <AccountQuoteComparisonLayer
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
              <AccountOpportunityRouteRedirect
                activeTaskId={activeTaskId}
                origin={pageLayerOrigin}
                view="details"
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
                setTaskInteraction={setTaskInteraction}
                taskInteraction={taskInteraction}
              />
            }
          />
          <Route
            path="/accounts/:accountId/opportunities/:opportunityId/compare"
            element={
              <AccountOpportunityRouteRedirect
                activeTaskId={activeTaskId}
                origin={pageLayerOrigin}
                view="matrix"
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
  onOpenDestination,
  onOpenOpportunity,
  onOpenWorkspace,
  setState,
  setTaskInteraction,
  state,
  taskInteraction,
  presentation = "default",
}: {
  onOpenAccount: (taskId: string, snapshot: TasksCollectionState) => void
  onOpenDestination: (
    taskId: string,
    path: string,
    snapshot: TasksCollectionState
  ) => void
  onOpenOpportunity: (taskId: string, snapshot: TasksCollectionState) => void
  onOpenWorkspace: (taskId: string, snapshot: TasksCollectionState) => void
  setState: React.Dispatch<React.SetStateAction<TasksCollectionState>>
  setTaskInteraction: React.Dispatch<React.SetStateAction<TaskInteractionState>>
  state: TasksCollectionState
  taskInteraction: TaskInteractionState
  presentation?: CollectionPresentation
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [agentContext, setAgentContext] = useState<TaskAgentContext>()
  const [agentDraft, setAgentDraft] = useState("")
  const [agentExpanded, setAgentExpanded] = useState(false)
  const [agentMessages, setAgentMessages] = useState<TaskAgentMessage[]>([])
  const [agentOpen, setAgentOpen] = useState(false)
  const [agentSessionStarted, setAgentSessionStarted] = useState(false)
  const [agentView, setAgentView] = useState<"chat" | "history">("chat")
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

  const openNewAgentChat = useCallback(() => {
    setAgentContext(undefined)
    setAgentDraft("")
    setAgentMessages([])
    setAgentSessionStarted(true)
    setAgentView("chat")
    setAgentOpen(true)
  }, [])

  const submitAgentPrompt = (prompt: string) => {
    const nextPrompt = prompt.trim()

    if (!nextPrompt) {
      return
    }

    const nextMessages = createTaskAgentExchange(nextPrompt, selectedTask)
    setAgentMessages((current) => [...current, ...nextMessages])
    setAgentDraft("")
    setAgentSessionStarted(true)
    setAgentView("chat")
    setAgentOpen(true)
  }

  const openAgentWithTaskContext = () => {
    setAgentContext({
      detail: `${selectedTask.accountName} · 2 of 3 requested fields found`,
      items: [
        "Coterie email",
        "3 requested fields",
        "Bob Smith account record",
      ],
      title: "Coterie underwriting request",
    })
    setAgentDraft("")
    setAgentExpanded(false)
    setAgentMessages([])
    setAgentSessionStarted(true)
    setAgentView("chat")
    setAgentOpen(true)
  }

  useEffect(() => {
    const handleAgentShortcut = (event: KeyboardEvent) => {
      const isNewChatShortcut =
        event.key.toLowerCase() === "j" && (event.metaKey || event.ctrlKey)

      if (isNewChatShortcut) {
        event.preventDefault()
        openNewAgentChat()
        return
      }

      if (event.key === "Escape" && agentOpen) {
        event.preventDefault()
        setAgentOpen(false)
        setAgentExpanded(false)
      }
    }

    document.addEventListener("keydown", handleAgentShortcut)

    return () => {
      document.removeEventListener("keydown", handleAgentShortcut)
    }
  }, [agentOpen, openNewAgentChat])

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
      bottomDock={
        <TaskAgentDock
          conversationTitle={
            agentContext?.title ?? agentConversationTitle(agentMessages)
          }
          hasSession={agentSessionStarted}
          isOpen={agentOpen}
          onHistory={() => {
            setAgentSessionStarted(true)
            setAgentView("history")
            setAgentOpen(true)
          }}
          onNewChat={openNewAgentChat}
          onOpen={() => {
            if (!agentSessionStarted) {
              openNewAgentChat()
              return
            }

            setAgentView("chat")
            setAgentOpen(true)
          }}
        />
      }
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
            onAskAgent={openAgentWithTaskContext}
            onOpenAccount={() =>
              onOpenAccount(selectedTask.id, snapshot())
            }
            onOpenDestination={(path) =>
              onOpenDestination(selectedTask.id, path, snapshot())
            }
            onOpenOpportunity={() =>
              onOpenOpportunity(selectedTask.id, snapshot())
            }
            onOpenTask={() => {
              if (
                taskExperience(selectedTask).workspace ===
                  "review-returned-quote" &&
                selectedTask.quoteRequestId
              ) {
                onOpenDestination(
                  selectedTask.id,
                  quoteRequestPath(
                    selectedTask.accountId,
                    selectedTask.opportunityId,
                    selectedTask.quoteRequestId
                  ),
                  snapshot()
                )
                return
              }

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
            setInteraction={setTaskInteraction}
            task={selectedTask}
            presentation={presentation}
          />
        ) : undefined
      }
      detailWidth={state.taskViewWidth}
      detailVariant="workspace"
      floatingPanel={
        agentOpen ? (
          <TaskAgentPanel
            context={agentContext}
            draft={agentDraft}
            expanded={agentExpanded}
            messages={agentMessages}
            onChangeDraft={setAgentDraft}
            onClose={() => {
              setAgentOpen(false)
              setAgentExpanded(false)
              setAgentMessages([])
              setAgentContext(undefined)
              setAgentSessionStarted(false)
              setAgentView("chat")
            }}
            onFocusTask={(taskId) => {
              setState((current) => ({
                ...current,
                selectedTaskId: taskId,
                taskSheetMode: "context",
                taskSheetOpen: true,
              }))
              setAgentOpen(false)
              setAgentExpanded(false)
            }}
            onMinimize={() => {
              setAgentOpen(false)
              setAgentExpanded(false)
            }}
            onNewChat={openNewAgentChat}
            onOpenAccount={() =>
              onOpenAccount(selectedTask.id, snapshot())
            }
            onSubmit={submitAgentPrompt}
            onToggleExpanded={() => setAgentExpanded((current) => !current)}
            onViewChange={setAgentView}
            selectedTask={selectedTask}
            view={agentView}
          />
        ) : undefined
      }
      onDetailWidthChange={(taskViewWidth) =>
        setState((current) => ({ ...current, taskViewWidth }))
      }
      presentation={presentation}
      title="Tasks"
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-4",
          presentation === "cards" && "p-5 pt-4"
        )}
      >
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
        <div
          className={cn(
            "min-h-0 flex-1 overflow-auto",
            presentation === "cards"
              ? "-mx-5 -mb-5 border-t"
              : "rounded-lg border"
          )}
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

type CollectionPresentation = "default" | "cards"

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

type TaskAgentAction = {
  kind: "focus-task" | "open-account"
  label: string
  taskId?: string
}

type TaskAgentContext = {
  detail: string
  items: string[]
  title: string
}

type TaskAgentMessage = {
  action?: TaskAgentAction
  body: string
  id: string
  points?: string[]
  role: "assistant" | "user"
  title?: string
}

const agentHistory = [
  {
    title: "Coterie carrier response",
    detail: "Bob Smith Construction · Today",
    prompt: "Help me reply to Coterie.",
  },
  {
    title: "Bob Smith account briefing",
    detail: "Bob Smith Construction · Yesterday",
    prompt: "What needs my attention on this account?",
  },
  {
    title: "New Accident Fund quote",
    detail: "Commercial Property · Aug 27",
    prompt: "Summarize the active quote requests.",
  },
]

function createTaskAgentExchange(
  prompt: string,
  selectedTask: TaskRecord
): TaskAgentMessage[] {
  const normalizedPrompt = prompt.toLowerCase()
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const userMessage: TaskAgentMessage = {
    body: prompt,
    id: `${id}-user`,
    role: "user",
  }

  if (
    normalizedPrompt.includes("coterie") ||
    normalizedPrompt.includes("reply") ||
    normalizedPrompt.includes("carrier response")
  ) {
    return [
      userMessage,
      {
        action: {
          kind: "focus-task",
          label: "Return to Coterie task",
          taskId: "task-bob-requote",
        },
        body:
          "Coterie can continue as soon as the broker confirms the final inspection timing. I found the other two answers in the account record.",
        id: `${id}-assistant`,
        points: [
          "Roof replacement year: 2019",
          "Roofing material: Standing-seam metal",
          "Still needed: whether work will finish before final inspection",
        ],
        role: "assistant",
        title: "One carrier answer is still missing",
      },
    ]
  }

  if (
    normalizedPrompt.includes("quote") ||
    normalizedPrompt.includes("market")
  ) {
    return [
      userMessage,
      {
        action: {
          kind: "open-account",
          label: "Open account",
        },
        body:
          "Commercial Property is the active quoting line. Two markets have quoted, one is pending review, one needs information, and three declined.",
        id: `${id}-assistant`,
        points: [
          "RT Specialty: $41,200, quoted",
          "Accident Fund: $38,900, quoted",
          "Coterie: blocked on one underwriting answer",
        ],
        role: "assistant",
        title: "The account has two returned property options",
      },
    ]
  }

  if (
    normalizedPrompt.includes("attention") ||
    normalizedPrompt.includes("account") ||
    normalizedPrompt.includes("priority")
  ) {
    return [
      userMessage,
      {
        action: {
          kind: "focus-task",
          label: "Focus highest-priority task",
          taskId: "task-bob-requote",
        },
        body:
          "Bob Smith Construction has two high-priority tasks at the top of the queue. The Coterie request is the clearest blocker because one answer is holding up underwriting.",
        id: `${id}-assistant`,
        points: [
          "Answer Coterie underwriting question, due Sep 1",
          "Review new Accident Fund property quote, due Sep 2",
          "Five active opportunities and six open tasks overall",
        ],
        role: "assistant",
        title: "Start with the underwriting blocker",
      },
    ]
  }

  return [
    userMessage,
    {
      action: {
        kind: "focus-task",
        label: "Return to selected task",
        taskId: selectedTask.id,
      },
      body: `${selectedTask.accountName}, ${selectedTask.opportunityName}, and the related task and quote-request history are in context. No account changes have been made.`,
      id: `${id}-assistant`,
      role: "assistant",
      title: "I have the current work in context",
    },
  ]
}

function agentConversationTitle(messages: TaskAgentMessage[]) {
  const firstPrompt = messages.find((message) => message.role === "user")?.body

  if (!firstPrompt) {
    return "New chat"
  }

  if (firstPrompt.toLowerCase().includes("coterie")) {
    return "Coterie carrier response"
  }

  if (firstPrompt.toLowerCase().includes("quote")) {
    return "Quote request summary"
  }

  if (firstPrompt.toLowerCase().includes("account")) {
    return "Account briefing"
  }

  return firstPrompt.length > 34 ? `${firstPrompt.slice(0, 34)}…` : firstPrompt
}

function TaskAgentDock({
  conversationTitle,
  hasSession,
  isOpen,
  onHistory,
  onNewChat,
  onOpen,
}: {
  conversationTitle: string
  hasSession: boolean
  isOpen: boolean
  onHistory: () => void
  onNewChat: () => void
  onOpen: () => void
}) {
  return (
    <div
      aria-label="Agent controls"
      className="flex min-w-0 items-center justify-end gap-1"
    >
      {hasSession ? (
        <Button
          aria-pressed={isOpen}
          className="max-w-64 justify-start truncate"
          onClick={onOpen}
          size="sm"
          variant={isOpen ? "secondary" : "ghost"}
        >
          <span className="truncate">{conversationTitle}</span>
        </Button>
      ) : (
        <Button
          aria-keyshortcuts="Meta+J Control+J"
          onClick={onNewChat}
          size="sm"
          variant="ghost"
        >
          <PlusIcon />
          New chat
          <kbd className="ml-1 text-[11px] text-muted-foreground">⌘ J</kbd>
        </Button>
      )}
      <Button
        aria-keyshortcuts="Meta+J Control+J"
        aria-pressed={isOpen}
        onClick={onOpen}
        size="sm"
        variant={isOpen ? "secondary" : "ghost"}
      >
        <SparklesIcon />
        Agent
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="Agent history"
            onClick={onHistory}
            size="icon-sm"
            variant="ghost"
          >
            <HistoryIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Agent history</TooltipContent>
      </Tooltip>
    </div>
  )
}

function TaskAgentPanel({
  context,
  draft,
  expanded,
  messages,
  onChangeDraft,
  onClose,
  onFocusTask,
  onMinimize,
  onNewChat,
  onOpenAccount,
  onSubmit,
  onToggleExpanded,
  onViewChange,
  selectedTask,
  view,
}: {
  context?: TaskAgentContext
  draft: string
  expanded: boolean
  messages: TaskAgentMessage[]
  onChangeDraft: (value: string) => void
  onClose: () => void
  onFocusTask: (taskId: string) => void
  onMinimize: () => void
  onNewChat: () => void
  onOpenAccount: () => void
  onSubmit: (prompt: string) => void
  onToggleExpanded: () => void
  onViewChange: (view: "chat" | "history") => void
  selectedTask: TaskRecord
  view: "chat" | "history"
}) {
  const conversationTitle = context?.title ?? agentConversationTitle(messages)
  const submitDraft = () => onSubmit(draft)

  return (
    <aside
      aria-label="Switchboard Agent"
      aria-modal="false"
      className={cn(
        "absolute z-40 flex overflow-hidden rounded-lg border bg-background shadow-xl",
        expanded
          ? "inset-3 bottom-14"
          : "right-3 bottom-14 h-[min(42rem,calc(100%-4.5rem))] w-[min(31rem,calc(100%-1.5rem))]"
      )}
      role="dialog"
    >
      {expanded ? (
        <nav
          aria-label="Recent agent conversations"
          className="hidden w-64 shrink-0 flex-col border-r bg-muted/30 p-3 md:flex"
        >
          <div className="mb-3 flex items-center justify-between gap-2 px-2">
            <span className="text-sm font-medium">Recent chats</span>
            <Button
              aria-label="New agent chat"
              onClick={onNewChat}
              size="icon-sm"
              variant="ghost"
            >
              <PlusIcon />
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            {agentHistory.map((item) => (
              <button
                className="flex flex-col items-start rounded-md px-2 py-2 text-left hover:bg-muted"
                key={item.title}
                onClick={() => onSubmit(item.prompt)}
                type="button"
              >
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">
                  {item.detail}
                </span>
              </button>
            ))}
          </div>
        </nav>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-1 border-b px-4">
          <button
            className="min-w-0 flex-1 truncate text-left text-sm font-medium"
            onClick={() => onViewChange("chat")}
            type="button"
          >
            {view === "history" ? "Agent history" : conversationTitle}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="Agent options" size="icon-sm" variant="ghost">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onNewChat}>
                <PlusIcon />
                New chat
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onViewChange("history")}>
                <HistoryIcon />
                View history
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Minimize Agent"
                onClick={onMinimize}
                size="icon-sm"
                variant="ghost"
              >
                <MinusIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Minimize</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={expanded ? "Restore Agent" : "Expand Agent"}
                aria-pressed={expanded}
                onClick={onToggleExpanded}
                size="icon-sm"
                variant="ghost"
              >
                {expanded ? <Minimize2Icon /> : <Maximize2Icon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{expanded ? "Restore" : "Expand"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Close Agent"
                onClick={onClose}
                size="icon-sm"
                variant="ghost"
              >
                <XIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        </header>

        {view === "history" ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Recent chats</h2>
                <p className="text-sm text-muted-foreground">
                  Account and task context from prior conversations.
                </p>
              </div>
            </div>
            <div className="divide-y border-y">
              {agentHistory.map((item) => (
                <button
                  className="flex w-full items-center justify-between gap-4 py-3 text-left hover:bg-muted/50"
                  key={item.title}
                  onClick={() => onSubmit(item.prompt)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
              {context ? (
                <div className="mx-auto mb-5 max-w-2xl rounded-md border bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CheckIcon className="size-4" />
                    Context added
                  </div>
                  <div className="mt-3 text-sm font-medium">
                    {context.title}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {context.detail}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {context.items.map((item) => (
                      <Badge key={item} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              {messages.length === 0 ? (
                <div
                  className={cn(
                    "mx-auto flex max-w-lg flex-col justify-center py-8",
                    !context && "min-h-full"
                  )}
                >
                  <SparklesIcon className="mb-4 size-7 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">
                    What can I help move forward?
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedTask.accountName} · {selectedTask.opportunityName}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Badge variant="secondary">{selectedTask.accountName}</Badge>
                    <Badge variant="outline">{selectedTask.title}</Badge>
                  </div>
                  <div className="mt-6 divide-y border-y">
                    {[
                      "What needs my attention on this account?",
                      "Summarize the active quote requests.",
                      "Help me reply to Coterie.",
                    ].map((prompt) => (
                      <button
                        className="flex w-full items-center justify-between gap-4 py-3 text-left text-sm hover:bg-muted/50"
                        key={prompt}
                        onClick={() => onSubmit(prompt)}
                        type="button"
                      >
                        <span>{prompt}</span>
                        <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex max-w-2xl flex-col gap-6">
                  {messages.map((message) =>
                    message.role === "user" ? (
                      <div className="flex justify-end" key={message.id}>
                        <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
                          {message.body}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3" key={message.id}>
                        {message.title ? (
                          <h3 className="font-semibold">{message.title}</h3>
                        ) : null}
                        <p className="text-sm leading-6">{message.body}</p>
                        {message.points ? (
                          <div className="divide-y border-y">
                            {message.points.map((point) => (
                              <div className="py-2 text-sm" key={point}>
                                {point}
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {message.action ? (
                          <div className="rounded-md border bg-muted/40 p-3">
                            <div className="mb-3">
                              <div className="text-sm font-medium">
                                Proposed next step
                              </div>
                              <div className="text-sm text-muted-foreground">
                                No account changes have been made.
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                if (message.action?.kind === "open-account") {
                                  onOpenAccount()
                                  return
                                }

                                if (message.action?.taskId) {
                                  onFocusTask(message.action.taskId)
                                }
                              }}
                              size="sm"
                            >
                              {message.action.label}
                              <ArrowRightIcon />
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t p-3">
              <form
                className="rounded-lg border bg-background p-2 shadow-sm"
                onSubmit={(event) => {
                  event.preventDefault()
                  submitDraft()
                }}
              >
                <Textarea
                  aria-label="Message Switchboard Agent"
                  className="min-h-20 resize-none border-0 p-2 shadow-none focus-visible:ring-0"
                  onChange={(event) => onChangeDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault()
                      submitDraft()
                    }
                  }}
                  placeholder="Ask about this work..."
                  value={draft}
                />
                <div className="flex items-center justify-between gap-2 px-1 pb-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <SparklesIcon className="size-3.5" />
                    {selectedTask.accountName} in context
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          aria-label="Attach a file"
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                        >
                          <PaperclipIcon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Attach a file</TooltipContent>
                    </Tooltip>
                    <Button
                      aria-label="Send message"
                      disabled={!draft.trim()}
                      size="icon-sm"
                      type="submit"
                    >
                      <SendIcon />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}

type TaskExperience = {
  actionLabel: string
  sourceExcerpt: string
  sourceLabel: string
  summary: string
  title: string
  workspace:
    | "collect-information"
    | "review-returned-quote"
    | "review-quote"
    | "send-notice"
    | "generic"
}

const taskExperiences: Partial<Record<string, TaskExperience>> = {
  "task-bob-requote": {
    actionLabel: "Draft carrier response",
    sourceExcerpt:
      "Please confirm the roof replacement year, material, and whether the work will be completed before final inspection.",
    sourceLabel: "Email source · Aug 27, 2026",
    summary:
      "The agent found two of Coterie's three requested details. One answer still needs broker review before the carrier can continue.",
    title: "Coterie underwriting information request",
    workspace: "collect-information",
  },
  "task-bob-property-options": {
    actionLabel: "Review new quote",
    sourceExcerpt:
      "Accident Fund returned two property options. The lowest is $38,900 with basic-form coverage and a $50,000 deductible.",
    sourceLabel: "Quote activity · Aug 27, 2026",
    summary:
      "A new Accident Fund quote needs a broker decision before the opportunity moves forward.",
    title: "Review new Accident Fund property quote",
    workspace: "review-returned-quote",
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
  onAskAgent,
  onBack,
  onClose,
  onOpenAccount,
  onOpenDestination,
  onOpenOpportunity,
  onOpenTask,
  setInteraction,
  task,
  presentation = "default",
}: {
  interaction: TaskInteractionState
  mode: TasksCollectionState["taskSheetMode"]
  onAskAgent: () => void
  onBack: () => void
  onClose: () => void
  onOpenAccount: () => void
  onOpenDestination: (path: string) => void
  onOpenOpportunity: () => void
  onOpenTask: () => void
  setInteraction: React.Dispatch<React.SetStateAction<TaskInteractionState>>
  task: TaskRecord
  presentation?: CollectionPresentation
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [carrierComposerOpen, setCarrierComposerOpen] = useState(false)
  const experience = taskExperience(task)
  const isInformationTask = experience.workspace === "collect-information"
  const isReturnedQuoteTask =
    experience.workspace === "review-returned-quote"
  const outcome = interaction.outcomes[task.id]
  const draft = interaction.drafts[task.id] ?? ""
  const informationAnswers =
    interaction.informationAnswers[task.id] ??
    defaultCarrierInformationAnswers
  const noticeConfirmed = interaction.noticeConfirmed[task.id] ?? false

  const updateDraft = (value: string) => {
    setInteraction((current) => ({
      ...current,
      drafts: { ...current.drafts, [task.id]: value },
    }))
  }

  const updateInformationAnswer = (
    field: CarrierInformationField,
    value: string
  ) => {
    setInteraction((current) => ({
      ...current,
      informationAnswers: {
        ...current.informationAnswers,
        [task.id]: {
          ...(current.informationAnswers[task.id] ??
            defaultCarrierInformationAnswers),
          [field]: value,
        },
      },
    }))
  }

  useLayoutEffect(() => {
    contentRef.current?.focus()
  }, [mode, task.id])

  const completeMessageTask = () => {
    setInteraction((current) => ({
      ...current,
      outcomes: {
        ...current.outcomes,
        [task.id]: {
          completedAt: "Aug 27, 2026, 2:18 PM",
          result:
            "Cancellation notice and payment instructions sent to dana@botl.com",
          status: "Sent",
        },
      },
    }))
  }

  const openCarrierComposer = () => {
    const roofReplacementYear = informationAnswers.roofReplacementYear.trim()
    const roofingMaterial = informationAnswers.roofingMaterial.trim()
    const workCompletion = informationAnswers.workCompletion.trim()
    if (!roofReplacementYear || !roofingMaterial || !workCompletion) return

    updateDraft(
      `Hi Mia,\n\nHere are the roof details you requested for Bob Smith Construction:\n\n- Roof replacement year: ${roofReplacementYear}\n- Roofing material: ${roofingMaterial}\n- Work completed before final inspection: ${workCompletion}\n\nPlease let me know if you need anything else to continue underwriting.\n\nThank you,\nAlex`
    )
    setCarrierComposerOpen(true)
  }

  const sendCarrierResponse = () => {
    setInteraction((current) => ({
      ...current,
      outcomes: {
        ...current.outcomes,
        [task.id]: {
          completedAt: "Aug 27, 2026, 2:18 PM",
          result: "Roof details sent to Coterie underwriting",
          status: "Sent",
        },
      },
    }))
    setCarrierComposerOpen(false)
  }

  const completeReturnedQuoteReview = (
    status: TaskOutcome["status"],
    result: string
  ) => {
    setInteraction((current) => ({
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
        isInformationTask ||
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
  }, [isInformationTask, mode, onOpenTask])

  return (
    <>
      <aside
        aria-label={`${experience.title} task view`}
        className={cn(
          "flex h-full min-h-0 flex-col bg-background outline-none",
          presentation === "cards" && "overflow-hidden rounded-lg"
        )}
        ref={contentRef}
        tabIndex={-1}
      >
      <header className="shrink-0 border-b p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          {mode === "action" && !isInformationTask ? (
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
          <div className="flex items-center gap-1.5">
            {isInformationTask ? (
              <Button
                asChild
                className="h-7 gap-1.5 px-2 text-xs"
                size="sm"
                variant="outline"
              >
                <a
                  href="mailto:mia@coterieinsurance.com?subject=Coterie%20underwriting%20information%20request"
                >
                  <MailIcon data-icon="inline-start" />
                  Open in Mail
                </a>
              </Button>
            ) : null}
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
        </div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant={task.priority === "High" ? "default" : "secondary"}>
            {task.priority} priority
          </Badge>
          {outcome || task.status !== "Open" ? (
            <Badge variant="secondary">{outcome?.status ?? task.status}</Badge>
          ) : null}
          <span className="text-sm text-muted-foreground tabular-nums">
            Due {task.due}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-balance">
          {mode === "action" && !isInformationTask
            ? experience.actionLabel
            : experience.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          {experience.summary}
        </p>
      </header>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto",
          !isInformationTask && !isReturnedQuoteTask && "p-4"
        )}
      >
        {isInformationTask ? (
          <div className="flex flex-col">
            <div className="p-4">
              <CarrierInformationWorkspace
                answers={informationAnswers}
                canDraft={!Object.values(informationAnswers).some(
                  (answer) => answer.trim().length === 0
                )}
                onAnswerChange={updateInformationAnswer}
                onAskAgent={onAskAgent}
                onDraftCarrierResponse={openCarrierComposer}
                outcome={outcome}
                presentation={presentation}
                task={task}
              />
            </div>
            <TaskAccountOpportunityTree
              account={findAccount(task.accountId)}
              activeTask={task}
              onNavigate={onOpenDestination}
              outcome={outcome}
            />
          </div>
        ) : isReturnedQuoteTask && mode === "context" ? (
          <TaskReturnedQuotePreview
            account={findAccount(task.accountId)}
            onCompleteReview={completeReturnedQuoteReview}
            onReview={onOpenTask}
            onNavigate={onOpenDestination}
            outcome={outcome}
            task={task}
          />
        ) : mode === "context" ? (
          <TaskContextOverview
            account={findAccount(task.accountId)}
            onOpenAccount={onOpenAccount}
            onOpenOpportunity={onOpenOpportunity}
            outcome={outcome}
            sourceExcerpt={experience.sourceExcerpt}
            sourceLabel={experience.sourceLabel}
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

      <footer className="flex shrink-0 flex-col gap-2 border-t p-4">
        <Button onClick={onOpenAccount} type="button" variant="outline">
          <ExternalLinkIcon data-icon="inline-start" />
          Open account
        </Button>
        {isInformationTask || isReturnedQuoteTask ? null : mode === "context" ? (
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
            Send and record delivery
          </Button>
        )}
      </footer>
      </aside>

      {experience.workspace === "collect-information" ? (
        <CarrierResponseDialog
          draft={draft}
          onDraftChange={updateDraft}
          onOpenChange={setCarrierComposerOpen}
          onSend={sendCarrierResponse}
          open={carrierComposerOpen}
          task={task}
        />
      ) : null}
    </>
  )
}

function TaskContextOverview({
  account,
  onOpenAccount,
  onOpenOpportunity,
  outcome,
  sourceExcerpt,
  sourceLabel,
  showSource = true,
  task,
}: {
  account: AccountRecord
  onOpenAccount: () => void
  onOpenOpportunity: () => void
  outcome?: TaskOutcome
  sourceExcerpt: string
  sourceLabel: string
  showSource?: boolean
  task: TaskRecord
}) {
  const contact = account.mainContact ?? {
    email: "contact@example.com",
    name: `${account.dba} contact`,
    phone: "(555) 010-0100",
    role: "Primary contact",
  }
  const contactPhone = contact.phone.replace(/\D/g, "")

  return (
    <div className="flex flex-col gap-4">
      {outcome ? (
        <Alert>
          <CheckIcon />
          <AlertTitle>{outcome.status}</AlertTitle>
          <AlertDescription>
            {outcome.result}. Updated {outcome.completedAt}.
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="flex flex-col gap-2">
        <h3 className="font-medium">Account context</h3>
        <div className="divide-y border-y">
          <TaskContextProperty
            label="Account"
            onClick={onOpenAccount}
            value={account.name}
          />
          <TaskContextProperty
            label="Opportunity"
            onClick={onOpenOpportunity}
            value={task.opportunityName}
          />
          <div className="flex min-w-0 items-center gap-2 px-1 py-2">
            <button
              className="group grid min-w-0 flex-1 grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={onOpenAccount}
              type="button"
            >
              <span className="text-xs font-medium text-muted-foreground">
                Main contact
              </span>
              <span
                className="truncate text-right text-sm font-medium underline-offset-4 group-hover:underline"
                title={contact.name}
              >
                {contact.name}
              </span>
            </button>
            <div
              aria-label={`Contact ${contact.name}`}
              className="flex shrink-0 items-center gap-1 pr-1"
              role="group"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild size="icon-sm" variant="outline">
                    <a aria-label={`Call ${contact.name}`} href={`tel:${contactPhone}`}>
                      <PhoneIcon />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Call {contact.name}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild size="icon-sm" variant="outline">
                    <a aria-label={`Text ${contact.name}`} href={`sms:${contactPhone}`}>
                      <MessageSquareTextIcon />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Text {contact.name}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild size="icon-sm" variant="outline">
                    <a aria-label={`Email ${contact.name}`} href={`mailto:${contact.email}`}>
                      <MailIcon />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Email {contact.name}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </section>

      {showSource ? (
        <>
          <Separator />

          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <MailIcon />
              <h3 className="font-medium">Source</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {sourceLabel}
            </p>
            <blockquote className="border-l-2 pl-4 text-sm leading-5 text-muted-foreground text-pretty">
              {sourceExcerpt}
            </blockquote>
          </section>
        </>
      ) : null}
    </div>
  )
}

function TaskReturnedQuotePreview({
  account,
  onCompleteReview,
  onReview,
  onNavigate,
  outcome,
  task,
}: {
  account: AccountRecord
  onCompleteReview: (status: TaskOutcome["status"], result: string) => void
  onReview: () => void
  onNavigate: (path: string) => void
  outcome?: TaskOutcome
  task: TaskRecord
}) {
  const returnedQuote = findQuoteRequest(task.quoteRequestId)
  const [revisionOpen, setRevisionOpen] = useState(false)
  const [revisionRequests, setRevisionRequests] = useState<string[]>([])
  const [revisionNote, setRevisionNote] = useState("")

  const updateRevisionRequest = (request: string, checked: boolean) => {
    setRevisionRequests((current) =>
      checked
        ? [...current, request]
        : current.filter((currentRequest) => currentRequest !== request)
    )
  }

  return (
    <div className="flex flex-col">
      <div className="p-4">
        {outcome ? (
          <Alert className="mb-4">
            <CheckIcon />
            <AlertTitle>{outcome.status}</AlertTitle>
            <AlertDescription>
              {outcome.result}. Updated {outcome.completedAt}.
            </AlertDescription>
          </Alert>
        ) : null}

        <section className="flex flex-col gap-3 rounded-md border bg-muted/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <h3 className="font-semibold">New quote received</h3>
              <p className="text-sm text-muted-foreground">
                Accident Fund returned two property options that need a broker
                decision.
              </p>
            </div>
            <Badge
              className="shrink-0 border-yellow-300 bg-yellow-100 text-yellow-950"
              variant="outline"
            >
              New quote
            </Badge>
          </div>

          <div className="divide-y border-y">
            {returnedQuote.options.map((option) => (
              <div
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
                key={option.id}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {option.label}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    Basic form · {option.deductible} deductible
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums">
                  {option.totalPremium}
                </div>
              </div>
            ))}
          </div>

          <div className="divide-y border-y">
            <TaskAccountSummaryRow
              label="Difference"
              value="7 material terms"
            />
            <TaskAccountSummaryRow
              label="Source"
              value="Extraction needs review"
            />
            <TaskAccountSummaryRow
              label="Market"
              value="Amwins still pending"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={Boolean(outcome)} type="button" variant="outline">
                  Actions
                  <ChevronDownIcon data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-48">
                <DropdownMenuItem onSelect={() => setRevisionOpen(true)}>
                  <MailIcon />
                  Request changes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() =>
                    onCompleteReview(
                      "Held",
                      `${returnedQuote.carrier} quote placed on hold pending further activity`
                    )
                  }
                >
                  <HistoryIcon />
                  Hold
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() =>
                    onCompleteReview(
                      "Closed",
                      `${returnedQuote.carrier} option declined because its coverage does not meet the client's requirements`
                    )
                  }
                  variant="destructive"
                >
                  <XIcon />
                  Decline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              aria-keyshortcuts="Enter"
              className="min-w-0 justify-between"
              onClick={onReview}
              type="button"
            >
              <span className="min-w-0 truncate">Review new quote</span>
              <kbd className="rounded border border-primary-foreground/40 bg-primary-foreground/10 px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary-foreground/90">
                ENT
              </kbd>
            </Button>
          </div>
        </section>
      </div>

      <TaskAccountOpportunityTree
        account={account}
        activeTask={task}
        onNavigate={onNavigate}
        outcome={outcome}
      />

      <Dialog onOpenChange={setRevisionOpen} open={revisionOpen}>
        <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-5 pr-14">
            <DialogTitle>Request {returnedQuote.carrier} quote changes</DialogTitle>
            <DialogDescription>
              Select one or more revisions. Switchboard will draft the carrier request.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5 p-6">
            <div className="divide-y border-y">
              {quoteRevisionChoices.map((request, index) => {
                const id = `task-quote-revision-${index}`
                const checked = revisionRequests.includes(request)

                return (
                  <label
                    className="flex cursor-pointer items-center gap-3 py-3 text-sm font-medium"
                    htmlFor={id}
                    key={request}
                  >
                    <Checkbox
                      checked={checked}
                      id={id}
                      name="task-quote-revision"
                      onCheckedChange={(value) =>
                        updateRevisionRequest(request, value === true)
                      }
                    />
                    {request}
                  </label>
                )
              })}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="task-quote-revision-note">
                Additional note
              </label>
              <Textarea
                id="task-quote-revision-note"
                name="task-quote-revision-note"
                onChange={(event) => setRevisionNote(event.target.value)}
                placeholder="Add context for the underwriter."
                rows={4}
                value={revisionNote}
              />
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button
              onClick={() => setRevisionOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={revisionRequests.length === 0}
              onClick={() => {
                onCompleteReview(
                  "Waiting on carrier",
                  `Requested ${revisionRequests.join(", ").toLowerCase()} from ${returnedQuote.carrier}${revisionNote.trim() ? " with an additional broker note" : ""}`
                )
                setRevisionOpen(false)
              }}
              type="button"
            >
              <SendIcon data-icon="inline-start" />
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TaskAccountOpportunityTree({
  account,
  activeTask,
  onNavigate,
  outcome,
}: {
  account: AccountRecord
  activeTask: TaskRecord
  onNavigate: (path: string) => void
  outcome?: TaskOutcome
}) {
  const accountOpportunities = opportunitiesForAccount(account.id)
  const requestCount = accountOpportunities.reduce(
    (count, opportunity) =>
      count + quoteRequestsForOpportunity(opportunity.id).length,
    0
  )
  const quotedCount = accountOpportunities.reduce(
    (count, opportunity) =>
      count +
      quoteRequestsForOpportunity(opportunity.id).filter(
        (request) => request.status === "Quoted"
      ).length,
    0
  )

  return (
    <>
      <TaskAccountSummary account={account} onNavigate={onNavigate} />
      <section className="flex flex-col gap-3 border-t py-4">
      <div className="flex min-w-0 items-center justify-between gap-3 px-4">
        <h3 className="min-w-0 text-lg font-semibold">Opportunities</h3>
        <Button
          className="shrink-0"
          onClick={() => onNavigate(`/accounts/${account.id}#opportunities`)}
          size="sm"
          type="button"
          variant="outline"
        >
          View opportunities
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5 px-4">
        <Badge variant="secondary">
          <span className="tabular-nums">{accountOpportunities.length}</span> active
        </Badge>
        <Badge variant="secondary">
          <span className="tabular-nums">{requestCount}</span> requests
        </Badge>
        <Badge variant="secondary">
          <span className="tabular-nums">{quotedCount}</span> quoted
        </Badge>
      </div>

      <div className="border-y" role="list">
        {accountOpportunities.map((opportunity) => {
          const requests = quoteRequestsForOpportunity(opportunity.id)

          return (
            <div
              className="border-b last:border-b-0"
              key={opportunity.id}
              role="listitem"
            >
              <div
                className={cn(
                  "flex min-w-0 items-start justify-between gap-3 bg-muted/50 px-4 py-2.5",
                  opportunity.id === activeTask.opportunityId && "bg-muted"
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {opportunity.line}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {opportunity.name}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className="max-w-40 truncate text-xs tabular-nums text-muted-foreground">
                    {requests.length === 0
                      ? opportunity.stage
                      : `${requests.length} requests`}
                  </span>
                </span>
              </div>

              {requests.length > 0 ? (
                <div className="divide-y">
                  {requests.map((request) => {
                    const status =
                      outcome && request.id === activeTask.quoteRequestId
                        ? "Pending review"
                        : request.status
                    const isCurrentTask =
                      request.id === activeTask.quoteRequestId

                    return (
                      <div
                        aria-current={isCurrentTask ? "true" : undefined}
                        className={cn(
                          "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5",
                          isCurrentTask &&
                            "border-l-2 border-l-yellow-500 bg-yellow-50 pl-[14px]"
                        )}
                        key={request.id}
                      >
                        <span className="min-w-0 truncate text-sm font-medium">
                          {request.carrier}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          {isCurrentTask ? (
                            <Badge
                              className="border-yellow-300 bg-yellow-100 text-yellow-950"
                              variant="outline"
                            >
                              Current task
                            </Badge>
                          ) : null}
                          {request.bestPremium !== "-" ? (
                            <span className="text-xs font-medium tabular-nums">
                              {taskRailCompactPremium(request.bestPremium)}
                            </span>
                          ) : null}
                          <TaskRailStatusLabel status={status} />
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-2.5">
                  <span className="truncate text-sm text-muted-foreground">
                    {opportunity.nextAction}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {opportunity.effectiveDate}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
      </section>
    </>
  )
}

function TaskAccountSummary({
  account,
  onNavigate,
}: {
  account: AccountRecord
  onNavigate: (path: string) => void
}) {
  const contact = account.mainContact
  const contactPhone = contact?.phone.replace(/\D/g, "")

  return (
    <section className="flex flex-col gap-3 border-t py-4">
      <div className="flex min-w-0 items-center justify-between gap-3 px-4">
        <h3 className="min-w-0 text-lg font-semibold">Account</h3>
        <Button
          className="shrink-0"
          onClick={() => onNavigate(`/accounts/${account.id}`)}
          size="sm"
          type="button"
          variant="outline"
        >
          View account
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5 px-4">
        <Badge variant="secondary">
          {account.relationshipStatus ?? "Active account"}
        </Badge>
        {account.clientSince ? (
          <Badge variant="secondary">Since {account.clientSince}</Badge>
        ) : null}
        {account.activePolicy ? (
          <Badge variant="secondary">1 active policy</Badge>
        ) : null}
      </div>

      <dl className="divide-y border-y">
        <TaskAccountSummaryRow label="Name" value={account.name} />
        <TaskAccountSummaryRow label="DBA" value={account.dba} />
        <TaskAccountSummaryRow
          label="Business"
          value={`${account.industry} · ${account.businessType}`}
        />
        {account.location ? (
          <TaskAccountSummaryRow label="Location" value={account.location} />
        ) : null}
        {contact ? (
          <div className="flex min-w-0 items-center gap-2 px-4 py-2.5">
            <dt className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
              Main contact
            </dt>
            <dd className="flex min-w-0 flex-1 items-center justify-end gap-2">
              <span
                className="min-w-0 truncate text-right text-sm font-medium"
                title={`${contact.name} · ${contact.role}`}
              >
                {contact.name} · {contact.role}
              </span>
              <div
                aria-label={`Contact ${contact.name}`}
                className="flex shrink-0 items-center gap-1"
                role="group"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild size="icon-sm" variant="outline">
                      <a aria-label={`Call ${contact.name}`} href={`tel:${contactPhone}`}>
                        <PhoneIcon />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Call {contact.name}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild size="icon-sm" variant="outline">
                      <a aria-label={`Text ${contact.name}`} href={`sms:${contactPhone}`}>
                        <MessageSquareTextIcon />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Text {contact.name}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild size="icon-sm" variant="outline">
                      <a aria-label={`Email ${contact.name}`} href={`mailto:${contact.email}`}>
                        <MailIcon />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Email {contact.name}</TooltipContent>
                </Tooltip>
              </div>
            </dd>
          </div>
        ) : null}
        <TaskAccountSummaryRow label="Account owner" value={account.owner} />
        {account.activePolicy ? (
          <TaskAccountSummaryRow
            label="Active policy"
            value={`${account.activePolicy.name} · ${account.activePolicy.renewalDate}`}
          />
        ) : null}
      </dl>
    </section>
  )
}

function TaskAccountSummaryRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-3 px-4 py-2.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right text-sm font-medium" title={value}>
        {value}
      </dd>
    </div>
  )
}

function TaskRailStatusLabel({ status }: { status: QuoteRequestStatus }) {
  const label =
    status === "Missing information"
      ? "Needs info"
      : status === "Pending review"
        ? "Pending"
        : status

  return (
    <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
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
    </span>
  )
}

function taskRailCompactPremium(premium: string) {
  const value = Number(premium.replace(/[^0-9.]/g, ""))
  return Number.isFinite(value) ? `$${(value / 1000).toFixed(1)}k` : premium
}

function TaskContextProperty({
  label,
  onClick,
  value,
}: {
  label: string
  onClick: () => void
  value: string
}) {
  return (
    <button
      className="group grid w-full grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3 px-1 py-2 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={onClick}
      type="button"
    >
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="flex min-w-0 items-center justify-end gap-1.5">
        <span
          className="truncate text-right text-sm font-medium underline-offset-4 group-hover:underline"
          title={value}
        >
          {value}
        </span>
        <ChevronRightIcon className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </span>
    </button>
  )
}

function CarrierInformationWorkspace({
  answers,
  canDraft,
  onAnswerChange,
  onAskAgent,
  onDraftCarrierResponse,
  outcome,
  presentation = "default",
  task,
}: {
  answers: CarrierInformationAnswers
  canDraft: boolean
  onAnswerChange: (field: CarrierInformationField, value: string) => void
  onAskAgent: () => void
  onDraftCarrierResponse: () => void
  outcome?: TaskOutcome
  presentation?: CollectionPresentation
  task: TaskRecord
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 p-4",
        presentation === "default" &&
          "rounded-md border bg-card shadow-sm",
        presentation === "cards" && "rounded-md border bg-muted/40"
      )}
    >
      {outcome ? (
        <Alert>
          <CheckIcon />
          <AlertTitle>{outcome.status}</AlertTitle>
          <AlertDescription>
            {outcome.result}. Updated {outcome.completedAt}.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium">Requested information</h3>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              The agent compared Coterie's email with the account intake and
              found two of three answers.
            </p>
          </div>
          <Badge className="shrink-0" variant="secondary">
            2 of 3 found
          </Badge>
        </div>

        <div className="divide-y border-y">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(10rem,0.8fr)] items-center gap-4 py-3">
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted-foreground">
                Request 1
              </div>
              <label
                className="mt-1 block text-sm font-medium"
                htmlFor={`carrier-answer-${task.id}-roof-year`}
              >
                Roof replacement year
              </label>
            </div>
            <div className="min-w-0">
              <InputGroup className="bg-white">
                <InputGroupInput
                  className="tabular-nums"
                  disabled={Boolean(outcome)}
                  id={`carrier-answer-${task.id}-roof-year`}
                  onChange={(event) =>
                    onAnswerChange("roofReplacementYear", event.target.value)
                  }
                  value={answers.roofReplacementYear}
                />
              </InputGroup>
              <div className="mt-1 text-right text-xs text-muted-foreground">
                Property schedule
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(10rem,0.8fr)] items-center gap-4 py-3">
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted-foreground">
                Request 2
              </div>
              <label
                className="mt-1 block text-sm font-medium"
                htmlFor={`carrier-answer-${task.id}-roofing-material`}
              >
                Roofing material
              </label>
            </div>
            <div className="min-w-0">
              <InputGroup className="bg-white">
                <InputGroupInput
                  disabled={Boolean(outcome)}
                  id={`carrier-answer-${task.id}-roofing-material`}
                  onChange={(event) =>
                    onAnswerChange("roofingMaterial", event.target.value)
                  }
                  value={answers.roofingMaterial}
                />
              </InputGroup>
              <div className="mt-1 text-right text-xs text-muted-foreground">
                Building details
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(10rem,0.8fr)] items-center gap-4 py-3">
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted-foreground">
                Request 3
              </div>
              <label
                className="mt-1 block text-sm font-medium"
                htmlFor={`carrier-answer-${task.id}-work-completion`}
              >
                Work completed before final inspection
              </label>
              <div className="mt-1 text-xs text-muted-foreground">
                Not found in account data
              </div>
            </div>
            <InputGroup className="bg-white">
              <InputGroupInput
                disabled={Boolean(outcome)}
                id={`carrier-answer-${task.id}-work-completion`}
                onChange={(event) =>
                  onAnswerChange("workCompletion", event.target.value)
                }
                placeholder="Enter answer"
                value={answers.workCompletion}
              />
            </InputGroup>
          </div>
        </div>
      </div>

      {outcome ? (
        <div
          className="flex h-9 items-center justify-center gap-2 rounded-md border bg-muted text-sm font-medium"
          role="status"
        >
          <CheckIcon />
          Carrier response sent
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={onAskAgent} type="button" variant="outline">
            <SparklesIcon data-icon="inline-start" />
            Ask Agent
          </Button>
          <Button
            disabled={!canDraft}
            onClick={onDraftCarrierResponse}
            type="button"
          >
            <MailIcon data-icon="inline-start" />
            Draft carrier response
          </Button>
        </div>
      )}
    </section>
  )
}

function CarrierResponseDialog({
  draft,
  onDraftChange,
  onOpenChange,
  onSend,
  open,
  task,
}: {
  draft: string
  onDraftChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onSend: () => void
  open: boolean
  task: TaskRecord
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Draft carrier response</DialogTitle>
          <DialogDescription>
            Review the generated email before sending it to Coterie.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center border-b px-6 py-3">
          <span className="text-sm text-muted-foreground">To</span>
          <span className="truncate text-sm">mia@coterieinsurance.com</span>
        </div>
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center border-b px-6 py-3">
          <span className="text-sm text-muted-foreground">Subject</span>
          <span className="truncate text-sm font-medium">
            {task.accountName} - requested roof information
          </span>
        </div>
        <Textarea
          aria-label="Carrier response message"
          className="min-h-80 resize-y rounded-none border-0 px-6 py-5 shadow-none focus-visible:ring-0"
          onChange={(event) => onDraftChange(event.target.value)}
          value={draft}
        />

        <DialogFooter className="items-center border-t bg-muted/30 px-6 py-4 sm:justify-between">
          <Button aria-label="Attach file" size="icon-sm" variant="ghost">
            <PaperclipIcon />
          </Button>
          <div className="flex items-center gap-2">
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Cancel
            </Button>
            <Button disabled={draft.trim().length === 0} onClick={onSend}>
              <SendIcon data-icon="inline-start" />
              Send
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  bottomDock,
  children,
  detail,
  detailWidth = 520,
  detailVariant = "rail",
  floatingPanel,
  onDetailWidthChange,
  presentation = "default",
  title,
}: {
  bottomDock?: ReactNode
  children: ReactNode
  detail?: ReactNode
  detailWidth?: number
  detailVariant?: "rail" | "workspace"
  floatingPanel?: ReactNode
  onDetailWidthChange?: (width: number) => void
  presentation?: CollectionPresentation
  title: string
}) {
  const hasWorkspaceDetail = Boolean(detail && detailVariant === "workspace")
  const layoutRef = useRef<HTMLDivElement>(null)
  const resizeOriginRef = useRef<
    | {
        max: number
        min: number
        pointerX: number
        width: number
      }
    | undefined
  >(undefined)
  const [isWorkspaceResizing, setIsWorkspaceResizing] = useState(false)
  const workspaceDetailMinWidth = 384
  const workspaceDetailMaxWidth = 760

  const workspaceResizeBounds = () => {
    const layoutWidth = layoutRef.current?.getBoundingClientRect().width ?? 1280

    return {
      max: Math.max(
        workspaceDetailMinWidth,
        Math.min(workspaceDetailMaxWidth, layoutWidth - 560)
      ),
      min: workspaceDetailMinWidth,
    }
  }

  const resizeWorkspaceDetail = (nextWidth: number) => {
    const { max, min } = workspaceResizeBounds()
    onDetailWidthChange?.(Math.min(Math.max(nextWidth, min), max))
  }

  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col",
        hasWorkspaceDetail ? "min-h-svh xl:h-svh" : "h-svh",
        presentation === "cards" &&
          cn("bg-muted/40 p-3", bottomDock && "pb-14")
      )}
    >
      <div
        className={cn(
          "grid min-h-0 flex-1 grid-cols-1",
          presentation === "cards" && "gap-3",
          detail &&
            (hasWorkspaceDetail
              ? "xl:grid-cols-[minmax(0,1fr)_var(--task-detail-width)]"
              : "xl:grid-cols-[minmax(0,1fr)_20rem]")
        )}
        ref={layoutRef}
        style={
          hasWorkspaceDetail
            ? ({
                "--task-detail-width": `${detailWidth}px`,
              } as CSSProperties)
            : undefined
        }
      >
        <main
          className={cn(
            "flex min-h-0 min-w-0 flex-col",
            presentation === "default" && "gap-6 p-4 sm:p-6",
            presentation === "cards" &&
              "overflow-hidden rounded-lg border bg-background shadow-sm",
            hasWorkspaceDetail && "min-h-[34rem] xl:min-h-0"
          )}
        >
          <div
            className={cn(
              "flex min-w-0 items-center gap-2",
              presentation === "cards" && "shrink-0 border-b px-5 py-4"
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-2xl font-semibold text-balance">{title}</h1>
            </div>
          </div>
          {children}
        </main>
        {detail ? (
          <aside
            className={cn(
              "min-h-0",
              presentation === "default" &&
                "border-t xl:border-l xl:border-t-0",
              presentation === "cards" &&
                "rounded-lg border bg-background shadow-sm",
              hasWorkspaceDetail
                ? "relative min-h-[32rem] overflow-visible"
                : "p-4 sm:p-6"
            )}
          >
            {hasWorkspaceDetail ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label="Resize task view"
                    aria-orientation="vertical"
                    aria-valuemax={workspaceDetailMaxWidth}
                    aria-valuemin={workspaceDetailMinWidth}
                    aria-valuenow={detailWidth}
                    aria-valuetext={`${detailWidth} pixels wide`}
                    className={cn(
                      "group absolute inset-y-0 left-0 z-20 hidden w-3 -translate-x-1/2 cursor-col-resize touch-none select-none xl:block",
                      isWorkspaceResizing && "cursor-col-resize"
                    )}
                    onDoubleClick={() => resizeWorkspaceDetail(520)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowLeft") {
                        event.preventDefault()
                        resizeWorkspaceDetail(detailWidth + 24)
                      } else if (event.key === "ArrowRight") {
                        event.preventDefault()
                        resizeWorkspaceDetail(detailWidth - 24)
                      } else if (event.key === "Home") {
                        event.preventDefault()
                        resizeWorkspaceDetail(520)
                      }
                    }}
                    onPointerCancel={() => {
                      resizeOriginRef.current = undefined
                      setIsWorkspaceResizing(false)
                    }}
                    onPointerDown={(event) => {
                      const { max, min } = workspaceResizeBounds()
                      resizeOriginRef.current = {
                        max,
                        min,
                        pointerX: event.clientX,
                        width: detailWidth,
                      }
                      event.currentTarget.setPointerCapture(event.pointerId)
                      setIsWorkspaceResizing(true)
                    }}
                    onPointerMove={(event) => {
                      const origin = resizeOriginRef.current

                      if (!origin) {
                        return
                      }

                      const nextWidth =
                        origin.width + origin.pointerX - event.clientX
                      onDetailWidthChange?.(
                        Math.min(Math.max(nextWidth, origin.min), origin.max)
                      )
                    }}
                    onPointerUp={(event) => {
                      resizeOriginRef.current = undefined
                      event.currentTarget.releasePointerCapture(event.pointerId)
                      setIsWorkspaceResizing(false)
                    }}
                    role="separator"
                    type="button"
                  >
                    <span
                      className={cn(
                        "absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-colors group-hover:bg-foreground/40 group-focus-visible:bg-ring",
                        isWorkspaceResizing && "bg-ring"
                      )}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left">Drag to resize</TooltipContent>
              </Tooltip>
            ) : null}
            {detail}
          </aside>
        ) : null}
      </div>
      {floatingPanel}
      {bottomDock ? (
        <div className="absolute inset-x-3 bottom-2 z-30">{bottomDock}</div>
      ) : null}
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

type AccountLayerProps = LayerRouteProps & {
  quoteRequestInteraction: QuoteRequestInteractionState
  taskInteraction: TaskInteractionState
}

type QuoteRequestLayerProps = LayerRouteProps & {
  quoteRequestInteraction: QuoteRequestInteractionState
  setQuoteRequestInteraction: React.Dispatch<
    React.SetStateAction<QuoteRequestInteractionState>
  >
  setTaskInteraction: React.Dispatch<React.SetStateAction<TaskInteractionState>>
  taskInteraction: TaskInteractionState
}

type TaskWorkspaceLayerProps = LayerRouteProps & {
  setTaskInteraction: React.Dispatch<React.SetStateAction<TaskInteractionState>>
  taskInteraction: TaskInteractionState
}

type QuoteComparisonLayerProps = LayerRouteProps & {
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

  if (
    experience.workspace === "review-returned-quote" &&
    task.quoteRequestId
  ) {
    return (
      <Navigate
        replace
        state={{
          ...(props.origin ? { pageLayerOrigin: props.origin } : {}),
          activeTaskId: task.id,
        }}
        to={quoteRequestPath(
          account.id,
          opportunity.id,
          task.quoteRequestId
        )}
      />
    )
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

type QuoteComparisonCandidate = {
  carrier: string
  channel: string
  conditions: string
  coverageForm: string
  deductible: string
  id: string
  label: string
  limit: string
  premium: string
  quoteNumber: string
  requestId: string
  reviewStatus: string
  sourceDocument: string
  terms: QuoteComparisonTerms
}

type QuoteComparisonTermKey =
  | "totalCost"
  | "changeFromExpiring"
  | "basePremium"
  | "fees"
  | "coverageForm"
  | "valuation"
  | "propertyLimit"
  | "businessPersonalProperty"
  | "businessIncome"
  | "ordinanceLaw"
  | "waterDamage"
  | "allOtherPerilsDeductible"
  | "windHailDeductible"
  | "materialEndorsement"
  | "bindingRequirement"
  | "coinsurance"

type QuoteComparisonTerms = Record<QuoteComparisonTermKey, string>

type QuoteComparisonRow = {
  category: "Price" | "Coverage" | "Deductibles" | "Terms"
  key: QuoteComparisonTermKey
  label: string
}

const expiringPropertyTerms: QuoteComparisonTerms = {
  totalCost: "$40,300",
  changeFromExpiring: "Baseline",
  basePremium: "$40,300",
  fees: "Included",
  coverageForm: "Special form",
  valuation: "Replacement cost",
  propertyLimit: "$5,000,000",
  businessPersonalProperty: "$500,000",
  businessIncome: "$1,000,000 · 12 months",
  ordinanceLaw: "10% of building limit",
  waterDamage: "$1,000,000",
  allOtherPerilsDeductible: "$25,000",
  windHailDeductible: "2%",
  materialEndorsement: "None",
  bindingRequirement: "None outstanding",
  coinsurance: "80%",
}

const quoteComparisonTermOverrides: Record<
  string,
  Omit<
    QuoteComparisonTerms,
    | "totalCost"
    | "basePremium"
    | "coverageForm"
    | "propertyLimit"
    | "allOtherPerilsDeductible"
    | "materialEndorsement"
  >
> = {
  "option-rt-standard": {
    changeFromExpiring: "+$900",
    fees: "$1,350",
    valuation: "Replacement cost",
    businessPersonalProperty: "$500,000",
    businessIncome: "$1,000,000 · 12 months",
    ordinanceLaw: "10% of building limit",
    waterDamage: "$1,000,000",
    windHailDeductible: "2%",
    bindingRequirement: "Updated roof inspection",
    coinsurance: "80%",
  },
  "option-rt-enhanced-limits": {
    changeFromExpiring: "+$3,600",
    fees: "$1,450",
    valuation: "Replacement cost",
    businessPersonalProperty: "$500,000",
    businessIncome: "$1,500,000 · 18 months",
    ordinanceLaw: "25% of building limit",
    waterDamage: "$1,000,000",
    windHailDeductible: "2%",
    bindingRequirement: "Updated roof inspection",
    coinsurance: "80%",
  },
  "option-rt-low-deductible": {
    changeFromExpiring: "+$7,300",
    fees: "$1,700",
    valuation: "Replacement cost",
    businessPersonalProperty: "$500,000",
    businessIncome: "$1,000,000 · 12 months",
    ordinanceLaw: "10% of building limit",
    waterDamage: "$1,000,000",
    windHailDeductible: "2%",
    bindingRequirement: "Updated roof inspection",
    coinsurance: "80%",
  },
  "option-af-high-deductible": {
    changeFromExpiring: "−$1,400",
    fees: "$1,650",
    valuation: "Replacement cost",
    businessPersonalProperty: "$500,000",
    businessIncome: "$500,000 · 6 months",
    ordinanceLaw: "Not included",
    waterDamage: "$250,000",
    windHailDeductible: "5%",
    bindingRequirement: "Protective safeguards confirmation",
    coinsurance: "80%",
  },
  "option-af-standard-deductible": {
    changeFromExpiring: "+$2,300",
    fees: "$1,750",
    valuation: "Replacement cost",
    businessPersonalProperty: "$500,000",
    businessIncome: "$500,000 · 6 months",
    ordinanceLaw: "Not included",
    waterDamage: "$250,000",
    windHailDeductible: "5%",
    bindingRequirement: "Protective safeguards confirmation",
    coinsurance: "80%",
  },
}

const quoteComparisonRows: QuoteComparisonRow[] = [
  { category: "Price", key: "totalCost", label: "Total annual cost" },
  {
    category: "Price",
    key: "changeFromExpiring",
    label: "Change from expiring",
  },
  { category: "Price", key: "basePremium", label: "Base premium" },
  { category: "Price", key: "fees", label: "Taxes and fees" },
  { category: "Coverage", key: "coverageForm", label: "Coverage form" },
  { category: "Coverage", key: "valuation", label: "Building valuation" },
  { category: "Coverage", key: "propertyLimit", label: "Property limit" },
  {
    category: "Coverage",
    key: "businessPersonalProperty",
    label: "Business personal property",
  },
  { category: "Coverage", key: "businessIncome", label: "Business income" },
  { category: "Coverage", key: "ordinanceLaw", label: "Ordinance or law" },
  { category: "Coverage", key: "waterDamage", label: "Water damage" },
  {
    category: "Deductibles",
    key: "allOtherPerilsDeductible",
    label: "All other perils",
  },
  {
    category: "Deductibles",
    key: "windHailDeductible",
    label: "Wind and hail",
  },
  {
    category: "Terms",
    key: "materialEndorsement",
    label: "Material endorsement",
  },
  {
    category: "Terms",
    key: "bindingRequirement",
    label: "Binding requirement",
  },
  { category: "Terms", key: "coinsurance", label: "Coinsurance" },
]

const quoteRevisionChoices = [
  "Special-form property coverage",
  "$25,000 all-other-perils deductible",
  "$1,000,000 business income for 12 months",
  "Clarify the protective safeguards endorsement",
]

function ReturnedQuoteTriageWorkspace({
  account,
  completeReview,
  opportunity,
  outcome,
  pageLayerProps,
  quoteRequest,
  task,
}: {
  account: AccountRecord
  completeReview: (status: TaskOutcome["status"], result: string) => void
  opportunity: OpportunityRecord
  outcome?: TaskOutcome
  pageLayerProps: LayerRouteProps
  quoteRequest: QuoteRequestRecord
  task?: TaskRecord
}) {
  const [revisionOpen, setRevisionOpen] = useState(false)
  const [revisionRequests, setRevisionRequests] = useState<string[]>([])
  const [revisionNote, setRevisionNote] = useState("")
  const sourceCheckNeeded = quoteRequest.options.some(
    (option) => option.reviewStatus === "Extraction needs review"
  )
  const optionLabel = `${quoteRequest.options.length} ${
    quoteRequest.options.length === 1 ? "option" : "options"
  }`
  const primaryCandidate = quoteComparisonCandidatesForOpportunity(
    opportunity.id
  ).find(
    (candidate) =>
      candidate.requestId === quoteRequest.id &&
      candidate.id === quoteRequest.options[0]?.id
  )
  const materialDifferences = primaryCandidate
    ? [
        {
          key: "totalCost" as const,
          label: "Total annual cost",
          signal: primaryCandidate.terms.changeFromExpiring,
        },
        {
          key: "propertyLimit" as const,
          label: "Property limit",
          signal: "Limit changed",
        },
        {
          key: "businessIncome" as const,
          label: "Business income",
          signal: "Coverage changed",
        },
        {
          key: "allOtherPerilsDeductible" as const,
          label: "All other perils deductible",
          signal: "Deductible changed",
        },
        {
          key: "materialEndorsement" as const,
          label: "Material endorsement",
          signal: "Endorsement added",
        },
        {
          key: "bindingRequirement" as const,
          label: "Binding condition",
          signal: "New condition",
        },
      ].filter(
        ({ key }) =>
          primaryCandidate.terms[key] !== expiringPropertyTerms[key]
      )
    : []
  const marketStatuses = quoteRequestsForOpportunity(opportunity.id).map(
    (request) => ({
      detail:
        request.options.length > 0
          ? `${request.options.length} ${
              request.options.length === 1 ? "option" : "options"
            }${request.bestPremium === "-" ? "" : ` · ${request.bestPremium}`}`
          : request.workflowState,
      isCurrent: request.id === quoteRequest.id,
      market: request.carrier,
      status: request.id === quoteRequest.id ? "This quote" : request.status,
    })
  )

  const updateRevisionRequest = (request: string, checked: boolean) => {
    setRevisionRequests((current) =>
      checked
        ? [...current, request]
        : current.filter((currentRequest) => currentRequest !== request)
    )
  }

  return (
    <>
      <PageLayerFrame
        {...pageLayerProps}
        contentClassName="h-full gap-0 p-0 sm:p-0"
        breadcrumb={
          <ObjectBreadcrumb
            activeTaskId={pageLayerProps.activeTaskId}
            items={[
              {
                label: account.name,
                path: `/accounts/${account.id}`,
              },
              {
                label: "Opportunities",
                path: `/accounts/${account.id}#opportunities`,
              },
              { current: true, label: `${quoteRequest.carrier} quote` },
            ]}
            navigateInsideLayer={pageLayerProps.navigateInsideLayer}
          />
        }
        mainClassName="lg:overflow-hidden"
      >
        <section className="grid min-h-full min-w-0 bg-background lg:h-full lg:min-h-0 lg:grid-cols-[minmax(34rem,0.95fr)_minmax(34rem,1.05fr)]">
          <div className="min-w-0 lg:min-h-0 lg:overflow-y-auto">
            <div className="flex min-w-0 flex-col gap-7 p-5 sm:p-7 lg:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-yellow-300 bg-yellow-100 text-yellow-950" variant="outline">
                  New quote
                </Badge>
                <Badge variant="secondary">
                  {sourceCheckNeeded ? "Source check needed" : "Source reviewed"}
                </Badge>
                {outcome ? <Badge variant="outline">{outcome.status}</Badge> : null}
                <span className="text-sm text-muted-foreground tabular-nums">
                  Due {task?.due ?? quoteRequest.due}
                </span>
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-balance">
                  {quoteRequest.carrier} property quote
                </h1>
                <p className="max-w-[64ch] text-sm text-muted-foreground text-pretty">
                  {optionLabel} returned for {account.name}. Review the extracted
                  terms and record the next step.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  disabled={Boolean(outcome)}
                  onClick={() => setRevisionOpen(true)}
                  type="button"
                >
                  <MailIcon data-icon="inline-start" />
                  Request changes
                </Button>
                <Button
                  disabled={Boolean(outcome)}
                  onClick={() =>
                    completeReview(
                      "Held",
                      `${quoteRequest.carrier} quote placed on hold pending further activity`
                    )
                  }
                  type="button"
                  variant="outline"
                >
                  <HistoryIcon data-icon="inline-start" />
                  Hold
                </Button>
                <Button
                  disabled={Boolean(outcome)}
                  onClick={() =>
                    completeReview(
                      "Closed",
                      `${quoteRequest.carrier} option declined because its coverage does not meet the client's requirements`
                    )
                  }
                  type="button"
                  variant="destructive"
                >
                  <XIcon data-icon="inline-start" />
                  Decline
                </Button>
              </div>

              {outcome ? (
                <div
                  aria-live="polite"
                  className="flex items-start gap-2 border-y py-3 text-sm"
                >
                  <CheckIcon className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <span className="font-medium">{outcome.status}.</span>{" "}
                    {outcome.result}. Updated {outcome.completedAt}.
                  </span>
                </div>
              ) : null}

              <section className="flex min-w-0 flex-col gap-4 border-t pt-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <h2 className="text-lg font-semibold text-balance">
                      Extracted options
                    </h2>
                    <p className="text-sm text-muted-foreground text-pretty">
                      {quoteRequest.channel} {quoteRequest.submissionMethod.toLowerCase()} · Quote {quoteRequest.externalId} · {optionLabel}.
                    </p>
                  </div>
                  <Badge variant="secondary">Quoted</Badge>
                </div>

                <div className="divide-y border-y">
                  {quoteRequest.options.map((option) => (
                    <div
                      className="grid gap-3 py-4 sm:grid-cols-[minmax(9rem,1fr)_repeat(3,minmax(6.5rem,auto))] sm:items-center"
                      key={option.id}
                    >
                      <div className="min-w-0">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {option.quoteNumber}
                        </div>
                      </div>
                      <ContextItem label="Total cost" value={option.totalPremium} />
                      <ContextItem label="Property limit" value={option.limit} />
                      <ContextItem label="Deductible" value={option.deductible} />
                    </div>
                  ))}
                </div>

                <div
                  className={cn(
                    "flex min-w-0 items-start gap-2 text-sm",
                    sourceCheckNeeded
                      ? "text-amber-900"
                      : "text-muted-foreground"
                  )}
                >
                  {sourceCheckNeeded ? (
                    <FileSearch2Icon className="mt-0.5 size-4 shrink-0" />
                  ) : (
                    <CheckIcon className="mt-0.5 size-4 shrink-0" />
                  )}
                  <span>
                    {sourceCheckNeeded
                      ? "Verify the extracted totals and conditions against the original document."
                      : "The extracted totals and conditions were reviewed against the original document."}
                  </span>
                </div>
              </section>

              <section className="flex min-w-0 flex-col gap-3 border-t pt-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-balance">
                    Material differences
                  </h2>
                  <p className="text-sm text-muted-foreground text-pretty">
                    Lowest {quoteRequest.carrier} option compared with the expiring policy.
                  </p>
                </div>
                <div className="-mx-4 -my-2 overflow-x-auto whitespace-nowrap sm:mx-0">
                  <div className="inline-block min-w-full px-4 py-2 align-middle sm:px-0">
                    <Table className="min-w-[42rem]">
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="whitespace-nowrap">Term</TableHead>
                          <TableHead className="whitespace-nowrap">Expiring policy</TableHead>
                          <TableHead className="whitespace-nowrap">{quoteRequest.carrier}</TableHead>
                          <TableHead className="whitespace-nowrap">Signal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materialDifferences.map(({ key, label, signal }) => (
                          <TableRow key={key}>
                            <TableCell className="font-medium">{label}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {expiringPropertyTerms[key]}
                            </TableCell>
                            <TableCell>{primaryCandidate?.terms[key]}</TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  signal.startsWith("−") || signal.startsWith("-")
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                    : "border-yellow-200 bg-yellow-50 text-yellow-950"
                                )}
                                variant="outline"
                              >
                                {signal}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </section>

              <section className="flex min-w-0 flex-col gap-5 border-t pt-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-balance">
                    Decision context
                  </h2>
                  <p className="text-sm text-muted-foreground text-pretty">
                    Client requirements and the current market position.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="font-semibold text-balance">Client priorities</h3>
                  <ul className="divide-y border-y" role="list">
                    {[
                      "Keep annual premium below $50,000",
                      "Prefer special-form property coverage",
                      "Accept deductibles up to $25,000",
                    ].map((priority) => (
                      <li
                        className="flex items-start gap-2 py-3 text-sm"
                        key={priority}
                      >
                        <CheckIcon className="mt-0.5 size-4 shrink-0" />
                        <span>{priority}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="font-semibold text-balance">Market status</h3>
                  <div className="divide-y border-y">
                    {marketStatuses.map(({ detail, isCurrent, market, status }) => (
                      <div
                        className="flex min-w-0 items-center justify-between gap-3 py-3"
                        key={market}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {market}
                          </div>
                          <div className="truncate text-sm text-muted-foreground">
                            {detail}
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            isCurrent &&
                              "border-yellow-300 bg-yellow-100 text-yellow-950"
                          )}
                          variant="outline"
                        >
                          {status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
          <QuoteDocumentViewer account={account} quoteRequest={quoteRequest} />
        </section>
      </PageLayerFrame>

      <Dialog onOpenChange={setRevisionOpen} open={revisionOpen}>
        <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-5 pr-14">
            <DialogTitle>Request {quoteRequest.carrier} quote changes</DialogTitle>
            <DialogDescription>
              Select one or more revisions. Switchboard will draft the carrier request.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5 p-6">
            <div className="divide-y border-y">
              {quoteRevisionChoices.map((request, index) => {
                const id = `quote-revision-${index}`
                const checked = revisionRequests.includes(request)

                return (
                  <label
                    className="flex cursor-pointer items-center gap-3 py-3 text-sm font-medium"
                    htmlFor={id}
                    key={request}
                  >
                    <Checkbox
                      checked={checked}
                      id={id}
                      name="quote-revision"
                      onCheckedChange={(value) =>
                        updateRevisionRequest(request, value === true)
                      }
                    />
                    {request}
                  </label>
                )
              })}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="quote-revision-note">
                Additional note
              </label>
              <Textarea
                id="quote-revision-note"
                name="quote-revision-note"
                onChange={(event) => setRevisionNote(event.target.value)}
                placeholder="Add context for the underwriter."
                rows={4}
                value={revisionNote}
              />
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button
              onClick={() => setRevisionOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={revisionRequests.length === 0}
              onClick={() => {
                completeReview(
                  "Waiting on carrier",
                  `Requested ${revisionRequests.join(", ").toLowerCase()} from ${quoteRequest.carrier}${revisionNote.trim() ? " with an additional broker note" : ""}`
                )
                setRevisionOpen(false)
              }}
              type="button"
            >
              <SendIcon data-icon="inline-start" />
              Send request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  )
}

function QuoteDocumentViewer({
  account,
  quoteRequest,
}: {
  account: AccountRecord
  quoteRequest: QuoteRequestRecord
}) {
  const [page, setPage] = useState(1)
  const pageCount = 3
  const primaryOption = quoteRequest.options[0]
  const primaryCandidate = quoteComparisonCandidatesForOpportunity(
    quoteRequest.opportunityId
  ).find((candidate) => candidate.id === primaryOption?.id)
  const accentColor =
    quoteRequest.carrier === "Accident Fund" ? "#8b1e2d" : "#155e75"
  const carrierInitials = quoteRequest.carrier
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const documentName =
    primaryOption?.sourceDocument ?? `${quoteRequest.carrier} quote.pdf`
  const coverageRows = primaryCandidate
    ? [
        ["Building coverage", primaryCandidate.terms.propertyLimit, primaryCandidate.terms.valuation],
        ["Business personal property", primaryCandidate.terms.businessPersonalProperty, "Replacement cost"],
        ["Business income", primaryCandidate.terms.businessIncome, "Policy period"],
        ["Ordinance or law", primaryCandidate.terms.ordinanceLaw, "Included limit"],
        ["Water damage", primaryCandidate.terms.waterDamage, "Annual aggregate"],
        ["All other perils", primaryCandidate.terms.allOtherPerilsDeductible, "Deductible"],
        ["Wind and hail", primaryCandidate.terms.windHailDeductible, "Deductible"],
      ]
    : []

  return (
    <aside
      aria-label="Original quote document"
      className="flex min-h-[44rem] min-w-0 flex-col bg-neutral-950 text-white lg:min-h-0"
    >
      <div className="flex min-h-14 shrink-0 items-center justify-between gap-4 border-b border-white/15 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <FileTextIcon className="size-4 shrink-0 text-neutral-300" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">
              {documentName}
            </div>
            <div className="text-xs text-neutral-400">Original quote</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Previous document page"
                className="border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <ChevronLeftIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous page</TooltipContent>
          </Tooltip>
          <span
            aria-live="polite"
            className="min-w-14 text-center text-xs text-neutral-300 tabular-nums"
          >
            {page} / {pageCount}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Next document page"
                className="border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white"
                disabled={page === pageCount}
                onClick={() =>
                  setPage((current) => Math.min(pageCount, current + 1))
                }
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <ChevronRightIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next page</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto p-4 sm:p-6 lg:p-8">
        <article
          aria-label={`Page ${page} of ${pageCount}`}
          className="w-full max-w-[36rem] shrink-0 bg-white text-neutral-900 shadow-2xl"
          style={{ aspectRatio: "8.5 / 11" }}
        >
          <div className="flex h-full flex-col p-[7%]">
            <header
              className="flex items-start justify-between gap-6 border-b-4 pb-5"
              style={{ borderColor: accentColor }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex size-10 items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {carrierInitials}
                </div>
                <div>
                  <div className="text-lg font-bold">{quoteRequest.carrier}</div>
                  <div className="text-[10px] text-neutral-500">
                    {quoteRequest.channel === "Wholesale"
                      ? "Wholesale property market"
                      : "Direct property market"}
                  </div>
                </div>
              </div>
              <div className="text-right text-[10px] leading-4 text-neutral-500">
                <div>QUOTE {quoteRequest.externalId}</div>
                <div>Issued {quoteRequest.lastActivity}</div>
              </div>
            </header>

            {page === 1 ? (
              <div className="flex flex-1 flex-col pt-7">
                <div className="mb-7">
                  <div
                    className="text-[10px] font-semibold uppercase"
                    style={{ color: accentColor }}
                  >
                    Commercial property quotation
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {account.name}
                  </h2>
                  <p className="mt-1 text-xs text-neutral-500">
                    {account.location ?? "Account location on file"}
                  </p>
                </div>

                <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-y py-5 text-xs">
                  <div>
                    <dt className="text-neutral-500">Policy term</dt>
                    <dd className="mt-1 font-medium">Oct 3, 2026 – Oct 3, 2027</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Broker</dt>
                    <dd className="mt-1 font-medium">Switchboard Insurance</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Coverage</dt>
                    <dd className="mt-1 font-medium">{quoteRequest.line}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">Underwriter</dt>
                    <dd className="mt-1 font-medium">{quoteRequest.underwriter}</dd>
                  </div>
                </dl>

                <div className="mt-7">
                  <h3 className="text-sm font-semibold">Premium options</h3>
                  <div className="mt-3 divide-y border-y text-xs">
                    {quoteRequest.options.map((option) => (
                      <div
                        className="grid grid-cols-[1fr_auto] gap-6 py-3"
                        key={option.id}
                      >
                        <div>
                          <div className="font-semibold">{option.label}</div>
                          <div className="mt-1 text-neutral-500">
                            {option.limit} limit · {option.deductible} deductible
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{option.totalPremium}</div>
                          <div className="mt-1 text-neutral-500">annual</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : page === 2 ? (
              <div className="flex flex-1 flex-col pt-7">
                <div className="mb-6">
                  <div
                    className="text-[10px] font-semibold uppercase"
                    style={{ color: accentColor }}
                  >
                    Coverage schedule
                  </div>
                  <h2 className="mt-2 text-xl font-semibold">Property terms</h2>
                </div>
                <div className="border-y text-xs">
                  {coverageRows.map(([coverage, limit, basis]) => (
                    <div
                      className="grid grid-cols-[1.2fr_0.8fr_1fr] gap-4 border-b py-3 last:border-b-0"
                      key={coverage}
                    >
                      <div className="font-medium">{coverage}</div>
                      <div className="text-right tabular-nums">{limit}</div>
                      <div className="text-right text-neutral-500">{basis}</div>
                    </div>
                  ))}
                </div>
                <div
                  className="mt-7 border-l-4 bg-neutral-100 p-4 text-xs leading-5"
                  style={{ borderColor: accentColor }}
                >
                  Coverage is subject to the terms, conditions, limitations, and
                  exclusions in the issued policy forms.
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col pt-7">
                <div className="mb-6">
                  <div
                    className="text-[10px] font-semibold uppercase"
                    style={{ color: accentColor }}
                  >
                    Conditions and subjectivities
                  </div>
                  <h2 className="mt-2 text-xl font-semibold">
                    Requirements prior to binding
                  </h2>
                </div>
                <ol className="space-y-4 text-xs leading-5">
                  <li className="flex gap-3 border-b pb-4">
                    <span className="font-semibold" style={{ color: accentColor }}>01</span>
                    <span>
                      Signed and dated application including the current property
                      schedule.
                    </span>
                  </li>
                  <li className="flex gap-3 border-b pb-4">
                    <span className="font-semibold" style={{ color: accentColor }}>02</span>
                    <span>
                      Review and accept the {primaryOption?.conditions.toLowerCase() ?? "listed endorsements"}.
                    </span>
                  </li>
                  <li className="flex gap-3 border-b pb-4">
                    <span className="font-semibold" style={{ color: accentColor }}>03</span>
                    <span>
                      No material change in operations, ownership, or loss history
                      before the effective date.
                    </span>
                  </li>
                </ol>
                <div
                  className="mt-7 p-5 text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  <div className="text-sm font-semibold">
                    {primaryOption?.conditions ?? "Quote conditions"}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/85">
                    This condition forms part of the returned quote and must be
                    reviewed before the option is presented or bound.
                  </p>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-8 border-t pt-5 text-[10px] text-neutral-500">
                  <div>
                    <div className="h-px bg-neutral-400" />
                    <div className="mt-2">Authorized representative</div>
                  </div>
                  <div>
                    <div className="h-px bg-neutral-400" />
                    <div className="mt-2">Date</div>
                  </div>
                </div>
              </div>
            )}

            <footer className="mt-auto flex items-center justify-between border-t pt-4 text-[9px] text-neutral-400">
              <span>{quoteRequest.carrier} quote document</span>
              <span className="tabular-nums">Page {page} of {pageCount}</span>
            </footer>
          </div>
        </article>
      </div>
    </aside>
  )
}

export function QuoteReviewWorkspace({
  account,
  candidateOptionIds,
  completeReview,
  initialMode = "triage",
  onBackToQuote,
  opportunity,
  outcome,
  pageLayerProps,
  task,
}: {
  account: AccountRecord
  candidateOptionIds?: string[]
  completeReview: (status: TaskOutcome["status"], result: string) => void
  initialMode?: "triage" | "comparison"
  onBackToQuote?: () => void
  opportunity: OpportunityRecord
  outcome?: TaskOutcome
  pageLayerProps: TaskWorkspaceLayerProps
  task: TaskRecord
}) {
  const quoteRequests = [
    findQuoteRequest("qr-bob-rt-specialty-property"),
    findQuoteRequest("qr-bob-accident-fund-property"),
  ]
  const allCandidates = quoteRequests.flatMap<QuoteComparisonCandidate>((request) => {
    const coverageForm =
      request.submittedValues.find((value) => value.label === "Coverage form")
        ?.value ?? "-"

    return request.options.map((option) => {
      const termOverrides = quoteComparisonTermOverrides[option.id]

      if (!termOverrides) {
        throw new Error(`Missing comparison terms for ${option.id}`)
      }

      return {
        carrier: request.carrier,
        channel: request.channel,
        conditions: option.conditions,
        coverageForm,
        deductible: option.deductible,
        id: option.id,
        label: option.label,
        limit: option.limit,
        premium: option.totalPremium,
        quoteNumber: option.quoteNumber,
        requestId: request.id,
        reviewStatus: option.reviewStatus,
        sourceDocument: option.sourceDocument,
        terms: {
          ...termOverrides,
          totalCost: option.totalPremium,
          basePremium: option.premium,
          coverageForm,
          propertyLimit: option.limit,
          allOtherPerilsDeductible: option.deductible,
          materialEndorsement: option.conditions,
        },
      }
    })
  })
  const candidates =
    candidateOptionIds && candidateOptionIds.length >= 2
      ? allCandidates.filter((candidate) =>
          candidateOptionIds.includes(candidate.id)
        )
      : allCandidates
  const [selectedOptionId, setSelectedOptionId] = useState(
    candidates.some((candidate) => candidate.id === "option-rt-standard")
      ? "option-rt-standard"
      : candidates[0]?.id
  )
  const [showAllTerms, setShowAllTerms] = useState(false)
  const [proposalOpen, setProposalOpen] = useState(false)
  const [proposalDraft, setProposalDraft] = useState("")
  const [workspaceMode, setWorkspaceMode] = useState<"triage" | "comparison">(
    initialMode
  )
  const selectedOption =
    candidates.find((candidate) => candidate.id === selectedOptionId) ??
    candidates[0]
  const candidateRequestCount = new Set(
    candidates.map((candidate) => candidate.requestId)
  ).size
  const visibleComparisonRows = quoteComparisonRows.filter((row) => {
    if (showAllTerms) return true

    const values = [
      expiringPropertyTerms[row.key],
      ...candidates.map((candidate) => candidate.terms[row.key]),
    ]

    return new Set(values).size > 1
  })
  const isRecommendedOption = selectedOption.id === "option-rt-standard"

  const agentObservation = isRecommendedOption
    ? "RT Specialty costs $2,300 more than the lowest option, but keeps the deductible at $25,000 and uses a special coverage form. The roof limitation endorsement still needs broker review."
    : selectedOption.carrier === "Accident Fund"
      ? "This option lowers premium, but uses a basic coverage form. Confirm that the narrower form and protective-safeguards condition fit the client's risk tolerance."
      : "This option preserves the special coverage form. Compare its added premium with the limit or deductible improvement before recommending it."

  const openProposal = () => {
    setProposalDraft(
      `We recommend the ${selectedOption.carrier} ${selectedOption.label.toLowerCase()} option at ${selectedOption.premium} annually. It provides a ${selectedOption.limit} limit with a ${selectedOption.deductible} deductible using the ${selectedOption.coverageForm.toLowerCase()} coverage form. Before binding, we will review the ${selectedOption.conditions.toLowerCase()}.`
    )
    setProposalOpen(true)
  }

  if (workspaceMode === "triage") {
    return (
      <ReturnedQuoteTriageWorkspace
        account={account}
        completeReview={completeReview}
        opportunity={opportunity}
        outcome={outcome}
        pageLayerProps={pageLayerProps}
        quoteRequest={findQuoteRequest(task.quoteRequestId)}
        task={task}
      />
    )
  }

  return (
    <>
      <PageLayerFrame
        {...pageLayerProps}
        breadcrumb={
          <ObjectBreadcrumb
            activeTaskId={pageLayerProps.activeTaskId}
            items={[
              {
                label: account.name,
                path: `/accounts/${account.id}`,
              },
              {
                label: opportunity.name,
                path: `/accounts/${account.id}/opportunities/${opportunity.id}`,
              },
              { current: true, label: "Compare quotes" },
            ]}
            navigateInsideLayer={pageLayerProps.navigateInsideLayer}
          />
        }
      >
        <section className="flex min-w-0 flex-col gap-6">
          <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:justify-between">
            <div className="flex min-w-0 flex-col gap-3">
              <Button
                className="w-fit"
                onClick={() =>
                  onBackToQuote ? onBackToQuote() : setWorkspaceMode("triage")
                }
                size="sm"
                type="button"
                variant="ghost"
              >
                <ArrowLeftIcon data-icon="inline-start" />
                Back to Accident Fund quote
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className="border-amber-200 bg-amber-50 text-amber-950"
                  variant="outline"
                >
                  Comparing options
                </Badge>
                <Badge variant="secondary">
                  {candidateRequestCount} returned{" "}
                  {candidateRequestCount === 1 ? "quote" : "quotes"}
                </Badge>
                <span className="text-sm text-muted-foreground tabular-nums">
                  Due {task.due}
                </span>
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <h1 className="text-2xl font-semibold text-balance">
                  Compare property quote options
                </h1>
                <p className="max-w-[72ch] text-sm text-muted-foreground text-pretty">
                  Focus on the material differences across {candidates.length}{" "}
                  {candidateOptionIds ? "selected" : "returned"} options, choose
                  the best fit for Bob Smith Construction, and prepare a client
                  recommendation.
                </p>
              </div>
            </div>
            <Button
              onClick={() =>
                pageLayerProps.navigateInsideLayer(
                  `/accounts/${account.id}/opportunities/${opportunity.id}`,
                  pageLayerProps.activeTaskId
                )
              }
              type="button"
              variant="outline"
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Back to opportunity
            </Button>
          </div>

          <section className="grid gap-4 border-y py-4 sm:grid-cols-2 lg:grid-cols-5">
            <ContextItem label="Account" value={account.name} />
            <ContextItem label="Opportunity" value={opportunity.name} />
            <ContextItem label="Line" value={task.line} />
            <ContextItem label="Effective date" value={task.effectiveDate} />
            <ContextItem label="Expiring premium" value="$40,300" />
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
              <AlertTitle>
                {candidates.length} options normalized from{" "}
                {candidateRequestCount}{" "}
                {candidateRequestCount === 1 ? "quote" : "quotes"}
              </AlertTitle>
              <AlertDescription>
                RT Specialty was extracted and reviewed. Accident Fund still
                needs a source check before its terms are presented.
              </AlertDescription>
            </Alert>
          )}

          <section className="flex min-w-0 flex-col gap-6">
            <section className="flex flex-col gap-4 border-y py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="font-semibold text-balance">Client priorities</h2>
                  <p className="text-sm text-muted-foreground text-pretty">
                    Use these requirements to judge material differences.
                  </p>
                </div>
                <Badge variant="secondary">3 decision criteria</Badge>
              </div>
              <ul className="grid gap-3 md:grid-cols-3" role="list">
                {[
                  "Keep annual premium below $50,000",
                  "Prefer special-form property coverage",
                  "Accept deductibles up to $25,000",
                ].map((priority) => (
                  <li className="flex items-start gap-2 text-sm" key={priority}>
                    <CheckIcon className="size-4 shrink-0" />
                    <span>{priority}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-balance">
                  Coverage differences
                </h2>
                <p className="text-sm text-muted-foreground text-pretty">
                  Expiring terms are the baseline. Identical terms are hidden.
                </p>
              </div>
              <label
                className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                htmlFor="show-all-quote-terms"
              >
                <Checkbox
                  checked={showAllTerms}
                  id="show-all-quote-terms"
                  name="show-all-quote-terms"
                  onCheckedChange={(checked) => setShowAllTerms(checked === true)}
                />
                Show all terms
              </label>
            </div>

            <div className="-mx-4 -my-2 overflow-x-auto whitespace-nowrap sm:-mx-6">
              <div className="inline-block min-w-full px-4 py-2 align-middle sm:px-6">
                <Table
                  className={cn(
                    candidates.length > 3
                      ? "min-w-[92rem]"
                      : candidates.length === 3
                        ? "min-w-[68rem]"
                        : "min-w-[52rem]"
                  )}
                >
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="sticky left-0 z-20 min-w-56 whitespace-nowrap bg-background">
                        Coverage term
                      </TableHead>
                      <TableHead className="min-w-48 whitespace-nowrap bg-muted/30 align-top">
                        <div className="flex flex-col gap-1 py-2">
                          <div className="font-semibold text-foreground">
                            Expiring policy
                          </div>
                          <div className="text-xs font-normal text-muted-foreground">
                            The Hartford · Baseline
                          </div>
                          <div className="font-semibold text-foreground tabular-nums">
                            $40,300
                          </div>
                        </div>
                      </TableHead>
                      {candidates.map((candidate) => {
                        const selected = candidate.id === selectedOption.id
                        const bestFit = candidate.id === "option-rt-standard"

                        return (
                          <TableHead
                            className={cn(
                              "min-w-52 whitespace-nowrap align-top",
                              selected && "bg-amber-100/70"
                            )}
                            key={candidate.id}
                          >
                            <label className="flex cursor-pointer items-start gap-2 py-2">
                              <input
                                aria-label={`Recommend ${candidate.carrier} ${candidate.label}`}
                                checked={selected}
                                className="size-4 shrink-0 accent-amber-700"
                                name="quote-recommendation"
                                onChange={() => setSelectedOptionId(candidate.id)}
                                type="radio"
                              />
                              <span className="flex min-w-0 flex-col gap-1">
                                <span className="flex min-w-0 items-center gap-2">
                                  <span className="truncate font-semibold text-foreground">
                                    {candidate.carrier}
                                  </span>
                                  {bestFit ? (
                                    <Badge className="border-amber-300 bg-amber-100 text-amber-950" variant="outline">
                                      Best fit
                                    </Badge>
                                  ) : null}
                                </span>
                                <span className="truncate font-normal text-muted-foreground">
                                  {candidate.label} · {candidate.quoteNumber}
                                </span>
                                <span className="font-semibold text-foreground tabular-nums">
                                  {candidate.premium}
                                </span>
                              </span>
                            </label>
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(["Price", "Coverage", "Deductibles", "Terms"] as const).map(
                      (category) => {
                        const rows = visibleComparisonRows.filter(
                          (row) => row.category === category
                        )

                        if (rows.length === 0) return null

                        return (
                          <Fragment key={category}>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                              <TableCell
                                className="sticky left-0 z-10 bg-muted/95 font-semibold"
                                colSpan={candidates.length + 2}
                              >
                                {category}
                              </TableCell>
                            </TableRow>
                            {rows.map((row) => {
                              const baselineValue = expiringPropertyTerms[row.key]

                              return (
                                <TableRow key={row.key}>
                                  <TableCell className="sticky left-0 z-10 min-w-56 whitespace-normal bg-background font-medium">
                                    {row.label}
                                  </TableCell>
                                  <TableCell className="min-w-48 whitespace-normal bg-muted/20 text-sm tabular-nums">
                                    {baselineValue}
                                  </TableCell>
                                  {candidates.map((candidate) => {
                                    const value = candidate.terms[row.key]
                                    const differs = value !== baselineValue
                                    const selected = candidate.id === selectedOption.id

                                    return (
                                      <TableCell
                                        className={cn(
                                          "min-w-52 whitespace-normal text-sm tabular-nums",
                                          differs && "bg-amber-50/50 font-medium",
                                          selected && "bg-amber-100/70"
                                        )}
                                        key={candidate.id}
                                      >
                                        {value}
                                      </TableCell>
                                    )
                                  })}
                                </TableRow>
                              )
                            })}
                          </Fragment>
                        )
                      }
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <section className="grid gap-8 border-t pt-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="size-4 shrink-0" />
                  <h2 className="font-semibold">Recommendation rationale</h2>
                </div>
                <div className="flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold">
                      {selectedOption.carrier} · {selectedOption.label}
                    </div>
                    {isRecommendedOption ? (
                      <Badge className="border-amber-300 bg-amber-100 text-amber-950" variant="outline">
                        Best fit
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-amber-950 text-pretty">
                    {agentObservation}
                  </p>
                </div>
              </div>

              <aside className="flex min-w-0 flex-col gap-3 lg:border-l lg:pl-6">
                <h2 className="font-semibold">Source review</h2>
                <div className="divide-y border-y">
                  {quoteRequests.map((request) => {
                    const needsReview =
                      request.options[0]?.reviewStatus === "Extraction needs review"

                    return (
                      <div
                        className="flex min-w-0 items-center justify-between gap-3 py-3"
                        key={request.id}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {request.carrier}
                          </div>
                          <div
                            className={cn(
                              "truncate text-xs",
                              needsReview ? "text-amber-800" : "text-muted-foreground"
                            )}
                          >
                            {request.options[0]?.reviewStatus}
                          </div>
                        </div>
                        <Button
                          className="shrink-0"
                          onClick={() =>
                            pageLayerProps.navigateInsideLayer(
                              quoteRequestPath(
                                account.id,
                                opportunity.id,
                                request.id
                              ),
                              task.id
                            )
                          }
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <FileTextIcon data-icon="inline-start" />
                          View source
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </aside>
            </section>
          </section>

          <section className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                Selected: {selectedOption.carrier} · {selectedOption.label}
              </div>
              <div className="text-sm text-muted-foreground tabular-nums">
                {selectedOption.premium} annual premium
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2">
              <Button
                disabled={Boolean(outcome)}
                onClick={() =>
                  completeReview(
                    "Waiting on carrier",
                    `Revision requested from ${selectedOption.carrier}`
                  )
                }
                type="button"
                variant="outline"
              >
                Request revision
              </Button>
              <Button disabled={Boolean(outcome)} onClick={openProposal} type="button">
                Draft client proposal
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
          </section>
        </section>
      </PageLayerFrame>

      <Dialog onOpenChange={setProposalOpen} open={proposalOpen}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b px-6 py-5 pr-14">
            <DialogTitle>Draft client proposal</DialogTitle>
            <DialogDescription>
              Review the recommendation before creating the proposal.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5 p-6">
            <div className="grid gap-4 border-y py-4 sm:grid-cols-3">
              <ContextItem label="Carrier" value={selectedOption.carrier} />
              <ContextItem label="Option" value={selectedOption.label} />
              <ContextItem label="Premium" value={selectedOption.premium} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="proposal-summary">
                Recommendation summary
              </label>
              <Textarea
                id="proposal-summary"
                name="proposal-summary"
                onChange={(event) => setProposalDraft(event.target.value)}
                rows={7}
                value={proposalDraft}
              />
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button
              onClick={() => setProposalOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={proposalDraft.trim().length === 0}
              onClick={() => {
                completeReview(
                  "Ready to present",
                  `${selectedOption.carrier} ${selectedOption.label.toLowerCase()} option selected for the client proposal`
                )
                setProposalOpen(false)
              }}
              type="button"
            >
              Create proposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
      to={accountOpportunityMatrixPath(account.id, opportunity.id)}
    />
  )
}

function AccountOpportunityRouteRedirect({
  activeTaskId,
  origin,
  view,
}: Pick<LayerRouteProps, "activeTaskId" | "origin"> & {
  view: "details" | "matrix"
}) {
  const { accountId, opportunityId } = useParams()
  const location = useLocation()
  const account = findAccount(accountId)
  const opportunity = findOpportunity(opportunityId)

  return (
    <Navigate
      replace
      state={{
        ...(origin ? { pageLayerOrigin: origin } : {}),
        ...(activeTaskId ? { activeTaskId } : {}),
      }}
      to={
        view === "details"
          ? accountOpportunityDetailsPath(account.id, opportunity.id)
          : `/accounts/${account.id}/compare${location.search}`
      }
    />
  )
}

type AccountTab = "overview" | "opportunities" | "intake" | "activity"

function accountTabFromHash(hash: string): AccountTab {
  const tab = hash.replace(/^#/, "")

  return tab === "opportunities" || tab === "intake" || tab === "activity"
    ? tab
    : "overview"
}

type AccountActivityItem = {
  actor: string
  detail: string
  id: string
  timestamp: string
  title: string
}

type AccountIntakeItem = {
  detail: string
  name: string
  owner: string
  status: "Complete" | "Needs review" | "Missing details"
  updated: string
}

const bobAccountActivity: AccountActivityItem[] = [
  {
    actor: "Coterie automated underwriting",
    detail: "Requested confirmation of the roof replacement scope.",
    id: "activity-coterie-question",
    timestamp: "Aug 27, 2026, 1:38 PM",
    title: "Additional information requested",
  },
  {
    actor: "Switchboard agent",
    detail: "Accident Fund returned a $38,900 property option.",
    id: "activity-accident-fund-quote",
    timestamp: "Aug 27, 2026, 10:12 AM",
    title: "Quote received",
  },
  {
    actor: "Jordan Price",
    detail: "Confirmed the Amwins submission is with the property team.",
    id: "activity-amwins-review",
    timestamp: "Aug 27, 2026, 8:45 AM",
    title: "Market review in progress",
  },
  {
    actor: "Mia Chen",
    detail: "Chubb declined because the building TIV is outside appetite.",
    id: "activity-chubb-decline",
    timestamp: "Aug 26, 2026, 2:21 PM",
    title: "Quote request declined",
  },
  {
    actor: "CNA property desk",
    detail: "CNA declined the municipal renovation exposure.",
    id: "activity-cna-decline",
    timestamp: "Aug 25, 2026, 4:08 PM",
    title: "Quote request declined",
  },
  {
    actor: "Switchboard agent",
    detail: "Commercial Property submission sent to seven markets.",
    id: "activity-property-submitted",
    timestamp: "Aug 24, 2026, 9:14 AM",
    title: "Marketing started",
  },
  {
    actor: "a@aol.com",
    detail: "Updated payroll, revenue, and subcontractor costs for renewal.",
    id: "activity-gl-update",
    timestamp: "Aug 22, 2026, 3:32 PM",
    title: "General Liability intake updated",
  },
]

const bobAccountIntake: AccountIntakeItem[] = [
  {
    detail: "Signed application and supplemental questionnaire",
    name: "Commercial insurance application",
    owner: "Bob Smith",
    status: "Complete",
    updated: "Aug 24, 2026",
  },
  {
    detail: "12 locations with construction and occupancy details",
    name: "Property schedule",
    owner: "a@aol.com",
    status: "Complete",
    updated: "Aug 24, 2026",
  },
  {
    detail: "Five policy years across current lines",
    name: "Loss runs",
    owner: "a@aol.com",
    status: "Complete",
    updated: "Aug 23, 2026",
  },
  {
    detail: "18 drivers; two MVR follow-ups remain",
    name: "Driver schedule",
    owner: "Bob Smith",
    status: "Needs review",
    updated: "Aug 22, 2026",
  },
  {
    detail: "Leased cranes, lifts, and rented equipment need values",
    name: "Contractors equipment schedule",
    owner: "Bob Smith",
    status: "Missing details",
    updated: "Aug 21, 2026",
  },
  {
    detail: "Four active policies and endorsement schedules",
    name: "Current policies",
    owner: "Switchboard agent",
    status: "Complete",
    updated: "Aug 20, 2026",
  },
]

function AccountLayer(props: AccountLayerProps) {
  const { accountId } = useParams()
  const location = useLocation()
  const account = findAccount(accountId)
  const accountOpportunities = useMemo(
    () => opportunitiesForAccount(account.id),
    [account.id]
  )
  const [activeTab, setActiveTab] = useState<AccountTab>(() =>
    accountTabFromHash(location.hash)
  )
  const requestedOpportunityId = new URLSearchParams(location.search).get(
    "opportunity"
  )
  const focusedOpportunityId = new URLSearchParams(location.search).get("focus")
  const preservedOpportunitiesScroll = new URLSearchParams(location.search).get(
    "scroll"
  )
  const preservedOpportunitiesScrollTop = preservedOpportunitiesScroll
    ? Number(preservedOpportunitiesScroll)
    : undefined
  const comparisonOptionIds =
    new URLSearchParams(location.search)
      .get("options")
      ?.split(",")
      .filter(Boolean) ?? []
  const [detailOpportunityId, setDetailOpportunityId] = useState<
    string | undefined
  >(() =>
    accountOpportunities.some(
      (opportunity) => opportunity.id === requestedOpportunityId
    )
      ? requestedOpportunityId ?? undefined
      : undefined
  )
  const accountTasks = tasks.filter(
    (task) =>
      task.accountId === account.id &&
      task.status === "Open" &&
      !task.id.startsWith("task-followup-") &&
      !props.taskInteraction.outcomes[task.id]
  )
  const accountQuoteRequests = accountOpportunities.flatMap((opportunity) =>
    quoteRequestsForOpportunity(opportunity.id)
  )
  const quotedCount = accountQuoteRequests.filter(
    (request) =>
      effectiveQuoteRequestStatus(request, props.quoteRequestInteraction) ===
      "Quoted"
  ).length
  const activityItems =
    account.id === bobAccount.id
      ? bobAccountActivity
      : [
          {
            actor: account.owner,
            detail: `Reviewed current work for ${account.name}.`,
            id: `activity-${account.id}`,
            timestamp: currentDateLabel,
            title: "Account reviewed",
          },
        ]
  const intakeItems =
    account.id === bobAccount.id
      ? bobAccountIntake
      : [
          {
            detail: "Core account information and current coverage",
            name: "Account intake",
            owner: account.owner,
            status: "Complete" as const,
            updated: currentDateLabel,
          },
        ]
  const openTaskContext = (task: TaskRecord) => {
    props.navigateInsideLayer(taskQuoteDestinationPath(task), task.id)
  }
  const detailOpportunity = accountOpportunities.find(
    (opportunity) => opportunity.id === detailOpportunityId
  )

  useLayoutEffect(() => {
    if (activeTab !== "opportunities" || !focusedOpportunityId) return

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(`opportunity-matrix-${focusedOpportunityId}`)
        ?.scrollIntoView({ block: "start" })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeTab, focusedOpportunityId])

  useLayoutEffect(() => {
    if (
      activeTab !== "opportunities" ||
      preservedOpportunitiesScrollTop === undefined ||
      !Number.isFinite(preservedOpportunitiesScrollTop)
    ) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      const scrollContainer = document.querySelector<HTMLElement>(
        "[data-page-layer-scroll-container]"
      )

      if (scrollContainer) {
        scrollContainer.scrollTop = preservedOpportunitiesScrollTop
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeTab, preservedOpportunitiesScrollTop])

  return (
    <PageLayerFrame {...props}>
      <section className="flex min-w-0 flex-col">
        <header className="flex flex-col">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-balance">
                {account.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {accountOpportunities.length} open opportunities
                <span aria-hidden="true"> · </span>
                {accountTasks.length} open tasks
                {quotedCount > 0 ? (
                  <>
                    <span aria-hidden="true"> · </span>
                    {quotedCount} returned quotes
                  </>
                ) : null}
              </p>
            </div>
            {account.mainContact ? (
              <div className="flex items-center gap-3">
                <div className="min-w-0 text-right">
                  <div className="truncate text-sm font-medium">
                    {account.mainContact.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {account.mainContact.role}
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild size="icon-sm" variant="outline">
                      <a
                        aria-label={`Call ${account.mainContact.name}`}
                        href={`tel:${account.mainContact.phone.replace(/\D/g, "")}`}
                      >
                        <PhoneIcon />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Call {account.mainContact.name}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild size="icon-sm" variant="outline">
                      <a
                        aria-label={`Text ${account.mainContact.name}`}
                        href={`sms:${account.mainContact.phone.replace(/\D/g, "")}`}
                      >
                        <MessageSquareTextIcon />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Text {account.mainContact.name}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild size="icon-sm" variant="outline">
                      <a
                        aria-label={`Email ${account.mainContact.name}`}
                        href={`mailto:${account.mainContact.email}`}
                      >
                        <MailIcon />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Email {account.mainContact.name}</TooltipContent>
                </Tooltip>
              </div>
            ) : null}
          </div>
        </header>

        <Tabs
          className="mt-6 gap-0"
          onValueChange={(value) => setActiveTab(value as AccountTab)}
          value={activeTab}
        >
          <TabsList
            className="h-auto min-h-11 w-full justify-start gap-0 overflow-x-auto border-b p-0"
            variant="line"
          >
            <TabsTrigger
              className="-mb-px h-11 flex-none rounded-none border-0 border-b-2 border-transparent px-4 py-0 after:hidden data-active:border-foreground data-active:bg-transparent"
              value="overview"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              className="-mb-px h-11 flex-none rounded-none border-0 border-b-2 border-transparent px-4 py-0 after:hidden data-active:border-foreground data-active:bg-transparent"
              value="opportunities"
            >
              Opportunities
            </TabsTrigger>
            <TabsTrigger
              className="-mb-px h-11 flex-none rounded-none border-0 border-b-2 border-transparent px-4 py-0 after:hidden data-active:border-foreground data-active:bg-transparent"
              value="intake"
            >
              Intake
            </TabsTrigger>
            <TabsTrigger
              className="-mb-px h-11 flex-none rounded-none border-0 border-b-2 border-transparent px-4 py-0 after:hidden data-active:border-foreground data-active:bg-transparent"
              value="activity"
            >
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-0" value="overview">
            <div className="grid lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.75fr)]">
              <AccountNextSteps
                onOpenTask={openTaskContext}
                tasks={accountTasks}
              />
              <AccountActivityPreview
                items={activityItems.slice(0, 3)}
                onViewAll={() => setActiveTab("activity")}
              />
            </div>
            <AccountOverviewSnapshot
              account={account}
              openOpportunityCount={accountOpportunities.length}
              quoteRequestCount={accountQuoteRequests.length}
              returnedQuoteCount={quotedCount}
            />
          </TabsContent>

          <TabsContent className="mt-0" value="opportunities">
            <section className="pt-6">
              <AccountOpportunitiesTable
                accountTasks={accountTasks}
                initialSelectedOptionIds={comparisonOptionIds}
                navigateInsideLayer={props.navigateInsideLayer}
                onViewDetails={(opportunityId) =>
                  setDetailOpportunityId(opportunityId)
                }
                opportunities={accountOpportunities}
                quoteRequestInteraction={props.quoteRequestInteraction}
              />
            </section>
          </TabsContent>

          <TabsContent className="mt-0" value="intake">
            <AccountIntakeTab account={account} items={intakeItems} />
          </TabsContent>

          <TabsContent className="mt-0" value="activity">
            <AccountActivityTab account={account} items={activityItems} />
          </TabsContent>
        </Tabs>

        <OpportunityDetailSheet
          onOpenChange={(open) => {
            if (!open) setDetailOpportunityId(undefined)
          }}
          onOpenQuote={(quoteRequestId) => {
            if (!detailOpportunity) return

            setDetailOpportunityId(undefined)
            props.navigateInsideLayer(
              quoteRequestPath(
                account.id,
                detailOpportunity.id,
                quoteRequestId
              ),
              props.activeTaskId
            )
          }}
          open={Boolean(detailOpportunity)}
          opportunity={detailOpportunity}
          quoteRequestInteraction={props.quoteRequestInteraction}
        />
      </section>
    </PageLayerFrame>
  )
}

function AccountNextSteps({
  onOpenTask,
  tasks: accountTasks,
}: {
  onOpenTask: (task: TaskRecord) => void
  tasks: TaskRecord[]
}) {
  return (
    <section className="py-6 lg:border-r lg:pr-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Open tasks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open tasks that need attention on this account.
          </p>
        </div>
        <Badge variant="secondary">{accountTasks.length} open</Badge>
      </div>
      <div className="mt-4 divide-y border-y">
        {accountTasks.map((task) => (
          <button
            className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-1 py-3 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            key={task.id}
            onClick={() => onOpenTask(task)}
            type="button"
          >
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium underline-offset-4 group-hover:underline">
                  {task.title}
                </span>
                <Badge
                  variant={task.priority === "High" ? "default" : "outline"}
                >
                  {task.priority}
                </Badge>
              </span>
              <span className="mt-1 block truncate text-xs text-muted-foreground">
                {task.opportunityName} · {task.line}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
              <span className="tabular-nums">Due {task.due}</span>
              <ChevronRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function AccountActivityPreview({
  items,
  onViewAll,
}: {
  items: AccountActivityItem[]
  onViewAll: () => void
}) {
  return (
    <section className="py-6 lg:pl-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <Button onClick={onViewAll} size="sm" type="button" variant="ghost">
          View all
          <ArrowRightIcon />
        </Button>
      </div>
      <div className="mt-3 divide-y border-y">
        {items.map((item) => (
          <div className="py-3" key={item.id}>
            <div className="text-sm font-medium">{item.title}</div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {item.detail}
            </p>
            <div className="mt-1 text-xs text-muted-foreground tabular-nums">
              {item.timestamp}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function AccountOverviewSnapshot({
  account,
  openOpportunityCount,
  quoteRequestCount,
  returnedQuoteCount,
}: {
  account: AccountRecord
  openOpportunityCount: number
  quoteRequestCount: number
  returnedQuoteCount: number
}) {
  const contact = account.mainContact

  return (
    <section className="grid border-y lg:grid-cols-3">
      <section className="flex min-w-0 flex-col gap-4 py-6 lg:pr-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Primary contact</h2>
          <CircleUserRoundIcon className="size-4 text-muted-foreground" />
        </div>
        {contact ? (
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate font-medium">{contact.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {contact.role}
              </div>
              <div className="mt-3 flex min-w-0 flex-col gap-1 text-sm">
                <a
                  className="w-fit max-w-full truncate underline-offset-4 hover:underline"
                  href={`mailto:${contact.email}`}
                >
                  {contact.email}
                </a>
                <a
                  className="w-fit text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  href={`tel:${contact.phone.replace(/\D/g, "")}`}
                >
                  {contact.phone}
                </a>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild size="icon-sm" variant="outline">
                    <a
                      aria-label={`Call ${contact.name}`}
                      href={`tel:${contact.phone.replace(/\D/g, "")}`}
                    >
                      <PhoneIcon />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Call {contact.name}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild size="icon-sm" variant="outline">
                    <a
                      aria-label={`Text ${contact.name}`}
                      href={`sms:${contact.phone.replace(/\D/g, "")}`}
                    >
                      <MessageSquareTextIcon />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Text {contact.name}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild size="icon-sm" variant="outline">
                    <a
                      aria-label={`Email ${contact.name}`}
                      href={`mailto:${contact.email}`}
                    >
                      <MailIcon />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Email {contact.name}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No primary contact recorded.
          </p>
        )}
      </section>

      <section className="flex min-w-0 flex-col gap-4 border-t py-6 lg:border-l lg:border-t-0 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Account details</h2>
          <Building2Icon className="size-4 text-muted-foreground" />
        </div>
        <dl className="divide-y border-y">
          {[
            ["DBA", account.dba],
            ["Business", `${account.industry} · ${account.businessType}`],
            ["Location", account.location ?? "Not recorded"],
            ["Client since", account.clientSince ?? "Not recorded"],
            ["Account owner", account.owner],
          ].map(([label, value]) => (
            <div
              className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 py-2.5"
              key={label}
            >
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-right text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex min-w-0 flex-col gap-4 border-t py-6 lg:border-l lg:border-t-0 lg:pl-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Current coverage</h2>
          <ClipboardCheckIcon className="size-4 text-muted-foreground" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {account.relationshipStatus ?? "Account"}
          </Badge>
          {account.activePolicy ? (
            <Badge variant="outline">1 active policy</Badge>
          ) : null}
        </div>
        <dl className="divide-y border-y">
          {[
            ["Policy", account.activePolicy?.name ?? "No active policy"],
            ["Renewal", account.activePolicy?.renewalDate ?? "—"],
            ["Opportunities", `${openOpportunityCount} open`],
            ["Market requests", `${quoteRequestCount} total`],
            ["Returned quotes", String(returnedQuoteCount)],
          ].map(([label, value]) => (
            <div
              className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 py-2.5"
              key={label}
            >
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-right text-sm font-medium tabular-nums">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </section>
  )
}

const quoteOptionDifferenceCounts: Record<string, number> = {
  "option-rt-standard": 2,
  "option-rt-enhanced-limits": 4,
  "option-rt-low-deductible": 3,
  "option-af-high-deductible": 7,
  "option-af-standard-deductible": 6,
}

function quoteRequestCoverageForm(request: QuoteRequestRecord) {
  return (
    request.submittedValues.find((value) => value.label === "Coverage form")
      ?.value ?? "Terms pending"
  )
}

function quoteRequestRequestedLimit(request: QuoteRequestRecord) {
  return (
    request.submittedValues.find((value) => value.label === "Requested limit")
      ?.value ?? "Limit pending"
  )
}

function quoteRequestDeductibleRange(request: QuoteRequestRecord) {
  const deductibles = [...new Set(request.options.map((option) => option.deductible))]
    .sort(
      (left, right) =>
        Number(left.replace(/[^0-9.]/g, "")) -
        Number(right.replace(/[^0-9.]/g, ""))
    )

  if (deductibles.length === 0) return "Deductible pending"
  if (deductibles.length === 1) return `${deductibles[0]} deductible`
  return `${deductibles[0]}–${deductibles[deductibles.length - 1]} deductibles`
}

function quoteRequestDifferenceLabel(request: QuoteRequestRecord) {
  const counts = request.options.map(
    (option) => quoteOptionDifferenceCounts[option.id] ?? 0
  )

  if (counts.length === 0) return "No comparison yet"

  const minimum = Math.min(...counts)
  const maximum = Math.max(...counts)
  const differenceCount = minimum === maximum ? `${minimum}` : `${minimum}–${maximum}`
  return `${differenceCount} material differences`
}

function quoteComparisonCandidatesForOpportunity(opportunityId: string) {
  return quoteRequestsForOpportunity(opportunityId).flatMap<QuoteComparisonCandidate>(
    (request) => {
      const coverageForm = quoteRequestCoverageForm(request)

      return request.options.flatMap((option) => {
        const termOverrides = quoteComparisonTermOverrides[option.id]

        if (!termOverrides) return []

        return [
          {
            carrier: request.carrier,
            channel: request.channel,
            conditions: option.conditions,
            coverageForm,
            deductible: option.deductible,
            id: option.id,
            label: option.label,
            limit: option.limit,
            premium: option.totalPremium,
            quoteNumber: option.quoteNumber,
            requestId: request.id,
            reviewStatus: option.reviewStatus,
            sourceDocument: option.sourceDocument,
            terms: {
              ...termOverrides,
              totalCost: option.totalPremium,
              basePremium: option.premium,
              coverageForm,
              propertyLimit: option.limit,
              allOtherPerilsDeductible: option.deductible,
              materialEndorsement: option.conditions,
            },
          },
        ]
      })
    }
  )
}

export function AccountOpportunitiesMatrix({
  accountTasks,
  navigateInsideLayer,
  onViewDetails,
  opportunities,
  quoteRequestInteraction,
}: {
  accountTasks: TaskRecord[]
  navigateInsideLayer: (path: string, activeTaskId?: string) => void
  onViewDetails: (opportunityId: string) => void
  opportunities: OpportunityRecord[]
  quoteRequestInteraction: QuoteRequestInteractionState
}) {
  const requestCount = opportunities.reduce(
    (total, opportunity) =>
      total + quoteRequestsForOpportunity(opportunity.id).length,
    0
  )
  const optionCount = opportunities.reduce(
    (total, opportunity) =>
      total + quoteComparisonCandidatesForOpportunity(opportunity.id).length,
    0
  )

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-balance">Opportunities</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            <span className="tabular-nums">{opportunities.length}</span> active
          </Badge>
          <Badge variant="secondary">
            <span className="tabular-nums">{requestCount}</span> requests
          </Badge>
          <Badge variant="secondary">
            <span className="tabular-nums">{optionCount}</span> options
          </Badge>
        </div>
      </div>

      {opportunities.map((opportunity) => (
        <AccountOpportunityMatrixSection
          accountTasks={accountTasks}
          key={opportunity.id}
          navigateInsideLayer={navigateInsideLayer}
          onViewDetails={() => onViewDetails(opportunity.id)}
          opportunity={opportunity}
          quoteRequestInteraction={quoteRequestInteraction}
        />
      ))}
    </div>
  )
}

function AccountOpportunityMatrixSection({
  accountTasks,
  navigateInsideLayer,
  onViewDetails,
  opportunity,
  quoteRequestInteraction,
}: {
  accountTasks: TaskRecord[]
  navigateInsideLayer: (path: string, activeTaskId?: string) => void
  onViewDetails: () => void
  opportunity: OpportunityRecord
  quoteRequestInteraction: QuoteRequestInteractionState
}) {
  const requests = quoteRequestsForOpportunity(opportunity.id)
  const candidates = quoteComparisonCandidatesForOpportunity(opportunity.id)
  const opportunityTasks = accountTasks.filter(
    (task) => task.opportunityId === opportunity.id
  )
  const [collapsedRequestIds, setCollapsedRequestIds] = useState<string[]>(() =>
    requests
      .filter(
        (request) =>
          effectiveQuoteRequestStatus(request, quoteRequestInteraction) ===
          "Declined"
      )
      .map((request) => request.id)
  )
  const [selectedOptionId, setSelectedOptionId] = useState(
    candidates.find((candidate) => candidate.id === "option-rt-standard")?.id ??
      candidates[0]?.id
  )
  const [showAllTerms, setShowAllTerms] = useState(false)
  const counts = quoteRequestCounts(requests, quoteRequestInteraction)
  const visibleRows = quoteComparisonRows.filter((row) => {
    if (showAllTerms) return true

    const values = [
      expiringPropertyTerms[row.key],
      ...candidates.map((candidate) => candidate.terms[row.key]),
    ]

    return new Set(values).size > 1
  })

  const setRequestCollapsed = (requestId: string, collapsed: boolean) => {
    setCollapsedRequestIds((current) =>
      collapsed
        ? [...new Set([...current, requestId])]
        : current.filter((id) => id !== requestId)
    )
  }

  const requestCellCount = (request: QuoteRequestRecord) =>
    collapsedRequestIds.includes(request.id)
      ? 1
      : Math.max(request.options.length, 1)

  const relatedTaskId = (request: QuoteRequestRecord) =>
    opportunityTasks.find((task) => task.quoteRequestId === request.id)?.id

  const openRequest = (request: QuoteRequestRecord) => {
    navigateInsideLayer(
      quoteRequestPath(opportunity.accountId, opportunity.id, request.id),
      relatedTaskId(request)
    )
  }

  const renderRequestCells = (
    request: QuoteRequestRecord,
    value: (candidate?: QuoteComparisonCandidate) => ReactNode,
    keyPrefix: string
  ) => {
    if (collapsedRequestIds.includes(request.id)) {
      return (
        <TableCell
          aria-label={`${request.carrier} hidden`}
          className="w-12 min-w-12 bg-muted/20 p-0"
          key={`${keyPrefix}-${request.id}`}
        />
      )
    }

    const requestCandidates = candidates.filter(
      (candidate) => candidate.requestId === request.id
    )

    if (requestCandidates.length === 0) {
      return (
        <TableCell
          className="min-w-52 whitespace-normal text-sm text-muted-foreground"
          key={`${keyPrefix}-${request.id}`}
        >
          {value()}
        </TableCell>
      )
    }

    return requestCandidates.map((candidate) => (
      <TableCell
        className={cn(
          "min-w-52 whitespace-normal text-sm tabular-nums",
          candidate.id === selectedOptionId && "bg-amber-100/70"
        )}
        key={`${keyPrefix}-${candidate.id}`}
      >
        {value(candidate)}
      </TableCell>
    ))
  }

  return (
    <section
      className="scroll-mt-20"
      id={`opportunity-matrix-${opportunity.id}`}
    >
      <div className="flex min-w-0 flex-col gap-3 border-y bg-muted/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-balance">
              {opportunity.line ?? opportunity.name}
            </h3>
            <Badge variant="outline">{opportunity.stage}</Badge>
          </div>
          <div className="truncate text-sm text-muted-foreground">
            {opportunity.name}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <div className="text-sm text-muted-foreground tabular-nums">
            Effective {opportunity.effectiveDate}
          </div>
          <Button onClick={onViewDetails} size="sm" type="button" variant="outline">
            View details
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>

      {requests.length === 0 ? (
        <dl className="grid border-b md:grid-cols-4">
          <div className="flex min-w-0 flex-col gap-1 py-4 md:pr-5">
            <dt className="text-sm font-medium">Stage</dt>
            <dd className="text-sm text-muted-foreground">{opportunity.stage}</dd>
          </div>
          <div className="flex min-w-0 flex-col gap-1 border-t py-4 md:border-t-0 md:px-5">
            <dt className="text-sm font-medium">Market activity</dt>
            <dd className="text-sm text-muted-foreground">
              {opportunity.quotingProgress}
            </dd>
          </div>
          <div className="flex min-w-0 flex-col gap-1 border-t py-4 md:border-t-0 md:px-5">
            <dt className="text-sm font-medium">Next action</dt>
            <dd className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{opportunity.nextAction}</span>
              {opportunityTasks.length > 0 ? (
                <Badge variant="secondary">Task</Badge>
              ) : null}
            </dd>
          </div>
          <div className="flex min-w-0 flex-col gap-1 border-t py-4 md:border-t-0 md:pl-5">
            <dt className="text-sm font-medium">Owner</dt>
            <dd className="text-sm text-muted-foreground">{opportunity.owner}</dd>
          </div>
        </dl>
      ) : (
        <div className="flex min-w-0 flex-col gap-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{requests.length} requests</Badge>
              <Badge variant="secondary">{counts.quoted} quoted</Badge>
              <Badge variant="secondary">{candidates.length} options</Badge>
              {collapsedRequestIds.length > 0 ? (
                <Badge variant="outline">
                  {collapsedRequestIds.length} hidden
                </Badge>
              ) : null}
            </div>
            <label
              className="flex cursor-pointer items-center gap-2 text-sm font-medium"
              htmlFor={`show-all-quote-terms-${opportunity.id}`}
            >
              <Checkbox
                checked={showAllTerms}
                id={`show-all-quote-terms-${opportunity.id}`}
                name={`show-all-quote-terms-${opportunity.id}`}
                onCheckedChange={(checked) => setShowAllTerms(checked === true)}
              />
              Show all terms
            </label>
          </div>

          <div className="-mx-4 -my-2 overflow-x-auto whitespace-nowrap sm:-mx-6">
            <div className="inline-block min-w-full px-4 py-2 align-middle sm:px-6">
              <Table className="min-w-max">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead
                      className="sticky left-0 z-30 min-w-56 whitespace-nowrap bg-background align-bottom"
                      rowSpan={2}
                    >
                      Coverage term
                    </TableHead>
                    <TableHead className="min-w-48 whitespace-nowrap bg-muted/30 text-foreground">
                      Current policy
                    </TableHead>
                    {requests.map((request) => {
                      const collapsed = collapsedRequestIds.includes(request.id)
                      const status = effectiveQuoteRequestStatus(
                        request,
                        quoteRequestInteraction
                      )

                      if (collapsed) {
                        return (
                          <TableHead
                            className="w-12 min-w-12 bg-muted/30 p-1 text-center"
                            key={request.id}
                            rowSpan={2}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  aria-label={`Show ${request.carrier} quote`}
                                  onClick={() => setRequestCollapsed(request.id, false)}
                                  size="icon-sm"
                                  type="button"
                                  variant="ghost"
                                >
                                  <EyeIcon />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Show {request.carrier}</TooltipContent>
                            </Tooltip>
                          </TableHead>
                        )
                      }

                      return (
                        <TableHead
                          className="whitespace-nowrap bg-muted/30 align-top"
                          colSpan={requestCellCount(request)}
                          key={request.id}
                        >
                          <div className="flex min-w-0 items-center justify-between gap-3 py-1">
                            <button
                              className="min-w-0 truncate rounded-sm font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                              onClick={() => openRequest(request)}
                              type="button"
                            >
                              {request.carrier}
                            </button>
                            <span className="flex shrink-0 items-center gap-2">
                              <Badge variant={carrierStatusVariant(status)}>
                                {status}
                              </Badge>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    aria-label={`Hide ${request.carrier} quote`}
                                    onClick={() => setRequestCollapsed(request.id, true)}
                                    size="icon-sm"
                                    type="button"
                                    variant="ghost"
                                  >
                                    <EyeOffIcon />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Hide {request.carrier}</TooltipContent>
                              </Tooltip>
                            </span>
                          </div>
                        </TableHead>
                      )
                    })}
                  </TableRow>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="min-w-48 whitespace-nowrap bg-muted/20 align-top">
                      <div className="flex flex-col gap-1 py-2">
                        <div className="font-semibold text-foreground">
                          Expiring policy
                        </div>
                        <div className="font-normal text-muted-foreground">
                          The Hartford · Baseline
                        </div>
                        <div className="font-semibold text-foreground tabular-nums">
                          $40,300
                        </div>
                      </div>
                    </TableHead>
                    {requests.flatMap((request) => {
                      if (collapsedRequestIds.includes(request.id)) return []

                      const requestCandidates = candidates.filter(
                        (candidate) => candidate.requestId === request.id
                      )

                      if (requestCandidates.length === 0) {
                        return [
                          <TableHead
                            className="min-w-52 whitespace-nowrap align-top"
                            key={`${request.id}-status`}
                          >
                            <div className="flex flex-col gap-1 py-2">
                              <div className="font-semibold text-foreground">
                                {request.workflowState}
                              </div>
                              <div className="font-normal text-muted-foreground tabular-nums">
                                {request.lastActivity}
                              </div>
                            </div>
                          </TableHead>,
                        ]
                      }

                      return requestCandidates.map((candidate) => {
                        const selected = candidate.id === selectedOptionId

                        return (
                          <TableHead
                            className={cn(
                              "min-w-52 whitespace-nowrap align-top",
                              selected && "bg-amber-100/70"
                            )}
                            key={candidate.id}
                          >
                            <label className="flex cursor-pointer items-start gap-2 py-2">
                              <input
                                aria-label={`Recommend ${candidate.carrier} ${candidate.label}`}
                                checked={selected}
                                className="size-4 shrink-0 accent-amber-700"
                                name={`quote-recommendation-${opportunity.id}`}
                                onChange={() => setSelectedOptionId(candidate.id)}
                                type="radio"
                              />
                              <span className="flex min-w-0 flex-col gap-1">
                                <span className="truncate font-semibold text-foreground">
                                  {candidate.label}
                                </span>
                                <span className="truncate font-normal text-muted-foreground">
                                  {candidate.quoteNumber}
                                </span>
                                <span className="font-semibold text-foreground tabular-nums">
                                  {candidate.premium}
                                </span>
                              </span>
                            </label>
                          </TableHead>
                        )
                      })
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableCell className="sticky left-0 z-20 bg-muted/95 font-semibold">
                      Workflow
                    </TableCell>
                    <TableCell
                      className="bg-muted/50"
                      colSpan={
                        requests.reduce(
                          (total, request) => total + requestCellCount(request),
                          1
                        )
                      }
                    />
                  </TableRow>
                  {[
                    {
                      baseline: "In force",
                      label: "Request status",
                      value: (request: QuoteRequestRecord) =>
                        effectiveQuoteRequestStatus(
                          request,
                          quoteRequestInteraction
                        ),
                    },
                    {
                      baseline: "Renewal baseline",
                      label: "Next action",
                      value: (request: QuoteRequestRecord) => request.nextAction,
                    },
                    {
                      baseline: "Current",
                      label: "Last activity",
                      value: (request: QuoteRequestRecord) => request.lastActivity,
                    },
                  ].map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="sticky left-0 z-10 min-w-56 whitespace-normal bg-background font-medium">
                        {row.label}
                      </TableCell>
                      <TableCell className="min-w-48 whitespace-normal bg-muted/20 text-sm text-muted-foreground tabular-nums">
                        {row.baseline}
                      </TableCell>
                      {requests.map((request) =>
                        renderRequestCells(
                          request,
                          () => row.value(request),
                          row.label
                        )
                      )}
                    </TableRow>
                  ))}

                  {(["Price", "Coverage", "Deductibles", "Terms"] as const).map(
                    (category) => {
                      const rows = visibleRows.filter(
                        (row) => row.category === category
                      )

                      if (rows.length === 0) return null

                      return (
                        <Fragment key={category}>
                          <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableCell className="sticky left-0 z-20 bg-muted/95 font-semibold">
                              {category}
                            </TableCell>
                            <TableCell
                              className="bg-muted/50"
                              colSpan={
                                requests.reduce(
                                  (total, request) =>
                                    total + requestCellCount(request),
                                  1
                                )
                              }
                            />
                          </TableRow>
                          {rows.map((row) => {
                            const baselineValue = expiringPropertyTerms[row.key]

                            return (
                              <TableRow key={row.key}>
                                <TableCell className="sticky left-0 z-10 min-w-56 whitespace-normal bg-background font-medium">
                                  {row.label}
                                </TableCell>
                                <TableCell className="min-w-48 whitespace-normal bg-muted/20 text-sm text-muted-foreground tabular-nums">
                                  {baselineValue}
                                </TableCell>
                                {requests.map((request) =>
                                  renderRequestCells(
                                    request,
                                    (candidate) =>
                                      candidate ? candidate.terms[row.key] : "—",
                                    row.key
                                  )
                                )}
                              </TableRow>
                            )
                          })}
                        </Fragment>
                      )
                    }
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function OpportunityDetailSheet({
  onOpenChange,
  onOpenQuote,
  open,
  opportunity,
  quoteRequestInteraction,
}: {
  onOpenChange: (open: boolean) => void
  onOpenQuote: (quoteRequestId: string) => void
  open: boolean
  opportunity?: OpportunityRecord
  quoteRequestInteraction: QuoteRequestInteractionState
}) {
  if (!opportunity) return null

  const requests = quoteRequestsForOpportunity(opportunity.id)
  const counts = quoteRequestCounts(requests, quoteRequestInteraction)

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="w-full gap-0 sm:max-w-lg">
        <SheetHeader className="border-b p-5 pr-14">
          <SheetTitle className="text-lg font-semibold text-balance">
            {opportunity.line ?? opportunity.name}
          </SheetTitle>
          <SheetDescription className="text-pretty">
            {opportunity.name}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{opportunity.type}</Badge>
              <Badge variant="outline">{opportunity.stage}</Badge>
              {requests.length > 0 ? (
                <Badge variant="secondary">
                  {counts.quoted} quoted · {requests.length} requests
                </Badge>
              ) : null}
            </div>

            <dl className="divide-y border-y">
              {[
                ["Account", opportunity.accountName],
                ["Effective date", opportunity.effectiveDate],
                ["Owner", opportunity.owner],
                ["Win probability", opportunity.winProbability],
                ["Market activity", opportunity.quotingProgress],
                ["Next action", opportunity.nextAction],
              ].map(([label, value]) => (
                <div
                  className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 py-3"
                  key={label}
                >
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-right text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>

            {requests.length > 0 ? (
              <section className="flex flex-col gap-3">
                <h3 className="font-semibold text-balance">Quote requests</h3>
                <div className="divide-y border-y">
                  {requests.map((request) => {
                    const status = effectiveQuoteRequestStatus(
                      request,
                      quoteRequestInteraction
                    )

                    return (
                      <button
                        className="group flex min-w-0 items-center justify-between gap-4 py-3 text-left outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        key={request.id}
                        onClick={() => onOpenQuote(request.id)}
                        type="button"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {request.carrier}
                          </span>
                          <span className="block truncate text-sm text-muted-foreground tabular-nums">
                            {quoteRequestPremiumRange(request)} · {request.lastActivity}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <Badge variant={carrierStatusVariant(status)}>
                            {status}
                          </Badge>
                          <ChevronRightIcon className="size-4 shrink-0" />
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            ) : null}
          </div>
        </div>
        <SheetFooter className="border-t p-4">
          <Button
            className="w-full"
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export function AccountOpportunitiesTable({
  accountTasks,
  initialSelectedOptionIds,
  navigateInsideLayer,
  onViewDetails,
  opportunities,
  quoteRequestInteraction,
}: {
  accountTasks: TaskRecord[]
  initialSelectedOptionIds?: string[]
  navigateInsideLayer: (path: string, activeTaskId?: string) => void
  onViewDetails: (opportunityId: string) => void
  opportunities: OpportunityRecord[]
  quoteRequestInteraction: QuoteRequestInteractionState
}) {
  const availableCandidates = opportunities.flatMap((opportunity) =>
    quoteComparisonCandidatesForOpportunity(opportunity.id).map((candidate) => ({
      ...candidate,
      opportunity,
    }))
  )
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>(() =>
    (initialSelectedOptionIds ?? []).filter((optionId) =>
      availableCandidates.some((candidate) => candidate.id === optionId)
    )
  )
  const selectedCandidates = availableCandidates.filter((candidate) =>
    selectedOptionIds.includes(candidate.id)
  )
  const allOptionsSelected =
    availableCandidates.length > 0 &&
    selectedOptionIds.length === availableCandidates.length
  const requestCount = opportunities.reduce(
    (total, opportunity) =>
      total + quoteRequestsForOpportunity(opportunity.id).length,
    0
  )

  const toggleOption = (optionId: string) => {
    setSelectedOptionIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
    )
  }

  const openComparison = () => {
    if (selectedOptionIds.length < 2) return

    const scrollContainer = document.querySelector<HTMLElement>(
      "[data-page-layer-scroll-container]"
    )
    const query = new URLSearchParams({
      options: selectedOptionIds.join(","),
      scroll: String(scrollContainer?.scrollTop ?? 0),
    })

    navigateInsideLayer(
      `/accounts/${opportunities[0].accountId}/compare?${query.toString()}`
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-balance">Opportunities</h2>
          <p className="mt-1 max-w-[68ch] text-sm text-muted-foreground text-pretty">
            Review active market work and select returned quote options to compare.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{opportunities.length} active</Badge>
          <Badge variant="secondary">{requestCount} requests</Badge>
          <Badge variant="secondary">{availableCandidates.length} options</Badge>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto sm:-mx-6">
        <div className="inline-block min-w-full px-4 align-middle sm:px-6">
          <Table className="min-w-[1080px] border-y">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[24%] whitespace-nowrap pl-3">
            <label className="flex cursor-pointer items-center gap-3">
              <Checkbox
                aria-label="Select all returned quote options"
                checked={
                  allOptionsSelected
                    ? true
                    : selectedOptionIds.length > 0
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={(checked) =>
                  setSelectedOptionIds(
                    checked === true
                      ? availableCandidates.map((candidate) => candidate.id)
                      : []
                  )
                }
              />
              <span>Opportunity / market</span>
            </label>
          </TableHead>
          <TableHead className="w-[11%] whitespace-nowrap">Status</TableHead>
          <TableHead className="w-[25%] whitespace-nowrap">Key terms</TableHead>
          <TableHead className="w-[11%] whitespace-nowrap">Total cost</TableHead>
          <TableHead className="w-[15%] whitespace-nowrap">Decision signal</TableHead>
          <TableHead className="w-[14%] whitespace-nowrap pr-3">Next action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {opportunities.map((opportunity) => {
          const requests = quoteRequestsForOpportunity(opportunity.id)
          const opportunityTasks = accountTasks.filter(
            (task) => task.opportunityId === opportunity.id
          )
          const counts = quoteRequestCounts(
            requests,
            quoteRequestInteraction
          )
          const quoteReviewTask = tasks.find(
            (task) =>
              task.accountId === opportunity.accountId &&
              task.opportunityId === opportunity.id &&
              taskExperience(task).workspace === "review-returned-quote"
          )
          return (
            <Fragment key={opportunity.id}>
              <TableRow
                className="bg-muted/70 hover:bg-muted/70"
                id={`opportunity-matrix-${opportunity.id}`}
              >
                <TableCell className="px-3 py-3" colSpan={6}>
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                      <button
                        className="max-w-full truncate rounded-sm font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        onClick={() => onViewDetails(opportunity.id)}
                        type="button"
                      >
                        {opportunity.name}
                      </button>
                      <Badge variant="outline">
                        {opportunity.line ?? "Commercial Property"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {opportunity.type} · {opportunity.stage}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="tabular-nums">
                        Effective {opportunity.effectiveDate}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {opportunityTasks.length === 0
                          ? "No open tasks"
                          : `${opportunityTasks.length} open ${opportunityTasks.length === 1 ? "task" : "tasks"}`}
                      </span>
                      {quoteReviewTask ? (
                        <Button
                          onClick={() =>
                            navigateInsideLayer(
                              quoteRequestPath(
                                opportunity.accountId,
                                opportunity.id,
                                quoteReviewTask.quoteRequestId ??
                                  "qr-bob-accident-fund-property"
                              )
                            )
                          }
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          Review new quote
                          <ArrowRightIcon data-icon="inline-end" />
                        </Button>
                      ) : null}
                      <Button
                        onClick={() => onViewDetails(opportunity.id)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        View details
                        <ChevronRightIcon data-icon="inline-end" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    <span>{opportunity.quotingProgress}</span>
                    {requests.length > 0 ? (
                      <span>
                        {requests.length} requests · {counts.quoted} quoted ·{" "}
                        {counts.pendingReview} pending ·{" "}
                        {counts.missingInformation} needs information ·{" "}
                        {counts.declined} declined
                      </span>
                    ) : (
                      <span>Next: {opportunity.nextAction}</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>

              {requests.length === 0 ? (
                <TableRow>
                  <TableCell className="pl-7">
                    <div className="font-medium">Current work</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {opportunity.line}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{opportunity.stage}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    {opportunity.quotingProgress}
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{opportunity.owner}</TableCell>
                  <TableCell className="whitespace-normal pr-3">
                    <div className="flex items-center gap-2">
                      <span>{opportunity.nextAction}</span>
                      {opportunityTasks.length > 0 ? (
                        <Badge variant="secondary">Task</Badge>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => {
                  const status = effectiveQuoteRequestStatus(
                    request,
                    quoteRequestInteraction
                  )
                  const relatedTask = opportunityTasks.find(
                    (task) => task.quoteRequestId === request.id
                  )
                  const isCurrentQuote = quoteReviewTask?.quoteRequestId === request.id
                  const actionTask = isCurrentQuote ? quoteReviewTask : relatedTask
                  const coverageForm = quoteRequestCoverageForm(request)
                  const requestedLimit = quoteRequestRequestedLimit(request)
                  const sourceConfidence = request.options[0]?.reviewStatus
                  const requestPath = quoteRequestPath(
                    opportunity.accountId,
                    opportunity.id,
                    request.id
                  )

                  return (
                    <Fragment key={request.id}>
                      <TableRow
                        aria-label={`Open ${request.carrier} quote request`}
                        className="cursor-pointer bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        onClick={() =>
                          navigateInsideLayer(requestPath, relatedTask?.id)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            navigateInsideLayer(requestPath, relatedTask?.id)
                          }
                        }}
                        tabIndex={0}
                      >
                        <TableCell className="pl-7 py-3">
                          <div className="font-semibold">{request.carrier}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {request.channel} · {request.submissionMethod}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={carrierStatusVariant(status)}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          {request.options.length > 0 ? (
                            <>
                              <div className="font-medium">
                                {coverageForm} · Replacement cost
                              </div>
                              <div className="mt-0.5 text-xs text-muted-foreground">
                                {requestedLimit} limit · {quoteRequestDeductibleRange(request)}
                              </div>
                            </>
                          ) : (
                            <>
                              <div>{request.workflowState}</div>
                              <div className="mt-0.5 text-xs text-muted-foreground">
                                {request.reason === "-"
                                  ? request.externalId
                                  : request.reason}
                              </div>
                            </>
                          )}
                        </TableCell>
                        <TableCell className="font-medium tabular-nums">
                          {quoteRequestPremiumRange(request)}
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          {request.options.length > 0 ? (
                            <>
                              <Badge variant="outline">
                                {quoteRequestDifferenceLabel(request)}
                              </Badge>
                              <div
                                className={cn(
                                  "mt-1 text-xs",
                                  sourceConfidence === "Extraction needs review"
                                    ? "text-amber-800"
                                    : "text-muted-foreground"
                                )}
                              >
                                {sourceConfidence}
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Updated {request.lastActivity}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-normal pr-3">
                          <div className="flex items-center gap-2">
                            <span>{actionTask?.title ?? request.nextAction}</span>
                            {actionTask ? (
                              <Badge variant="secondary">Task</Badge>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>

                      {request.options.map((option) => {
                        const selected = selectedOptionIds.includes(option.id)

                        return (
                          <TableRow
                            className={cn(
                              "cursor-pointer hover:bg-muted/40",
                              selected && "bg-muted/50 hover:bg-muted/50"
                            )}
                            data-state={selected ? "selected" : undefined}
                            key={option.id}
                            onClick={() => toggleOption(option.id)}
                          >
                            <TableCell
                              className="pl-12"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <label className="flex cursor-pointer items-center gap-3 font-medium">
                                <Checkbox
                                  aria-label={`Compare ${request.carrier} ${option.label}`}
                                  checked={selected}
                                  name={`quote-option-${option.id}`}
                                  onCheckedChange={() => toggleOption(option.id)}
                                  value={option.id}
                                />
                                <span>{option.label}</span>
                              </label>
                            </TableCell>
                            <TableCell>
                              {selected ? (
                                <Badge variant="outline">Selected</Badge>
                              ) : null}
                            </TableCell>
                            <TableCell className="whitespace-normal text-muted-foreground">
                              <div className="text-foreground">
                                {quoteRequestCoverageForm(request)} · Replacement cost
                              </div>
                              <span className="block text-xs">
                                {option.limit} limit · {option.deductible} deductible
                              </span>
                            </TableCell>
                            <TableCell className="font-semibold tabular-nums">
                              {option.totalPremium}
                            </TableCell>
                            <TableCell className="whitespace-normal">
                              <Badge variant="outline">
                                {quoteOptionDifferenceCounts[option.id] ?? 0} differences
                              </Badge>
                              <div
                                className={cn(
                                  "mt-1 text-xs",
                                  option.reviewStatus === "Extraction needs review"
                                    ? "text-amber-800"
                                    : "text-muted-foreground"
                                )}
                              >
                                {option.reviewStatus}
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-normal pr-3">
                              <div className="text-sm">
                                {isCurrentQuote
                                  ? "Review new quote"
                                  : request.nextAction}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {option.quoteNumber}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </Fragment>
                  )
                })
              )}
            </Fragment>
          )
        })}
      </TableBody>
          </Table>
        </div>
      </div>

      {selectedOptionIds.length > 0 ? (
        <div
          aria-live="polite"
          className="sticky bottom-4 z-30 mx-auto flex w-[calc(100%-1rem)] max-w-4xl flex-col gap-3 rounded-md bg-background p-3 shadow-lg ring-1 ring-black/10 sm:w-full sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="font-semibold">
              {selectedOptionIds.length} quote {selectedOptionIds.length === 1 ? "option" : "options"} selected
            </div>
            <div className="truncate text-sm text-muted-foreground">
              {selectedCandidates
                .slice(0, 2)
                .map(
                  (candidate) =>
                    `${candidate.carrier} ${candidate.label} · ${candidate.opportunity.line}`
                )
                .join("  ·  ")}
              {selectedCandidates.length > 2
                ? `  ·  +${selectedCandidates.length - 2} more`
                : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">
            <Button
              onClick={() => setSelectedOptionIds([])}
              type="button"
              variant="ghost"
            >
              Clear
            </Button>
            <Button
              disabled={selectedOptionIds.length < 2}
              onClick={openComparison}
              type="button"
            >
              Compare
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

type AccountQuoteComparisonCandidate = QuoteComparisonCandidate & {
  opportunity: OpportunityRecord
}

function AccountQuoteComparisonLayer(props: LayerRouteProps) {
  const { accountId } = useParams()
  const location = useLocation()
  const account = findAccount(accountId)
  const accountOpportunities = opportunitiesForAccount(account.id)
  const comparisonQuery = new URLSearchParams(location.search)
  const selectedOptionIds = comparisonQuery
    .get("options")
    ?.split(",")
    .filter(Boolean) ?? []
  const allCandidates = accountOpportunities.flatMap<AccountQuoteComparisonCandidate>(
    (opportunity) =>
      quoteComparisonCandidatesForOpportunity(opportunity.id).map((candidate) => ({
        ...candidate,
        opportunity,
      }))
  )
  const selectedCandidates = allCandidates.filter((candidate) =>
    selectedOptionIds.includes(candidate.id)
  )
  const opportunityGroups = accountOpportunities
    .map((opportunity) => ({
      candidates: selectedCandidates.filter(
        (candidate) => candidate.opportunity.id === opportunity.id
      ),
      opportunity,
    }))
    .filter((group) => group.candidates.length > 0)
  const orderedCandidates = opportunityGroups.flatMap(
    (group) => group.candidates
  )
  const includeBaseline = opportunityGroups.length === 1
  const comparisonColumnCount =
    orderedCandidates.length + (includeBaseline ? 1 : 0)
  const rowHasDifference = (row: QuoteComparisonRow) => {
    const values = [
      ...(includeBaseline ? [expiringPropertyTerms[row.key]] : []),
      ...orderedCandidates.map((candidate) => candidate.terms[row.key]),
    ]

    return new Set(values).size > 1
  }
  const [showAllTerms, setShowAllTerms] = useState(false)
  const visibleRows = quoteComparisonRows.filter(
    (row) => showAllTerms || rowHasDifference(row)
  )
  const editSelectionQuery = new URLSearchParams({
    options: selectedOptionIds.join(","),
  })
  const sourceScrollTop = comparisonQuery.get("scroll")

  if (sourceScrollTop) {
    editSelectionQuery.set("scroll", sourceScrollTop)
  }

  const editSelectionPath = `/accounts/${account.id}?${editSelectionQuery.toString()}#opportunities`
  const closeComparison = () => {
    props.navigateInsideLayer(editSelectionPath, props.activeTaskId)
  }

  return (
    <PageLayerFrame
      {...props}
      headerLabel="Compare"
      onClose={closeComparison}
      breadcrumb={
        <ObjectBreadcrumb
          activeTaskId={props.activeTaskId}
          items={[
            { label: account.name, path: `/accounts/${account.id}` },
            {
              label: "Opportunities",
              path: editSelectionPath,
            },
            { current: true, label: "Compare quotes" },
          ]}
          navigateInsideLayer={props.navigateInsideLayer}
        />
      }
    >
      {orderedCandidates.length < 2 ? (
        <section className="flex min-h-[24rem] flex-col items-center justify-center gap-4 text-center">
          <div className="flex max-w-lg flex-col gap-2">
            <h1 className="text-2xl font-semibold text-balance">
              Select at least two quote options
            </h1>
            <p className="text-sm text-muted-foreground text-pretty">
              The comparison workspace opens after two or more returned quote
              options are selected from the account Opportunities table.
            </p>
          </div>
          <Button
            onClick={() =>
              props.navigateInsideLayer(
                editSelectionPath,
                props.activeTaskId
              )
            }
            type="button"
          >
            Open Opportunities
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </section>
      ) : (
        <section className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-amber-300 bg-amber-100 text-amber-950" variant="outline">
                  Comparison set
                </Badge>
                <Badge variant="secondary">
                  {orderedCandidates.length} quote options
                </Badge>
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-balance">
                Compare selected quotes
              </h1>
              <p className="mt-1 max-w-[72ch] text-sm text-muted-foreground text-pretty">
                Review material price, coverage, deductible, and condition
                differences side by side. Opportunity groupings remain visible
                above every selected quote.
              </p>
            </div>
            <Button
              className="shrink-0"
              onClick={() =>
                props.navigateInsideLayer(
                  editSelectionPath,
                  props.activeTaskId
                )
              }
              type="button"
              variant="outline"
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Edit selection
            </Button>
          </div>

          <section className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-balance">
                  Material differences
                </h2>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">
                  Identical terms are hidden. Yellow cells differ from the
                  comparison baseline.
                </p>
              </div>
              <label
                className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                htmlFor="show-all-account-quote-terms"
              >
                <Checkbox
                  checked={showAllTerms}
                  id="show-all-account-quote-terms"
                  onCheckedChange={(checked) => setShowAllTerms(checked === true)}
                />
                Show all terms
              </label>
            </div>

            <div className="-mx-4 overflow-x-auto sm:-mx-6">
              <div className="inline-block min-w-full px-4 align-middle sm:px-6">
                <Table
                  className="border-y"
                  style={{
                    minWidth: `${18 + comparisonColumnCount * 14}rem`,
                  }}
                >
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead
                        className="sticky left-0 z-30 min-w-56 bg-background align-bottom"
                        rowSpan={2}
                      >
                        Coverage term
                      </TableHead>
                      {opportunityGroups.map((group) => (
                        <TableHead
                          className="border-l bg-muted/50 whitespace-normal align-top"
                          colSpan={
                            group.candidates.length +
                            (includeBaseline ? 1 : 0)
                          }
                          key={group.opportunity.id}
                        >
                          <div className="flex min-w-0 flex-col gap-1 py-1">
                            <div className="font-semibold text-foreground">
                              {group.opportunity.line ?? "Opportunity"}
                            </div>
                            <div className="truncate font-normal text-muted-foreground">
                              {group.opportunity.name}
                            </div>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                      {includeBaseline ? (
                        <TableHead className="min-w-48 bg-muted/20 whitespace-normal align-top">
                          <div className="flex flex-col gap-1 py-2">
                            <div className="font-semibold text-foreground">
                              Expiring policy
                            </div>
                            <div className="font-normal text-muted-foreground">
                              The Hartford · Baseline
                            </div>
                            <div className="font-semibold text-foreground tabular-nums">
                              {expiringPropertyTerms.totalCost}
                            </div>
                          </div>
                        </TableHead>
                      ) : null}
                      {orderedCandidates.map((candidate) => (
                        <TableHead
                          className="min-w-56 border-l whitespace-normal align-top"
                          key={candidate.id}
                        >
                          <div className="flex min-w-0 items-start justify-between gap-2 py-2">
                            <div className="flex min-w-0 flex-col gap-1">
                              <div className="font-semibold text-foreground">
                                {candidate.carrier}
                              </div>
                              <div className="font-normal text-muted-foreground">
                                {candidate.label} · {candidate.quoteNumber}
                              </div>
                              <div className="font-semibold text-foreground tabular-nums">
                                {candidate.premium}
                              </div>
                              {candidate.reviewStatus === "Extraction needs review" ? (
                                <Badge className="mt-1 w-fit border-amber-300 bg-amber-50 text-amber-950" variant="outline">
                                  Source check needed
                                </Badge>
                              ) : null}
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button asChild size="icon-sm" variant="ghost">
                                  <a
                                    aria-label={`Open ${candidate.carrier} quote`}
                                    href={quoteRequestPath(
                                      account.id,
                                      candidate.opportunity.id,
                                      candidate.requestId
                                    )}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                  >
                                    <ExternalLinkIcon />
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Open quote in new tab</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(["Price", "Coverage", "Deductibles", "Terms"] as const).map(
                      (category) => {
                        const categoryRows = visibleRows.filter(
                          (row) => row.category === category
                        )

                        if (categoryRows.length === 0) return null

                        return (
                          <Fragment key={category}>
                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                              <TableCell
                                className="sticky left-0 z-20 bg-muted/95 font-semibold"
                                colSpan={comparisonColumnCount + 1}
                              >
                                {category}
                              </TableCell>
                            </TableRow>
                            {categoryRows.map((row) => {
                              const baselineValue = expiringPropertyTerms[row.key]
                              const different = rowHasDifference(row)

                              return (
                                <TableRow key={row.key}>
                                  <TableCell className="sticky left-0 z-10 min-w-56 whitespace-normal bg-background font-medium">
                                    {row.label}
                                  </TableCell>
                                  {includeBaseline ? (
                                    <TableCell className="min-w-48 whitespace-normal bg-muted/20 text-sm tabular-nums">
                                      {baselineValue}
                                    </TableCell>
                                  ) : null}
                                  {orderedCandidates.map((candidate) => {
                                    const value = candidate.terms[row.key]
                                    const differsFromBaseline = includeBaseline
                                      ? value !== baselineValue
                                      : different

                                    return (
                                      <TableCell
                                        className={cn(
                                          "min-w-56 border-l whitespace-normal text-sm tabular-nums",
                                          differsFromBaseline &&
                                            "bg-amber-50/70 font-medium"
                                        )}
                                        key={candidate.id}
                                      >
                                        {value}
                                      </TableCell>
                                    )
                                  })}
                                </TableRow>
                              )
                            })}
                          </Fragment>
                        )
                      }
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>
        </section>
      )}
    </PageLayerFrame>
  )
}

function AccountIntakeTab({
  account,
  items,
}: {
  account: AccountRecord
  items: AccountIntakeItem[]
}) {
  return (
    <section className="py-7">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Intake</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Applications, schedules, policies, and supporting information for{" "}
          {account.name}.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Material</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.name}>
              <TableCell>
                <div className="flex items-center gap-2 font-medium">
                  <FileTextIcon className="size-4 text-muted-foreground" />
                  {item.name}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    item.status === "Complete"
                      ? "outline"
                      : item.status === "Missing details"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell className="max-w-96 whitespace-normal">
                {item.detail}
              </TableCell>
              <TableCell>{item.owner}</TableCell>
              <TableCell className="tabular-nums">{item.updated}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

function AccountActivityTab({
  account,
  items,
}: {
  account: AccountRecord
  items: AccountActivityItem[]
}) {
  return (
    <section className="py-7">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Meaningful changes across {account.name}, summarized from account and
          market activity.
        </p>
      </div>
      <ol className="border-y">
        {items.map((item) => (
          <li
            className="grid gap-3 border-b py-4 last:border-b-0 md:grid-cols-[12rem_minmax(0,1fr)_12rem]"
            key={item.id}
          >
            <div className="text-sm text-muted-foreground tabular-nums">
              {item.timestamp}
            </div>
            <div>
              <div className="text-sm font-medium">{item.title}</div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {item.detail}
              </p>
            </div>
            <div className="text-sm text-muted-foreground md:text-right">
              {item.actor}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function OpportunityLayer(props: OpportunityLayerProps) {
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

export function QuoteComparisonLayer(props: QuoteComparisonLayerProps) {
  const { accountId, opportunityId } = useParams()
  const location = useLocation()
  const account = findAccount(accountId)
  const opportunity = findOpportunity(opportunityId)
  const task =
    tasks.find(
      (candidate) =>
        candidate.accountId === account.id &&
        candidate.opportunityId === opportunity.id &&
        taskExperience(candidate).workspace === "review-returned-quote"
    ) ?? findTask(props.activeTaskId)
  const outcome = props.taskInteraction.outcomes[task.id]
  const candidateOptionIds = new URLSearchParams(location.search)
    .get("options")
    ?.split(",")
    .filter(Boolean)

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

  return (
    <QuoteReviewWorkspace
      account={account}
      candidateOptionIds={candidateOptionIds}
      completeReview={completeReview}
      initialMode="comparison"
      onBackToQuote={() =>
        props.navigateInsideLayer(
          quoteRequestPath(
            account.id,
            opportunity.id,
            "qr-bob-accident-fund-property"
          ),
          props.activeTaskId
        )
      }
      opportunity={opportunity}
      outcome={outcome}
      pageLayerProps={props}
      task={task}
    />
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
  const [directQuoteOutcome, setDirectQuoteOutcome] = useState<TaskOutcome>()
  const responseText =
    draftResponses[quoteRequest.id] ?? submittedResponse?.body ?? ""
  const attemptedSubmit = attemptedSubmitIds.includes(quoteRequest.id)
  const responseIsInvalid = attemptedSubmit && responseText.trim().length === 0
  const opportunityPath = accountOpportunityMatrixPath(
    account.id,
    opportunity.id
  )

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

  const relatedQuoteTask = tasks.find(
    (task) =>
      task.quoteRequestId === quoteRequest.id &&
      taskExperience(task).workspace === "review-returned-quote"
  )

  if (quoteRequest.options.length > 0) {
    const quoteOutcome = relatedQuoteTask
      ? props.taskInteraction.outcomes[relatedQuoteTask.id]
      : directQuoteOutcome
    const completeReview = (
      nextStatus: TaskOutcome["status"],
      result: string
    ) => {
      if (!relatedQuoteTask) {
        setDirectQuoteOutcome({
          completedAt: "Aug 27, 2026, 2:24 PM",
          result,
          status: nextStatus,
        })
        return
      }

      props.setTaskInteraction((current) => ({
        ...current,
        outcomes: {
          ...current.outcomes,
          [relatedQuoteTask.id]: {
            completedAt: "Aug 27, 2026, 2:24 PM",
            result,
            status: nextStatus,
          },
        },
      }))
    }

    return (
      <ReturnedQuoteTriageWorkspace
        account={account}
        completeReview={completeReview}
        opportunity={opportunity}
        outcome={quoteOutcome}
        pageLayerProps={props}
        quoteRequest={quoteRequest}
        task={relatedQuoteTask}
      />
    )
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
              label: "Opportunities",
              path: `/accounts/${account.id}#opportunities`,
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
  contentClassName,
  headerLabel,
  mainClassName,
  navigateInsideLayer,
  onClose,
  origin,
}: LayerRouteProps & {
  children: ReactNode
  contentClassName?: string
  headerLabel?: string
  mainClassName?: string
}) {
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
          {headerLabel ? (
            <div className="min-w-0 flex-1 truncate text-sm font-medium">
              {headerLabel}
            </div>
          ) : origin?.kind === "tasks" ? (
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
          {!headerLabel ? (
            <div className="ml-auto hidden text-sm text-muted-foreground tabular-nums sm:block">
              {currentDateLabel}
            </div>
          ) : null}
        </div>
        {breadcrumb ? (
          <div className="border-t px-4 py-3 sm:px-6">{breadcrumb}</div>
        ) : null}
      </header>
      <main
        data-page-layer-scroll-container
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
          mainClassName
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-col gap-6 p-4 sm:p-6",
            contentClassName
          )}
        >
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

export function QuoteRequestsSection({
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

function quoteRequestPremiumRange(request: QuoteRequestRecord) {
  if (request.options.length < 2) {
    return request.bestPremium
  }

  const sortedPremiums = [...request.options].sort((left, right) => {
    const leftValue = Number(left.totalPremium.replace(/[^0-9.]/g, ""))
    const rightValue = Number(right.totalPremium.replace(/[^0-9.]/g, ""))
    return leftValue - rightValue
  })

  return `${sortedPremiums[0].totalPremium} – ${sortedPremiums.at(-1)?.totalPremium}`
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

function accountOpportunityDetailsPath(
  accountId: string,
  opportunityId: string
) {
  return `/accounts/${accountId}?opportunity=${opportunityId}#opportunities`
}

function accountOpportunityMatrixPath(
  accountId: string,
  opportunityId: string
) {
  return `/accounts/${accountId}?focus=${opportunityId}#opportunities`
}

function opportunityQuoteSectionPath(task: TaskRecord) {
  return accountOpportunityMatrixPath(task.accountId, task.opportunityId)
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
