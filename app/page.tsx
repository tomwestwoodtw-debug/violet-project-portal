"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Role = "volunteer" | "admin" | "manager";
type Tab =
  | "home"
  | "tasks"
  | "expenses"
  | "hours"
  | "events"
  | "calendar"
  | "resources"
  | "profile"
  | "feedback"
  | "messages"
  | "emails"
  | "management";
type ManagementTab =
  | "overview"
  | "launch"
  | "tasks"
  | "approvals"
  | "volunteers"
  | "users"
  | "events"
  | "mailbox"
  | "resources"
  | "compliance"
  | "reports"
  | "integrations"
  | "training"
  | "fundraising"
  | "contacts"
  | "designs"
  | "services"
  | "data"
  | "ask"
  | "intake"
  | "messages"
  | "settings";
type ExpenseStatus = "Draft" | "Submitted" | "Needs evidence" | "Approved" | "Paid" | "Rejected";
type HoursStatus = "Submitted" | "Approved" | "Query";
type InterestStatus = "Interested" | "Available" | "Confirmed" | "Declined";
type WaitingOn = "Melanie" | "Tom" | "Volunteer" | "External contact" | "Admin team" | "Management" | "Nobody";
type TaskCommentTone = "Note" | "Feedback" | "Submission" | "Approval";
type EventPrepStatus = "Not started" | "In progress" | "Done" | "Blocked";
type EmailRewriteMode = "warmer" | "shorter" | "formal" | "melanie-email" | "summarise";

type TaskComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  tone: TaskCommentTone;
};

type ExpenseClaim = {
  id: string;
  claimantName: string;
  role: string;
  date: string;
  type: string;
  amount: string;
  claimCategory: string;
  supplier: string;
  purchaseFor: string;
  travelFrom: string;
  travelTo: string;
  mileage: string;
  returnJourney: boolean;
  routeSource: string;
  reason: string;
  evidence: string;
  evidenceFile: string;
  receiptSuggestion: string;
  adminNote: string;
  status: ExpenseStatus;
  submittedAt: string;
  paidDate?: string;
  paidBy?: string;
  queryMessage?: string;
  syncStatus?: "Not synced" | "Synced" | "Sync issue";
};

type HourLog = {
  id: string;
  name: string;
  date: string;
  activity: string;
  eventId: string;
  hours: string;
  notes: string;
  status: HoursStatus;
  submittedAt: string;
  queryMessage?: string;
  syncStatus?: "Not synced" | "Synced" | "Sync issue";
};

type ManagerTask = {
  id: string;
  title: string;
  volunteerName: string;
  owner: string;
  dueDate: string;
  source: "Expense" | "Hours" | "DBS" | "Profile" | "Event" | "Fundraising" | "Certificate" | "Contact" | "Document" | "Launch" | "General";
  status: "Open" | "In progress" | "Submitted" | "Approved" | "Changes needed" | "Done";
  detail: string;
  createdAt: string;
  evidenceFiles?: string[];
  volunteerNote?: string;
  managerFeedback?: string;
  submittedAt?: string;
  reviewedAt?: string;
  waitingOn?: WaitingOn;
  comments?: TaskComment[];
};

type PortalEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  detail: string;
  defaultHours: string;
  rolesNeeded: string;
  capacity: number;
  source?: "Portal" | "Imported calendar" | "SharePoint";
  syncStatus?: "Not synced" | "Synced" | "Sync issue";
};

type EventPrepItem = {
  id: string;
  eventId: string;
  label: string;
  owner: string;
  status: EventPrepStatus;
  note: string;
};

type SharedFile = {
  id: string;
  name: string;
  area: "Policies" | "Training materials" | "Event resources" | "General";
  visibleTo: "Everyone" | "Managers only";
  uploadedBy: string;
  uploadedAt: string;
  syncStatus: "Not synced" | "Synced" | "Sync issue";
};

type ResourceItem = {
  id: string;
  title: string;
  type: string;
  owner: string;
  updated: string;
  tags: string[];
  summary: string;
  source: "SharePoint" | "OneDrive publish" | "Portal" | "Demo";
};

type CheckIn = {
  id: string;
  eventId: string;
  volunteerName: string;
  checkedInAt: string;
  checkedOutAt: string;
  hoursLogged: string;
};

type EventInterest = {
  id: string;
  eventId: string;
  volunteerName: string;
  status: InterestStatus;
  submittedAt: string;
};

type FeedbackEntry = {
  id: string;
  eventId: string;
  volunteerName: string;
  wentWell: string;
  concerns: string;
  suggestions: string;
  submittedAt: string;
};

type PortalMessage = {
  id: string;
  fromName: string;
  fromRole: Role | "coordinator";
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  status: "Unread" | "Read";
};

type VolunteerProfile = {
  id: string;
  name: string;
  role: string;
  email: string;
  pin?: string;
  phone: string;
  emergencyContact: string;
  availability: string;
  dbsExpiry: string;
  trainingDue: number;
  dietaryAccess: string;
  yearsVolunteering: number;
};

type UserProfileDraft = {
  name: string;
  role: string;
  email: string;
  pin: string;
  phone: string;
  emergencyContact: string;
  availability: string;
  dbsExpiry: string;
  trainingDue: string;
  dietaryAccess: string;
  yearsVolunteering: string;
};

type ClientPortalSettings = {
  organisationName: string;
  portalUrl: string;
  websiteUrl: string;
  adminMailbox: string;
  managementMailbox: string;
  managerName: string;
  adminLeadName: string;
  mileageRatePence: string;
  primaryColour: string;
  accentColour: string;
  logoStatus: string;
};

type DbsEmail = {
  id: string;
  direction: "Received" | "Sent";
  category: "DBS" | "Training" | "Certificate" | "Fundraising" | "Contact" | "Expense" | "Event" | "General";
  subject: string;
  from: string;
  to: string;
  receivedAt: string;
  waitingDays: number;
  volunteerEmail: string;
  volunteerNameHint: string;
  snippet: string;
  status: "Matched" | "Needs review";
  followUpStatus: "Reply needed" | "Waiting for confirmation" | "Confirmed" | "Closed";
  owner: string;
  nextAction: string;
  relatedRegion?: string;
  linkedEventId?: string;
};

type ContactProfile = {
  id: string;
  name: string;
  organisation: string;
  email: string;
  phone: string;
  region: string;
  area: "Events" | "Training" | "Fundraising" | "Referrals" | "Corporate" | "General";
  inviteFor: string;
  status: string;
  formType: string;
  requiredAttachments: string[];
  attachments: string[];
  lastAction: string;
};

type ContactProfileDraft = {
  name: string;
  organisation: string;
  email: string;
  phone: string;
  region: string;
  area: ContactProfile["area"];
  inviteFor: string;
  status: string;
  formType: string;
  requiredAttachments: string;
};

type ContactLogEntry = {
  id: string;
  contactId: string;
  contactName: string;
  area: ContactProfile["area"];
  region: string;
  action: string;
  detail: string;
  at: string;
};

type VipContact = {
  id: string;
  name: string;
  role: string;
  organisation: string;
  priority: "High" | "Medium" | "Low";
  contactMethodType: "Email" | "Form";
  directEmail: string;
  officeEmail: string;
  formLink: string;
  campaignEvent: string;
  templateType: "Mayor" | "Sponsor" | "General";
  customEmail: "Yes" | "No";
  notes: string;
  email: string;
  region: string;
  area: ContactProfile["area"];
  relevance: string;
};

type DesignStatus = "Brief ready" | "In Canva" | "Needs approval" | "Approved" | "Published";

type DesignAsset = {
  id: string;
  title: string;
  format: string;
  campaign: string;
  eventId: string;
  channel: string;
  dueDate: string;
  owner: string;
  approver: string;
  status: DesignStatus;
  destination: string;
  templateUrl: string;
  exportName: string;
  notes: string;
};

type DesignLogEntry = {
  id: string;
  assetId: string;
  assetTitle: string;
  campaign: string;
  action: string;
  detail: string;
  at: string;
};

type DesignBrief = {
  campaign: string;
  eventId: string;
  eventDate: string;
  location: string;
  audience: string;
  keyMessage: string;
  action: string;
  channels: string;
  requiredAssets: string;
  notes: string;
};

type LaunchStatus = "Ready" | "In progress" | "Waiting" | "Blocked";

type LaunchChecklistItem = {
  id: string;
  area: string;
  task: string;
  owner: string;
  status: LaunchStatus;
  detail: string;
};

type SharePointMapItem = {
  area: string;
  portalData: string;
  sharePointTarget: string;
  syncMode: string;
  status: LaunchStatus;
  notes: string;
};

type ReportPackStatus = "Draft ready" | "Copied" | "Exported" | "Needs update";

type ReportPack = {
  id: string;
  title: string;
  period: string;
  audience: string;
  template: string;
  focus: string;
  generatedAt: string;
  status: ReportPackStatus;
  sections: string[];
  sourceData: string[];
  destination: string;
};

type PublicIntakeStatus = "New" | "Assigned" | "In progress" | "Closed";

type PublicFormIntake = {
  id: string;
  type: "Volunteer enquiry" | "Event invite" | "Training request" | "Fundraising offer" | "Contact request";
  name: string;
  email: string;
  phone: string;
  region: string;
  receivedAt: string;
  message: string;
  status: PublicIntakeStatus;
  owner: string;
  linkedTo: string;
};

type ServiceReferralStatus = "New referral" | "Triage booked" | "Waiting list" | "Allocated" | "Active support" | "Closed";
type ServiceUrgency = "Routine" | "Priority" | "Urgent";
type ServiceFilter = "All" | "New" | "Waiting" | "Urgent" | "Unallocated" | "Active" | "Outcome due";

type ServiceReferral = {
  id: string;
  reference: string;
  clientName: string;
  referralSource: "Self referral" | "GP" | "School" | "Partner" | "Internal" | "Other";
  region: string;
  receivedAt: string;
  waitingDays: number;
  urgency: ServiceUrgency;
  status: ServiceReferralStatus;
  assignedTo: string;
  contactMethod: string;
  preferredSupport: "Counselling" | "Peer support" | "Group support" | "Signposting" | "Assessment";
  consentStatus: "Consent recorded" | "Consent needed";
  safeguardingFlag: "None" | "Check needed" | "Escalated";
  nextAction: string;
  outcomeStatus: "Not started" | "Baseline due" | "Review due" | "Completed";
};

type ServiceSession = {
  id: string;
  referralId: string;
  date: string;
  worker: string;
  format: "Phone" | "Video" | "In person";
  attendance: "Booked" | "Attended" | "Cancelled" | "No-show";
  adminStatus: "Notes locked" | "Follow-up due" | "Outcome due" | "Closed";
  nextStep: string;
};

type PermissionPreviewRole = Role | "finance";

type WorkloadMetric = {
  label: string;
  value: string | number;
  tone: "warn" | "info" | "good";
  detail?: string;
  action?: () => void;
};

type MicrosoftConnectionStatus = {
  mode: string;
  updatedAt: string;
  sharePoint: {
    configured: boolean;
    writable: boolean;
    hostname: string;
    sitePath: string;
    siteId: string;
    driveId: string;
    libraryName: string;
    backendFolder: string;
    evidenceFolder: string;
    taskEvidenceFolder: string;
    reportsFolder: string;
    syncLogsFolder: string;
    webUrl: string;
  };
  oneDrive: {
    policy: string;
    publishFolder: string;
    privateByDefault: boolean;
    detail: string;
  };
  mailbox: {
    address: string;
    configured: boolean;
  };
  services: {
    googleMapsConfigured: boolean;
    openAiConfigured: boolean;
  };
  missing: {
    target: string[];
    auth: string[];
  };
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type TravelDistanceResponse = {
  miles?: number;
  googleMapsUrl?: string;
  source?: string;
  error?: string;
};

type MileageResult = {
  ok: boolean;
  miles?: number;
  amount?: string;
  source?: string;
  googleMapsUrl?: string;
  error?: string;
};

type StaffAuthResponse =
  | { ok: true; name: string; role: Exclude<Role, "volunteer">; email: string }
  | { ok: false; error: string };

type InstallStatus = "ready" | "unsupported" | "instructions" | "installed";
type CalendarMode = "week" | "month";

const rolePins: Record<Role, string> = {
  volunteer: "2468",
  admin: "7391",
  manager: "9021",
};

const expenseTypes = [
  "Mileage",
  "Parking",
  "Train or bus",
  "Event supplies",
  "Training materials",
  "Refreshments",
  "Other",
];

const expenseCategoryOptions: Record<string, string[]> = {
  Mileage: ["Event travel", "Training travel", "Volunteer visit", "Other journey"],
  Parking: ["Event parking", "Training parking", "Meeting parking", "Other parking"],
  "Train or bus": ["Train", "Bus", "Taxi", "Other public transport"],
  "Event supplies": ["Stationery", "Room supplies", "Event materials", "Other supplies"],
  "Training materials": ["Workbook", "Printing", "Course resource", "Other training cost"],
  Refreshments: ["Tea and coffee", "Biscuits/snacks", "Light lunch", "Water/soft drinks", "Other refreshments"],
  Other: ["General cost", "Accessibility support", "Venue item", "Other"],
};

const travelExpenseTypes = ["Mileage", "Parking", "Train or bus"];
const waitingOnOptions: WaitingOn[] = ["Melanie", "Tom", "Volunteer", "External contact", "Admin team", "Management", "Nobody"];
const eventPrepTemplates: { label: string; owner: string }[] = [
  { label: "Venue and access confirmed", owner: "Management" },
  { label: "Volunteer cover confirmed", owner: "Melanie" },
  { label: "VIP/contact invites sent", owner: "Admin team" },
  { label: "Poster and social asset ready", owner: "Admin team" },
  { label: "Briefing and risk documents uploaded", owner: "Management" },
  { label: "QR check-in ready", owner: "Management" },
];

const emptyVolunteerProfile: VolunteerProfile = {
  id: "",
  name: "",
  role: "",
  email: "",
  pin: "",
  phone: "",
  emergencyContact: "",
  availability: "",
  dbsExpiry: "",
  trainingDue: 0,
  dietaryAccess: "",
  yearsVolunteering: 0,
};

const blankUserProfileDraft: UserProfileDraft = {
  name: "",
  role: "Volunteer",
  email: "",
  pin: "",
  phone: "",
  emergencyContact: "",
  availability: "",
  dbsExpiry: "",
  trainingDue: "0",
  dietaryAccess: "",
  yearsVolunteering: "0",
};

const defaultClientSettings: ClientPortalSettings = {
  organisationName: "Violet Project",
  portalUrl: "https://portal.violetproject.co.uk",
  websiteUrl: "https://violetproject.co.uk",
  adminMailbox: "contact@violetproject.co.uk",
  managementMailbox: "info@violetproject.co.uk",
  managerName: "Melanie",
  adminLeadName: "Tom",
  mileageRatePence: "40",
  primaryColour: "#632494",
  accentColour: "#3b9094",
  logoStatus: "Logo to add later",
};

const emptyPortalEvent: PortalEvent = {
  id: "",
  title: "",
  date: "",
  time: "",
  location: "",
  detail: "",
  defaultHours: "",
  rolesNeeded: "",
  capacity: 0,
};

const cleanDataVersion = "violet-real-data-v1";

const initialEvents: PortalEvent[] = [];

const calendarMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const resourceLibrary: ResourceItem[] = [];

const demoProfiles: VolunteerProfile[] = [
  {
    id: "demo-profile-thomas",
    name: "Thomas Example",
    role: "Volunteer",
    email: "thomas@example.org",
    phone: "07123 456789",
    emergencyContact: "Jane Example, 07123 000000",
    availability: "Tuesday evenings, Saturday mornings",
    dbsExpiry: "2026-10-12",
    trainingDue: 1,
    dietaryAccess: "No dietary notes recorded",
    yearsVolunteering: 2,
  },
  {
    id: "demo-profile-aisha",
    name: "Aisha Example",
    role: "Volunteer coordinator",
    email: "aisha@example.org",
    phone: "07900 111222",
    emergencyContact: "Sam Example, 07900 333444",
    availability: "Monthly events and online admin",
    dbsExpiry: "2027-03-18",
    trainingDue: 0,
    dietaryAccess: "Step-free access preferred",
    yearsVolunteering: 1,
  },
];

const demoEvents: PortalEvent[] = [
  {
    id: "demo-event-wspd",
    title: "Demo: World Suicide Prevention Day planning",
    date: "2026-09-10",
    time: "10:00",
    location: "Coventry city centre",
    detail: "Labelled demo event for showing the calendar, VIP invite and staffing tools.",
    defaultHours: "3",
    rolesNeeded: "Welcome desk, leaflet support, setup",
    capacity: 8,
    source: "Portal",
    syncStatus: "Not synced",
  },
  {
    id: "demo-event-training",
    title: "Demo: Volunteer safeguarding refresher",
    date: "2026-07-02",
    time: "18:30",
    location: "Online",
    detail: "Labelled demo training item for the volunteer and management calendars.",
    defaultHours: "1.5",
    rolesNeeded: "Attendance confirmation",
    capacity: 20,
    source: "Imported calendar",
    syncStatus: "Not synced",
  },
];

const demoMailboxItems: DbsEmail[] = [
  {
    id: "demo-mail-dbs",
    direction: "Received",
    category: "DBS",
    subject: "Demo: DBS certificate received",
    from: "dbs@example.org",
    to: "contact@violetproject.co.uk",
    receivedAt: "12/06/2026, 09:42",
    waitingDays: 2,
    volunteerEmail: "thomas@example.org",
    volunteerNameHint: "Thomas Example",
    snippet: "Labelled demo email showing how a DBS update can be matched to a volunteer profile.",
    status: "Matched",
    followUpStatus: "Reply needed",
    owner: "Admin team",
    nextAction: "Check the certificate date, update the profile and confirm receipt.",
    relatedRegion: "Coventry",
  },
  {
    id: "demo-mail-fundraising",
    direction: "Received",
    category: "Fundraising",
    subject: "Demo: Fundraising support offer",
    from: "supporter@example.org",
    to: "contact@violetproject.co.uk",
    receivedAt: "08/06/2026, 14:15",
    waitingDays: 6,
    volunteerEmail: "",
    volunteerNameHint: "External supporter",
    snippet: "Labelled demo email for the SLA queue and thank-you workflow.",
    status: "Needs review",
    followUpStatus: "Waiting for confirmation",
    owner: "Melanie Griffin",
    nextAction: "Send thank-you, log contact details and check if a follow-up call is needed.",
    relatedRegion: "Birmingham",
  },
];

const demoResources: ResourceItem[] = [
  {
    id: "demo-resource-safeguarding",
    title: "Demo: Safeguarding quick guide",
    type: "Policy",
    owner: "Management",
    updated: "14 Jun 2026",
    tags: ["safeguarding", "policy", "volunteers", "urgent"],
    summary: "Labelled demo resource showing tag search instead of folder browsing.",
    source: "Demo",
  },
  {
    id: "demo-resource-expenses",
    title: "Demo: Expense claim guidance",
    type: "Finance",
    owner: "Admin",
    updated: "14 Jun 2026",
    tags: ["expenses", "mileage", "receipts", "finance"],
    summary: "Explains what evidence to upload and how mileage is calculated.",
    source: "Demo",
  },
  {
    id: "demo-resource-training",
    title: "Demo: Lone working training slides",
    type: "Training",
    owner: "Melanie",
    updated: "14 Jun 2026",
    tags: ["training", "lone working", "dbs"],
    summary: "Example training material that can later sync from SharePoint.",
    source: "Demo",
  },
];

const initialProfiles: VolunteerProfile[] = [];

const initialMailboxItems: DbsEmail[] = [];

const trainingCertificates: Array<{
  id: string;
  volunteer: string;
  course: string;
  completedAt: string;
  waitedDays: number;
  provider: string;
  status: string;
  emailId: string;
}> = [];

const fundraisingFollowUps: Array<{
  id: string;
  name: string;
  email: string;
  item: string;
  amount: string;
  thanked: string;
  waitedDays: number;
  region: string;
}> = [];

const initialContactProfiles: ContactProfile[] = [];

const initialContactLog: ContactLogEntry[] = [];

const blankContactProfileDraft: ContactProfileDraft = {
  name: "",
  organisation: "",
  email: "",
  phone: "",
  region: "",
  area: "Events",
  inviteFor: "",
  status: "New",
  formType: "",
  requiredAttachments: "",
};

const regionalServices: Array<{
  region: string;
  referrals: number;
  activeVolunteers: number;
  events: number;
  openEmails: number;
  trainingWaiting: number;
  fundraisingFollowUps: number;
}> = [];

const initialServiceReferrals: ServiceReferral[] = [];

const initialServiceSessions: ServiceSession[] = [];

const servicePathway = [
  { label: "Intake", status: "New referral", detail: "Record source, consent and contact preference." },
  { label: "Triage", status: "Triage booked", detail: "Check urgency, region and next safe action." },
  { label: "Waiting", status: "Waiting list", detail: "Track wait length and contact schedule." },
  { label: "Allocated", status: "Allocated", detail: "Assign worker without exposing private notes." },
  { label: "Support", status: "Active support", detail: "Track appointments, attendance and outcomes." },
  { label: "Closed", status: "Closed", detail: "Record closure reason and follow-up route." },
];

const counsellorCapacity: Array<{ name: string; role: string; capacity: number; active: number; region: string }> = [];

const vipContacts: VipContact[] = [
  { id: "vip-coventry-mayor", name: "Mayor of Coventry", role: "Mayor", organisation: "Coventry City Council", priority: "High", contactMethodType: "Form", directEmail: "", officeEmail: "mayorsoffice@coventry.gov.uk", formLink: "https://www.coventry.gov.uk/councillors-mayor/mayor-coventry", campaignEvent: "World Suicide Prevention Day", templateType: "Mayor", customEmail: "No", notes: "Use formal civic request", email: "mayorsoffice@coventry.gov.uk", region: "Coventry", area: "Events", relevance: "Best fit for Coventry civic invitations and World Suicide Prevention Day visibility." },
  { id: "vip-birmingham-mayor", name: "Mayor of Birmingham", role: "Mayor", organisation: "Birmingham City Council", priority: "High", contactMethodType: "Form", directEmail: "", officeEmail: "lordmayor@birmingham.gov.uk", formLink: "https://www.birmingham.gov.uk/mayor", campaignEvent: "World Suicide Prevention Day", templateType: "Mayor", customEmail: "No", notes: "Formal invite needed", email: "lordmayor@birmingham.gov.uk", region: "Birmingham", area: "Events", relevance: "Best fit for Birmingham civic invitations and major regional awareness events." },
  { id: "vip-solihull-mayor", name: "Mayor of Solihull", role: "Mayor", organisation: "Solihull Council", priority: "High", contactMethodType: "Form", directEmail: "", officeEmail: "mayor@solihull.gov.uk", formLink: "https://www.solihull.gov.uk/councillors-democracy/mayor", campaignEvent: "World Suicide Prevention Day", templateType: "Mayor", customEmail: "No", notes: "", email: "mayor@solihull.gov.uk", region: "Solihull", area: "Events", relevance: "Best fit for Solihull civic invitations and public awareness events." },
  { id: "vip-sandwell-mayor", name: "Mayor of Sandwell", role: "Mayor", organisation: "Sandwell Council", priority: "High", contactMethodType: "Form", directEmail: "", officeEmail: "mayor@sandwell.gov.uk", formLink: "https://www.sandwell.gov.uk/mayor", campaignEvent: "World Suicide Prevention Day", templateType: "Mayor", customEmail: "No", notes: "", email: "mayor@sandwell.gov.uk", region: "Sandwell", area: "Events", relevance: "Best fit for Sandwell civic invitations and public awareness events." },
  { id: "vip-dudley-mayor", name: "Mayor of Dudley", role: "Mayor", organisation: "Dudley Council", priority: "High", contactMethodType: "Form", directEmail: "", officeEmail: "mayor@dudley.gov.uk", formLink: "https://www.dudley.gov.uk/council-community/mayor/", campaignEvent: "World Suicide Prevention Day", templateType: "Mayor", customEmail: "No", notes: "", email: "mayor@dudley.gov.uk", region: "Dudley", area: "Events", relevance: "Best fit for Dudley civic invitations and public awareness events." },
  { id: "vip-walsall-mayor", name: "Mayor of Walsall", role: "Mayor", organisation: "Walsall Council", priority: "High", contactMethodType: "Form", directEmail: "", officeEmail: "mayor@walsall.gov.uk", formLink: "https://go.walsall.gov.uk/mayor", campaignEvent: "World Suicide Prevention Day", templateType: "Mayor", customEmail: "No", notes: "", email: "mayor@walsall.gov.uk", region: "Walsall", area: "Events", relevance: "Best fit for Walsall civic invitations and public awareness events." },
  { id: "vip-wolverhampton-mayor", name: "Mayor of Wolverhampton", role: "Mayor", organisation: "Wolverhampton Council", priority: "High", contactMethodType: "Form", directEmail: "", officeEmail: "mayor@wolverhampton.gov.uk", formLink: "https://www.wolverhampton.gov.uk/your-council/mayor", campaignEvent: "World Suicide Prevention Day", templateType: "Mayor", customEmail: "No", notes: "", email: "mayor@wolverhampton.gov.uk", region: "Wolverhampton", area: "Events", relevance: "Best fit for Wolverhampton civic invitations and public awareness events." },
  { id: "vip-richard-parker", name: "Richard Parker", role: "West Midlands Mayor", organisation: "WMCA", priority: "High", contactMethodType: "Form", directEmail: "", officeEmail: "mayor@wmca.org.uk", formLink: "https://www.wmca.org.uk/contact/", campaignEvent: "World Suicide Prevention Day", templateType: "Mayor", customEmail: "No", notes: "Top priority", email: "mayor@wmca.org.uk", region: "West Midlands", area: "Events", relevance: "Top priority for region-wide events across the West Midlands." },
  { id: "vip-paul-sinha", name: "Paul Sinha", role: "Comedian", organisation: "", priority: "Medium", contactMethodType: "Email", directEmail: "", officeEmail: "", formLink: "", campaignEvent: "World Suicide Prevention Day", templateType: "Sponsor", customEmail: "No", notes: "Contact via agent", email: "", region: "West Midlands", area: "Fundraising", relevance: "Potential sponsor/guest for campaign visibility if agent contact is found." },
  { id: "vip-adrian-goldberg", name: "Adrian Goldberg", role: "Journalist", organisation: "", priority: "High", contactMethodType: "Email", directEmail: "", officeEmail: "", formLink: "", campaignEvent: "World Suicide Prevention Day", templateType: "Sponsor", customEmail: "No", notes: "Good host", email: "", region: "Birmingham", area: "Events", relevance: "Potential host/media contact for awareness events." },
  { id: "vip-patrick-vernon", name: "Patrick Vernon", role: "Campaigner", organisation: "", priority: "High", contactMethodType: "Email", directEmail: "", officeEmail: "", formLink: "", campaignEvent: "World Suicide Prevention Day", templateType: "Sponsor", customEmail: "No", notes: "", email: "", region: "West Midlands", area: "Events", relevance: "Strong campaign voice for public awareness and community engagement." },
  { id: "vip-ruth-jacobs", name: "Ruth Jacobs", role: "Community Leader", organisation: "", priority: "High", contactMethodType: "Email", directEmail: "", officeEmail: "", formLink: "", campaignEvent: "World Suicide Prevention Day", templateType: "Sponsor", customEmail: "No", notes: "", email: "", region: "West Midlands", area: "Events", relevance: "Community leadership fit for campaign and awareness events." },
];

const initialDesignBrief: DesignBrief = {
  campaign: "",
  eventId: "",
  eventDate: "",
  location: "",
  audience: "",
  keyMessage: "",
  action: "",
  channels: "",
  requiredAssets: "",
  notes: "",
};

const initialDesignAssets: DesignAsset[] = [];

const initialDesignLog: DesignLogEntry[] = [];

const brandColours = [
  { label: "Violet", value: "#8360af" },
  { label: "Deep violet", value: "#632494" },
  { label: "Soft lavender", value: "#bc8cc6" },
  { label: "Teal", value: "#3b9094" },
  { label: "Deep teal", value: "#12687d" },
  { label: "Blush", value: "#e6c2bf" },
  { label: "Ink", value: "#20162a" },
];

const initialLaunchChecklist: LaunchChecklistItem[] = [
  {
    id: "launch-build",
    area: "Portal build",
    task: "Keep portal independent of current website migration",
    owner: "Codex / Admin",
    status: "Ready",
    detail: "The portal can be built and tested on a separate preview or portal subdomain before the main website moves.",
  },
  {
    id: "launch-domain",
    area: "Website",
    task: "Choose launch URL",
    owner: "Website owner",
    status: "Waiting",
    detail: "Recommended first version: portal.violetproject.co.uk, linked from the existing website until the main site migrates.",
  },
  {
    id: "launch-auth",
    area: "Microsoft sign-in",
    task: "Register the portal in Microsoft Entra",
    owner: "Microsoft 365 admin",
    status: "Waiting",
    detail: "Needed for secure staff/volunteer sign-in and Microsoft Graph access.",
  },
  {
    id: "launch-sharepoint-site",
    area: "SharePoint",
    task: "Confirm the SharePoint site and libraries",
    owner: "Microsoft 365 admin",
    status: "Waiting",
    detail: "SharePoint should remain the hidden storage layer; staff should not need to work inside it directly.",
  },
  {
    id: "launch-mailbox",
    area: "Mailbox",
    task: "Connect contact@violetproject.co.uk",
    owner: "Admin / Microsoft 365 admin",
    status: "Waiting",
    detail: "Admin inbox items should appear inside this portal with reply status, wait time, owner and linked records.",
  },
  {
    id: "launch-files",
    area: "Files",
    task: "Create document libraries and folder rules",
    owner: "Admin / Microsoft 365 admin",
    status: "In progress",
    detail: "Receipts, certificates, Canva exports, contact forms and resources need predictable portal-managed storage.",
  },
  {
    id: "launch-permissions",
    area: "Permissions",
    task: "Lock down role-based access",
    owner: "Management",
    status: "In progress",
    detail: "Volunteers see their own information only; admin/management see operational data based on role.",
  },
  {
    id: "launch-env",
    area: "Private settings",
    task: "Prepare local and deployment environment variables",
    owner: "Developer",
    status: "In progress",
    detail: "Keys and Microsoft IDs live in private settings, not in code and not in the volunteer UI.",
  },
];

const sharePointDataMap: SharePointMapItem[] = [
  {
    area: "Volunteer profile",
    portalData: "Phone, email, emergency contact, availability, DBS expiry, accessibility notes",
    sharePointTarget: "List: Volunteers",
    syncMode: "Two-way",
    status: "In progress",
    notes: "Portal is the editable front end; SharePoint stores the source record.",
  },
  {
    area: "Hours",
    portalData: "Submitted hours, event check-ins, approval status, manager notes",
    sharePointTarget: "List: Volunteer Hours",
    syncMode: "Portal writes, management approves",
    status: "Ready",
    notes: "Useful first integration because it proves submit -> approve -> report.",
  },
  {
    area: "Expenses",
    portalData: "Mileage, receipts, OCR hints, approvals, payment batch",
    sharePointTarget: "List: Expenses + Library: Expense Evidence",
    syncMode: "Portal writes records and uploads files",
    status: "Ready",
    notes: "Receipts should be linked to claims automatically.",
  },
  {
    area: "Events",
    portalData: "Calendar, sign-ups, check-in QR, volunteer roles, feedback",
    sharePointTarget: "List: Events + Microsoft 365 Calendar",
    syncMode: "Two-way with calendar import",
    status: "In progress",
    notes: "Staff update events in the portal; SharePoint/calendar keep the official records.",
  },
  {
    area: "Admin inbox",
    portalData: "Email tasks, wait time, owner, reply status, linked volunteer/contact",
    sharePointTarget: "Mailbox: contact@violetproject.co.uk + List: Inbox Tasks",
    syncMode: "Mailbox reads, portal tracks work",
    status: "Waiting",
    notes: "Staff should work from the portal queue, not live in Outlook all day.",
  },
  {
    area: "Counselling and service delivery",
    portalData: "Referral intake, triage status, waiting list, allocation, appointment admin and outcomes due",
    sharePointTarget: "Restricted list: Service Referrals + restricted library: Service Evidence",
    syncMode: "Portal writes admin records; private notes stay restricted",
    status: "Waiting",
    notes: "General admin can track work status without opening sensitive counselling notes.",
  },
  {
    area: "Training and DBS",
    portalData: "Training due, certificate waits, DBS expiry, evidence links",
    sharePointTarget: "List: Training and DBS + Library: Certificates",
    syncMode: "Portal tracks and files evidence",
    status: "In progress",
    notes: "Sensitive data needs stricter permissions than general resources.",
  },
  {
    area: "Contacts and VIPs",
    portalData: "Profiles, forms, attachments, invite status, campaign logs",
    sharePointTarget: "List: Contacts + Library: Contact Forms",
    syncMode: "Portal writes and logs",
    status: "Ready",
    notes: "This is where civic/VIP outreach and forms become trackable.",
  },
  {
    area: "Design Studio",
    portalData: "Canva briefs, export files, approvals, publish log",
    sharePointTarget: "List: Design Assets + Library: Campaign Files",
    syncMode: "Portal logs, files saved back",
    status: "In progress",
    notes: "Canva remains the editor; the portal owns the brief, approval and storage trail.",
  },
  {
    area: "Resources",
    portalData: "Policies, safeguarding, lone working, training materials, public resources",
    sharePointTarget: "Library: Resources",
    syncMode: "Portal publishes from OneDrive/SharePoint",
    status: "In progress",
    notes: "Volunteers search resources in the portal rather than browsing folders.",
  },
];

const privateSettingRows = [
  { key: "NEXT_PUBLIC_PORTAL_BASE_URL", use: "Final portal URL for QR codes, emails and install links", needed: "Before public testing" },
  { key: "MICROSOFT_TENANT_ID", use: "Identifies Violet Project Microsoft 365 tenant", needed: "Before Microsoft sign-in" },
  { key: "MICROSOFT_CLIENT_ID", use: "Portal app registration ID", needed: "Before Microsoft sign-in" },
  { key: "MICROSOFT_CLIENT_SECRET", use: "Private server-side app secret", needed: "Before SharePoint sync" },
  { key: "SHAREPOINT_SITE_ID", use: "Target SharePoint site for lists and files", needed: "Before SharePoint sync" },
  { key: "SHAREPOINT_DRIVE_ID", use: "Document library for evidence, resources and campaign files", needed: "Before file upload" },
  { key: "CONTACT_MAILBOX_ADDRESS", use: "Admin mailbox shown in the portal", needed: "Before inbox sync" },
  { key: "GOOGLE_MAPS_API_KEY", use: "Mileage distance calculation", needed: "Before live expense mileage" },
  { key: "OPENAI_API_KEY", use: "Optional smart email and receipt-reading features", needed: "Before AI drafting/OCR" },
];

const reportPackTemplates = [
  "Trustee update deck",
  "Volunteer impact report",
  "Event briefing deck",
  "Training certificate pack",
  "Fundraising thank-you pack",
  "Regional service breakdown",
  "Counselling waiting list report",
];

const initialPublicIntake: PublicFormIntake[] = [];

const onboardingSteps = [
  "Profile completed",
  "Emergency contact added",
  "DBS date recorded",
  "Training assigned",
  "First event booked",
  "Documents read",
];

const certificateTemplates = [
  "Safeguarding Refresher",
  "Volunteer Induction",
  "Lone Working",
  "Event Support Training",
];

const permissionPreviewRows: Record<PermissionPreviewRole, string[]> = {
  volunteer: ["Own dashboard", "Own tasks", "Own expenses", "Own hours", "Events", "Resources", "Messages"],
  manager: ["Approval inbox", "Volunteer records", "Event command centre", "Reports", "Messages", "Resources"],
  admin: ["Inbox", "Public form intake", "Contacts", "Certificates", "Design Studio", "Integrations", "Data sync"],
  finance: ["Expense approvals", "Payment batch", "Finance reports", "Receipt evidence", "Audit trail"],
};

const notificationChannels = [
  "Event reminders",
  "Expense updates",
  "Training and DBS reminders",
  "General volunteer updates",
  "Email reminders",
];

const initialNotificationPrefs = [
  "Event reminders",
  "Expense updates",
  "Training and DBS reminders",
];

const notificationSubscriptionService = {
  name: "Reminder preferences",
  currentVersion: "Saved.",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parsePortalDate(value: string) {
  if (!value) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const day = next.getDay() || 7;
  next.setDate(next.getDate() - day + 1);
  return next;
}

function sameCalendarDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function eventMonthIndex(date: string) {
  const parsed = parsePortalDate(date);
  if (parsed) return parsed.getMonth();
  return calendarMonths.findIndex((month) => date.toLowerCase().includes(month.toLowerCase()));
}

function eventTime(event: PortalEvent) {
  return parsePortalDate(event.date)?.getTime() ?? Number.MAX_SAFE_INTEGER;
}

function formatCalendarDate(date: Date) {
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function formatDateLong(value: string) {
  const parsed = parsePortalDate(value);
  return parsed ? parsed.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : value || "No date";
}

function dateInputValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function taskDueLabel(task: ManagerTask) {
  if (task.status === "Approved" || task.status === "Done") return "Complete";
  const dueDate = parsePortalDate(task.dueDate);
  if (!dueDate) return "No due date";
  const days = Math.ceil((startOfDay(dueDate).getTime() - startOfDay(new Date()).getTime()) / 86400000);
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function isTaskOverdue(task: ManagerTask) {
  const dueDate = parsePortalDate(task.dueDate);
  return Boolean(dueDate && !["Approved", "Done"].includes(task.status) && startOfDay(dueDate).getTime() < startOfDay(new Date()).getTime());
}

function waitingOnForStatus(status: ManagerTask["status"]): WaitingOn {
  if (status === "Submitted") return "Melanie";
  if (status === "Changes needed") return "Volunteer";
  if (status === "Approved" || status === "Done") return "Nobody";
  return "Volunteer";
}

function waitingOnLabel(task: ManagerTask): WaitingOn {
  return task.waitingOn || waitingOnForStatus(task.status);
}

function eventPrepItemId(eventId: string, label: string) {
  return `${eventId}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function money(value: string | number) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function inferWestMidlandsRegion(text: string) {
  const lower = text.toLowerCase();
  const places = ["Coventry", "Birmingham", "Solihull", "Sandwell", "Dudley", "Walsall", "Wolverhampton"];
  return places.find((place) => lower.includes(place.toLowerCase())) || "West Midlands";
}

function vipScore(vip: VipContact, eventText: string, eventRegion: string) {
  let score = vip.priority === "High" ? 40 : vip.priority === "Medium" ? 25 : 10;
  if (vip.region === eventRegion) score += 45;
  if (vip.region === "West Midlands") score += 25;
  if (eventText.toLowerCase().includes(vip.campaignEvent.toLowerCase())) score += 20;
  if (eventText.toLowerCase().includes("fundraising") && vip.area === "Fundraising") score += 15;
  if (eventText.toLowerCase().includes("training") && vip.area === "Training") score += 15;
  return score;
}

function saveCsv(filename: string, rows: Record<string, string | number>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function saveText(filename: string, text: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getProfile(id: string, profiles: VolunteerProfile[]) {
  return profiles.find((profile) => profile.id === id) || profiles[0] || emptyVolunteerProfile;
}

function isDbsSoon(date: string) {
  const expiry = new Date(`${date}T00:00:00`);
  const days = (expiry.getTime() - Date.now()) / 86400000;
  return days <= 90;
}

function eventTitle(eventId: string) {
  return initialEvents.find((event) => event.id === eventId)?.title || "Unlinked event";
}

function matchDbsEmail(profile: VolunteerProfile, mailboxItems = initialMailboxItems) {
  const profileEmail = profile.email?.toLowerCase().trim();
  const profileName = profile.name.toLowerCase().trim();

  return mailboxItems.find((email) => {
    const emailMatch =
      profileEmail && email.volunteerEmail.toLowerCase().trim() === profileEmail;
    const nameMatch =
      email.volunteerNameHint.toLowerCase().trim() === profileName ||
      email.subject.toLowerCase().includes(profileName);
    return emailMatch || nameMatch;
  });
}

function inferForwardedEmailAction(text: string) {
  const lower = text.toLowerCase();
  if (/(dbs|disclosure|barring)/.test(lower)) return "Check or update DBS";
  if (/(certificate|training completed|course completed)/.test(lower)) return "Issue or chase certificate";
  if (/(invite|event|calendar|speaker|vip|mayor)/.test(lower)) return "Send event/contact invite";
  if (/(fundraising|donation|sponsor|thank)/.test(lower)) return "Send fundraising thank-you";
  if (/(form|attachment|attach|document|upload|evidence)/.test(lower)) return "Complete form or attach documents";
  if (/(chase|follow up|follow-up|remind)/.test(lower)) return "Chase or follow up";
  if (/(reply|respond|email back|write back|send.*email)/.test(lower)) return "Draft and send reply";
  return "Review and action";
}

function inferForwardedEmailPriority(text: string) {
  const lower = text.toLowerCase();
  if (/(urgent|asap|today|immediately|before close|by end of day)/.test(lower)) return "Today";
  if (/(tomorrow|this week|by friday|by monday|soon)/.test(lower)) return "This week";
  return "Routine";
}

function inferForwardedEmailSource(text: string): ManagerTask["source"] {
  const lower = text.toLowerCase();
  if (lower.includes("dbs")) return "DBS";
  if (lower.includes("certificate") || lower.includes("training")) return "Certificate";
  if (lower.includes("expense") || lower.includes("receipt")) return "Expense";
  if (lower.includes("event") || lower.includes("calendar") || lower.includes("invite")) return "Event";
  if (lower.includes("fundraising") || lower.includes("donation") || lower.includes("sponsor")) return "Fundraising";
  if (lower.includes("contact") || lower.includes("vip") || lower.includes("mayor")) return "Contact";
  if (lower.includes("form") || lower.includes("attachment") || lower.includes("document")) return "Document";
  return "General";
}

async function fetchMileage(
  origin: string,
  destination: string,
  returnJourney: boolean,
): Promise<MileageResult> {
  try {
    const response = await fetch("/api/violet/travel-distance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination, returnJourney }),
    });
    const data = (await response.json()) as TravelDistanceResponse;
    if (!response.ok || !data.miles) {
      return {
        ok: false,
        error: data.error || "Google Maps could not calculate this route yet.",
        googleMapsUrl: data.googleMapsUrl,
      };
    }

    return {
      ok: true,
      miles: data.miles,
      amount: (data.miles * 0.4).toFixed(2),
      source: data.source,
      googleMapsUrl: data.googleMapsUrl,
    };
  } catch {
    return {
      ok: false,
      error: "Mileage calculation is not available right now.",
    };
  }
}

export default function VioletProjectPortalPage() {
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("volunteer");
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<Tab>("home");
  const [managementTab, setManagementTab] = useState<ManagementTab>("overview");
  const [managementSearch, setManagementSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [managementFilter, setManagementFilter] = useState("All");
  const [taskBoardFilter, setTaskBoardFilter] = useState<ManagerTask["status"] | "Overdue" | "All">("All");
  const [approvalFilter, setApprovalFilter] = useState("All");
  const [approvalSort, setApprovalSort] = useState("Newest first");
  const [reportRange, setReportRange] = useState("This month");
  const [reportPackDraft, setReportPackDraft] = useState({
    template: reportPackTemplates[0],
    audience: "Melanie / trustees",
    focus: "Impact, risks, follow-ups, events, money and certificates",
  });
  const [reportPacks, setReportPacks] = useState<ReportPack[]>([]);
  const [generatedReportPack, setGeneratedReportPack] = useState("");
  const [askVioletQuestion, setAskVioletQuestion] = useState("");
  const [askVioletAnswer, setAskVioletAnswer] = useState("");
  const [permissionPreviewRole, setPermissionPreviewRole] = useState<PermissionPreviewRole>("volunteer");
  const [publicIntake, setPublicIntake] = useState<PublicFormIntake[]>(initialPublicIntake);
  const [serviceReferrals, setServiceReferrals] = useState<ServiceReferral[]>(initialServiceReferrals);
  const [serviceSessions, setServiceSessions] = useState<ServiceSession[]>(initialServiceSessions);
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("All");
  const [certificateDraft, setCertificateDraft] = useState({
    volunteer: "",
    course: certificateTemplates[0],
    completedAt: today(),
    reference: "",
  });
  const [certificateOutput, setCertificateOutput] = useState("");
  const [microsoftStatus, setMicrosoftStatus] = useState<MicrosoftConnectionStatus | null>(null);
  const [microsoftStatusBusy, setMicrosoftStatusBusy] = useState(false);
  const [selectedProfileForManager, setSelectedProfileForManager] = useState<string | null>(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
  const [profiles, setProfiles] = useState<VolunteerProfile[]>(initialProfiles);
  const [profileEditorId, setProfileEditorId] = useState("");
  const [profileDraft, setProfileDraft] = useState<UserProfileDraft>(blankUserProfileDraft);
  const [demoMode, setDemoMode] = useState(false);
  const [clientSettings, setClientSettings] = useState<ClientPortalSettings>(defaultClientSettings);
  const [expenses, setExpenses] = useState<ExpenseClaim[]>([]);
  const [hours, setHours] = useState<HourLog[]>([]);
  const [managerTasks, setManagerTasks] = useState<ManagerTask[]>([]);
  const [customEvents, setCustomEvents] = useState<PortalEvent[]>([]);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [contactProfiles, setContactProfiles] = useState<ContactProfile[]>(initialContactProfiles);
  const [contactDraft, setContactDraft] = useState<ContactProfileDraft>(blankContactProfileDraft);
  const [contactLog, setContactLog] = useState<ContactLogEntry[]>(initialContactLog);
  const [contactFormDrafts, setContactFormDrafts] = useState<Record<string, string>>({});
  const [designAssets, setDesignAssets] = useState<DesignAsset[]>(initialDesignAssets);
  const [designLog, setDesignLog] = useState<DesignLogEntry[]>(initialDesignLog);
  const [designBriefDraft, setDesignBriefDraft] = useState<DesignBrief>(initialDesignBrief);
  const [launchChecklist, setLaunchChecklist] = useState<LaunchChecklistItem[]>(initialLaunchChecklist);
  const [emailFollowUps, setEmailFollowUps] = useState<Record<string, DbsEmail["followUpStatus"]>>({});
  const [emailDelegations, setEmailDelegations] = useState<Record<string, string>>({});
  const [emailDrafts, setEmailDrafts] = useState<Record<string, string>>({});
  const [emailDraftSources, setEmailDraftSources] = useState<Record<string, string>>({});
  const [emailDraftBusy, setEmailDraftBusy] = useState<string | null>(null);
  const [interests, setInterests] = useState<EventInterest[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [eventPrepItems, setEventPrepItems] = useState<EventPrepItem[]>([]);
  const [portalMessages, setPortalMessages] = useState<PortalMessage[]>([]);
  const [taskCommentDrafts, setTaskCommentDrafts] = useState<Record<string, string>>({});
  const [resourceQuery, setResourceQuery] = useState("");
  const [resourceTagFilter, setResourceTagFilter] = useState("All");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("week");
  const [calendarFocusDate, setCalendarFocusDate] = useState(today());
  const [topCalendarExpanded, setTopCalendarExpanded] = useState(false);
  const [travelBusy, setTravelBusy] = useState(false);
  const [mileageStatus, setMileageStatus] = useState("");
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installStatus, setInstallStatus] = useState<InstallStatus>("unsupported");
  const [isIosSafari, setIsIosSafari] = useState(false);
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<string[]>(initialNotificationPrefs);
  const [favouriteAddress, setFavouriteAddress] = useState("");
  const [resourceBookmarks, setResourceBookmarks] = useState<string[]>([]);

  const [expenseDraft, setExpenseDraft] = useState({
    date: today(),
    type: "Mileage",
    amount: "",
    claimCategory: expenseCategoryOptions.Mileage[0],
    supplier: "",
    purchaseFor: "",
    travelFrom: "",
    travelTo: "",
    mileage: "",
    returnJourney: true,
    reason: "",
    evidence: "",
    evidenceFile: "",
    receiptSuggestion: "",
  });

  const [hoursDraft, setHoursDraft] = useState({
    date: today(),
    activity: "Peer support",
    eventId: "",
    hours: "",
    notes: "",
  });

  const [feedbackDraft, setFeedbackDraft] = useState({
    eventId: "",
    wentWell: "",
    concerns: "",
    suggestions: "",
  });

  const [eventDraft, setEventDraft] = useState({
    title: "",
    date: today(),
    time: "10:00",
    location: "",
    detail: "",
    defaultHours: "2",
    rolesNeeded: "",
    capacity: "8",
  });
  const [calendarImportText, setCalendarImportText] = useState("");
  const [sharedFileArea, setSharedFileArea] = useState<SharedFile["area"]>("Training materials");
  const [sharedFileVisibility, setSharedFileVisibility] = useState<SharedFile["visibleTo"]>("Everyone");
  const [messageDraft, setMessageDraft] = useState({
    to: "Admin team",
    subject: "",
    body: "",
  });
  const [taskDraft, setTaskDraft] = useState({
    volunteerName: "",
    title: "",
    detail: "",
    dueDate: today(),
    source: "Document" as ManagerTask["source"],
  });
  const [forwardedEmailText, setForwardedEmailText] = useState("");
  const [forwardedEmailResult, setForwardedEmailResult] = useState({
    instruction: "",
    subject: "",
    originalFrom: "",
    actionType: "",
    priority: "",
    taskSummary: "",
    cleanBody: "",
    suggestedReply: "",
  });
  const [serviceReferralDraft, setServiceReferralDraft] = useState({
    clientName: "",
    referralSource: "Self referral" as ServiceReferral["referralSource"],
    region: "",
    urgency: "Routine" as ServiceUrgency,
    contactMethod: "",
    preferredSupport: "Assessment" as ServiceReferral["preferredSupport"],
    nextAction: "",
  });

  useEffect(() => {
    document.title = "Violet Project";
    if (localStorage.getItem("violet-data-version") !== cleanDataVersion) {
      Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index))
        .filter((key): key is string => Boolean(key))
        .filter((key) => key.startsWith("violet-"))
        .forEach((key) => localStorage.removeItem(key));
      localStorage.setItem("violet-data-version", cleanDataVersion);
    }
    setExpenses(readStored("violet-expenses", []));
    setHours(readStored("violet-hours", []));
    setManagerTasks(readStored("violet-manager-tasks", []));
    setCustomEvents(readStored("violet-custom-events", []));
    setSharedFiles(readStored("violet-shared-files", []));
    setContactProfiles(readStored("violet-contact-profiles", initialContactProfiles));
    setContactLog(readStored("violet-contact-log", initialContactLog));
    setContactFormDrafts(readStored("violet-contact-form-drafts", {}));
    setDesignAssets(readStored("violet-design-assets", initialDesignAssets));
    setDesignLog(readStored("violet-design-log", initialDesignLog));
    setDesignBriefDraft(readStored("violet-design-brief", initialDesignBrief));
    setLaunchChecklist(readStored("violet-launch-checklist", initialLaunchChecklist));
    setReportPacks(readStored("violet-report-packs", []));
    setPublicIntake(readStored("violet-public-intake", initialPublicIntake));
    setServiceReferrals(readStored("violet-service-referrals", initialServiceReferrals));
    setServiceSessions(readStored("violet-service-sessions", initialServiceSessions));
    setEmailFollowUps(readStored("violet-email-follow-ups", {}));
    setEmailDelegations(readStored("violet-email-delegations", {}));
    setEmailDrafts(readStored("violet-email-drafts", {}));
    setEmailDraftSources(readStored("violet-email-draft-sources", {}));
    setInterests(readStored("violet-event-interest", []));
    setCheckIns(readStored("violet-check-ins", []));
    setFeedback(readStored("violet-feedback", []));
    setEventPrepItems(readStored("violet-event-prep-items", []));
    setPortalMessages(readStored("violet-portal-messages", []));
    setProfiles(readStored("violet-profiles", initialProfiles));
    setDemoMode(readStored("violet-demo-mode", false));
    setClientSettings(readStored("violet-client-settings", defaultClientSettings));
    setNotificationPrefs(readStored("violet-notification-prefs", initialNotificationPrefs));
    setFavouriteAddress(readStored("violet-favourite-address", ""));
    setResourceBookmarks(readStored("violet-resource-bookmarks", []));
    setExpenseDraft(readStored("violet-expense-draft", {
      date: today(),
      type: "Mileage",
      amount: "",
      claimCategory: expenseCategoryOptions.Mileage[0],
      supplier: "",
      purchaseFor: "",
      travelFrom: "",
      travelTo: "",
      mileage: "",
      returnJourney: true,
      reason: "",
      evidence: "",
      evidenceFile: "",
      receiptSuggestion: "",
    }));
    setHoursDraft(readStored("violet-hours-draft", {
      date: today(),
      activity: "Peer support",
      eventId: "",
      hours: "",
      notes: "",
    }));
    const session = readStored<{ name: string; role: Role; selectedVolunteerId?: string } | null>(
      "violet-session",
      null,
    );
    if (session?.name && session.role) {
      setName(session.name);
      setRole(session.role);
      if (session.selectedVolunteerId) setSelectedVolunteerId(session.selectedVolunteerId);
      if (session.role !== "volunteer") setTab("management");
      if (session.role === "admin") setManagementTab("overview");
      setSignedIn(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("violet-expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("violet-hours", JSON.stringify(hours));
  }, [hours]);

  useEffect(() => {
    localStorage.setItem("violet-manager-tasks", JSON.stringify(managerTasks));
  }, [managerTasks]);

  useEffect(() => {
    localStorage.setItem("violet-custom-events", JSON.stringify(customEvents));
  }, [customEvents]);

  useEffect(() => {
    localStorage.setItem("violet-shared-files", JSON.stringify(sharedFiles));
  }, [sharedFiles]);

  useEffect(() => {
    localStorage.setItem("violet-contact-profiles", JSON.stringify(contactProfiles));
  }, [contactProfiles]);

  useEffect(() => {
    localStorage.setItem("violet-contact-log", JSON.stringify(contactLog));
  }, [contactLog]);

  useEffect(() => {
    localStorage.setItem("violet-contact-form-drafts", JSON.stringify(contactFormDrafts));
  }, [contactFormDrafts]);

  useEffect(() => {
    localStorage.setItem("violet-design-assets", JSON.stringify(designAssets));
  }, [designAssets]);

  useEffect(() => {
    localStorage.setItem("violet-design-log", JSON.stringify(designLog));
  }, [designLog]);

  useEffect(() => {
    localStorage.setItem("violet-design-brief", JSON.stringify(designBriefDraft));
  }, [designBriefDraft]);

  useEffect(() => {
    localStorage.setItem("violet-launch-checklist", JSON.stringify(launchChecklist));
  }, [launchChecklist]);

  useEffect(() => {
    localStorage.setItem("violet-report-packs", JSON.stringify(reportPacks));
  }, [reportPacks]);

  useEffect(() => {
    void refreshMicrosoftStatus();
  }, []);

  useEffect(() => {
    localStorage.setItem("violet-public-intake", JSON.stringify(publicIntake));
  }, [publicIntake]);

  useEffect(() => {
    localStorage.setItem("violet-service-referrals", JSON.stringify(serviceReferrals));
  }, [serviceReferrals]);

  useEffect(() => {
    localStorage.setItem("violet-service-sessions", JSON.stringify(serviceSessions));
  }, [serviceSessions]);

  useEffect(() => {
    localStorage.setItem("violet-email-follow-ups", JSON.stringify(emailFollowUps));
  }, [emailFollowUps]);

  useEffect(() => {
    localStorage.setItem("violet-email-delegations", JSON.stringify(emailDelegations));
  }, [emailDelegations]);

  useEffect(() => {
    localStorage.setItem("violet-email-drafts", JSON.stringify(emailDrafts));
  }, [emailDrafts]);

  useEffect(() => {
    localStorage.setItem("violet-email-draft-sources", JSON.stringify(emailDraftSources));
  }, [emailDraftSources]);

  useEffect(() => {
    localStorage.setItem("violet-event-interest", JSON.stringify(interests));
  }, [interests]);

  useEffect(() => {
    localStorage.setItem("violet-check-ins", JSON.stringify(checkIns));
  }, [checkIns]);

  useEffect(() => {
    localStorage.setItem("violet-feedback", JSON.stringify(feedback));
  }, [feedback]);

  useEffect(() => {
    localStorage.setItem("violet-event-prep-items", JSON.stringify(eventPrepItems));
  }, [eventPrepItems]);

  useEffect(() => {
    localStorage.setItem("violet-portal-messages", JSON.stringify(portalMessages));
  }, [portalMessages]);

  useEffect(() => {
    localStorage.setItem("violet-profiles", JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem("violet-demo-mode", JSON.stringify(demoMode));
  }, [demoMode]);

  useEffect(() => {
    localStorage.setItem("violet-client-settings", JSON.stringify(clientSettings));
  }, [clientSettings]);

  useEffect(() => {
    localStorage.setItem("violet-notification-prefs", JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);

  useEffect(() => {
    localStorage.setItem("violet-favourite-address", JSON.stringify(favouriteAddress));
  }, [favouriteAddress]);

  useEffect(() => {
    localStorage.setItem("violet-resource-bookmarks", JSON.stringify(resourceBookmarks));
  }, [resourceBookmarks]);

  useEffect(() => {
    localStorage.setItem("violet-expense-draft", JSON.stringify(expenseDraft));
  }, [expenseDraft]);

  useEffect(() => {
    localStorage.setItem("violet-hours-draft", JSON.stringify(hoursDraft));
  }, [hoursDraft]);

  useEffect(() => {
    const origin = expenseDraft.travelFrom.trim();
    const destination = expenseDraft.travelTo.trim();

    if (expenseDraft.type !== "Mileage" || !origin || !destination) {
      setMileageStatus("");
      return;
    }

    setMileageStatus("Mileage will calculate automatically.");
    const timer = window.setTimeout(async () => {
      setTravelBusy(true);
      const result = await fetchMileage(origin, destination, expenseDraft.returnJourney);
      setTravelBusy(false);

      if (!result.ok || !result.miles || !result.amount) {
        setMileageStatus(result.error || "Automatic mileage needs a Google Maps API key.");
        return;
      }
      const mileageRatePence = Number(clientSettings.mileageRatePence || 40);
      const mileageAmount = (result.miles * (mileageRatePence / 100)).toFixed(2);

      setExpenseDraft((draft) => {
        if (
          draft.travelFrom.trim() !== origin ||
          draft.travelTo.trim() !== destination ||
          draft.returnJourney !== expenseDraft.returnJourney
        ) {
          return draft;
        }

        return {
          ...draft,
          mileage: String(result.miles),
          amount: mileageAmount || result.amount || draft.amount,
          receiptSuggestion: `${result.source || "Google Maps"} calculated ${result.miles} miles at ${mileageRatePence}p per mile.`,
        };
      });
      setMileageStatus(`Mileage calculated: ${result.miles} miles, ${money(mileageAmount)} at ${mileageRatePence}p per mile.`);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [clientSettings.mileageRatePence, expenseDraft.returnJourney, expenseDraft.travelFrom, expenseDraft.travelTo, expenseDraft.type]);

  useEffect(() => {
    const agent = navigator.userAgent;
    const iosSafari =
      /iPad|iPhone|iPod/.test(agent) &&
      /Safari/.test(agent) &&
      !/CriOS|FxiOS|EdgiOS/.test(agent);
    setIsIosSafari(iosSafari);
    if (iosSafari) {
      setInstallStatus("instructions");
    }

    function handleInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setInstallStatus("ready");
    }

    function handleInstalled() {
      setInstallStatus("installed");
      setShowNotificationPrefs(true);
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const visibleProfiles = demoMode
    ? [...profiles, ...demoProfiles.filter((demoProfile) => !profiles.some((profile) => profile.id === demoProfile.id))]
    : profiles;
  const mailboxItems = demoMode ? [...initialMailboxItems, ...demoMailboxItems] : initialMailboxItems;
  const sharedFileResources: ResourceItem[] = sharedFiles
    .filter((file) => file.visibleTo === "Everyone" || role !== "volunteer")
    .map((file) => ({
      id: `shared-${file.id}`,
      title: file.name,
      type: file.area,
      owner: file.uploadedBy,
      updated: file.uploadedAt,
      tags: [file.area.toLowerCase(), file.visibleTo === "Everyone" ? "everyone" : "management", file.syncStatus.toLowerCase()],
      summary: file.visibleTo === "Everyone"
        ? "Published file available through the portal resource search."
        : "Management-only file queued for the shared library.",
      source: "OneDrive publish",
    }));
  const portalResources = demoMode
    ? [...resourceLibrary, ...demoResources, ...sharedFileResources]
    : [...resourceLibrary, ...sharedFileResources];
  const resourceTags = ["All", ...Array.from(new Set(portalResources.flatMap((resource) => resource.tags))).sort()];
  const selectedVolunteer = getProfile(selectedVolunteerId, visibleProfiles);
  const portalEvents = demoMode ? [...demoEvents, ...initialEvents, ...customEvents] : [...initialEvents, ...customEvents];
  const sortedPortalEvents = [...portalEvents].sort((a, b) => eventTime(a) - eventTime(b));
  const portalCalendar = calendarMonths.map((month, index) => ({
    month,
    events: sortedPortalEvents.filter((event) => eventMonthIndex(event.date) === index),
  }));
  const calendarFocus = parsePortalDate(calendarFocusDate) || new Date();
  const weekStart = startOfWeek(calendarFocus);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const weekCalendar = weekDays.map((day) => ({
    day,
    events: sortedPortalEvents.filter((event) => {
      const eventDate = parsePortalDate(event.date);
      return eventDate ? sameCalendarDay(eventDate, day) : false;
    }),
  }));
  const monthStart = new Date(calendarFocus.getFullYear(), calendarFocus.getMonth(), 1);
  const monthGridStart = startOfWeek(monthStart);
  const monthCalendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = addDays(monthGridStart, index);
    return {
      day,
      isCurrentMonth: day.getMonth() === calendarFocus.getMonth(),
      events: sortedPortalEvents.filter((event) => {
        const eventDate = parsePortalDate(event.date);
        return eventDate ? sameCalendarDay(eventDate, day) : false;
      }),
    };
  });
  const calendarTitle =
    calendarMode === "week"
      ? `${formatCalendarDate(weekDays[0])} to ${formatCalendarDate(weekDays[6])}`
      : calendarFocus.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const upcomingCalendarEvents = sortedPortalEvents
    .filter((event) => (parsePortalDate(event.date)?.getTime() ?? 0) >= startOfDay(new Date()).getTime())
    .slice(0, 6);
  const calendarAccountRows = [
    {
      label: "Melanie's calendar",
      address: "Microsoft 365 calendar",
      status: microsoftStatus?.sharePoint.configured ? "Ready to connect after approval" : "Needs Microsoft approval",
    },
    {
      label: "Management inbox",
      address: "info@violetproject.co.uk",
      status: microsoftStatus?.mailbox.configured ? "Ready to sync" : "Needs mailbox connection",
    },
    {
      label: "Admin inbox",
      address: "contact@violetproject.co.uk",
      status: microsoftStatus?.mailbox.configured ? "Ready to sync" : "Needs mailbox connection",
    },
  ];
  const eventName = (eventId: string) =>
    portalEvents.find((event) => event.id === eventId)?.title || (eventId ? eventTitle(eventId) : "No event selected");
  const sessionName = role === "volunteer" ? selectedVolunteer.name || name || "Volunteer" : name;
  const currentPersonName = role === "volunteer" ? selectedVolunteer.name || name : name;
  const selectedManagerProfile = visibleProfiles.find((profile) => profile.id === selectedProfileForManager) || null;
  const personalExpenses = expenses.filter((expense) => expense.claimantName === currentPersonName);
  const personalHours = hours.filter((entry) => entry.name === currentPersonName);
  const personalTaskList = managerTasks.filter((task) => task.volunteerName === selectedVolunteer.name);
  const personalTasks = personalTaskList.filter((task) => !["Done", "Approved"].includes(task.status));
  const isMelanie = currentPersonName === "Melanie Griffin";
  const canMessageVolunteers = role !== "volunteer" || isMelanie;
  const messageRecipientOptions = canMessageVolunteers
    ? ["All volunteers", ...visibleProfiles.map((profile) => profile.name), "Admin team"]
    : ["Admin team", "Melanie Griffin"];
  const delegationOptions = Array.from(
    new Set([
      "Admin team",
      "Melanie Griffin",
      name,
      ...visibleProfiles.map((profile) => profile.name),
      ...mailboxItems.map((email) => email.owner),
    ].filter(Boolean)),
  );
  const messageInbox = portalMessages
    .filter(
      (item) =>
        item.to === currentPersonName ||
        (role === "volunteer" && item.to === "All volunteers") ||
        (role !== "volunteer" && item.to === "Admin team"),
    )
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  const sentMessages = portalMessages
    .filter((item) => item.fromName === currentPersonName)
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  const unreadMessages = messageInbox.filter((item) => item.status === "Unread");
  const nextEvent = portalEvents[0];
  const volunteerInterests = interests.filter((entry) => entry.volunteerName === selectedVolunteer.name);
  const activeCheckIn = checkIns.find(
    (entry) =>
      entry.eventId === selectedEventId &&
      entry.volunteerName === selectedVolunteer.name &&
      !entry.checkedOutAt,
  );

  const dashboard = useMemo(() => {
    const pendingAmount = personalExpenses
      .filter((expense) => !["Paid", "Rejected"].includes(expense.status))
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const hoursThisYear = personalHours.reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
    const supportedEventIds = new Set(personalHours.map((entry) => entry.eventId).filter(Boolean));
    const checkedInEventIds = new Set(
      checkIns
        .filter((entry) => entry.volunteerName === currentPersonName && entry.eventId)
        .map((entry) => entry.eventId),
    );
    return {
      hoursThisYear,
      upcomingEvents: portalEvents.length,
      trainingDue: selectedVolunteer.trainingDue,
      expensesPending: pendingAmount,
      eventsSupported: new Set([...supportedEventIds, ...checkedInEventIds]).size,
    };
  }, [checkIns, currentPersonName, personalExpenses, personalHours, portalEvents.length, selectedVolunteer.trainingDue]);

  const queueSummary = {
    expenseClaims: expenses.filter(
      (expense) => expense.status === "Submitted" || expense.status === "Needs evidence",
    ).length,
    hourLogs: hours.filter((entry) => entry.status === "Submitted").length,
    activeCheckIns: checkIns.filter((entry) => !entry.checkedOutAt).length,
    dbsItems: visibleProfiles.filter((profile) => profile.trainingDue > 0 || isDbsSoon(profile.dbsExpiry)).length,
  };

  const isTravelExpense = travelExpenseTypes.includes(expenseDraft.type);
  const isMileageExpense = expenseDraft.type === "Mileage";
  const categoryOptions = expenseCategoryOptions[expenseDraft.type] || expenseCategoryOptions.Other;
  const pendingExpenses = expenses.filter(
    (expense) => expense.status === "Submitted" || expense.status === "Needs evidence",
  );
  const approvedExpenses = expenses.filter((expense) => expense.status === "Approved");
  const paidExpenses = expenses.filter((expense) => expense.status === "Paid");
  const submittedHours = hours.filter((entry) => entry.status === "Submitted" || entry.status === "Query");
  const approvedHours = hours.filter((entry) => entry.status === "Approved");
  const activeCheckIns = checkIns.filter((entry) => !entry.checkedOutAt);
  const complianceItems = visibleProfiles.filter((profile) => profile.trainingDue > 0 || isDbsSoon(profile.dbsExpiry));
  const emailActionItems = mailboxItems.filter((email) => {
    const status = emailFollowUps[email.id] || email.followUpStatus;
    return status === "Reply needed" || status === "Waiting for confirmation";
  });
  const longestEmailWait = emailActionItems.reduce((longest, email) => Math.max(longest, email.waitingDays), 0);
  const certificateWaiting = trainingCertificates.filter((item) => item.status === "Waiting for certificate");
  const longestCertificateWait = certificateWaiting.reduce((longest, item) => Math.max(longest, item.waitedDays), 0);
  const fundraisingNeedsThanks = fundraisingFollowUps.filter((item) => item.thanked !== "Yes");
  const eventContactsOpen = contactProfiles.filter((contact) => contact.status !== "Confirmed");
  const designAssetsOpen = designAssets.filter((asset) => asset.status !== "Published");
  const designAssetsForApproval = designAssets.filter((asset) => asset.status === "Needs approval");
  const designAssetsPublished = designAssets.filter((asset) => asset.status === "Published");
  const designCampaigns = Array.from(new Set(designAssets.map((asset) => asset.campaign)));
  const launchReady = launchChecklist.filter((item) => item.status === "Ready").length;
  const launchWaiting = launchChecklist.filter((item) => item.status === "Waiting").length;
  const launchBlocked = launchChecklist.filter((item) => item.status === "Blocked").length;
  const launchInProgress = launchChecklist.filter((item) => item.status === "In progress").length;
  const launchOpen = launchChecklist.length - launchReady;
  const designPipeline = [
    { label: "Brief", status: "Brief ready" as DesignStatus, detail: "Ready for Canva" },
    { label: "Canva", status: "In Canva" as DesignStatus, detail: "Being designed" },
    { label: "Review", status: "Needs approval" as DesignStatus, detail: "Needs sign-off" },
    { label: "Approved", status: "Approved" as DesignStatus, detail: "Ready to export" },
    { label: "Published", status: "Published" as DesignStatus, detail: "Stored and live" },
  ].map((stage) => ({
    ...stage,
    count: designAssets.filter((asset) => asset.status === stage.status).length,
  }));
  const regionalOpenEmails = regionalServices.reduce((total, region) => total + region.openEmails, 0);
  const contactLogByArea = contactLog.reduce<Record<string, number>>((summary, entry) => {
    summary[entry.area] = (summary[entry.area] || 0) + 1;
    return summary;
  }, {});
  const contactLogByRegion = contactLog.reduce<Record<string, number>>((summary, entry) => {
    summary[entry.region] = (summary[entry.region] || 0) + 1;
    return summary;
  }, {});
  const serviceOpenReferrals = serviceReferrals.filter((item) => item.status !== "Closed");
  const serviceNewReferrals = serviceReferrals.filter((item) => item.status === "New referral");
  const serviceWaitingList = serviceReferrals.filter((item) => item.status === "Waiting list");
  const serviceUrgentReferrals = serviceReferrals.filter(
    (item) => item.urgency === "Urgent" || item.safeguardingFlag !== "None",
  );
  const serviceUnallocated = serviceReferrals.filter(
    (item) => item.status !== "Closed" && !item.assignedTo.trim(),
  );
  const serviceOutcomeDue = serviceReferrals.filter(
    (item) => item.outcomeStatus === "Baseline due" || item.outcomeStatus === "Review due",
  );
  const serviceLongestWait = serviceOpenReferrals.reduce((longest, item) => Math.max(longest, item.waitingDays), 0);
  const serviceSessionsThisWeek = serviceSessions.filter((item) => item.attendance === "Booked").length;
  const serviceRegionRows = regionalServices.map((region) => {
    const referrals = serviceReferrals.filter((item) => item.region === region.region);
    return {
      ...region,
      serviceReferrals: referrals.length,
      serviceWaiting: referrals.filter((item) => item.status === "Waiting list").length,
      serviceUrgent: referrals.filter((item) => item.urgency === "Urgent" || item.safeguardingFlag !== "None").length,
    };
  });
  const filteredServiceReferrals = serviceReferrals
    .filter((item) => {
      if (serviceFilter === "New") return item.status === "New referral";
      if (serviceFilter === "Waiting") return item.status === "Waiting list";
      if (serviceFilter === "Urgent") return item.urgency === "Urgent" || item.safeguardingFlag !== "None";
      if (serviceFilter === "Unallocated") return item.status !== "Closed" && !item.assignedTo.trim();
      if (serviceFilter === "Active") return item.status === "Allocated" || item.status === "Active support";
      if (serviceFilter === "Outcome due") return item.outcomeStatus === "Baseline due" || item.outcomeStatus === "Review due";
      return true;
    })
    .sort((a, b) => b.waitingDays - a.waitingDays);
  const serviceWorkload: WorkloadMetric[] = [
    { label: "New referrals", value: serviceNewReferrals.length, tone: serviceNewReferrals.length ? "warn" : "good", detail: "Open triage", action: () => setServiceFilter("New") },
    { label: "Waiting list", value: serviceWaitingList.length, tone: serviceWaitingList.length ? "info" : "good", detail: "Sort by wait", action: () => setServiceFilter("Waiting") },
    { label: "Urgent or flagged", value: serviceUrgentReferrals.length, tone: serviceUrgentReferrals.length ? "warn" : "good", detail: "Review risk", action: () => setServiceFilter("Urgent") },
    { label: "Unallocated", value: serviceUnallocated.length, tone: serviceUnallocated.length ? "warn" : "good", detail: "Assign worker", action: () => setServiceFilter("Unallocated") },
    { label: "Longest wait", value: `${serviceLongestWait}d`, tone: serviceLongestWait > 14 ? "warn" : "info", detail: "Waiting time", action: () => setServiceFilter("Waiting") },
    { label: "Sessions booked", value: serviceSessionsThisWeek, tone: "good", detail: "Admin log" },
    { label: "Outcomes due", value: serviceOutcomeDue.length, tone: serviceOutcomeDue.length ? "info" : "good", detail: "Review measures", action: () => setServiceFilter("Outcome due") },
  ];
  const eventSuggestionText = [eventDraft.title, eventDraft.location, eventDraft.detail].join(" ");
  const eventSuggestionRegion = inferWestMidlandsRegion(eventSuggestionText);
  const suggestedVips = eventSuggestionText.trim()
    ? vipContacts
        .map((vip) => ({ vip, score: vipScore(vip, eventSuggestionText, eventSuggestionRegion) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
    : [];
  const openManagerTasks = managerTasks.filter((task) => !["Done", "Approved"].includes(task.status));
  const submittedManagerTasks = managerTasks.filter((task) => task.status === "Submitted");
  const taskBoardStatuses: ManagerTask["status"][] = ["Open", "In progress", "Submitted", "Changes needed", "Approved"];
  const taskBoard = taskBoardStatuses.map((status) => ({
    status,
    tasks: managerTasks.filter((task) => task.status === status),
  }));
  const overdueManagerTasks = managerTasks.filter(isTaskOverdue);
  const changesNeededTasks = managerTasks.filter((task) => task.status === "Changes needed");
  const approvedManagerTasks = managerTasks.filter((task) => task.status === "Approved");
  const filteredTaskBoard =
    taskBoardFilter === "All"
      ? taskBoard
      : taskBoard
          .map((column) => ({
            ...column,
            tasks:
              taskBoardFilter === "Overdue"
                ? column.tasks.filter(isTaskOverdue)
                : column.status === taskBoardFilter
                  ? column.tasks
                  : [],
          }))
          .filter((column) => column.tasks.length || taskBoardFilter === column.status);
  const staffingGaps = portalEvents
    .map((event) => {
      const confirmed = interests.filter((entry) => entry.eventId === event.id && entry.status === "Confirmed").length;
      return { event, gap: Math.max(event.capacity - confirmed, 0), confirmed };
    })
    .filter((item) => item.gap > 0)
    .sort((a, b) => b.gap - a.gap);
  const checkInExceptions = [
    ...activeCheckIns.map((entry) => ({
      title: `${entry.volunteerName} still checked in`,
      detail: `${eventName(entry.eventId)} from ${entry.checkedInAt}`,
    })),
    ...hours
      .filter((entry) => Number(entry.hours || 0) > 8)
      .map((entry) => ({
        title: `${entry.name} logged ${entry.hours} hours`,
        detail: `${entry.activity} on ${entry.date}`,
      })),
  ];
  const paymentBatch = approvedExpenses.filter((expense) => expense.status === "Approved");
  const unifiedFollowUps = [
    ...openManagerTasks.map((task) => ({
      title: task.title,
      owner: task.owner,
      area: task.source,
      status: task.status,
      due: task.dueDate,
      detail: `${task.volunteerName}: ${task.detail}`,
    })),
    ...emailActionItems.map((email) => ({
      title: email.subject,
      owner: email.owner,
      area: email.category,
      status: emailFollowUps[email.id] || email.followUpStatus,
      due: `${email.waitingDays} days waiting`,
      detail: email.nextAction,
    })),
    ...certificateWaiting.map((certificate) => ({
      title: `Certificate waiting: ${certificate.volunteer}`,
      owner: "Training admin",
      area: "Certificate",
      status: certificate.status,
      due: `${certificate.waitedDays} days waiting`,
      detail: certificate.course,
    })),
    ...fundraisingNeedsThanks.map((item) => ({
      title: `Thank-you due: ${item.name}`,
      owner: "Fundraising lead",
      area: "Fundraising",
      status: item.thanked,
      due: `${item.waitedDays} days waiting`,
      detail: `${item.item} ${item.amount}`,
    })),
    ...eventContactsOpen.map((contact) => ({
      title: `Contact follow-up: ${contact.name}`,
      owner: "Admin",
      area: contact.area,
      status: contact.status,
      due: contact.region,
      detail: `${contact.organisation}: ${contact.inviteFor}`,
    })),
    ...serviceUnallocated.map((referral) => ({
      title: `Service allocation: ${referral.reference}`,
      owner: "Service manager",
      area: "Counselling",
      status: referral.status,
      due: `${referral.waitingDays} days waiting`,
      detail: `${referral.region}: ${referral.nextAction}`,
    })),
    ...serviceOutcomeDue.map((referral) => ({
      title: `Outcome due: ${referral.reference}`,
      owner: referral.assignedTo || "Service manager",
      area: "Counselling",
      status: referral.outcomeStatus,
      due: referral.region,
      detail: referral.nextAction,
    })),
  ].slice(0, 16);
  const approvalInboxItems = [
    ...pendingExpenses.map((expense) => ({
      kind: "expense",
      id: expense.id,
      title: `${expense.claimantName}: ${expense.type} ${money(expense.amount)}`,
      detail: `${expense.claimCategory || "General"} - ${expense.evidenceFile || expense.evidence || "No evidence attached"}`,
      status: expense.status,
      owner: "Management",
    })),
    ...submittedHours.map((entry) => ({
      kind: "hours",
      id: entry.id,
      title: `${entry.name}: ${entry.hours} hours`,
      detail: `${entry.activity} - ${eventName(entry.eventId)} - ${entry.notes || "No notes"}`,
      status: entry.status,
      owner: "Management",
    })),
    ...submittedManagerTasks.map((task) => ({
      kind: "task",
      id: task.id,
      title: task.title,
      detail: `${task.volunteerName} uploaded ${task.evidenceFiles?.join(", ") || "no files"}`,
      status: task.status,
      owner: task.owner,
    })),
    ...designAssetsForApproval.map((asset) => ({
      kind: "design",
      id: asset.id,
      title: asset.title,
      detail: `${asset.campaign} - ${asset.channel} - approver ${asset.approver}`,
      status: asset.status,
      owner: asset.owner,
    })),
    ...certificateWaiting.map((certificate) => ({
      kind: "certificate",
      id: certificate.id,
      title: `Certificate waiting: ${certificate.volunteer}`,
      detail: `${certificate.course} - ${certificate.waitedDays} days - ${certificate.provider}`,
      status: certificate.status,
      owner: "Training admin",
    })),
  ];
  const emailSlaRows = mailboxItems
    .map((email) => {
      const status = emailFollowUps[email.id] || email.followUpStatus;
      const sla =
        status === "Closed" || status === "Confirmed"
          ? "Done"
          : email.waitingDays >= 5
            ? "Overdue"
            : email.waitingDays >= 3
              ? "Urgent"
              : email.waitingDays >= 1
                ? "Waiting"
                : "New";
      return { ...email, statusLabel: status, sla };
    })
    .sort((a, b) => b.waitingDays - a.waitingDays);
  const emailSlaBuckets = [
    {
      label: "Under 2 days",
      count: emailSlaRows.filter((email) => email.sla !== "Done" && email.waitingDays < 3).length,
      detail: "Reply while it is still fresh",
    },
    {
      label: "3-5 days",
      count: emailSlaRows.filter((email) => email.sla !== "Done" && email.waitingDays >= 3 && email.waitingDays <= 5).length,
      detail: "Needs a clear owner",
    },
    {
      label: "Over 7 days",
      count: emailSlaRows.filter((email) => email.sla !== "Done" && email.waitingDays > 7).length,
      detail: "Escalate or close with note",
    },
    {
      label: "Waiting for Melanie",
      count: emailSlaRows.filter((email) => (emailDelegations[email.id] || email.owner).includes("Melanie")).length,
      detail: "Needs manager input",
    },
    {
      label: "Waiting external",
      count: emailSlaRows.filter((email) => (emailDelegations[email.id] || email.owner) === "External contact").length,
      detail: "Waiting on someone outside",
    },
    {
      label: "Ready to close",
      count: emailSlaRows.filter((email) => email.statusLabel === "Confirmed").length,
      detail: "Can be closed off",
    },
  ];
  const todayDate = startOfDay(new Date());
  const tasksDueToday = openManagerTasks.filter((task) => {
    const due = parsePortalDate(task.dueDate);
    return due ? sameCalendarDay(due, todayDate) : false;
  });
  const eventsToday = sortedPortalEvents.filter((event) => {
    const eventDate = parsePortalDate(event.date);
    return eventDate ? sameCalendarDay(eventDate, todayDate) : false;
  });
  const emailsWaiting = emailSlaRows.filter((email) => email.sla !== "Done");
  const todayWorkItems = [
    {
      id: "emails",
      title: "Emails needing reply",
      value: emailsWaiting.length,
      detail: emailsWaiting[0]
        ? `${emailsWaiting[0].subject} has waited ${emailsWaiting[0].waitingDays} day${emailsWaiting[0].waitingDays === 1 ? "" : "s"}.`
        : "Inbox is clear.",
      status: emailsWaiting.some((email) => email.sla === "Overdue") ? "Overdue" : emailsWaiting.length ? "Waiting" : "Clear",
      action: () => setManagementTab("mailbox"),
    },
    {
      id: "approvals",
      title: "Approvals waiting",
      value: approvalInboxItems.length,
      detail: approvalInboxItems[0] ? approvalInboxItems[0].title : "No approval items waiting.",
      status: approvalInboxItems.length ? "Review" : "Clear",
      action: () => setManagementTab("approvals"),
    },
    {
      id: "tasks",
      title: "Tasks due today",
      value: tasksDueToday.length,
      detail: tasksDueToday[0] ? `${tasksDueToday[0].title} is waiting on ${waitingOnLabel(tasksDueToday[0])}.` : "No tasks due today.",
      status: tasksDueToday.length ? "Due today" : "Clear",
      action: () => setManagementTab("tasks"),
    },
    {
      id: "events",
      title: "Events today",
      value: eventsToday.length,
      detail: eventsToday[0] ? `${eventsToday[0].title} at ${eventsToday[0].time || "time to add"}.` : "No events today.",
      status: eventsToday.length ? "Today" : "Clear",
      action: () => setManagementTab("events"),
    },
  ];
  const expenseQualityChecks = expenses.flatMap((expense) => {
    const checks: { id: string; title: string; detail: string; status: string; expenseId: string }[] = [];
    if (!expense.evidenceFile && !expense.evidence) {
      checks.push({
        id: `${expense.id}-missing-evidence`,
        title: "Missing expense evidence",
        detail: `${expense.claimantName}: ${expense.type} ${money(expense.amount)}`,
        status: "Missing",
        expenseId: expense.id,
      });
    }
    if (expense.type === "Mileage" && (!expense.travelFrom || !expense.travelTo || !expense.mileage)) {
      checks.push({
        id: `${expense.id}-mileage`,
        title: "Mileage needs checking",
        detail: `${expense.claimantName}: add route and calculated mileage.`,
        status: "Needs review",
        expenseId: expense.id,
      });
    }
    if (
      expense.evidenceFile &&
      expenses.some((other) => other.id !== expense.id && other.evidenceFile === expense.evidenceFile)
    ) {
      checks.push({
        id: `${expense.id}-duplicate`,
        title: "Possible duplicate receipt",
        detail: `${expense.evidenceFile} appears on more than one claim.`,
        status: "Needs review",
        expenseId: expense.id,
      });
    }
    return checks;
  });
  const onboardingRows = visibleProfiles.map((profile) => {
    const completed = [
      Boolean(profile.email && profile.phone),
      Boolean(profile.emergencyContact),
      Boolean(profile.dbsExpiry),
      profile.trainingDue === 0,
      interests.some((entry) => entry.volunteerName === profile.name),
      resourceBookmarks.length > 0 || profile.yearsVolunteering > 0,
    ];
    const completeCount = completed.filter(Boolean).length;
    return {
      profile,
      completeCount,
      percent: Math.round((completeCount / onboardingSteps.length) * 100),
      completed,
    };
  });
  const selectedPersonTimeline = selectedManagerProfile
    ? [
        ...expenses
          .filter((expense) => expense.claimantName === selectedManagerProfile.name)
          .map((expense) => ({
            at: expense.submittedAt,
            title: `Expense ${expense.status}`,
            detail: `${expense.type} ${money(expense.amount)} - ${expense.evidenceFile || expense.evidence || "No evidence"}`,
          })),
        ...hours
          .filter((entry) => entry.name === selectedManagerProfile.name)
          .map((entry) => ({
            at: entry.submittedAt,
            title: `Hours ${entry.status}`,
            detail: `${entry.hours}h - ${entry.activity} - ${eventName(entry.eventId)}`,
          })),
        ...managerTasks
          .filter((task) => task.volunteerName === selectedManagerProfile.name)
          .map((task) => ({
            at: task.submittedAt || task.createdAt,
            title: `Task ${task.status}`,
            detail: `${task.title} - ${task.source}`,
          })),
        ...checkIns
          .filter((entry) => entry.volunteerName === selectedManagerProfile.name)
          .map((entry) => ({
            at: entry.checkedInAt,
            title: "Event check-in",
            detail: `${eventName(entry.eventId)} - ${entry.checkedOutAt ? "checked out" : "still checked in"}`,
          })),
        ...(matchDbsEmail(selectedManagerProfile, mailboxItems)
          ? [
              {
                at: matchDbsEmail(selectedManagerProfile, mailboxItems)?.receivedAt || "",
                title: "Linked email",
                detail: matchDbsEmail(selectedManagerProfile, mailboxItems)?.subject || "",
              },
            ]
          : []),
      ].sort((a, b) => b.at.localeCompare(a.at))
    : [];
  const publicIntakeOpen = publicIntake.filter((item) => item.status !== "Closed");
  const searchResults = globalSearch.trim()
    ? [
        ...visibleProfiles.map((profile) => ({ type: "Volunteer", title: profile.name, detail: `${profile.email} - ${profile.role}` })),
        ...portalEvents.map((event) => ({ type: "Event", title: event.title, detail: `${event.date} - ${event.location}` })),
        ...portalResources.map((resource) => ({ type: "Resource", title: resource.title, detail: `${resource.type} - ${resource.owner}` })),
        ...mailboxItems.map((email) => ({ type: "Email", title: email.subject, detail: `${email.category} - ${email.from}` })),
        ...vipContacts.map((vip) => ({ type: "VIP", title: vip.name, detail: `${vip.role} - ${vip.region} - ${vip.priority}` })),
        ...designAssets.map((asset) => ({ type: "Design", title: asset.title, detail: `${asset.campaign} - ${asset.status} - ${asset.channel}` })),
        ...publicIntake.map((item) => ({ type: "Website form", title: item.name, detail: `${item.type} - ${item.region} - ${item.status}` })),
        ...reportPacks.map((pack) => ({ type: "Report", title: pack.title, detail: `${pack.template} - ${pack.status}` })),
        ...(role !== "volunteer"
          ? serviceReferrals.map((referral) => ({ type: "Service referral", title: referral.reference, detail: `${referral.region} - ${referral.status} - ${referral.nextAction}` }))
          : []),
      ]
        .filter((item) => `${item.type} ${item.title} ${item.detail}`.toLowerCase().includes(globalSearch.toLowerCase()))
        .slice(0, 8)
    : [];
  const missingInfoProfiles = visibleProfiles.filter(
    (profile) => !profile.email || !profile.phone || !profile.emergencyContact,
  );
  const filteredApprovalExpenses = expenses
    .filter((expense) => approvalFilter === "All" || expense.status === approvalFilter)
    .sort((a, b) => {
      if (approvalSort === "Highest amount") return Number(b.amount || 0) - Number(a.amount || 0);
      if (approvalSort === "Oldest first") return a.submittedAt.localeCompare(b.submittedAt);
      return b.submittedAt.localeCompare(a.submittedAt);
    });
  const syncIssueCount =
    expenses.filter((expense) => expense.syncStatus === "Sync issue" || expense.syncStatus === "Not synced").length +
    hours.filter((entry) => entry.syncStatus === "Sync issue" || entry.syncStatus === "Not synced").length;
  const sharePointStatusLabel = microsoftStatus?.sharePoint.writable
    ? "Runtime ready"
    : microsoftStatus?.sharePoint.configured
      ? "Target ready"
      : "Not connected";
  const integrationStatus = [
    {
      label: "SharePoint",
      status: sharePointStatusLabel,
      detail: microsoftStatus?.sharePoint.configured
        ? `Shared backend target: ${microsoftStatus.sharePoint.sitePath} / ${microsoftStatus.sharePoint.libraryName} / ${microsoftStatus.sharePoint.backendFolder}.`
        : "Hidden backend for lists, files and calendar records. Staff should use the portal, not SharePoint.",
    },
    {
      label: "OneDrive",
      status: "Selective publish",
      detail: microsoftStatus?.oneDrive.detail || "Melanie's personal OneDrive stays private. Only files deliberately selected for sharing are copied into the shared publish folder.",
    },
    {
      label: "Mailbox",
      status: microsoftStatus?.mailbox.configured ? "Configured" : "Planned",
      detail: `${microsoftStatus?.mailbox.address || "contact@violetproject.co.uk"} will feed the admin inbox queue.`,
    },
    {
      label: "Google Maps",
      status: microsoftStatus?.services.googleMapsConfigured ? "Configured" : "Needs key",
      detail: "Enables automatic mileage distance lookup.",
    },
    {
      label: "Canva",
      status: "Template workflow",
      detail: `${designAssetsOpen.length} design asset${designAssetsOpen.length === 1 ? "" : "s"} still open in the admin design queue.`,
    },
  ];
  const launchReadinessChecks = [
    {
      label: "Microsoft sign-in",
      status: microsoftStatus ? (microsoftStatus.missing.auth.length ? "Waiting" : "Ready") : "Checking",
      detail: microsoftStatus?.missing.auth.length
        ? `Add ${microsoftStatus.missing.auth.join(", ")}`
        : microsoftStatus
          ? "App credentials are present."
          : "Checking local private settings.",
      action: () => setManagementTab("integrations"),
    },
    {
      label: "SharePoint",
      status: microsoftStatus?.sharePoint.configured ? "Target ready" : "Waiting",
      detail: microsoftStatus?.sharePoint.configured
        ? microsoftStatus.sharePoint.webUrl
        : "Add the SharePoint site and library settings.",
      action: () => setManagementTab("integrations"),
    },
    {
      label: "Outlook inbox",
      status: microsoftStatus?.mailbox.configured ? "Configured" : "Waiting",
      detail: microsoftStatus?.mailbox.address || clientSettings.adminMailbox,
      action: () => setManagementTab("mailbox"),
    },
    {
      label: "Portal domain",
      status: clientSettings.portalUrl.includes("violetproject") ? "Ready" : "Waiting",
      detail: clientSettings.portalUrl || "Add the intended portal URL.",
      action: () => setManagementTab("settings"),
    },
    {
      label: "Google Maps",
      status: microsoftStatus?.services.googleMapsConfigured ? "Configured" : "Needs key",
      detail: "Needed for automatic mileage calculations.",
      action: () => setManagementTab("integrations"),
    },
    {
      label: "AI drafting",
      status: microsoftStatus?.services.openAiConfigured ? "Configured" : "Optional",
      detail: "Falls back to local smart templates until the AI key is added.",
      action: () => setManagementTab("mailbox"),
    },
    {
      label: "Test submissions",
      status: expenses.length || hours.length || managerTasks.some((task) => task.evidenceFiles?.length) ? "Ready" : "Waiting",
      detail: "Submit one expense, one hours log and one document task before launch.",
      action: () => setManagementTab("approvals"),
    },
  ];
  const managementTabs: ManagementTab[] =
    role === "admin"
      ? ["overview", "launch", "approvals", "tasks", "ask", "messages", "mailbox", "intake", "events", "reports", "training", "fundraising", "contacts", "designs", "services", "users", "integrations", "data", "settings"]
      : ["overview", "tasks", "messages", "approvals", "volunteers", "services", "events", "mailbox", "resources", "compliance", "reports", "settings"];

  const managementRows = visibleProfiles.map((profile) => {
    const profileExpenses = expenses.filter((expense) => expense.claimantName === profile.name);
    const profileHours = hours.filter((entry) => entry.name === profile.name);
    const profileCheckIns = checkIns.filter((entry) => entry.volunteerName === profile.name);
    const dbsEmail = matchDbsEmail(profile, mailboxItems);
    return {
      profile,
      expenseCount: profileExpenses.length,
      waitingValue: profileExpenses
        .filter((expense) => !["Paid", "Rejected"].includes(expense.status))
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
      hoursValue: profileHours.reduce((sum, entry) => sum + Number(entry.hours || 0), 0),
      checkIns: profileCheckIns.length,
      trainingDue: profile.trainingDue,
      dbs: isDbsSoon(profile.dbsExpiry) ? "Due soon" : "Current",
      dbsEmail,
      latest:
        profileExpenses[0]?.submittedAt ||
        profileHours[0]?.submittedAt ||
        profileCheckIns[0]?.checkedInAt ||
        "No submissions yet",
      missingInfo: [
        !profile.email ? "email" : "",
        !profile.phone ? "phone" : "",
        !profile.emergencyContact ? "emergency contact" : "",
      ].filter(Boolean),
    };
  });

  const filteredManagementRows = managementRows.filter((row) => {
    const query = managementSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      row.profile.name.toLowerCase().includes(query) ||
      row.profile.email.toLowerCase().includes(query) ||
      row.profile.role.toLowerCase().includes(query);
    const matchesFilter =
      managementFilter === "All" ||
      (managementFilter === "DBS/training" && (row.trainingDue > 0 || row.dbs === "Due soon")) ||
      (managementFilter === "Missing info" && row.missingInfo.length > 0) ||
      (managementFilter === "Expenses pending" && row.waitingValue > 0);
    return matchesSearch && matchesFilter;
  });

  const eventStaffing = portalEvents.map((event) => {
    const interested = interests.filter((entry) => entry.eventId === event.id);
    const confirmed = interested.filter((entry) => entry.status === "Confirmed" || entry.status === "Available");
    const checkedIn = checkIns.filter((entry) => entry.eventId === event.id);
    return {
      event,
      interested,
      confirmed,
      checkedIn,
      spacesLeft: Math.max(event.capacity - confirmed.length, 0),
    };
  });

  const selectedCommandEvent =
    portalEvents.find((event) => event.id === selectedEventId) || portalEvents[0] || emptyPortalEvent;
  const selectedCommandStaffing =
    eventStaffing.find((item) => item.event.id === selectedCommandEvent.id) || eventStaffing[0];
  const selectedCommandFeedback = feedback.filter((entry) => entry.eventId === selectedCommandEvent.id);
  const selectedEventSearchTerm = selectedCommandEvent.title.toLowerCase().slice(0, 12);
  const selectedCommandTasks = selectedCommandEvent.id
    ? managerTasks.filter(
        (task) =>
          task.source === "Event" &&
          (task.detail.toLowerCase().includes(selectedCommandEvent.title.toLowerCase()) ||
            task.title.toLowerCase().includes(selectedCommandEvent.title.toLowerCase())),
      )
    : [];
  const selectedCommandFiles = selectedCommandEvent.id
    ? sharedFiles.filter(
        (file) =>
          file.area === "Event resources" ||
          file.name.toLowerCase().includes(selectedEventSearchTerm),
      )
    : [];
  const eventCommandChecklist = [
    { label: "Event details", status: selectedCommandEvent.id && selectedCommandEvent.detail ? "Ready" : "Missing", detail: selectedCommandEvent.id ? selectedCommandEvent.detail || "Add event purpose and notes." : "Add or import a real event first." },
    { label: "Volunteer cover", status: selectedCommandStaffing?.spacesLeft ? "Needs follow-up" : "Ready", detail: `${selectedCommandStaffing?.confirmed.length || 0} available, ${selectedCommandStaffing?.spacesLeft || 0} spaces left.` },
    { label: "VIP invites", status: selectedCommandEvent.id && contactLog.some((entry) => entry.detail.includes(selectedCommandEvent.title)) ? "In progress" : "Waiting", detail: selectedCommandEvent.id ? `${suggestedVips.length} suggested contacts nearby.` : "Add an event before matching VIPs." },
    { label: "Design assets", status: selectedCommandEvent.id && designAssets.some((asset) => asset.eventId === selectedCommandEvent.id) ? "In progress" : "Waiting", detail: selectedCommandEvent.id ? "Poster, social square, newsletter header and volunteer callout." : "Create a design brief from a real event." },
    { label: "Event files", status: selectedCommandFiles.length ? "Ready" : "Missing", detail: `${selectedCommandFiles.length} resource file${selectedCommandFiles.length === 1 ? "" : "s"} linked.` },
    { label: "Feedback", status: selectedCommandFeedback.length ? "Ready" : "Waiting", detail: `${selectedCommandFeedback.length} feedback form${selectedCommandFeedback.length === 1 ? "" : "s"} returned.` },
  ];
  const selectedEventPrepItems = selectedCommandEvent.id
    ? eventPrepTemplates.map((template) => {
        const id = eventPrepItemId(selectedCommandEvent.id, template.label);
        return eventPrepItems.find((item) => item.id === id) || {
          id,
          eventId: selectedCommandEvent.id,
          label: template.label,
          owner: template.owner,
          status: "Not started" as EventPrepStatus,
          note: "",
        };
      })
    : [];
  const selectedEventPrepOpen = selectedEventPrepItems.filter((item) => item.status !== "Done").length;
  const selectedEventPrepBlocked = selectedEventPrepItems.filter((item) => item.status === "Blocked").length;
  const smartExpenseQueue = expenses
    .filter((expense) => expense.evidenceFile || expense.evidence || expense.type === "Mileage")
    .slice(0, 8);
  const syncHealthRows = sharePointDataMap.map((item) => {
    const pending =
      item.area === "Hours"
        ? hours.filter((entry) => entry.syncStatus !== "Synced").length
        : item.area === "Expenses"
          ? expenses.filter((expense) => expense.syncStatus !== "Synced").length
          : item.area === "Events"
            ? customEvents.filter((event) => event.syncStatus !== "Synced").length
            : item.area === "Resources" || item.area === "Design Studio"
              ? sharedFiles.filter((file) => file.syncStatus !== "Synced").length
              : item.status === "Ready"
                ? 0
                : 1;
    return {
      ...item,
      pending,
      lastRun: pending
        ? microsoftStatus?.sharePoint.configured
          ? "Target ready; auth pending"
          : "Waiting for connection"
        : "Ready to sync",
      health: pending > 0 ? "Waiting" : "Ready",
    };
  });
  const reportCards = [
    { label: "Hours approved", value: approvedHours.reduce((sum, entry) => sum + Number(entry.hours || 0), 0) },
    { label: "Expenses pending", value: money(pendingExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)) },
    { label: "Expenses approved", value: money(approvedExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)) },
    { label: "Expenses paid", value: money(paidExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)) },
    { label: "Events covered", value: eventStaffing.filter((item) => item.confirmed.length > 0).length },
    { label: "Volunteer records", value: visibleProfiles.length },
    { label: "Briefing packs", value: reportPacks.length },
  ];

  const auditTrail = [
    ...expenses.slice(0, 4).map((expense) => ({
      title: `${expense.status}: ${expense.claimantName} expense`,
      detail: `${expense.type} ${money(expense.amount)} submitted ${expense.submittedAt}`,
    })),
    ...hours.slice(0, 4).map((entry) => ({
      title: `${entry.status}: ${entry.name} hours`,
      detail: `${entry.hours}h for ${eventName(entry.eventId)} submitted ${entry.submittedAt}`,
    })),
    ...mailboxItems.slice(0, 3).map((email) => ({
      title: `${email.status}: ${email.subject}`,
      detail: `${email.direction} ${email.receivedAt}`,
    })),
  ].slice(0, 8);

  const managementAttentionItems = [
    ...expenses
      .filter((expense) => expense.status === "Submitted" || expense.status === "Needs evidence")
      .map((expense) => ({
        title: `${expense.claimantName}: ${expense.type} ${money(expense.amount)}`,
        detail: `${expense.status} - ${expense.evidenceFile || expense.evidence || "No evidence attached"}`,
      })),
    ...visibleProfiles
      .filter((profile) => profile.trainingDue > 0 || isDbsSoon(profile.dbsExpiry))
      .map((profile) => ({
        title: `${profile.name}: compliance check`,
        detail: `${profile.trainingDue} training due, DBS expires ${profile.dbsExpiry}`,
      })),
    ...visibleProfiles
      .map((profile) => ({ profile, dbsEmail: matchDbsEmail(profile, mailboxItems) }))
      .filter(({ dbsEmail }) => dbsEmail)
      .map(({ profile, dbsEmail }) => ({
        title: `${profile.name}: DBS email ${dbsEmail?.status.toLowerCase()}`,
        detail: `${dbsEmail?.subject} received ${dbsEmail?.receivedAt}`,
      })),
    ...checkIns
      .filter((entry) => !entry.checkedOutAt)
      .map((entry) => ({
        title: `${entry.volunteerName}: still checked in`,
        detail: `${eventName(entry.eventId)} from ${entry.checkedInAt}`,
      })),
  ].slice(0, 6);

  const volunteerJobs = [
    ...(unreadMessages.length
      ? [
          {
            title: `${unreadMessages.length} unread message${unreadMessages.length === 1 ? "" : "s"}`,
            detail: `Latest from ${unreadMessages[0].fromName}: ${unreadMessages[0].subject}`,
            action: "Open Messages",
            tab: "messages" as Tab,
          },
        ]
      : []),
    ...personalTasks.map((task) => ({
      title: task.title,
      detail: task.detail,
      action: "Open Tasks",
      tab: "tasks" as Tab,
    })),
    ...(selectedVolunteer.trainingDue > 0
      ? [
          {
            title: "Training to complete",
            detail: `${selectedVolunteer.trainingDue} training item${selectedVolunteer.trainingDue === 1 ? "" : "s"} due.`,
            action: "Open Resources",
            tab: "resources" as Tab,
          },
        ]
      : []),
    ...(isDbsSoon(selectedVolunteer.dbsExpiry)
        ? [
          {
            title: "DBS renewal coming up",
            detail: `Your DBS expiry date is ${selectedVolunteer.dbsExpiry}.`,
            action: "Check Profile",
            tab: "profile" as Tab,
          },
        ]
      : []),
    ...expenses
      .filter(
        (expense) =>
          expense.claimantName === selectedVolunteer.name &&
          expense.status === "Needs evidence",
      )
      .map((expense) => ({
        title: `Add evidence for ${expense.type}`,
        detail: `${money(expense.amount)} from ${expense.date} needs a receipt or note.`,
        action: "Open Expenses",
        tab: "expenses" as Tab,
      })),
    ...portalEvents.slice(0, 2).map((event) => ({
      title: `Upcoming: ${event.title}`,
      detail: `${event.date} at ${event.time}. Put your name down if you can help.`,
      action: "Open Calendar",
      tab: "calendar" as Tab,
    })),
    ...(activeCheckIn
      ? [
          {
            title: "Check out of event",
            detail: `You are checked in to ${eventName(activeCheckIn.eventId)}.`,
            action: "Open Events",
            tab: "events" as Tab,
          },
        ]
      : []),
  ].slice(0, 6);

  const homeItems = role === "volunteer" ? volunteerJobs : managementAttentionItems;

  const filteredResources = portalResources.filter((resource) => {
    const query = resourceQuery.toLowerCase();
    const matchesTag = resourceTagFilter === "All" || resource.tags.includes(resourceTagFilter);
    const matchesQuery = [resource.title, resource.type, resource.owner, resource.summary, ...resource.tags]
      .join(" ")
      .toLowerCase()
      .includes(query);
    return matchesTag && matchesQuery;
  });

  async function refreshMicrosoftStatus() {
    setMicrosoftStatusBusy(true);
    try {
      const response = await fetch("/api/violet/microsoft-status", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not read Microsoft status");
      const data = (await response.json()) as MicrosoftConnectionStatus;
      setMicrosoftStatus(data);
      setMessage(
        data.sharePoint.writable
          ? "Microsoft 365 runtime is ready."
          : data.sharePoint.configured
            ? "Microsoft 365 storage is ready. App credentials are still needed for live writes."
            : "Microsoft 365 storage settings are missing.",
      );
    } catch {
      setMessage("Microsoft 365 status could not be checked.");
    } finally {
      setMicrosoftStatusBusy(false);
    }
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const enteredIdentity = loginEmail.trim();
    const staffEmail = enteredIdentity.toLowerCase();

    if (password) {
      if (!staffEmail) {
        setMessage("Enter your email address.");
        return;
      }
      try {
        const response = await fetch("/api/violet/staff-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: staffEmail, password }),
        });
        const result = (await response.json()) as StaffAuthResponse;
        if (!response.ok || !result.ok) {
          setMessage(result.ok ? "Staff login failed." : result.error);
          return;
        }
        setRole(result.role);
        setName(result.name);
        localStorage.setItem(
          "violet-session",
          JSON.stringify({ name: result.name, role: result.role, email: result.email }),
        );
        setTab("management");
        setManagementTab("overview");
        setSignedIn(true);
        setPassword("");
        setPin("");
        setMessage("");
      } catch {
        setMessage("Staff login is not available right now.");
      }
      return;
    }

    const profile =
      visibleProfiles.find((item) => item.id === selectedVolunteerId) ||
      visibleProfiles.find(
        (item) =>
          item.email.toLowerCase() === staffEmail ||
          item.name.toLowerCase() === enteredIdentity.toLowerCase(),
      ) ||
      getProfile(selectedVolunteerId, visibleProfiles);
    if (!profile.id) {
      setMessage("No volunteer profile is loaded yet. Add or import real volunteer records first.");
      return;
    }
    const expectedPin = profile.pin || (profile.id.startsWith("demo-") ? rolePins.volunteer : "");
    if (!expectedPin || pin !== expectedPin) {
      setMessage("That PIN is not right for this volunteer.");
      return;
    }
    const nextName = profile.name;
    setRole("volunteer");
    setName(nextName);
    localStorage.setItem(
      "violet-session",
      JSON.stringify({ name: nextName, role: "volunteer", selectedVolunteerId }),
    );
    setTab("home");
    setManagementTab("overview");
    setSignedIn(true);
    setMessage("");
  }

  function signOut() {
    localStorage.removeItem("violet-session");
    setSignedIn(false);
    setPin("");
    setPassword("");
    setMessage("");
  }

  function changeExpenseType(nextType: string) {
    const nextCategories = expenseCategoryOptions[nextType] || expenseCategoryOptions.Other;
    const nextIsTravel = travelExpenseTypes.includes(nextType);
    setMileageStatus("");
    setMessage("");
    setExpenseDraft((draft) => ({
      ...draft,
      type: nextType,
      claimCategory: nextCategories[0],
      travelFrom: nextIsTravel ? draft.travelFrom : "",
      travelTo: nextIsTravel ? draft.travelTo : "",
      mileage: nextType === "Mileage" ? draft.mileage : "",
      returnJourney: nextIsTravel ? draft.returnJourney : false,
      amount: nextType === "Mileage" ? draft.amount : "",
      receiptSuggestion: "",
    }));
  }

  async function calculateMileage() {
    if (!expenseDraft.travelFrom || !expenseDraft.travelTo) {
      setMessage("Add travel from and travel to before calculating mileage.");
      return;
    }
    setTravelBusy(true);
    setMessage("");
    try {
      const result = await fetchMileage(
        expenseDraft.travelFrom,
        expenseDraft.travelTo,
        expenseDraft.returnJourney,
      );
      if (!result.ok || !result.miles || !result.amount) {
        if (result.googleMapsUrl) window.open(result.googleMapsUrl, "_blank", "noopener,noreferrer");
        setMessage(result.error || "Google Maps could not calculate this route yet.");
        return;
      }
      const mileageRatePence = Number(clientSettings.mileageRatePence || 40);
      const mileageAmount = (result.miles * (mileageRatePence / 100)).toFixed(2);
      setExpenseDraft((draft) => ({
        ...draft,
        mileage: String(result.miles),
        amount: mileageAmount || result.amount || draft.amount,
        receiptSuggestion: `${result.source || "Google Maps"} calculated ${result.miles} miles at ${mileageRatePence}p per mile.`,
      }));
      setMileageStatus(`Mileage calculated: ${result.miles} miles, ${money(mileageAmount)} at ${mileageRatePence}p per mile.`);
    } finally {
      setTravelBusy(false);
    }
  }

  function handleEvidenceFile(fileName: string) {
    const lower = fileName.toLowerCase();
      const suggestion = lower.includes("parking")
      ? "Smart read suggestion: parking receipt detected. Check date, car park name and total before submitting."
      : lower.includes("train") || lower.includes("bus")
        ? "Smart read suggestion: public transport proof detected. Check fare total and journey date."
        : "Receipt uploaded. Check the amount before submitting.";
    setExpenseDraft((draft) => ({
      ...draft,
      evidenceFile: fileName,
      receiptSuggestion: suggestion,
      evidence: draft.evidence || suggestion,
    }));
  }

  function submitExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const claim: ExpenseClaim = {
      id: crypto.randomUUID(),
      claimantName: role === "volunteer" ? selectedVolunteer.name : name,
      role: role === "volunteer" ? selectedVolunteer.role : role,
      status: expenseDraft.evidenceFile || expenseDraft.evidence ? "Submitted" : "Needs evidence",
      submittedAt: new Date().toLocaleString("en-GB"),
      routeSource: expenseDraft.mileage ? `Calculated or manually entered at ${clientSettings.mileageRatePence || 40}p per mile` : "",
      adminNote: "",
      syncStatus: "Not synced",
      ...expenseDraft,
    };
    setExpenses((current) => [claim, ...current]);
    setExpenseDraft({
      date: today(),
      type: "Mileage",
      amount: "",
      claimCategory: expenseCategoryOptions.Mileage[0],
      supplier: "",
      purchaseFor: "",
      travelFrom: "",
      travelTo: "",
      mileage: "",
      returnJourney: true,
      reason: "",
      evidence: "",
      evidenceFile: "",
      receiptSuggestion: "",
    });
    setMessage("Expense submitted.");
  }

  function submitHours(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entry: HourLog = {
      id: crypto.randomUUID(),
      name: role === "volunteer" ? selectedVolunteer.name : name,
      status: "Submitted",
      submittedAt: new Date().toLocaleString("en-GB"),
      syncStatus: "Not synced",
      ...hoursDraft,
    };
    setHours((current) => [entry, ...current]);
    setHoursDraft({
      date: today(),
      activity: "Peer support",
      eventId: selectedEventId || "",
      hours: "",
      notes: "",
    });
    setMessage("Hours logged.");
  }

  function updateExpense(id: string, update: Partial<ExpenseClaim>) {
    setExpenses((current) =>
      current.map((expense) => (expense.id === id ? { ...expense, ...update } : expense)),
    );
  }

  function updateHourStatus(id: string, status: HoursStatus) {
    setHours((current) => current.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
  }

  function createTaskComment(body: string, tone: TaskCommentTone, author = currentPersonName || name || "Portal"): TaskComment {
    return {
      id: crypto.randomUUID(),
      author,
      body,
      tone,
      createdAt: new Date().toLocaleString("en-GB"),
    };
  }

  function createManagerTask(task: Omit<ManagerTask, "id" | "createdAt" | "status"> & { status?: ManagerTask["status"] }) {
    const status = task.status || "Open";
    setManagerTasks((current) => [
      {
        id: crypto.randomUUID(),
        status,
        createdAt: new Date().toLocaleString("en-GB"),
        evidenceFiles: [],
        volunteerNote: "",
        managerFeedback: "",
        waitingOn: task.waitingOn || waitingOnForStatus(status),
        comments: task.comments?.length
          ? task.comments
          : [createTaskComment(task.detail ? `Task created: ${task.detail}` : "Task created.", "Note", task.owner || currentPersonName || name || "Portal")],
        ...task,
      },
      ...current,
    ]);
    setMessage("Task created.");
  }

  function updateManagerTask(id: string, update: Partial<ManagerTask>) {
    setManagerTasks((current) => current.map((task) => (task.id === id ? { ...task, ...update } : task)));
  }

  function updateManagerTaskWithComment(
    task: ManagerTask,
    update: Partial<ManagerTask>,
    commentBody: string,
    tone: TaskCommentTone,
    author = currentPersonName || name || "Portal",
  ) {
    updateManagerTask(task.id, {
      ...update,
      comments: [...(task.comments || []), createTaskComment(commentBody, tone, author)],
    });
  }

  function addManualTaskComment(task: ManagerTask) {
    const body = taskCommentDrafts[task.id]?.trim();
    if (!body) {
      setMessage("Write a note first.");
      return;
    }
    updateManagerTaskWithComment(task, {}, body, "Note");
    setTaskCommentDrafts((current) => ({ ...current, [task.id]: "" }));
    setMessage("Task note added.");
  }

  function submitManagerTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!taskDraft.title.trim() || !taskDraft.volunteerName.trim()) {
      setMessage("Add a volunteer and task title.");
      return;
    }
    createManagerTask({
      volunteerName: taskDraft.volunteerName,
      title: taskDraft.title,
      detail: taskDraft.detail || "Upload the requested document and submit it for review.",
      dueDate: taskDraft.dueDate,
      source: taskDraft.source,
      owner: name || "Melanie",
    });
    setTaskDraft({
      volunteerName: visibleProfiles[0]?.name || "",
      title: "",
      detail: "",
      dueDate: today(),
      source: "Document",
    });
  }

  function uploadTaskEvidence(task: ManagerTask, fileList: FileList | null) {
    if (!fileList?.length) return;
    const files = Array.from(fileList).map((file) => file.name);
    const nextFiles = Array.from(new Set([...(task.evidenceFiles || []), ...files]));
    updateManagerTaskWithComment(task, {
      evidenceFiles: Array.from(new Set([...(task.evidenceFiles || []), ...files])),
      status: "Submitted",
      submittedAt: new Date().toLocaleString("en-GB"),
      waitingOn: "Melanie",
    }, `Uploaded ${files.join(", ")}. ${nextFiles.length} file${nextFiles.length === 1 ? "" : "s"} attached.`, "Submission", task.volunteerName || currentPersonName || "Volunteer");
    setMessage("Document uploaded for review.");
  }

  function removeTaskEvidence(task: ManagerTask, fileName: string) {
    const nextFiles = (task.evidenceFiles || []).filter((file) => file !== fileName);
    updateManagerTask(task.id, {
      evidenceFiles: nextFiles,
      status: nextFiles.length ? task.status : "In progress",
    });
    setMessage("Document removed from the task.");
  }

  function submitTaskForReview(task: ManagerTask) {
    if (!task.evidenceFiles?.length) {
      setMessage("Upload at least one document before submitting.");
      return;
    }
    updateManagerTaskWithComment(task, {
      status: "Submitted",
      submittedAt: new Date().toLocaleString("en-GB"),
      waitingOn: "Melanie",
    }, task.volunteerNote ? `Submitted for review with note: ${task.volunteerNote}` : "Submitted for review.", "Submission", task.volunteerName || currentPersonName || "Volunteer");
    setMessage("Task sent for review.");
  }

  function approveManagerTask(task: ManagerTask) {
    const feedback = task.managerFeedback || "Approved. Thank you.";
    updateManagerTaskWithComment(task, {
      status: "Approved",
      reviewedAt: new Date().toLocaleString("en-GB"),
      managerFeedback: feedback,
      waitingOn: "Nobody",
    }, feedback, "Approval");
    setMessage("Task approved.");
  }

  function requestTaskChanges(task: ManagerTask) {
    const feedback = task.managerFeedback || "Please check the document and upload the corrected version.";
    updateManagerTaskWithComment(task, {
      status: "Changes needed",
      reviewedAt: new Date().toLocaleString("en-GB"),
      managerFeedback: feedback,
      waitingOn: "Volunteer",
    }, feedback, "Feedback");
    setMessage("Feedback sent.");
  }

  function cleanForwardedEmail() {
    if (!forwardedEmailText.trim()) {
      setMessage("Paste the forwarded email first.");
      return;
    }
    const lines = forwardedEmailText.split(/\r?\n/);
    const firstForwardHeader = lines.findIndex((line) =>
      /forwarded message|original message|^from:|^sent:|^to:|^subject:/i.test(line.trim()),
    );
    const instruction = (firstForwardHeader > 0 ? lines.slice(0, firstForwardHeader) : [])
      .join("\n")
      .trim()
      .replace(/\n{3,}/g, "\n\n");
    const originalFrom =
      lines.find((line) => /^from:/i.test(line.trim()))?.replace(/^from:/i, "").trim() ||
      "Original sender not detected";
    const subject =
      lines.find((line) => /^subject:/i.test(line.trim()))?.replace(/^subject:/i, "").trim() ||
      "Forwarded email";
    const bodyStart = firstForwardHeader >= 0 ? firstForwardHeader : 0;
    const cleanBody = lines
      .slice(bodyStart)
      .filter((line) => {
        const trimmed = line.trim();
        return (
          trimmed &&
          !/^[-_ ]*(forwarded|original) message[-_ ]*$/i.test(trimmed) &&
          !/^(from|sent|to|cc|date|subject):/i.test(trimmed) &&
          !trimmed.startsWith(">") &&
          !/^on .+ wrote:$/i.test(trimmed)
        );
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    const instructionText = instruction || "No separate instruction found above the forwarded email.";
    const actionType = inferForwardedEmailAction(`${instructionText}\n${subject}\n${cleanBody}`);
    const priority = inferForwardedEmailPriority(instructionText);
    const taskSummary =
      instruction && instruction.length > 160
        ? `${instruction.slice(0, 157).trim()}...`
        : instruction || actionType;
    const suggestedReply = [
      "Hello,",
      "",
      instruction
        ? `Thank you for your email. We have picked this up and will respond in line with Melanie's note: ${taskSummary}`
        : "Thank you for your email. We have picked this up and will come back to you once it has been reviewed.",
      "",
      "Kind regards,",
      "Violet Project",
    ].join("\n");
    setForwardedEmailResult({
      instruction: instructionText,
      subject,
      originalFrom,
      actionType,
      priority,
      taskSummary,
      cleanBody,
      suggestedReply,
    });
    setMessage("Forwarded email cleaned.");
  }

  function createTaskFromForwardedEmail() {
    if (!forwardedEmailResult.subject && !forwardedEmailText.trim()) {
      setMessage("Clean a forwarded email first.");
      return;
    }
    const taskInstruction = forwardedEmailResult.taskSummary || forwardedEmailResult.instruction || "Review the forwarded email and respond from the portal.";
    const combinedText = `${forwardedEmailResult.instruction}\n${forwardedEmailResult.subject}\n${forwardedEmailResult.cleanBody}`;
    createManagerTask({
      volunteerName: taskDraft.volunteerName,
      title: `${forwardedEmailResult.actionType || "Forwarded email"}: ${forwardedEmailResult.subject || "Review needed"}`,
      detail: [
        `What Melanie wants done: ${taskInstruction}`,
        `Priority: ${forwardedEmailResult.priority || "Routine"}.`,
        `Original sender: ${forwardedEmailResult.originalFrom || "Not detected"}.`,
        forwardedEmailResult.cleanBody ? `Original email context: ${forwardedEmailResult.cleanBody}` : "",
      ].filter(Boolean).join("\n\n"),
      dueDate: taskDraft.dueDate,
      source: inferForwardedEmailSource(combinedText),
      owner: name || "Melanie",
      waitingOn: taskDraft.volunteerName.toLowerCase().includes("melanie") ? "Melanie" : "Tom",
      comments: [
        createTaskComment(
          [
            "Created from Melanie-forwarded email.",
            forwardedEmailResult.instruction ? `Melanie's note: ${forwardedEmailResult.instruction}` : "",
            forwardedEmailResult.actionType ? `Suggested action: ${forwardedEmailResult.actionType}` : "",
            forwardedEmailResult.priority ? `Priority: ${forwardedEmailResult.priority}` : "",
            forwardedEmailResult.cleanBody ? `Original message: ${forwardedEmailResult.cleanBody.slice(0, 220)}` : "",
          ].filter(Boolean).join(" "),
          "Note",
        ),
      ],
    });
  }

  function updateLaunchChecklist(id: string, status: LaunchStatus) {
    setLaunchChecklist((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  function queryExpense(expense: ExpenseClaim) {
    const query = expense.adminNote || "Please add the missing receipt or explain the claim.";
    updateExpense(expense.id, {
      status: "Needs evidence",
      queryMessage: query,
      syncStatus: "Not synced",
    });
    createManagerTask({
      title: `Expense evidence needed: ${expense.type}`,
      volunteerName: expense.claimantName,
      owner: name || "Manager",
      dueDate: today(),
      source: "Expense",
      detail: query,
    });
  }

  function markExpensePaid(expense: ExpenseClaim) {
    updateExpense(expense.id, {
      status: "Paid",
      paidDate: today(),
      paidBy: name || "Manager",
      syncStatus: "Not synced",
    });
  }

  function queryHours(entry: HourLog) {
    const query = entry.queryMessage || "Please confirm these hours or add more detail.";
    updateHourStatus(entry.id, "Query");
    setHours((current) =>
      current.map((item) =>
        item.id === entry.id ? { ...item, queryMessage: query, syncStatus: "Not synced" } : item,
      ),
    );
    createManagerTask({
      title: `Hours query: ${eventName(entry.eventId)}`,
      volunteerName: entry.name,
      owner: name || "Manager",
      dueDate: today(),
      source: "Hours",
      detail: query,
    });
  }

  function saveManagedEvent(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!eventDraft.title.trim()) {
      setMessage("Add an event title first.");
      return;
    }
    setCustomEvents((current) => [
      {
        id: crypto.randomUUID(),
        title: eventDraft.title,
        date: eventDraft.date,
        time: eventDraft.time,
        location: eventDraft.location,
        detail: eventDraft.detail,
        defaultHours: eventDraft.defaultHours,
        rolesNeeded: eventDraft.rolesNeeded,
        capacity: Number(eventDraft.capacity || 0),
        source: "Portal",
        syncStatus: "Not synced",
      },
      ...current,
    ]);
    setEventDraft({
      title: "",
      date: today(),
      time: "10:00",
      location: "",
      detail: "",
      defaultHours: "2",
      rolesNeeded: "",
      capacity: "8",
    });
    setMessage("Event added to the portal calendar.");
  }

  function importCalendarText() {
    const lines = calendarImportText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const title = lines.find((line) => /^subject:|^title:/i.test(line))?.replace(/^subject:|^title:/i, "").trim() || lines[0] || "";
    const date = lines.find((line) => /^date:/i.test(line))?.replace(/^date:/i, "").trim() || today();
    const time = lines.find((line) => /^time:/i.test(line))?.replace(/^time:/i, "").trim() || "10:00";
    const location = lines.find((line) => /^location:/i.test(line))?.replace(/^location:/i, "").trim() || "";
    setEventDraft((draft) => ({
      ...draft,
      title,
      date,
      time,
      location,
      detail: calendarImportText,
    }));
    setMessage("Calendar text copied into the event form.");
  }

  function addSharedFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const nextFiles = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      area: sharedFileArea,
      visibleTo: sharedFileVisibility,
      uploadedBy: name || "Manager",
      uploadedAt: new Date().toLocaleString("en-GB"),
      syncStatus: "Not synced" as const,
    }));
    setSharedFiles((current) => [...nextFiles, ...current]);
    setMessage("Files added to the shared library queue.");
  }

  function addServiceReferral(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!serviceReferralDraft.clientName.trim()) {
      setMessage("Add a client/reference name first.");
      return;
    }

    const nextNumber = String(serviceReferrals.length + 1).padStart(3, "0");
    setServiceReferrals((current) => [
      {
        id: crypto.randomUUID(),
        reference: `VP-SVC-${nextNumber}`,
        clientName: serviceReferralDraft.clientName,
        referralSource: serviceReferralDraft.referralSource,
        region: serviceReferralDraft.region,
        receivedAt: today(),
        waitingDays: 0,
        urgency: serviceReferralDraft.urgency,
        status: "New referral",
        assignedTo: "",
        contactMethod: serviceReferralDraft.contactMethod || "Not recorded",
        preferredSupport: serviceReferralDraft.preferredSupport,
        consentStatus: "Consent needed",
        safeguardingFlag: serviceReferralDraft.urgency === "Urgent" ? "Check needed" : "None",
        nextAction: serviceReferralDraft.nextAction || "Book triage and record consent.",
        outcomeStatus: "Baseline due",
      },
      ...current,
    ]);
    setServiceReferralDraft({
      clientName: "",
      referralSource: "Self referral",
      region: "",
      urgency: "Routine",
      contactMethod: "",
      preferredSupport: "Assessment",
      nextAction: "",
    });
    setServiceFilter("New");
    setMessage("Service referral added to triage.");
  }

  function updateServiceReferral(id: string, update: Partial<ServiceReferral>) {
    setServiceReferrals((current) =>
      current.map((referral) => (referral.id === id ? { ...referral, ...update } : referral)),
    );
  }

  function updateServiceSession(id: string, update: Partial<ServiceSession>) {
    setServiceSessions((current) =>
      current.map((session) => (session.id === id ? { ...session, ...update } : session)),
    );
  }

  function addContactLog(contact: ContactProfile, action: string, detail: string) {
    setContactLog((current) => [
      {
        id: crypto.randomUUID(),
        contactId: contact.id,
        contactName: contact.name,
        area: contact.area,
        region: contact.region,
        action,
        detail,
        at: new Date().toLocaleString("en-GB"),
      },
      ...current,
    ]);
  }

  function saveContactProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contactDraft.name.trim()) {
      setMessage("Add a contact name before saving.");
      return;
    }

    const contact: ContactProfile = {
      id: crypto.randomUUID(),
      name: contactDraft.name.trim(),
      organisation: contactDraft.organisation.trim(),
      email: contactDraft.email.trim(),
      phone: contactDraft.phone.trim(),
      region: contactDraft.region.trim(),
      area: contactDraft.area,
      inviteFor: contactDraft.inviteFor.trim(),
      status: contactDraft.status.trim() || "New",
      formType: contactDraft.formType.trim() || "Email",
      requiredAttachments: contactDraft.requiredAttachments
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      attachments: [],
      lastAction: "Profile created",
    };
    setContactProfiles((current) => [contact, ...current]);
    setContactLog((current) => [
      {
        id: crypto.randomUUID(),
        contactId: contact.id,
        contactName: contact.name,
        area: contact.area,
        region: contact.region || "Not set",
        action: "Profile created",
        detail: `${contact.organisation || "No organisation"} - ${contact.inviteFor || "No purpose recorded"}`,
        at: new Date().toLocaleString("en-GB"),
      },
      ...current,
    ]);
    setContactDraft(blankContactProfileDraft);
    setMessage("Contact profile added.");
  }

  function attachContactFile(contact: ContactProfile, fileList: FileList | null) {
    if (!fileList?.length) return;
    const fileNames = Array.from(fileList).map((file) => file.name);
    setContactProfiles((current) =>
      current.map((item) =>
        item.id === contact.id
          ? { ...item, attachments: Array.from(new Set([...item.attachments, ...fileNames])), lastAction: "Attachment added" }
          : item,
      ),
    );
    addContactLog(contact, "Attachment added", fileNames.join(", "));
    setMessage("Attachment added to contact profile.");
  }

  function autoFillContactForm(contact: ContactProfile) {
    const missing = contact.requiredAttachments.filter((item) => !contact.attachments.includes(item));
    const draft = [
      `${contact.formType}`,
      "",
      `Organisation: ${contact.organisation}`,
      `Named contact: ${contact.name}`,
      `Email: ${contact.email}`,
      `Phone: ${contact.phone}`,
      `Region: ${contact.region}`,
      `Area: ${contact.area}`,
      `Purpose: ${contact.inviteFor}`,
      `Status: ${contact.status}`,
      "",
      `Attachments included: ${contact.attachments.length ? contact.attachments.join(", ") : "None yet"}`,
      `Still needed: ${missing.length ? missing.join(", ") : "Nothing missing"}`,
      "",
      "Message:",
      `Hello ${contact.name},`,
      "",
      `Please find the details for ${contact.inviteFor}. Let us know if you need anything else from Violet Project.`,
      "",
      "Kind regards,",
      "Violet Project",
    ].join("\n");

    setContactFormDrafts((current) => ({ ...current, [contact.id]: draft }));
    addContactLog(contact, "Form auto-filled", `${contact.formType}; ${missing.length} attachment item${missing.length === 1 ? "" : "s"} still needed.`);
    setMessage("Contact form auto-filled.");
  }

  function markContactFormSent(contact: ContactProfile) {
    setContactProfiles((current) =>
      current.map((item) =>
        item.id === contact.id
          ? { ...item, status: "Awaiting reply", lastAction: "Form sent" }
          : item,
      ),
    );
    addContactLog(contact, "Form sent", `${contact.formType} sent to ${contact.email}.`);
    setMessage("Contact form marked as sent.");
  }

  function vipLogEntry(vip: VipContact, action: string, detail: string) {
    setContactLog((current) => [
      {
        id: crypto.randomUUID(),
        contactId: vip.id,
        contactName: vip.name,
        area: vip.area,
        region: vip.region,
        action,
        detail,
        at: new Date().toLocaleString("en-GB"),
      },
      ...current,
    ]);
  }

  function autoFillVipInvite(vip: VipContact) {
    const route = vip.contactMethodType === "Form" && vip.formLink
      ? `Use form: ${vip.formLink}`
      : `Send to: ${vip.directEmail || vip.officeEmail || "contact details needed"}`;
    const draft = [
      vip.templateType === "Mayor" ? `Formal civic request: ${vip.name}` : `Invitation / supporter request: ${vip.name}`,
      "",
      `Campaign/Event: ${eventDraft.title || vip.campaignEvent}`,
      `Event location: ${eventDraft.location || "To confirm"}`,
      `Event date/time: ${eventDraft.date} ${eventDraft.time}`,
      `Region match: ${eventSuggestionRegion}`,
      `Contact route: ${route}`,
      "",
      vip.templateType === "Mayor"
        ? `Dear ${vip.name},\n\nViolet Project would like to invite you to support ${eventDraft.title || vip.campaignEvent}. The event is connected to suicide prevention and self-harm awareness, and we would be grateful for civic attendance or a message of support.`
        : `Hello,\n\nViolet Project would like to invite ${vip.name} to support ${eventDraft.title || vip.campaignEvent}. We think this could be a strong fit because: ${vip.relevance}`,
      "",
      `Notes: ${vip.notes || "No extra notes"}`,
      "",
      "Kind regards,",
      "Violet Project",
    ].join("\n");

    setContactFormDrafts((current) => ({ ...current, [vip.id]: draft }));
    vipLogEntry(vip, "VIP invite auto-filled", `${vip.templateType} invite prepared for ${eventDraft.title || vip.campaignEvent}.`);
    setMessage("VIP invite auto-filled.");
  }

  function markVipInviteSent(vip: VipContact) {
    const destination = vip.contactMethodType === "Form" ? vip.formLink : vip.directEmail || vip.officeEmail || "contact details needed";
    vipLogEntry(vip, "VIP invite sent", `${eventDraft.title || vip.campaignEvent} via ${vip.contactMethodType}: ${destination}.`);
    setMessage("VIP invite logged as sent.");
  }

  function logDesignAction(asset: DesignAsset, action: string, detail: string) {
    setDesignLog((current) => [
      {
        id: crypto.randomUUID(),
        assetId: asset.id,
        assetTitle: asset.title,
        campaign: asset.campaign,
        action,
        detail,
        at: new Date().toLocaleString("en-GB"),
      },
      ...current,
    ]);
  }

  function updateDesignAsset(id: string, update: Partial<DesignAsset>) {
    setDesignAssets((current) =>
      current.map((asset) => (asset.id === id ? { ...asset, ...update } : asset)),
    );
  }

  function designBriefText(asset?: DesignAsset) {
    const event = portalEvents.find((item) => item.id === (asset?.eventId || designBriefDraft.eventId));
    return [
      "Violet Project design brief",
      "",
      `Campaign: ${asset?.campaign || designBriefDraft.campaign}`,
      asset ? `Asset: ${asset.title}` : "Asset: Campaign pack",
      asset ? `Format: ${asset.format}` : `Required assets: ${designBriefDraft.requiredAssets}`,
      asset ? `Channel: ${asset.channel}` : `Channels: ${designBriefDraft.channels}`,
      asset ? `Due: ${asset.dueDate}` : `Event/date: ${designBriefDraft.eventDate}`,
      `Location: ${event?.location || designBriefDraft.location}`,
      `Audience: ${designBriefDraft.audience}`,
      `Key message: ${designBriefDraft.keyMessage}`,
      `Action: ${designBriefDraft.action}`,
      `Website: violetproject.co.uk`,
      `Contact: contact@violetproject.co.uk`,
      `Export name: ${asset?.exportName || "Use clear campaign file names"}`,
      `Save to: ${asset?.destination || "Campaign files"}`,
      "",
      `Notes: ${asset?.notes || designBriefDraft.notes}`,
    ].join("\n");
  }

  function copyDesignBrief(asset?: DesignAsset) {
    const brief = designBriefText(asset);
    navigator.clipboard?.writeText(brief);
    if (asset) logDesignAction(asset, "Brief copied", "Design brief copied for Canva.");
    setMessage(asset ? "Design brief copied." : "Campaign brief copied.");
  }

  function markDesignStatus(asset: DesignAsset, status: DesignStatus, action: string) {
    updateDesignAsset(asset.id, { status });
    logDesignAction(asset, action, `${asset.title} moved to ${status}.`);
    setMessage(`${asset.title}: ${status}.`);
  }

  function saveDesignExport(asset: DesignAsset, fileList: FileList | null) {
    const files = fileList?.length ? Array.from(fileList).map((file) => file.name) : [asset.exportName];
    setSharedFiles((current) => [
      ...files.map((file) => ({
        id: crypto.randomUUID(),
        name: file,
        area: "Event resources" as const,
        visibleTo: "Everyone" as const,
        uploadedBy: name || "Admin",
        uploadedAt: new Date().toLocaleString("en-GB"),
        syncStatus: "Not synced" as const,
      })),
      ...current,
    ]);
    updateDesignAsset(asset.id, {
      status: asset.status === "Approved" || asset.status === "Published" ? asset.status : "Needs approval",
    });
    logDesignAction(asset, "Export saved", `${files.join(", ")} queued for ${asset.destination}.`);
    setMessage("Design export queued in shared files.");
  }

  function publishDesignAsset(asset: DesignAsset) {
    updateDesignAsset(asset.id, { status: "Published" });
    logDesignAction(asset, "Published", `${asset.exportName} marked published and linked to ${asset.destination}.`);
    setMessage("Design marked as published.");
  }

  function loadDesignBriefFromEvent(eventId: string) {
    const event = portalEvents.find((item) => item.id === eventId);
    if (!event) return;
    setDesignBriefDraft((current) => ({
      ...current,
      campaign: event.title,
      eventId: event.id,
      eventDate: `${event.date}, ${event.time}`,
      location: event.location,
      action: `Invite people to view event details and express interest through violetproject.co.uk`,
      requiredAssets: "Event poster, social square, volunteer callout, newsletter header",
      notes: event.detail,
    }));
    setMessage("Campaign brief loaded from event.");
  }

  function createCampaignDesignPack() {
    if (!designBriefDraft.campaign.trim()) {
      setMessage("Add a real campaign or load an event before creating a design pack.");
      return;
    }
    const pack = [
      { title: "Event poster", format: "A4 print / PDF", channel: "Venue print and partner sharing", exportName: "event-poster.pdf", templateUrl: "https://www.canva.com/templates/search/event-poster/" },
      { title: "Social square", format: "1080 x 1080 social image", channel: "Instagram, Facebook and WhatsApp", exportName: "social-square.png", templateUrl: "https://www.canva.com/templates/search/instagram-post/" },
      { title: "Newsletter header", format: "Email header 1200 x 480", channel: "Email newsletter", exportName: "newsletter-header.png", templateUrl: "https://www.canva.com/templates/search/email-header/" },
      { title: "Volunteer callout", format: "A5 handout and social crop", channel: "Volunteer recruitment", exportName: "volunteer-callout.pdf", templateUrl: "https://www.canva.com/templates/search/volunteer-flyer/" },
    ];

    const created = pack.map((asset) => ({
      id: crypto.randomUUID(),
      campaign: designBriefDraft.campaign,
      eventId: designBriefDraft.eventId,
      dueDate: designBriefDraft.eventDate,
      owner: name || "Admin",
      approver: "Melanie",
      status: "Brief ready" as const,
      destination: `Campaign files / ${designBriefDraft.campaign}`,
      notes: designBriefDraft.notes,
      ...asset,
    }));
    setDesignAssets((current) => [...created, ...current]);
    setDesignLog((current) => [
      {
        id: crypto.randomUUID(),
        assetId: "campaign-pack",
        assetTitle: "Campaign pack",
        campaign: designBriefDraft.campaign,
        action: "Campaign pack created",
        detail: `${created.length} Canva-ready assets created from the current brief.`,
        at: new Date().toLocaleString("en-GB"),
      },
      ...current,
    ]);
    setMessage("Campaign design pack created.");
  }

  function reportPackText(pack: ReportPack) {
    return [
      `# ${pack.title}`,
      "",
      `Period: ${pack.period}`,
      `Audience: ${pack.audience}`,
      `Template: ${pack.template}`,
      `Focus: ${pack.focus}`,
      `Generated: ${pack.generatedAt}`,
      `Status: ${pack.status}`,
      `Save to: ${pack.destination}`,
      "",
      "## Suggested PowerPoint Slides",
      ...pack.sections.map((section, index) => `${index + 1}. ${section}`),
      "",
      "## Source Data",
      ...pack.sourceData.map((source) => `- ${source}`),
      "",
      "## Speaker Notes",
      "Use this as the prompt/brief for the built-in PowerPoint creator. The first live version should create an editable PPTX server-side, then store the finished deck back in the portal files.",
    ].join("\n");
  }

  function generateReportPack() {
    const totalHours = approvedHours.reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
    const openRisks = unifiedFollowUps.length + syncIssueCount + staffingGaps.length;
    const pack: ReportPack = {
      id: crypto.randomUUID(),
      title: `${reportPackDraft.template} - ${reportRange}`,
      period: reportRange,
      audience: reportPackDraft.audience,
      template: reportPackDraft.template,
      focus: reportPackDraft.focus,
      generatedAt: new Date().toLocaleString("en-GB"),
      status: "Draft ready",
      destination: "Reports / Board and management packs",
      sections: [
        `Opening summary: ${visibleProfiles.length} volunteer records, ${totalHours} approved hours and ${portalEvents.length} events in view.`,
        `Volunteer contribution: hours, check-ins, upcoming commitments and training due.`,
        `Operational risks: ${openRisks} open follow-up, staffing, sync or inbox items.`,
        `Finance: ${money(pendingExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0))} pending, ${money(approvedExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0))} approved, ${money(paidExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0))} paid.`,
        `Inbox and certificates: longest email wait ${longestEmailWait} days, longest certificate wait ${longestCertificateWait} days.`,
        `Regional view: ${regionalServices.length} service regions with ${regionalOpenEmails} open email items.`,
        `Events: ${eventStaffing.filter((item) => item.confirmed.length > 0).length} events have cover; ${staffingGaps.length} still need attention.`,
        "Decision slide: items for Melanie/trustees to approve, unblock or follow up.",
      ],
      sourceData: [
        "Volunteer profiles, hours and check-ins",
        "Expenses, evidence and payment statuses",
        "Admin mailbox wait times and smart reply status",
        "Training certificates and DBS expiry",
        "Event staffing, feedback and VIP/contact outreach",
        "SharePoint hidden backend readiness map",
      ],
    };

    const text = reportPackText(pack);
    setReportPacks((current) => [pack, ...current]);
    setGeneratedReportPack(text);
    setMessage("PowerPoint briefing pack drafted.");
  }

  function copyReportPack(pack?: ReportPack) {
    const text = pack ? reportPackText(pack) : generatedReportPack;
    if (!text) {
      setMessage("Generate a briefing pack first.");
      return;
    }
    navigator.clipboard?.writeText(text);
    if (pack) {
      setReportPacks((current) =>
        current.map((item) => (item.id === pack.id ? { ...item, status: "Copied" } : item)),
      );
    }
    setMessage("Briefing pack copied.");
  }

  function downloadReportPack(pack?: ReportPack) {
    const text = pack ? reportPackText(pack) : generatedReportPack;
    if (!text) {
      setMessage("Generate a briefing pack first.");
      return;
    }
    if (pack) {
      setReportPacks((current) =>
        current.map((item) => (item.id === pack.id ? { ...item, status: "Exported" } : item)),
      );
    }
    saveText(`violet-project-${(pack?.template || reportPackDraft.template).toLowerCase().replaceAll(" ", "-")}.md`, text, "text/markdown;charset=utf-8");
  }

  function updateEventPrepItem(item: EventPrepItem, update: Partial<EventPrepItem>) {
    setEventPrepItems((current) => {
      const existing = current.some((entry) => entry.id === item.id);
      const nextItem = { ...item, ...update };
      return existing
        ? current.map((entry) => (entry.id === item.id ? nextItem : entry))
        : [nextItem, ...current];
    });
  }

  function createTaskFromEventPrep(item: EventPrepItem) {
    if (!selectedCommandEvent.id) {
      setMessage("Choose an event first.");
      return;
    }
    createManagerTask({
      title: `${selectedCommandEvent.title}: ${item.label}`,
      volunteerName: item.owner === "Melanie" ? "Melanie Griffin" : item.owner === "Admin team" ? "Admin team" : name || "Management",
      owner: currentPersonName || name || "Management",
      dueDate: selectedCommandEvent.date || today(),
      source: "Event",
      waitingOn: item.owner === "Melanie" ? "Melanie" : item.owner === "Admin team" ? "Admin team" : "Management",
      detail: item.note || `Complete event prep item: ${item.label}.`,
      comments: [createTaskComment(`Created from event prep checklist for ${selectedCommandEvent.title}.`, "Note")],
    });
    updateEventPrepItem(item, { status: item.status === "Done" ? item.status : "In progress" });
  }

  function createEventCommandPack() {
    const event = selectedCommandEvent;
    if (!event.id) {
      setMessage("Add or import a real event before creating a command pack.");
      return;
    }
    const assignee = visibleProfiles.find((profile) => profile.name.toLowerCase().includes("thomas"))?.name || selectedVolunteer.name;
    const eventTasks: Omit<ManagerTask, "id" | "createdAt" | "status">[] = [
      {
        title: `Event briefing pack: ${event.title}`,
        volunteerName: assignee,
        owner: name || "Melanie",
        dueDate: today(),
        source: "Event",
        detail: `Prepare final event briefing for ${event.title}: ${event.date}, ${event.time}, ${event.location}.`,
        evidenceFiles: [],
        volunteerNote: "",
        managerFeedback: "",
      },
      {
        title: `VIP invitations: ${event.title}`,
        volunteerName: assignee,
        owner: name || "Melanie",
        dueDate: today(),
        source: "Contact",
        detail: `Use the suggested VIP list for ${event.location}. Draft, copy or send invites and log responses.`,
        evidenceFiles: [],
        volunteerNote: "",
        managerFeedback: "",
      },
      {
        title: `Volunteer cover: ${event.title}`,
        volunteerName: assignee,
        owner: name || "Melanie",
        dueDate: today(),
        source: "Event",
        detail: `${selectedCommandStaffing?.spacesLeft || 0} spaces still open. Message volunteers or confirm cover.`,
        evidenceFiles: [],
        volunteerNote: "",
        managerFeedback: "",
      },
    ];

    setManagerTasks((current) => [
      ...eventTasks.map((task) => ({
        id: crypto.randomUUID(),
        status: "Open" as const,
        createdAt: new Date().toLocaleString("en-GB"),
        waitingOn: "Tom" as WaitingOn,
        comments: [createTaskComment(`Event pack task created: ${task.detail}`, "Note", name || "Management")],
        ...task,
      })),
      ...current,
    ]);
    setDesignBriefDraft((current) => ({
      ...current,
      campaign: event.title,
      eventId: event.id,
      eventDate: `${event.date}, ${event.time}`,
      location: event.location,
      action: "Put your name down, attend, share, or reply through the portal.",
      requiredAssets: "Event poster, social square, newsletter header, volunteer callout, briefing slide",
      notes: event.detail,
    }));
    setMessage("Event command pack created: tasks added and design brief prepared.");
  }

  function exportEventBriefing() {
    const event = selectedCommandEvent;
    if (!event.id) {
      setMessage("Add or import a real event before exporting a briefing.");
      return;
    }
    const text = [
      `# Event Command Brief: ${event.title}`,
      "",
      `Date/time: ${event.date}, ${event.time}`,
      `Location: ${event.location}`,
      `Roles needed: ${event.rolesNeeded}`,
      `Capacity: ${event.capacity}`,
      `Default hours: ${event.defaultHours}`,
      "",
      "## Current State",
      ...eventCommandChecklist.map((item) => `- ${item.label}: ${item.status} - ${item.detail}`),
      "",
      "## Event Prep Checklist",
      ...(selectedEventPrepItems.length
        ? selectedEventPrepItems.map((item) => `- ${item.label}: ${item.status}, owner ${item.owner}${item.note ? ` - ${item.note}` : ""}`)
        : ["- No prep checklist yet."]),
      "",
      "## Suggested VIPs",
      ...suggestedVips.map(({ vip, score }) => `- ${vip.name}, ${vip.role}, ${vip.region} (${score})`),
      "",
      "## Linked Tasks",
      ...selectedCommandTasks.map((task) => `- ${task.title}: ${task.status}, ${task.volunteerName}`),
      "",
      "## Notes",
      event.detail || "No notes yet.",
    ].join("\n");
    saveText(`violet-event-brief-${event.title.toLowerCase().replaceAll(" ", "-")}.md`, text, "text/markdown;charset=utf-8");
  }

  function markSyncAreaChecked(area: string) {
    if (area === "Hours") {
      setHours((current) => current.map((entry) => ({ ...entry, syncStatus: "Synced" })));
    }
    if (area === "Expenses") {
      setExpenses((current) => current.map((expense) => ({ ...expense, syncStatus: "Synced" })));
    }
    if (area === "Events") {
      setCustomEvents((current) => current.map((event) => ({ ...event, syncStatus: "Synced" })));
    }
    if (area === "Resources" || area === "Design Studio") {
      setSharedFiles((current) => current.map((file) => ({ ...file, syncStatus: "Synced" })));
    }
    setMessage(`${area} sync marked checked locally.`);
  }

  function createExpenseAiTask(expense: ExpenseClaim) {
    createManagerTask({
      title: `Check smart expense read: ${expense.type}`,
      volunteerName: expense.claimantName,
      owner: name || "Admin",
      dueDate: today(),
      source: "Expense",
      detail: `${expense.evidenceFile || "Evidence note"}: ${expense.receiptSuggestion || expense.evidence || "Check receipt amount, date and category."}`,
    });
  }

  function generateTrusteePack() {
    const pack: ReportPack = {
      id: crypto.randomUUID(),
      title: `Trustee update deck - ${reportRange}`,
      period: reportRange,
      audience: "Melanie / trustees",
      template: "Trustee update deck",
      focus: "Impact, risk, money, service regions, decisions needed",
      generatedAt: new Date().toLocaleString("en-GB"),
      status: "Draft ready",
      destination: "Reports / Trustee packs",
      sections: [
        `Impact snapshot: ${visibleProfiles.length} volunteers, ${approvedHours.reduce((sum, entry) => sum + Number(entry.hours || 0), 0)} approved hours and ${portalEvents.length} events.`,
        `People and compliance: ${complianceItems.length} DBS/training items and ${certificateWaiting.length} certificates waiting.`,
        `Money: ${money(pendingExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0))} pending expenses and ${fundraisingNeedsThanks.length} fundraising thank-yous due.`,
        `Inbox: ${emailActionItems.length} active email follow-ups, longest wait ${longestEmailWait} days.`,
        `Counselling/services: ${serviceOpenReferrals.length} open referrals, ${serviceWaitingList.length} on the waiting list, ${serviceUnallocated.length} unallocated and ${serviceOutcomeDue.length} outcomes due.`,
        `Regions: ${regionalServices.length} service areas with ${regionalOpenEmails} open email items.`,
        `Decisions needed: approvals, access, SharePoint connection and migration readiness.`,
      ],
      sourceData: [
        "Portal dashboards",
        "Approval inbox",
        "Admin inbox SLA",
        "Counselling and service delivery tracker",
        "Training certificate tracker",
        "Regional service breakdown",
        "Migration readiness checklist",
      ],
    };
    const text = reportPackText(pack);
    setReportPacks((current) => [pack, ...current]);
    setGeneratedReportPack(text);
    setMessage("Trustee pack drafted.");
  }

  function answerAskViolet(event?: FormEvent<HTMLFormElement>, overrideQuestion?: string) {
    event?.preventDefault();
    const question = (overrideQuestion || askVioletQuestion).toLowerCase();
    const lines = ["Work Assistant result", ""];

    if (!question.trim()) {
      setAskVioletAnswer("Enter a search about volunteers, emails, events, expenses, services, certificates, tasks or migration readiness.");
      return;
    }

    if (question.includes("dbs") || question.includes("training") || question.includes("certificate")) {
      lines.push(`Training/DBS: ${complianceItems.length} people need a DBS or training check.`);
      lines.push(`Certificates: ${certificateWaiting.length} waiting, longest wait ${longestCertificateWait} days.`);
      lines.push(...certificateWaiting.slice(0, 3).map((item) => `- ${item.volunteer}: ${item.course}, ${item.waitedDays} days.`));
    } else if (question.includes("email") || question.includes("inbox") || question.includes("reply")) {
      lines.push(`Inbox: ${emailActionItems.length} items need action. Longest wait is ${longestEmailWait} days.`);
      lines.push(...emailSlaRows.slice(0, 4).map((email) => `- ${email.sla}: ${email.subject} (${email.waitingDays} days).`));
    } else if (question.includes("expense") || question.includes("receipt") || question.includes("mileage")) {
      lines.push(`Expenses: ${pendingExpenses.length} waiting for review, ${approvedExpenses.length} approved, ${paidExpenses.length} paid.`);
      lines.push(`Checks: ${expenseQualityChecks.length} possible missing/duplicate/mileage evidence issues.`);
      lines.push(...expenseQualityChecks.slice(0, 4).map((check) => `- ${check.title}: ${check.detail}`));
    } else if (question.includes("event") || question.includes("calendar") || question.includes("staff")) {
      lines.push(`Events: ${portalEvents.length} in the portal. ${staffingGaps.length} have staffing gaps.`);
      lines.push(`Current command event: ${selectedCommandEvent.title}, ${selectedCommandStaffing?.spacesLeft || 0} spaces left.`);
      lines.push(...staffingGaps.slice(0, 4).map((gap) => `- ${gap.event.title}: ${gap.gap} places open.`));
    } else if (question.includes("service") || question.includes("counselling") || question.includes("counseling") || question.includes("referral") || question.includes("waiting list")) {
      lines.push(`Services: ${serviceOpenReferrals.length} open referrals, ${serviceWaitingList.length} waiting, ${serviceUnallocated.length} unallocated.`);
      lines.push(`Safeguarding/urgency: ${serviceUrgentReferrals.length} urgent or flagged. Longest wait is ${serviceLongestWait} days.`);
      lines.push(...filteredServiceReferrals.slice(0, 4).map((referral) => `- ${referral.reference}: ${referral.region}, ${referral.status}, ${referral.waitingDays} days, ${referral.nextAction}`));
    } else if (question.includes("task") || question.includes("approval") || question.includes("melanie")) {
      lines.push(`Approvals: ${approvalInboxItems.length} items waiting.`);
      lines.push(`Tasks: ${openManagerTasks.length} open, ${submittedManagerTasks.length} submitted for review.`);
      lines.push(...approvalInboxItems.slice(0, 5).map((item) => `- ${item.title}: ${item.status}.`));
    } else if (question.includes("launch") || question.includes("sharepoint") || question.includes("sync")) {
      lines.push(`Migration checklist: ${launchOpen} open items. ${launchWaiting} waiting, ${launchInProgress} in progress and ${launchBlocked} blocked.`);
      lines.push(`Sync checks: ${syncHealthRows.filter((row) => row.pending > 0).length} areas have pending records.`);
      lines.push(...syncHealthRows.slice(0, 5).map((row) => `- ${row.area}: ${row.pending} pending, ${row.health}.`));
    } else {
      lines.push(`Overall: ${approvalInboxItems.length} approvals, ${emailActionItems.length} inbox items, ${openManagerTasks.length} open tasks, ${staffingGaps.length} staffing gaps, ${serviceOpenReferrals.length} service referrals.`);
      lines.push("Try asking: 'what emails are overdue?', 'who needs certificates?', 'what service referrals are waiting?', or 'what is blocking migration?'.");
    }

    lines.push("", "Sources: portal tasks, expenses, hours, mailbox log, certificates, events, contacts, service referrals and migration checklist.");
    setAskVioletAnswer(lines.join("\n"));
  }

  function resolveApprovalItem(item: { kind: string; id: string }) {
    if (item.kind === "expense") updateExpense(item.id, { status: "Approved", syncStatus: "Not synced" });
    if (item.kind === "hours") updateHourStatus(item.id, "Approved");
    if (item.kind === "task") {
      const task = managerTasks.find((entry) => entry.id === item.id);
      if (task) approveManagerTask(task);
    }
    if (item.kind === "design") {
      const asset = designAssets.find((entry) => entry.id === item.id);
      if (asset) markDesignStatus(asset, "Approved", "Approved from inbox");
    }
    if (item.kind === "certificate") {
      const certificate = trainingCertificates.find((entry) => entry.id === item.id);
      if (certificate) {
        setCertificateDraft({
          volunteer: certificate.volunteer,
          course: certificate.course,
          completedAt: certificate.completedAt,
          reference: `VP-CERT-${Date.now().toString().slice(-5)}`,
        });
        setManagementTab("training");
      }
    }
    setMessage("Approval item updated.");
  }

  function generateCertificate() {
    if (!certificateDraft.volunteer.trim() || !certificateDraft.reference.trim()) {
      setMessage("Choose a real volunteer and add a certificate reference first.");
      return;
    }
    const output = [
      "Violet Project Certificate",
      "",
      `This confirms that ${certificateDraft.volunteer} completed ${certificateDraft.course}.`,
      `Completion date: ${certificateDraft.completedAt}`,
      `Reference: ${certificateDraft.reference}`,
      "",
      "Signed: Violet Project",
      "Website: violetproject.co.uk",
    ].join("\n");
    setCertificateOutput(output);
    setSharedFiles((current) => [
      {
        id: crypto.randomUUID(),
        name: `${certificateDraft.volunteer.toLowerCase().replaceAll(" ", "-")}-${certificateDraft.course.toLowerCase().replaceAll(" ", "-")}-certificate.txt`,
        area: "Training materials",
        visibleTo: "Managers only",
        uploadedBy: name || "Admin",
        uploadedAt: new Date().toLocaleString("en-GB"),
        syncStatus: "Not synced",
      },
      ...current,
    ]);
    setMessage("Certificate generated and queued for filing.");
  }

  function updatePublicIntakeStatus(id: string, status: PublicIntakeStatus) {
    setPublicIntake((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  function createTaskFromIntake(item: PublicFormIntake) {
    createManagerTask({
      title: `${item.type}: ${item.name}`,
      volunteerName: visibleProfiles[0]?.name || name || "Admin team",
      owner: item.owner || name || "Admin",
      dueDate: today(),
      source: item.type === "Fundraising offer" ? "Fundraising" : item.type === "Event invite" ? "Event" : "Contact",
      detail: `${item.region}: ${item.message}. Reply to ${item.email}${item.phone ? ` / ${item.phone}` : ""}.`,
    });
    updatePublicIntakeStatus(item.id, "Assigned");
  }

  function runCommandBar() {
    const query = globalSearch.toLowerCase();
    if (query.includes("approval")) {
      setTab("management");
      setManagementTab("approvals");
    } else if (query.includes("ask")) {
      setTab("management");
      setManagementTab("ask");
    } else if (query.includes("report") || query.includes("trustee") || query.includes("board")) {
      setTab("management");
      setManagementTab("reports");
      generateTrusteePack();
    } else if (query.includes("certificate")) {
      setTab("management");
      setManagementTab("training");
    } else if (query.includes("form") || query.includes("intake") || query.includes("website")) {
      setTab("management");
      setManagementTab("intake");
    } else if (query.includes("event")) {
      setTab("management");
      setManagementTab("events");
    } else if (query.includes("expense")) {
      setTab(role === "volunteer" ? "expenses" : "management");
      if (role !== "volunteer") setManagementTab("approvals");
    } else if (query.includes("hour")) {
      setTab(role === "volunteer" ? "hours" : "management");
      if (role !== "volunteer") setManagementTab("approvals");
    } else {
      setMessage("Command not recognised yet. Try approval, ask, report, certificate, intake, event, expense or hours.");
      return;
    }
    setMessage("Command opened.");
  }

  function updateEmailFollowUp(id: string, status: DbsEmail["followUpStatus"]) {
    setEmailFollowUps((current) => ({ ...current, [id]: status }));
  }

  function toggleEmailDone(id: string, checked: boolean) {
    updateEmailFollowUp(id, checked ? "Closed" : "Reply needed");
  }

  function markEmailReplied(email: DbsEmail) {
    updateEmailFollowUp(email.id, "Waiting for confirmation");
    setMessage(`${email.subject} marked as replied. It will stay visible until confirmed or closed.`);
  }

  function markEmailWaitingExternal(email: DbsEmail) {
    updateEmailFollowUp(email.id, "Waiting for confirmation");
    updateEmailDelegation(email.id, "External contact");
    setMessage(`${email.subject} is now waiting for an external reply.`);
  }

  function closeEmailItem(email: DbsEmail) {
    updateEmailFollowUp(email.id, "Closed");
    setMessage(`${email.subject} closed.`);
  }

  function emailTaskSource(email: DbsEmail): ManagerTask["source"] {
    if (email.category === "Fundraising") return "Fundraising";
    if (email.category === "Certificate" || email.category === "Training") return "Certificate";
    if (email.category === "Contact") return "Contact";
    if (email.category === "Event") return "Event";
    if (email.category === "DBS") return "DBS";
    if (email.category === "Expense") return "Expense";
    return "General";
  }

  function updateEmailDelegation(id: string, assignee: string) {
    setEmailDelegations((current) => ({ ...current, [id]: assignee }));
  }

  function createDelegatedEmailTask(email: DbsEmail, linkedName: string) {
    const delegatedTo = emailDelegations[email.id] || email.owner || "Admin team";
    createManagerTask({
      title: `${email.category} email: ${email.subject}`,
      volunteerName: delegatedTo,
      owner: currentPersonName || name || "Management",
      dueDate: today(),
      source: emailTaskSource(email),
      waitingOn: delegatedTo === "Melanie Griffin" ? "Melanie" : delegatedTo === "Admin team" ? "Admin team" : "Tom",
      comments: [
        createTaskComment(
          `Delegated from ${email.to}. Linked person/contact: ${linkedName || email.volunteerNameHint || "Needs review"}. Waited ${email.waitingDays} day${email.waitingDays === 1 ? "" : "s"}.`,
          "Note",
        ),
      ],
      detail: [
        `Delegated from ${email.to}.`,
        `Linked person/contact: ${linkedName || email.volunteerNameHint || "Needs review"}.`,
        `Waited ${email.waitingDays} day${email.waitingDays === 1 ? "" : "s"}.`,
        email.nextAction,
      ].join(" "),
    });
    updateEmailDelegation(email.id, delegatedTo);
    setMessage(`Email task delegated to ${delegatedTo}.`);
  }

  function closeRepliedEmails() {
    setEmailFollowUps((current) => {
      const next = { ...current };
      mailboxItems.forEach((email) => {
        const status = next[email.id] || email.followUpStatus;
        if (status === "Waiting for confirmation") next[email.id] = "Closed";
      });
      return next;
    });
    setMessage("Replied inbox items closed.");
  }

  function localEmailDraft(email: DbsEmail, linkedName: string) {
    const greetingName = linkedName && linkedName !== "Needs review" ? linkedName.split(" ")[0] : "";
    const greeting = greetingName ? `Hi ${greetingName},` : "Hello,";
    const waitedLine = email.waitingDays > 3
      ? `Sorry you have been waiting ${email.waitingDays} days for a response.`
      : "Thank you for getting in touch.";

    const templates: Record<DbsEmail["category"], string> = {
      DBS: `${greeting}\n\n${waitedLine}\n\nWe have received the DBS update and are checking it against the correct volunteer record. If we need anything else from you, we will come back to you directly.\n\nKind regards,\nViolet Project`,
      Training: `${greeting}\n\n${waitedLine}\n\nWe have received the training update. We will check the completion record and update the volunteer profile once it has been confirmed.\n\nKind regards,\nViolet Project`,
      Certificate: `${greeting}\n\n${waitedLine}\n\nWe can see the training has been completed and the certificate is still outstanding. We will chase this and update you as soon as it has been issued.\n\nKind regards,\nViolet Project`,
      Fundraising: `${greeting}\n\n${waitedLine}\n\nThank you for supporting Violet Project. We really appreciate the donation/support linked to ${email.subject}. We will confirm the details and make sure the fundraising record is updated.\n\nKind regards,\nViolet Project`,
      Contact: `${greeting}\n\n${waitedLine}\n\nThank you for contacting Violet Project. We can help with the event invitation and will pass this to the right person. Please send any date, venue, audience and contact details you would like us to use.\n\nKind regards,\nViolet Project`,
      Expense: `${greeting}\n\n${waitedLine}\n\nWe have received the expense message and will check the claim details and any evidence attached. We will come back to you if anything is missing.\n\nKind regards,\nViolet Project`,
      Event: `${greeting}\n\n${waitedLine}\n\nThank you for the event update. We will check the event record and confirm arrangements, including arrival time, location and volunteer roles where needed.\n\nKind regards,\nViolet Project`,
      General: `${greeting}\n\n${waitedLine}\n\nWe have received your message and will make sure it reaches the right person. We will update you once this has been reviewed.\n\nKind regards,\nViolet Project`,
    };

    return templates[email.category];
  }

  async function draftEmailReply(email: DbsEmail, linkedName: string, followUpStatus: DbsEmail["followUpStatus"]) {
    const fallback = localEmailDraft(email, linkedName);
    setEmailDraftBusy(email.id);
    setMessage("Generating reply...");
    try {
      const response = await fetch("/api/violet/email-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, linkedName, followUpStatus }),
      });
      const data = (await response.json()) as { draft?: string; source?: string; note?: string };
      setEmailDrafts((current) => ({ ...current, [email.id]: data.draft || fallback }));
      setEmailDraftSources((current) => ({
        ...current,
        [email.id]: `${data.source || "Local smart draft"}${data.note ? ` - ${data.note}` : ""}`,
      }));
      setMessage("Reply drafted. Check it before sending.");
    } catch {
      setEmailDrafts((current) => ({ ...current, [email.id]: fallback }));
      setEmailDraftSources((current) => ({
        ...current,
        [email.id]: "Local smart draft - The AI draft service could not be reached.",
      }));
      setMessage("Reply drafted locally. Check it before sending.");
    } finally {
      setEmailDraftBusy(null);
    }
  }

  async function rewriteEmailDraft(email: DbsEmail, linkedName: string, followUpStatus: DbsEmail["followUpStatus"], mode: EmailRewriteMode) {
    const currentDraft = emailDrafts[email.id] || localEmailDraft(email, linkedName);
    setEmailDraftBusy(email.id);
    setMessage(mode === "summarise" ? "Summarising email..." : "Rewriting draft...");
    try {
      const response = await fetch("/api/violet/email-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          currentDraft,
          email,
          linkedName,
          followUpStatus,
        }),
      });
      const data = (await response.json()) as { draft?: string; source?: string; note?: string };
      setEmailDrafts((current) => ({ ...current, [email.id]: data.draft || currentDraft }));
      setEmailDraftSources((current) => ({
        ...current,
        [email.id]: `${data.source || "Local rewrite"}${data.note ? ` - ${data.note}` : ""}`,
      }));
      setMessage(mode === "summarise" ? "Summary created. Check it before using." : "Draft rewritten. Check it before sending.");
    } catch {
      setEmailDrafts((current) => ({ ...current, [email.id]: currentDraft }));
      setEmailDraftSources((current) => ({
        ...current,
        [email.id]: "Local draft kept - The rewrite service could not be reached.",
      }));
      setMessage("Draft kept. Rewrite service could not be reached.");
    } finally {
      setEmailDraftBusy(null);
    }
  }

  async function rewriteForwardedEmailDraft(mode: EmailRewriteMode) {
    const currentDraft = forwardedEmailResult.suggestedReply || "";
    if (!currentDraft && mode !== "summarise" && mode !== "melanie-email") {
      setMessage("Read Melanie's instruction first.");
      return;
    }
    setMessage(mode === "summarise" ? "Summarising forwarded email..." : "Rewriting forwarded email draft...");
    try {
      const response = await fetch("/api/violet/email-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          currentDraft,
          melanieInstruction: forwardedEmailResult.instruction,
          originalEmailContext: forwardedEmailResult.cleanBody,
          linkedName: taskDraft.volunteerName || "Needs review",
          followUpStatus: "Reply needed",
          email: {
            category: inferForwardedEmailSource(`${forwardedEmailResult.instruction}\n${forwardedEmailResult.subject}\n${forwardedEmailResult.cleanBody}`),
            subject: forwardedEmailResult.subject || "Forwarded email",
            from: forwardedEmailResult.originalFrom || "Original sender not detected",
            to: "contact@violetproject.co.uk",
            receivedAt: new Date().toLocaleString("en-GB"),
            waitingDays: forwardedEmailResult.priority === "Today" ? 1 : 0,
            volunteerNameHint: taskDraft.volunteerName || "Needs review",
            snippet: forwardedEmailResult.cleanBody || forwardedEmailResult.instruction,
            owner: name || "Admin team",
            nextAction: forwardedEmailResult.taskSummary || forwardedEmailResult.actionType || "Review and action",
            relatedRegion: inferWestMidlandsRegion(`${forwardedEmailResult.subject} ${forwardedEmailResult.cleanBody}`),
          },
        }),
      });
      const data = (await response.json()) as { draft?: string; source?: string; note?: string };
      setForwardedEmailResult((current) => ({
        ...current,
        suggestedReply: data.draft || current.suggestedReply,
      }));
      setMessage(`${data.source || "Draft assistant"}: ${data.note || "Review before sending."}`);
    } catch {
      setMessage("Rewrite service could not be reached. Current draft kept.");
    }
  }

  function updateEmailDraft(id: string, draft: string) {
    setEmailDrafts((current) => ({ ...current, [id]: draft }));
  }

  function expressInterest(eventId: string, status: InterestStatus) {
    const volunteerName = role === "volunteer" ? selectedVolunteer.name : name;
    setInterests((current) => {
      const existing = current.find(
        (entry) => entry.eventId === eventId && entry.volunteerName === volunteerName,
      );
      if (existing) {
        return current.map((entry) => (entry.id === existing.id ? { ...entry, status } : entry));
      }
      return [
        {
          id: crypto.randomUUID(),
          eventId,
          volunteerName,
          status,
          submittedAt: new Date().toLocaleString("en-GB"),
        },
        ...current,
      ];
    });
  }

  function checkIn() {
    const event = portalEvents.find((item) => item.id === selectedEventId);
    if (!event) {
      setMessage("Add or import an event before check-in.");
      return;
    }
    const entry: CheckIn = {
      id: crypto.randomUUID(),
      eventId: selectedEventId,
      volunteerName: selectedVolunteer.name,
      checkedInAt: new Date().toLocaleString("en-GB"),
      checkedOutAt: "",
      hoursLogged: event.defaultHours,
    };
    setCheckIns((current) => [entry, ...current]);
    setHours((current) => [
      {
        id: crypto.randomUUID(),
        name: selectedVolunteer.name,
        date: today(),
        activity: `${event.title} check-in`,
        eventId: event.id,
        hours: event.defaultHours,
        notes: "Created automatically from event check-in.",
        status: "Submitted",
        submittedAt: new Date().toLocaleString("en-GB"),
      },
      ...current,
    ]);
  }

  function checkOut(id: string) {
    setCheckIns((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, checkedOutAt: new Date().toLocaleString("en-GB") } : entry,
      ),
    );
  }

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback((current) => [
      {
        id: crypto.randomUUID(),
        volunteerName: role === "volunteer" ? selectedVolunteer.name : name,
        submittedAt: new Date().toLocaleString("en-GB"),
        ...feedbackDraft,
      },
      ...current,
    ]);
    setFeedbackDraft({ eventId: selectedEventId || "", wentWell: "", concerns: "", suggestions: "" });
    setMessage("Feedback saved.");
  }

  function updateProfile(update: Partial<VolunteerProfile>) {
    setProfiles((current) =>
      current.map((profile) =>
        profile.id === selectedVolunteer.id ? { ...profile, ...update } : profile,
      ),
    );
  }

  function draftFromProfile(profile: VolunteerProfile): UserProfileDraft {
    return {
      name: profile.name,
      role: profile.role || "Volunteer",
      email: profile.email,
      pin: profile.pin || "",
      phone: profile.phone,
      emergencyContact: profile.emergencyContact,
      availability: profile.availability,
      dbsExpiry: profile.dbsExpiry,
      trainingDue: String(profile.trainingDue || 0),
      dietaryAccess: profile.dietaryAccess,
      yearsVolunteering: String(profile.yearsVolunteering || 0),
    };
  }

  function resetProfileDraft() {
    setProfileEditorId("");
    setProfileDraft(blankUserProfileDraft);
  }

  function editProfile(profile: VolunteerProfile) {
    if (profile.id.startsWith("demo-")) {
      setProfileEditorId("");
      setProfileDraft({
        ...draftFromProfile(profile),
        name: profile.name.replace(/^Demo:\s*/i, "").replace(/\sExample$/, ""),
        email: "",
        phone: "",
      });
      setMessage("Demo profile copied into the form. Save it to create a real record.");
      return;
    }
    setProfileEditorId(profile.id);
    setProfileDraft(draftFromProfile(profile));
    setMessage(`Editing ${profile.name}.`);
  }

  function saveProfileRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profileDraft.name.trim()) {
      setMessage("Add a name before saving the person record.");
      return;
    }

    const nextProfile: VolunteerProfile = {
      id: profileEditorId || crypto.randomUUID(),
      name: profileDraft.name.trim(),
      role: profileDraft.role.trim() || "Volunteer",
      email: profileDraft.email.trim(),
      pin: profileDraft.pin.trim(),
      phone: profileDraft.phone.trim(),
      emergencyContact: profileDraft.emergencyContact.trim(),
      availability: profileDraft.availability.trim(),
      dbsExpiry: profileDraft.dbsExpiry,
      trainingDue: Number(profileDraft.trainingDue || 0),
      dietaryAccess: profileDraft.dietaryAccess.trim(),
      yearsVolunteering: Number(profileDraft.yearsVolunteering || 0),
    };

    setProfiles((current) => {
      if (profileEditorId) {
        return current.map((profile) => (profile.id === profileEditorId ? nextProfile : profile));
      }
      return [nextProfile, ...current];
    });
    setSelectedProfileForManager(nextProfile.id);
    if (!selectedVolunteerId) setSelectedVolunteerId(nextProfile.id);
    resetProfileDraft();
    setMessage(profileEditorId ? "Person record updated." : "Person record added.");
  }

  function deleteProfileRecord(profile: VolunteerProfile) {
    if (profile.id.startsWith("demo-")) {
      setMessage("Demo records are controlled by the demo-mode toggle.");
      return;
    }
    setProfiles((current) => current.filter((item) => item.id !== profile.id));
    if (selectedVolunteerId === profile.id) setSelectedVolunteerId("");
    if (selectedProfileForManager === profile.id) setSelectedProfileForManager(null);
    if (profileEditorId === profile.id) resetProfileDraft();
    setMessage(`${profile.name} removed from local records.`);
  }

  function sendPortalMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!messageDraft.subject.trim() || !messageDraft.body.trim()) {
      setMessage("Add a subject and message first.");
      return;
    }
    const safeRecipient = messageRecipientOptions.includes(messageDraft.to)
      ? messageDraft.to
      : messageRecipientOptions[0] || "Admin team";
    setPortalMessages((current) => [
      {
        id: crypto.randomUUID(),
        fromName: currentPersonName,
        fromRole: role === "volunteer" && isMelanie ? "coordinator" : role,
        to: safeRecipient,
        subject: messageDraft.subject,
        body: messageDraft.body,
        sentAt: new Date().toLocaleString("en-GB"),
        status: "Unread",
      },
      ...current,
    ]);
    setMessageDraft({ to: messageRecipientOptions[0] || "Admin team", subject: "", body: "" });
    setMessage("Message sent.");
  }

  function setPortalMessageRead(id: string, read: boolean) {
    setPortalMessages((current) =>
      current.map((item) => (item.id === id ? { ...item, status: read ? "Read" : "Unread" } : item)),
    );
  }

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallStatus(choice.outcome === "accepted" ? "installed" : "instructions");
      setShowNotificationPrefs(true);
      return;
    }
    setInstallStatus("instructions");
    setShowNotificationPrefs(true);
  }

  function toggleNotificationPref(channel: string) {
    setNotificationPrefs((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel],
    );
  }

  function exportExpenses() {
    saveCsv(
      "violet-expenses.csv",
      expenses.map((expense) => ({
        claimantName: expense.claimantName,
        role: expense.role,
        date: expense.date,
        type: expense.type,
        amount: expense.amount,
        mileage: expense.mileage,
        travelFrom: expense.travelFrom,
        travelTo: expense.travelTo,
        returnJourney: expense.returnJourney ? "yes" : "no",
        routeSource: expense.routeSource,
        reason: expense.reason,
        evidence: expense.evidence,
        evidenceFile: expense.evidenceFile,
        adminNote: expense.adminNote,
        status: expense.status,
        submittedAt: expense.submittedAt,
      })),
    );
  }

  function exportHours() {
    saveCsv(
      "violet-volunteer-hours.csv",
      hours.map((entry) => ({
        name: entry.name,
        date: entry.date,
        activity: entry.activity,
        event: eventName(entry.eventId),
        hours: entry.hours,
        status: entry.status,
        notes: entry.notes,
        submittedAt: entry.submittedAt,
      })),
    );
  }

  function exportManagement() {
    saveCsv(
      "violet-management-summary.csv",
      managementRows.map((row) => ({
        volunteer: row.profile.name,
        role: row.profile.role,
        waitingExpenses: row.waitingValue,
        hours: row.hoursValue,
        checkIns: row.checkIns,
        trainingDue: row.trainingDue,
        dbs: row.dbs,
        dbsExpiry: row.profile.dbsExpiry,
        dbsEmailSubject: row.dbsEmail?.subject || "",
        dbsEmailReceived: row.dbsEmail?.receivedAt || "",
        dbsEmailStatus: row.dbsEmail?.status || "",
        latest: row.latest,
      })),
    );
  }

  function exportCheckIns() {
    saveCsv(
      "violet-check-ins.csv",
      checkIns.map((entry) => ({
        event: eventName(entry.eventId),
        volunteer: entry.volunteerName,
        checkedInAt: entry.checkedInAt,
        checkedOutAt: entry.checkedOutAt || "not checked out",
        hoursLogged: entry.hoursLogged,
      })),
    );
  }

  function exportFeedback() {
    saveCsv(
      "violet-feedback.csv",
      feedback.map((entry) => ({
        event: eventName(entry.eventId),
        volunteer: entry.volunteerName,
        wentWell: entry.wentWell,
        concerns: entry.concerns,
        suggestions: entry.suggestions,
        submittedAt: entry.submittedAt,
      })),
    );
  }

  function exportFollowUps() {
    saveCsv(
      "violet-follow-ups.csv",
      unifiedFollowUps.map((item) => ({
        title: item.title,
        owner: item.owner,
        area: item.area,
        status: item.status,
        due: item.due,
        detail: item.detail,
      })),
    );
  }

  function exportLaunchReadiness() {
    saveCsv(
      "violet-launch-sharepoint-readiness.csv",
      [
        ...launchChecklist.map((item) => ({
          type: "Launch checklist",
          area: item.area,
          item: item.task,
          target: item.owner,
          mode: item.status,
          detail: item.detail,
        })),
        ...sharePointDataMap.map((item) => ({
          type: "SharePoint map",
          area: item.area,
          item: item.portalData,
          target: item.sharePointTarget,
          mode: item.syncMode,
          detail: `${item.status}: ${item.notes}`,
        })),
        ...privateSettingRows.map((item) => ({
          type: "Private setting",
          area: "Environment",
          item: item.key,
          target: item.needed,
          mode: "Private env",
          detail: item.use,
        })),
      ],
    );
  }

  function exportPaymentBatch() {
    saveCsv(
      "violet-payment-batch.csv",
      paymentBatch.map((expense) => ({
        claimant: expense.claimantName,
        type: expense.type,
        category: expense.claimCategory,
        amount: expense.amount,
        date: expense.date,
        evidence: expense.evidenceFile || expense.evidence,
        note: expense.adminNote,
      })),
    );
  }

  function approveAllRoutineHours() {
    setHours((current) =>
      current.map((entry) =>
        entry.status === "Submitted" && Number(entry.hours || 0) <= 6
          ? { ...entry, status: "Approved", syncStatus: "Not synced" }
          : entry,
      ),
    );
    setMessage("Routine hours approved.");
  }

  function repeatLastExpense() {
    const last = personalExpenses[0];
    if (!last) return;
    setExpenseDraft({
      date: today(),
      type: last.type,
      amount: "",
      claimCategory: last.claimCategory,
      supplier: last.supplier,
      purchaseFor: last.purchaseFor,
      travelFrom: last.travelFrom,
      travelTo: last.travelTo,
      mileage: "",
      returnJourney: last.returnJourney,
      reason: last.reason,
      evidence: "",
      evidenceFile: "",
      receiptSuggestion: "Copied from your last expense. Add the new receipt and amount before submitting.",
    });
    setTab("expenses");
  }

  function repeatLastHours() {
    const last = personalHours[0];
    if (!last) return;
    setHoursDraft({
      date: today(),
      activity: last.activity,
      eventId: last.eventId,
      hours: last.hours,
      notes: "",
    });
    setTab("hours");
  }

  function toggleResourceBookmark(title: string) {
    setResourceBookmarks((current) =>
      current.includes(title) ? current.filter((item) => item !== title) : [title, ...current],
    );
  }

  if (!signedIn) {
    return (
      <main className={styles.page}>
        <div className={`${styles.shell} ${styles.loginShell}`}>
          <Topbar />
          <section className={styles.loginCard}>
            <div className={styles.loginIntro}>
              <h1>{clientSettings.organisationName} hub</h1>
              <p>Private access for the people supporting Violet Project.</p>
            </div>
            <form className={styles.loginGrid} onSubmit={signIn}>
              <label className={styles.field}>
                Email address or name
                <input
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="Email or name"
                />
              </label>
              <div className={styles.loginAccessGroup}>
                <span>Volunteers</span>
                <label className={styles.field}>
                  PIN
                  <input value={pin} onChange={(event) => setPin(event.target.value)} inputMode="numeric" placeholder="Enter your PIN" />
                </label>
              </div>
              <div className={styles.loginAccessGroup}>
                <span>Password access</span>
                <label className={styles.field}>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                  />
                </label>
              </div>
              <button className={styles.primary} type="submit">
                Open hub
              </button>
            </form>
            {message && <p className={styles.notice}>{message}</p>}
            <p className={styles.loginPrivacy}>Use either your volunteer PIN or your password.</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Topbar />

        {role === "volunteer" && tab === "home" ? (
          <>
            <section className={styles.hero}>
              <div className={styles.heroCopy}>
                <h1>Welcome {sessionName}</h1>
                <p>Your hours, expenses, events and profile.</p>
              </div>
            </section>

            <section className={styles.snapshot} aria-label="Volunteer snapshot">
              <Stat label="Hours This Year" value={dashboard.hoursThisYear} detail="Includes check-ins" />
              <Stat label="Upcoming Events" value={dashboard.upcomingEvents} detail="Events needing support" />
              <Stat label="Training Due" value={dashboard.trainingDue} detail="Training and DBS" />
              <Stat label="Expenses Pending" value={money(dashboard.expensesPending)} detail="Waiting or unpaid" />
            </section>
          </>
        ) : role !== "volunteer" ? (
          <section className={styles.managementHero}>
            <div className={styles.managementHeroHeader}>
              <div>
                <span className={styles.meta}>{role === "admin" ? "Admin workspace" : "Management workspace"}</span>
                <h1>{role === "admin" ? "Admin console" : "Operations dashboard"}</h1>
                <p>
                  {role === "admin"
                    ? "Inbox, contacts, forms, VIP invites, certificates, fundraising, regional logs and follow-up tasks."
                    : "Calendar, inboxes, approvals, volunteer records and follow-up tasks."}
                </p>
              </div>
              <div className={styles.accountActions}>
                {role === "admin" && (
                  <button className={styles.accountButton} type="button" onClick={() => setDemoMode((current) => !current)}>
                    {demoMode ? "Demo mode on" : "Real mode"}
                  </button>
                )}
                <button className={styles.accountButton} type="button" onClick={signOut}>Sign out</button>
              </div>
            </div>
            <div className={styles.managementCalendarTop}>
              <section className={styles.managementMonthPanel}>
                <div className={styles.cardHeader}>
                  <strong>{topCalendarExpanded ? calendarFocus.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "Calendar peek"}</strong>
                  <div className={styles.inlineActions}>
                    <button className={styles.quietButton} type="button" onClick={() => setCalendarFocusDate(dateInputValue(new Date(calendarFocus.getFullYear(), calendarFocus.getMonth() - 1, 1)))}>Previous</button>
                    <button className={styles.quietButton} type="button" onClick={() => setCalendarFocusDate(today())}>Today</button>
                    <button className={styles.quietButton} type="button" onClick={() => setCalendarFocusDate(dateInputValue(new Date(calendarFocus.getFullYear(), calendarFocus.getMonth() + 1, 1)))}>Next</button>
                    <button className={styles.secondary} type="button" onClick={() => setTopCalendarExpanded((current) => !current)}>
                      {topCalendarExpanded ? "Shrink" : "Expand"}
                    </button>
                  </div>
                </div>
                <div className={styles.accountStrip} aria-label="Connected calendar and inboxes">
                  {calendarAccountRows.map((account) => (
                    <div key={`strip-${account.label}`}>
                      <span>{account.label}</span>
                      <strong>{account.address}</strong>
                    </div>
                  ))}
                </div>
                {topCalendarExpanded ? (
                  <div className={styles.monthCalendar}>
                    {monthCalendarDays.map((day) => (
                      <article className={`${styles.monthDay} ${!day.isCurrentMonth ? styles.outOfMonth : ""}`} key={`top-${day.day.toISOString()}`}>
                        <span className={styles.monthDayNumber}>{day.day.getDate()}</span>
                        {day.events.slice(0, 2).map((event) => (
                          <button className={styles.miniCalendarEvent} type="button" key={event.id} onClick={() => {
                            setSelectedEventId(event.id);
                            setTab("management");
                            setManagementTab("events");
                          }}>
                            <b>{event.time}</b>
                            <span>{event.title}</span>
                          </button>
                        ))}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className={styles.compactCalendarFeature}>
                    <div className={styles.compactWeek}>
                      {weekCalendar.map((day) => (
                        <button className={styles.compactDay} type="button" key={`peek-${day.day.toISOString()}`} onClick={() => setCalendarFocusDate(dateInputValue(day.day))}>
                          <span>{day.day.toLocaleDateString("en-GB", { weekday: "short" })}</span>
                          <strong>{day.day.getDate()}</strong>
                          <small>{day.events.length ? `${day.events.length} event${day.events.length === 1 ? "" : "s"}` : "Clear"}</small>
                        </button>
                      ))}
                    </div>
                    <div className={styles.compactAgenda}>
                      <strong>Next events</strong>
                      {upcomingCalendarEvents.slice(0, 3).map((event) => (
                        <button type="button" key={`peek-event-${event.id}`} onClick={() => {
                          setSelectedEventId(event.id);
                          setTab("management");
                          setManagementTab("events");
                        }}>
                          <span>{formatDateLong(event.date)} at {event.time}</span>
                          <b>{event.title}</b>
                        </button>
                      ))}
                      {!upcomingCalendarEvents.length && <p>No upcoming events yet.</p>}
                    </div>
                  </div>
                )}
              </section>
              <aside className={styles.calendarAccountPanel}>
                <div className={styles.cardHeader}>
                  <strong>Calendar and inboxes</strong>
                  <StatusChip label={microsoftStatus?.mailbox.configured ? "Connected" : "Pending"} />
                </div>
                <div className={styles.compactList}>
                  {calendarAccountRows.map((account) => (
                    <div key={account.label}>
                      <span>{account.label}<br />{account.address}</span>
                      <b>{account.status}</b>
                    </div>
                  ))}
                </div>
                <div className={styles.emailActions}>
                  <button className={styles.secondary} type="button" onClick={() => { setTab("management"); setManagementTab("events"); }}>Full calendar</button>
                  <button className={styles.quietButton} type="button" onClick={() => { setTab("management"); setManagementTab("integrations"); }}>Connect accounts</button>
                </div>
              </aside>
            </div>
          </section>
        ) : null}

        {role === "volunteer" && (
          <nav className={styles.tabs} aria-label="Hub sections">
            {(["home", "tasks", "messages", "expenses", "hours", "events", "calendar", "resources", "profile", "feedback"] as Tab[]).map((item) => (
              <button
                key={item}
                className={`${styles.tab} ${tab === item ? styles.tabActive : ""}`}
                type="button"
                onClick={() => setTab(item)}
              >
                {item === "home"
                  ? "Dashboard"
                  : item === "tasks" && personalTasks.length
                    ? `Tasks (${personalTasks.length})`
                  : item === "messages" && unreadMessages.length
                    ? `Messages (${unreadMessages.length})`
                    : item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
            <button className={styles.tab} type="button" onClick={signOut}>Sign out</button>
          </nav>
        )}

        {role !== "volunteer" && (
          <section className={styles.searchPanel}>
            <div className={styles.commandBar}>
              <label className={styles.field}>
                Search records
                <input
                  value={globalSearch}
                  onChange={(event) => setGlobalSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") runCommandBar();
                  }}
                  placeholder="Search volunteers, events, emails, contacts or type approvals, report, certificate, event..."
                />
              </label>
              <button className={styles.primary} type="button" onClick={runCommandBar}>Search / open</button>
            </div>
            {searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map((item) => (
                  <div key={`${item.type}-${item.title}`}>
                    <span>{item.type}</span>
                    <b>{item.title}</b>
                    <small>{item.detail}</small>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div className={styles.app}>
          {tab === "home" && (
            <section className={styles.panel}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>{role === "volunteer" ? "Jobs to complete" : "Needs attention"}</h2>
                  <p>
                    {role === "volunteer"
                      ? "Your next actions and event reminders."
                      : "Approvals, records and follow-up tasks."}
                  </p>
                </div>
                {role !== "volunteer" && (
                  <button className={styles.secondary} type="button" onClick={() => setTab("management")}>
                    Management view
                  </button>
                )}
              </div>
              {role === "volunteer" && volunteerJobs[0] && (
                <article className={styles.nextActionCard}>
                  <div>
                    <span>Next task</span>
                    <strong>{volunteerJobs[0].title}</strong>
                    <p>{volunteerJobs[0].detail}</p>
                  </div>
                  <div className={styles.emailActions}>
                    <button className={styles.primary} type="button" onClick={() => setTab(volunteerJobs[0].tab)}>
                      {volunteerJobs[0].action}
                    </button>
                    <button className={styles.quietButton} type="button" onClick={repeatLastExpense} disabled={!personalExpenses.length}>
                      Repeat expense
                    </button>
                    <button className={styles.quietButton} type="button" onClick={repeatLastHours} disabled={!personalHours.length}>
                      Repeat hours
                    </button>
                  </div>
                </article>
              )}
              <div className={styles.cards}>
                {homeItems.length ? (
                  homeItems.map((item) => (
                    <article className={styles.card} key={`${item.title}-${item.detail}`}>
                      <strong>{item.title}</strong>
                      <p>{item.detail}</p>
                      {"tab" in item && (() => {
                        const actionItem = item as typeof item & { tab: Tab; action: string };
                        return (
                          <button className={styles.button} type="button" onClick={() => setTab(actionItem.tab)}>
                            {actionItem.action}
                          </button>
                        );
                      })()}
                    </article>
                  ))
                ) : (
                  <article className={styles.card}>
                    <strong>{role === "volunteer" ? "Nothing to do right now" : "Nothing urgent"}</strong>
                    <p>
                      {role === "volunteer"
                        ? "When you have training, expenses, profile updates or event actions, they will appear here."
                        : "New submissions, missing evidence, active check-ins and compliance reminders appear here."}
                    </p>
                  </article>
                )}
              </div>

              {role === "volunteer" ? (
                <div className={styles.split}>
                  {nextEvent ? (
                    <article className={styles.card}>
                      <strong>My next event</strong>
                      <p className={styles.meta}>{nextEvent.date} at {nextEvent.time}</p>
                      <p>{nextEvent.title}</p>
                      <p className={styles.meta}>{nextEvent.location}</p>
                      <div className={styles.buttonRow}>
                        <button className={styles.primary} type="button" onClick={() => expressInterest(nextEvent.id, "Interested")}>
                          Put my name down
                        </button>
                      </div>
                    </article>
                  ) : (
                    <article className={styles.card}>
                      <strong>No upcoming events</strong>
                      <p>Events will appear here once management adds them or imports the calendar.</p>
                    </article>
                  )}

                  <article className={styles.card}>
                    <strong>My submissions</strong>
                    <div className={styles.compactList}>
                      {personalExpenses.slice(0, 3).map((expense) => (
                        <div key={expense.id}>
                          <span>{expense.type} · {money(expense.amount)}</span>
                          <b>{expense.status}</b>
                        </div>
                      ))}
                      {personalHours.slice(0, 3).map((entry) => (
                        <div key={entry.id}>
                          <span>{entry.activity} · {entry.hours}h</span>
                          <b>{entry.status}</b>
                        </div>
                      ))}
                      {!personalExpenses.length && !personalHours.length && (
                        <p className={styles.meta}>No submissions yet.</p>
                      )}
                    </div>
                  </article>
                </div>
              ) : (
                <div className={styles.cards}>
                  <article className={styles.card}>
                    <strong>Queues</strong>
                    <div className={styles.miniStats}>
                      <span>Expenses <b>{queueSummary.expenseClaims}</b></span>
                      <span>Hours <b>{queueSummary.hourLogs}</b></span>
                      <span>Check-ins <b>{queueSummary.activeCheckIns}</b></span>
                    </div>
                    <button className={styles.primary} type="button" onClick={() => setTab("management")}>
                      Open queues
                    </button>
                  </article>
                  <article className={styles.card}>
                    <strong>DBS and training</strong>
                    <div className={styles.miniStats}>
                      <span>Items <b>{queueSummary.dbsItems}</b></span>
                      <span>Emails <b>{mailboxItems.length}</b></span>
                      <span>Volunteers <b>{visibleProfiles.length}</b></span>
                    </div>
                    <button className={styles.secondary} type="button" onClick={() => setTab("management")}>
                      Review
                    </button>
                  </article>
                </div>
              )}

              <div className={styles.split}>
                {role === "volunteer" ? (
                  <article className={styles.card}>
                    <strong>My contribution</strong>
                    <div className={styles.miniStats}>
                      <span>Hours This Year <b>{dashboard.hoursThisYear}</b></span>
                      <span>Events Supported <b>{dashboard.eventsSupported}</b></span>
                      <span>Years Volunteering <b>{selectedVolunteer.yearsVolunteering}</b></span>
                    </div>
                  </article>
                ) : (
                  <article className={styles.card}>
                    <strong>Recent feedback</strong>
                    <div className={styles.compactList}>
                      {feedback.slice(0, 3).map((entry) => (
                        <div key={entry.id}>
                          <span>{eventName(entry.eventId)}</span>
                          <b>{entry.concerns ? "Concern" : "Clear"}</b>
                        </div>
                      ))}
                      {!feedback.length && <p className={styles.meta}>No feedback yet.</p>}
                    </div>
                  </article>
                )}
                <InstallCard
                  installStatus={installStatus}
                  isIosSafari={isIosSafari}
                  showNotificationPrefs={showNotificationPrefs}
                  notificationPrefs={notificationPrefs}
                  onInstall={installApp}
                  onShowPrefs={() => setShowNotificationPrefs(true)}
                  onTogglePref={toggleNotificationPref}
                />
              </div>
            </section>
          )}

          {tab === "tasks" && role === "volunteer" && (
            <section className={styles.panel}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>My Tasks</h2>
                  <p>Tasks from Melanie or management. Upload documents here, then they can approve them or send feedback.</p>
                </div>
                <p className={styles.integrationNote}>{personalTasks.length} open</p>
              </div>
              <div className={styles.processRail} aria-label="Task upload process">
                {["Task", "Upload documents", "Add note", "Submit", "Waiting approval", "Approved / changes requested"].map((step) => (
                  <span key={step}>{step}</span>
                ))}
              </div>
              <div className={styles.taskList}>
                {personalTaskList.map((task) => (
                  <article className={styles.taskCard} key={task.id}>
                    <div className={styles.cardHeader}>
                      <div>
                        <strong>{task.title}</strong>
                        <span>{taskDueLabel(task)} - {task.source}</span>
                      </div>
                      <StatusChip label={task.status} />
                    </div>
                    <p className={styles.meta}>From {task.owner} - due {formatDateLong(task.dueDate)}</p>
                    <p>{task.detail}</p>
                    <div className={styles.taskMetaGrid}>
                      <div><span>Documents</span><b>{task.evidenceFiles?.length || 0}</b></div>
                      {task.submittedAt && <div><span>Submitted</span><b>{task.submittedAt}</b></div>}
                      {task.reviewedAt && <div><span>Reviewed</span><b>{task.reviewedAt}</b></div>}
                    </div>
                    {task.managerFeedback && (
                      <div className={styles.feedbackBox}>
                        <span>Feedback</span>
                        <strong>{task.managerFeedback}</strong>
                      </div>
                    )}
                    {(task.comments || []).length > 0 && (
                      <div className={styles.commentThread}>
                        <span>Task history</span>
                        {(task.comments || []).slice(-4).map((comment) => (
                          <div className={styles.commentItem} key={comment.id}>
                            <b>{comment.author} - {comment.tone}</b>
                            <p>{comment.body}</p>
                            <small>{comment.createdAt}</small>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={styles.commentComposer}>
                      <textarea
                        value={taskCommentDrafts[task.id] || ""}
                        onChange={(event) => setTaskCommentDrafts((current) => ({ ...current, [task.id]: event.target.value }))}
                        placeholder="Add a note about this task"
                      />
                      <button className={styles.quietButton} type="button" onClick={() => addManualTaskComment(task)}>Add note</button>
                    </div>
                    <label className={styles.field}>
                      Note with upload
                      <textarea
                        value={task.volunteerNote || ""}
                        onChange={(event) => updateManagerTask(task.id, { volunteerNote: event.target.value })}
                        placeholder="Optional note for Melanie or management"
                      />
                    </label>
                    <div className={styles.evidenceList}>
                      {(task.evidenceFiles || []).map((file) => (
                        <span className={styles.evidenceChip} key={file}>
                          {file}
                          <button type="button" onClick={() => removeTaskEvidence(task, file)} aria-label={`Remove ${file}`}>x</button>
                        </span>
                      ))}
                      {!task.evidenceFiles?.length && <p className={styles.meta}>No documents uploaded yet.</p>}
                    </div>
                    <label className={styles.dropZone}>
                      <strong>Upload document for this task</strong>
                      <p>Receipt, certificate, form, screenshot or supporting file.</p>
                      <input className={styles.hiddenFile} type="file" multiple onChange={(event) => uploadTaskEvidence(task, event.target.files)} />
                    </label>
                    <div className={styles.emailActions}>
                      <button className={styles.quietButton} type="button" onClick={() => updateManagerTask(task.id, { status: "In progress" })}>Mark in progress</button>
                      <button className={styles.quietButton} type="button" disabled={!task.evidenceFiles?.length} onClick={() => submitTaskForReview(task)}>Submit for review</button>
                    </div>
                  </article>
                ))}
                {!personalTaskList.length && (
                  <EmptyState
                    title="No tasks assigned"
                    detail="Tasks from Melanie or management will appear here when they need a document, note or response from you."
                  />
                )}
              </div>
            </section>
          )}

          {tab === "messages" && role === "volunteer" && (
            <section className={styles.panel}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Messages</h2>
                  <p>{isMelanie ? "Send updates to volunteers or message the admin team." : "Message Admin or Melanie, and read replies from the team."}</p>
                </div>
                <p className={styles.integrationNote}>{unreadMessages.length} unread</p>
              </div>
              <div className={styles.queueGrid}>
                <article className={styles.card}>
                  <strong>Send message</strong>
                  <form className={styles.formGrid} onSubmit={sendPortalMessage}>
                    <label className={styles.field}>To<select value={messageRecipientOptions.includes(messageDraft.to) ? messageDraft.to : messageRecipientOptions[0]} onChange={(event) => setMessageDraft({ ...messageDraft, to: event.target.value })}>{messageRecipientOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
                    <label className={styles.field}>Subject<input value={messageDraft.subject} onChange={(event) => setMessageDraft({ ...messageDraft, subject: event.target.value })} /></label>
                    <label className={styles.field}>Message<textarea value={messageDraft.body} onChange={(event) => setMessageDraft({ ...messageDraft, body: event.target.value })} /></label>
                    <button className={styles.primary} type="submit">Send message</button>
                  </form>
                </article>
                <article className={styles.card}>
                  <div className={styles.cardHeader}>
                    <strong>Inbox</strong>
                    <span>{messageInbox.length}</span>
                  </div>
                  {messageInbox.map((item) => (
                    <div className={styles.actionItem} key={item.id}>
                      <div>
                        <b>{item.subject}</b>
                        <span>From {item.fromName} - {item.sentAt}<br />{item.body}</span>
                      </div>
                      <label className={styles.checkboxField}>
                        <input type="checkbox" checked={item.status === "Read"} onChange={(event) => setPortalMessageRead(item.id, event.target.checked)} />
                        Read
                      </label>
                    </div>
                  ))}
                  {!messageInbox.length && <p className={styles.meta}>No messages yet.</p>}
                </article>
              </div>
              <article className={styles.card}>
                <strong>Sent</strong>
                <div className={styles.compactList}>
                  {sentMessages.map((item) => (
                    <div key={item.id}><span>{item.to}: {item.subject}</span><b>{item.sentAt}</b></div>
                  ))}
                  {!sentMessages.length && <p className={styles.meta}>No sent messages yet.</p>}
                </div>
              </article>
            </section>
          )}

          {tab === "expenses" && (
            <section className={styles.panel}>
              <h2>Expenses</h2>
              <p>Submit mileage, parking, travel and event costs with evidence and status tracking.</p>
              <div className={styles.buttonRow}>
                <button className={styles.quietButton} type="button" onClick={repeatLastExpense} disabled={!personalExpenses.length}>Repeat last expense</button>
                <button className={styles.quietButton} type="button" onClick={() => setFavouriteAddress(expenseDraft.travelFrom || favouriteAddress)} disabled={!expenseDraft.travelFrom && !favouriteAddress}>Save favourite address</button>
                {favouriteAddress && <button className={styles.quietButton} type="button" onClick={() => setExpenseDraft({ ...expenseDraft, travelFrom: favouriteAddress })}>Use favourite address</button>}
              </div>
              <form className={styles.formGrid} onSubmit={submitExpense}>
                <label className={styles.field}>Date<input type="date" value={expenseDraft.date} onChange={(event) => setExpenseDraft({ ...expenseDraft, date: event.target.value })} /></label>
                <label className={styles.field}>Type<select value={expenseDraft.type} onChange={(event) => changeExpenseType(event.target.value)}>{expenseTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                <label className={styles.field}>Category<select value={expenseDraft.claimCategory} onChange={(event) => setExpenseDraft({ ...expenseDraft, claimCategory: event.target.value })}>{categoryOptions.map((type) => <option key={type}>{type}</option>)}</select></label>
                <label className={styles.field}>{expenseDraft.type === "Refreshments" ? "Where bought from" : "Supplier or provider"}<input value={expenseDraft.supplier} onChange={(event) => setExpenseDraft({ ...expenseDraft, supplier: event.target.value })} placeholder={expenseDraft.type === "Refreshments" ? "Shop, cafe or supermarket" : "Organisation or shop"} /></label>
                <label className={styles.field}>{expenseDraft.type === "Refreshments" ? "Refreshments for" : "What was this for?"}<input value={expenseDraft.purchaseFor} onChange={(event) => setExpenseDraft({ ...expenseDraft, purchaseFor: event.target.value })} placeholder={expenseDraft.type === "Refreshments" ? "Event, meeting or session" : "Event, training or activity"} /></label>
                {isTravelExpense && <label className={styles.field}>Travel from<input value={expenseDraft.travelFrom} onChange={(event) => setExpenseDraft({ ...expenseDraft, travelFrom: event.target.value })} /></label>}
                {isTravelExpense && <label className={styles.field}>Travel to<input value={expenseDraft.travelTo} onChange={(event) => setExpenseDraft({ ...expenseDraft, travelTo: event.target.value })} /></label>}
                {isMileageExpense && <label className={styles.field}>Mileage<input value={expenseDraft.mileage} onChange={(event) => setExpenseDraft({ ...expenseDraft, mileage: event.target.value, amount: (Number(event.target.value || 0) * (Number(clientSettings.mileageRatePence || 40) / 100)).toFixed(2) })} placeholder="Calculated or manual" /></label>}
                <label className={styles.field}>Amount<input value={expenseDraft.amount} onChange={(event) => setExpenseDraft({ ...expenseDraft, amount: event.target.value })} placeholder="0.00" /></label>
                {isTravelExpense && <label className={styles.checkboxField}><input type="checkbox" checked={expenseDraft.returnJourney} onChange={(event) => setExpenseDraft({ ...expenseDraft, returnJourney: event.target.checked })} />Return journey</label>}
                {isMileageExpense && <button className={styles.secondary} type="button" onClick={calculateMileage} disabled={travelBusy}>
                  {travelBusy ? "Calculating..." : "Work out miles with Google Maps"}
                </button>}
                {mileageStatus && <p className={styles.notice}>{mileageStatus}</p>}
                <label className={styles.field}>Upload receipt or proof<input type="file" accept="image/*,.pdf" onChange={(event) => handleEvidenceFile(event.target.files?.[0]?.name || "")} /></label>
                <label className={styles.field}>Evidence note<textarea value={expenseDraft.evidence} onChange={(event) => setExpenseDraft({ ...expenseDraft, evidence: event.target.value })} /></label>
                <label className={styles.field}>Reason<textarea value={expenseDraft.reason} onChange={(event) => setExpenseDraft({ ...expenseDraft, reason: event.target.value })} /></label>
                {expenseDraft.receiptSuggestion && <p className={styles.notice}>{expenseDraft.receiptSuggestion}</p>}
                <button className={styles.primary} type="submit">Submit expense</button>
              </form>
              <article className={styles.card}>
                <strong>What happens next?</strong>
                <p>Your claim goes to management for review. If evidence is missing, it will come back as a task; approved claims move into the payment batch.</p>
              </article>
              {message && <p className={styles.notice}>{message}</p>}
            </section>
          )}

          {tab === "hours" && (
            <section className={styles.panel}>
              <h2>Volunteer hour sheet</h2>
              <p>Log your volunteering time.</p>
              <div className={styles.buttonRow}>
                <button className={styles.quietButton} type="button" onClick={repeatLastHours} disabled={!personalHours.length}>Repeat last hours entry</button>
              </div>
              <form className={styles.formGrid} onSubmit={submitHours}>
                <label className={styles.field}>Date<input type="date" value={hoursDraft.date} onChange={(event) => setHoursDraft({ ...hoursDraft, date: event.target.value })} /></label>
                <label className={styles.field}>Event<select value={hoursDraft.eventId} onChange={(event) => setHoursDraft({ ...hoursDraft, eventId: event.target.value })}><option value="">General volunteering</option>{portalEvents.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label>
                <label className={styles.field}>Activity<input value={hoursDraft.activity} onChange={(event) => setHoursDraft({ ...hoursDraft, activity: event.target.value })} /></label>
                <label className={styles.field}>Hours<input value={hoursDraft.hours} onChange={(event) => setHoursDraft({ ...hoursDraft, hours: event.target.value })} placeholder="2.5" /></label>
                <label className={styles.field}>Notes<textarea value={hoursDraft.notes} onChange={(event) => setHoursDraft({ ...hoursDraft, notes: event.target.value })} /></label>
                <button className={styles.primary} type="submit">Log hours</button>
              </form>
              <article className={styles.card}>
                <strong>What happens next?</strong>
                <p>Your hours are submitted for approval. QR check-ins can create hour entries automatically, and management can query anything that looks unusual.</p>
              </article>
            </section>
          )}

          {tab === "events" && (
            <section className={styles.panel}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Events bulletin</h2>
                  <p>Upcoming events needing volunteers, with interest and check-in tools.</p>
                </div>
              </div>
              <div className={styles.cards}>
                {portalEvents.map((event) => {
                  const eventInterests = interests.filter((entry) => entry.eventId === event.id);
                  const mine = volunteerInterests.find((entry) => entry.eventId === event.id);
                  return (
                    <article className={styles.card} key={event.id}>
                      <strong>{event.title}</strong>
                      <p className={styles.meta}>{event.date} at {event.time} - {event.location}</p>
                      <p>{event.detail}</p>
                      <p className={styles.meta}>Roles needed: {event.rolesNeeded}. Capacity {event.capacity}.</p>
                      <div className={styles.buttonRow}>
                        {(["Interested", "Available", "Declined"] as InterestStatus[]).map((status) => (
                          <button className={styles.button} type="button" key={status} onClick={() => expressInterest(event.id, status)}>{status}</button>
                        ))}
                      </div>
                      <p className={styles.meta}>Your status: {mine?.status || "Not set"} - expressions: {eventInterests.length}</p>
                    </article>
                  );
                })}
              </div>

              <div className={styles.split}>
                <article className={styles.card}>
                  <strong>Event check-in</strong>
                  <label className={styles.field}>Event<select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>{portalEvents.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label>
                  <div className={styles.qrBox}>
                    <span>VP</span>
                    <b>{selectedEventId.toUpperCase()}</b>
                    <small>Scan at the event</small>
                  </div>
                  {activeCheckIn ? (
                    <>
                      <p className={styles.notice}>Checked in. Hours will be logged automatically.</p>
                      <button className={styles.secondary} type="button" onClick={() => checkOut(activeCheckIn.id)}>Check out</button>
                    </>
                  ) : (
                    <button className={styles.primary} type="button" onClick={checkIn}>Scan and check in</button>
                  )}
                </article>
                <article className={styles.card}>
                  <strong>Recent check-ins</strong>
                  {checkIns.slice(0, 5).map((entry) => (
                    <div className={styles.row} key={entry.id}>
                      <span>{entry.volunteerName}<br />{eventName(entry.eventId)}</span>
                      <strong>{entry.checkedOutAt ? "Done" : "In"}</strong>
                    </div>
                  ))}
                  {!checkIns.length && <p>No check-ins yet.</p>}
                </article>
              </div>
            </section>
          )}

          {tab === "calendar" && (
            <section className={styles.panel}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Full year calendar</h2>
                  <p>Events by month.</p>
                </div>
              </div>
              <div className={styles.calendarGrid}>
                {portalCalendar.map((month) => (
                  <article className={styles.monthCard} key={month.month}>
                    <strong>{month.month}</strong>
                    {month.events.length ? (
                      month.events.map((event) => {
                        const mine = volunteerInterests.find((entry) => entry.eventId === event.id);
                        return (
                          <div className={styles.calendarEvent} key={event.id}>
                            <span>{event.date}</span>
                            <b>{event.title}</b>
                            <small>{event.location}</small>
                            <button className={styles.button} type="button" onClick={() => expressInterest(event.id, "Interested")}>
                              {mine ? mine.status : "Put my name down"}
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p className={styles.meta}>No events listed yet.</p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === "resources" && (
            <section className={styles.panel}>
              <h2>Information hub</h2>
              <p>Policies, safeguarding, lone working, training materials and contact details without folder hunting.</p>
              <div className={styles.tagScroller} aria-label="Resource tags">
                {resourceTags.map((tag) => (
                  <button
                    className={`${styles.tagButton} ${resourceTagFilter === tag ? styles.tagButtonActive : ""}`}
                    type="button"
                    key={tag}
                    onClick={() => setResourceTagFilter(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <label className={styles.field}>
                Search resources
                <input value={resourceQuery} onChange={(event) => setResourceQuery(event.target.value)} placeholder="Search resources..." />
              </label>
              {resourceBookmarks.length > 0 && (
                <article className={styles.card}>
                  <strong>Bookmarked resources</strong>
                  <p className={styles.meta}>{resourceBookmarks.join(", ")}</p>
                </article>
              )}
              <div className={styles.cards}>
                {filteredResources.map((resource) => (
                  <article className={styles.card} key={resource.title}>
                    <strong>{resource.title}</strong>
                    <p className={styles.meta}>{resource.type} - {resource.owner} - updated {resource.updated} - {resource.source}</p>
                    <p>{resource.summary}</p>
                    <div className={styles.tagRow}>
                      {resource.tags.map((tag) => <span key={`${resource.id}-${tag}`}>{tag}</span>)}
                    </div>
                    <button className={styles.quietButton} type="button" onClick={() => toggleResourceBookmark(resource.title)}>
                      {resourceBookmarks.includes(resource.title) ? "Remove bookmark" : "Bookmark"}
                    </button>
                  </article>
                ))}
                {!filteredResources.length && (
                  <EmptyState
                    title="No resources found"
                    detail={portalResources.length ? "Try a different tag or search term." : "Resources will appear here after admin publishes files from OneDrive or SharePoint."}
                    actionLabel={role === "volunteer" ? undefined : "Publish files"}
                    onAction={role === "volunteer" ? undefined : () => {
                      setTab("management");
                      setManagementTab("resources");
                    }}
                  />
                )}
              </div>
            </section>
          )}

          {tab === "profile" && (
            <section className={styles.panel}>
              <h2>Volunteer Profile</h2>
              <p>Volunteers can keep contact, availability, DBS and accessibility details current.</p>
              <form className={styles.formGrid}>
                <label className={styles.field}>Email<input type="email" value={selectedVolunteer.email || ""} onChange={(event) => updateProfile({ email: event.target.value })} /></label>
                <label className={styles.field}>Phone number<input value={selectedVolunteer.phone} onChange={(event) => updateProfile({ phone: event.target.value })} /></label>
                <label className={styles.field}>Emergency contact<input value={selectedVolunteer.emergencyContact} onChange={(event) => updateProfile({ emergencyContact: event.target.value })} /></label>
                <label className={styles.field}>Availability<textarea value={selectedVolunteer.availability} onChange={(event) => updateProfile({ availability: event.target.value })} /></label>
                <label className={styles.field}>DBS status expiry<input type="date" value={selectedVolunteer.dbsExpiry} onChange={(event) => updateProfile({ dbsExpiry: event.target.value })} /></label>
                <label className={styles.field}>Dietary/accessibility requirements<textarea value={selectedVolunteer.dietaryAccess} onChange={(event) => updateProfile({ dietaryAccess: event.target.value })} /></label>
              </form>
            </section>
          )}

          {tab === "feedback" && (
            <section className={styles.panel}>
              <h2>Feedback forms</h2>
              <p>After an event, share what went well, any concerns and suggestions.</p>
              <form className={styles.formGrid} onSubmit={submitFeedback}>
                <label className={styles.field}>Event<select value={feedbackDraft.eventId} onChange={(event) => setFeedbackDraft({ ...feedbackDraft, eventId: event.target.value })}>{portalEvents.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label>
                <label className={styles.field}>How did the event go?<textarea value={feedbackDraft.wentWell} onChange={(event) => setFeedbackDraft({ ...feedbackDraft, wentWell: event.target.value })} /></label>
                <label className={styles.field}>Any concerns?<textarea value={feedbackDraft.concerns} onChange={(event) => setFeedbackDraft({ ...feedbackDraft, concerns: event.target.value })} /></label>
                <label className={styles.field}>Suggestions<textarea value={feedbackDraft.suggestions} onChange={(event) => setFeedbackDraft({ ...feedbackDraft, suggestions: event.target.value })} /></label>
                <button className={styles.primary} type="submit">Submit feedback</button>
              </form>
            </section>
          )}

          {tab === "emails" && (role === "admin" || role === "manager") && (
            <section className={styles.panel}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>Email log</h2>
                  <p>Received and sent messages linked to volunteer records, including DBS updates.</p>
                </div>
                <div className={styles.buttonRow}>
                  <p className={styles.integrationNote}>Staff mailbox</p>
                  <button className={styles.secondary} type="button">Import emails</button>
                </div>
              </div>
              <div className={styles.cards}>
                {mailboxItems.map((email) => {
                  const matched = visibleProfiles.find((profile) => matchDbsEmail(profile, mailboxItems)?.id === email.id);
                  const followUpStatus = emailFollowUps[email.id] || email.followUpStatus;
                  return (
                    <article className={styles.card} key={email.id}>
                      <div className={styles.emailHeader}>
                        <strong>{email.subject}</strong>
                        <span>{email.direction}</span>
                      </div>
                      <p className={styles.meta}>{email.category} - {email.receivedAt}</p>
                      <p>{email.snippet}</p>
                      <div className={styles.compactList}>
                        <div>
                          <span>From</span>
                          <b>{email.from}</b>
                        </div>
                        <div>
                          <span>To</span>
                          <b>{email.to}</b>
                        </div>
                        <div>
                          <span>Linked volunteer</span>
                          <b>{matched?.name || "Needs review"}</b>
                        </div>
                        <div>
                          <span>Follow-up</span>
                          <b>{followUpStatus}</b>
                        </div>
                      </div>
                      <div className={styles.emailActions}>
                        <label className={styles.checkboxField}>
                          <input
                            type="checkbox"
                            checked={followUpStatus === "Closed" || followUpStatus === "Confirmed"}
                            onChange={(event) => toggleEmailDone(email.id, event.target.checked)}
                          />
                          Done
                        </label>
                        <span className={email.status === "Matched" ? styles.statusGood : styles.statusWarn}>
                          {email.status}
                        </span>
                        <select value={followUpStatus} onChange={(event) => updateEmailFollowUp(email.id, event.target.value as DbsEmail["followUpStatus"])}>
                          <option>Reply needed</option>
                          <option>Waiting for confirmation</option>
                          <option>Confirmed</option>
                          <option>Closed</option>
                        </select>
                        <button className={styles.quietButton} type="button">
                          {matched ? "Open volunteer record" : "Choose volunteer"}
                        </button>
                        {email.category === "DBS" && (
                          <button className={styles.quietButton} type="button">Create DBS task</button>
                        )}
                      </div>
                    </article>
                  );
                })}
                {!mailboxItems.length && (
                  <article className={styles.card}>
                    <strong>No emails imported yet</strong>
                    <p>Mailbox items will appear here once the Microsoft 365 inbox connection is live.</p>
                  </article>
                )}
              </div>
            </section>
          )}

          {tab === "management" && (role === "admin" || role === "manager") && (
            <section className={styles.panel}>
              <div className={styles.sectionHeader}>
                <div>
                  <h2>{role === "admin" ? "Admin Console" : "Management Hub"}</h2>
                  <p>
                    {role === "admin"
                      ? "Admin inbox, response tracking, certificates, fundraising thanks, event contacts and regional service follow-up."
                      : "One place for operational work. SharePoint, OneDrive and mailbox sync stay behind the scenes."}
                  </p>
                </div>
              </div>

              <nav className={styles.subTabs} aria-label="Management sections">
                {managementTabs.map((item) => (
                  <button
                    className={`${styles.subTab} ${managementTab === item ? styles.subTabActive : ""}`}
                    key={item}
                    type="button"
                    onClick={() => setManagementTab(item)}
                  >
                    {item === "overview"
                      ? role === "admin" ? "Setup" : "Today"
                      : item === "launch"
                        ? "Launch Plan"
                      : item === "tasks"
                        ? "Task List"
                      : item === "approvals"
                        ? "Approval Inbox"
                      : item === "ask"
                        ? "Work Assistant"
                      : item === "intake"
                        ? "Website Intake"
                      : item === "reports"
                        ? "Reports & Data"
                          : item === "data"
                            ? "Data & Sync"
                            : item === "mailbox" && role === "admin"
                              ? "Inbox"
                              : item === "messages" && unreadMessages.length
                                ? `Messages (${unreadMessages.length})`
                               : item === "services"
                                 ? "Services"
                                 : item === "designs"
                                  ? "Design Studio"
                           : item[0].toUpperCase() + item.slice(1)}
                  </button>
                ))}
              </nav>

              {managementTab === "overview" && role === "admin" && (
                <div className={styles.managementGrid}>
                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Setup checklist</strong>
                      <span>{integrationStatus.length}</span>
                    </div>
                    {integrationStatus.map((item) => (
                      <div className={styles.actionItem} key={item.label}>
                        <div>
                          <b>{item.label}</b>
                          <span>{item.detail}</span>
                        </div>
                        <StatusChip label={item.status} />
                      </div>
                    ))}
                    <div className={styles.emailActions}>
                      <button className={styles.secondary} type="button" onClick={() => setManagementTab("integrations")}>Open integrations</button>
                    </div>
                  </article>

                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Sync health</strong>
                      <span>{syncIssueCount}</span>
                    </div>
                    <div className={styles.compactList}>
                      <div><span>Expense records</span><b>{expenses.length}</b></div>
                      <div><span>Hour records</span><b>{hours.length}</b></div>
                      <div><span>Custom events</span><b>{customEvents.length}</b></div>
                      <div><span>Queued shared files</span><b>{sharedFiles.length}</b></div>
                      <div><span>Not synced</span><b>{syncIssueCount}</b></div>
                    </div>
                    <div className={styles.emailActions}>
                      <button className={styles.secondary} type="button" onClick={() => setManagementTab("data")}>Review data</button>
                    </div>
                  </article>

                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Access model</strong>
                      <span>{visibleProfiles.length + 2}</span>
                    </div>
                    <div className={styles.compactList}>
                      <div><span>Volunteers</span><b>{visibleProfiles.length}</b></div>
                      <div><span>Managers</span><b>Operations, approvals, reports</b></div>
                      <div><span>Admins</span><b>Users, integrations, data, settings</b></div>
                      <div><span>Missing profile details</span><b>{missingInfoProfiles.length}</b></div>
                    </div>
                    <div className={styles.emailActions}>
                      <button className={styles.secondary} type="button" onClick={() => setManagementTab("users")}>Manage users</button>
                    </div>
                  </article>

                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Admin follow-ups</strong>
                      <span>{emailActionItems.length + certificateWaiting.length + fundraisingNeedsThanks.length}</span>
                    </div>
                    <p className={styles.mailboxAddress}>contact@violetproject.co.uk</p>
                    <div className={styles.compactList}>
                      <div><span>Unticked inbox items</span><b>{emailActionItems.length}</b></div>
                      <div><span>Longest email wait</span><b>{longestEmailWait} days</b></div>
                      <div><span>Certificates waiting</span><b>{certificateWaiting.length}, longest {longestCertificateWait} days</b></div>
                      <div><span>Fundraising thank-yous due</span><b>{fundraisingNeedsThanks.length}</b></div>
                      <div><span>Open regional email items</span><b>{regionalOpenEmails}</b></div>
                    </div>
                    <div className={styles.emailActions}>
                      <button className={styles.quietButton} type="button" onClick={() => setManagementTab("mailbox")}>Open inbox</button>
                      <button className={styles.quietButton} type="button" onClick={closeRepliedEmails}>Close replied items</button>
                      <button className={styles.quietButton} type="button" onClick={() => setManagementTab("training")}>Training certificates</button>
                    </div>
                  </article>
                </div>
              )}

              {managementTab === "launch" && role === "admin" && (
                <div className={styles.launchPanel}>
                  <section className={styles.launchCommand}>
                    <div>
                      <h3>Launch Plan</h3>
                      <p>
                        Build the portal now, launch it on a temporary or portal URL, then connect the Violet Project
                        domain and SharePoint when access is ready. The portal is the one stop shop; SharePoint stays
                        behind the scenes.
                      </p>
                    </div>
                    <div className={styles.launchScore}>
                      <span>{launchOpen}</span>
                      <strong>{launchChecklist.length} migration checks in the checklist</strong>
                      <small>{launchWaiting} waiting, {launchInProgress} in progress, {launchBlocked} blocked. Click checklist items below to update the status.</small>
                    </div>
                  </section>

                  <section className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Launch readiness</strong>
                      <span>{launchReadinessChecks.filter((item) => item.status === "Ready" || item.status === "Configured" || item.status === "Target ready").length}/{launchReadinessChecks.length}</span>
                    </div>
                    <div className={styles.readinessGrid}>
                      {launchReadinessChecks.map((item) => (
                        <button className={styles.readinessItem} type="button" key={item.label} onClick={item.action}>
                          <span>{item.label}</span>
                          <StatusChip label={item.status} />
                          <small>{item.detail}</small>
                        </button>
                      ))}
                    </div>
                  </section>

                  <div className={styles.managementSummary}>
                    <article className={styles.workloadCard}><span>Target handover</span><strong>18 Jun</strong></article>
                    <article className={styles.workloadCard}><span>Portal rule</span><strong>One stop shop</strong></article>
                    <article className={styles.workloadCard}><span>SharePoint role</span><strong>Hidden backend</strong></article>
                    <article className={styles.workloadCard}><span>Data areas mapped</span><strong>{sharePointDataMap.length}</strong></article>
                  </div>

                  <div className={styles.launchRoadmap}>
                    <article>
                      <span>1</span>
                      <strong>Preview now</strong>
                      <p>Keep building and testing away from the live website.</p>
                    </article>
                    <article>
                      <span>2</span>
                      <strong>Deploy portal</strong>
                      <p>Use a staging URL or portal.violetproject.co.uk when domain access is available.</p>
                    </article>
                    <article>
                      <span>3</span>
                      <strong>Connect Microsoft 365</strong>
                      <p>Add sign-in, SharePoint lists, document libraries, calendar and mailbox sync.</p>
                    </article>
                    <article>
                      <span>4</span>
                      <strong>Switch over</strong>
                      <p>Add the portal link to the current website, then move it cleanly during the website migration.</p>
                    </article>
                  </div>

                  <div className={styles.queueGrid}>
                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>One stop shop principle</strong>
                        <StatusChip label="Ready" />
                      </div>
                      <div className={styles.compactList}>
                        <div><span>Volunteers</span><b>Hours, expenses, events, resources, profile, messages</b></div>
                        <div><span>Management</span><b>Approvals, calendar, volunteers, reports, resources</b></div>
                        <div><span>Admin</span><b>Inbox, contacts, certificates, fundraising, regions, designs</b></div>
                        <div><span>SharePoint</span><b>Lists and files only; no daily folder hunting</b></div>
                      </div>
                    </article>
                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>Needed before transfer</strong>
                        <span>{launchChecklist.length}</span>
                      </div>
                      <div className={styles.compactList}>
                        <div><span>Domain / website access</span><b>GoDaddy or DNS owner</b></div>
                        <div><span>Microsoft 365 access</span><b>Tenant, SharePoint site, mailbox</b></div>
                        <div><span>Security approval</span><b>Role access and sensitive DBS/training data</b></div>
                        <div><span>Private settings</span><b>Env vars added outside code</b></div>
                      </div>
                    </article>
                  </div>

                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Thursday readiness checklist</strong>
                      <button className={styles.secondary} type="button" onClick={exportLaunchReadiness}>Export handover pack</button>
                    </div>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Area</th>
                            <th>Task</th>
                            <th>Owner</th>
                            <th>Status</th>
                            <th>Detail</th>
                          </tr>
                        </thead>
                        <tbody>
                          {launchChecklist.map((item) => (
                            <tr key={item.id}>
                              <td><strong>{item.area}</strong></td>
                              <td>{item.task}</td>
                              <td>{item.owner}</td>
                              <td>
                                <select value={item.status} onChange={(event) => updateLaunchChecklist(item.id, event.target.value as LaunchStatus)}>
                                  <option>Ready</option>
                                  <option>In progress</option>
                                  <option>Waiting</option>
                                  <option>Blocked</option>
                                </select>
                              </td>
                              <td>{item.detail}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </article>

                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Background data map</strong>
                      <StatusChip label="Portal first" />
                    </div>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Area</th>
                            <th>Portal data</th>
                            <th>Storage area</th>
                            <th>Sync</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sharePointDataMap.map((item) => (
                            <tr key={item.area}>
                              <td><strong>{item.area}</strong><br />{item.notes}</td>
                              <td>{item.portalData}</td>
                              <td>{item.sharePointTarget}</td>
                              <td>{item.syncMode}</td>
                              <td><StatusChip label={item.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </article>

                  <div className={styles.queueGrid}>
                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>Private settings</strong>
                        <span>{privateSettingRows.length}</span>
                      </div>
                      {privateSettingRows.map((item) => (
                        <div className={styles.actionItem} key={item.key}>
                          <div>
                            <b>{item.key}</b>
                            <span>{item.use}<br />Needed: {item.needed}</span>
                          </div>
                        </div>
                      ))}
                    </article>
                    <article className={styles.card}>
                      <strong>Recommended transfer path</strong>
                      <div className={styles.compactList}>
                        <div><span>Before Thursday</span><b>Finish UI, test flows, prepare env and data map</b></div>
                        <div><span>Thursday</span><b>Deploy portal, add Microsoft settings, point portal URL</b></div>
                        <div><span>After access</span><b>Connect SharePoint, mailbox, calendar and file libraries</b></div>
                        <div><span>Fallback</span><b>Portal works in staging while the main website remains on GoDaddy</b></div>
                      </div>
                      <div className={styles.emailActions}>
                        <button className={styles.quietButton} type="button" onClick={() => setManagementTab("integrations")}>Open integrations</button>
                        <button className={styles.quietButton} type="button" onClick={() => setManagementTab("data")}>Review sync data</button>
                      </div>
                    </article>
                  </div>
                </div>
              )}

              {managementTab === "overview" && (
                <section className={styles.todayWorkPanel}>
                  <div className={styles.cardHeader}>
                    <div>
                      <small className={styles.meta}>Today</small>
                      <strong>Work that needs attention</strong>
                    </div>
                    <button className={styles.quietButton} type="button" onClick={() => setManagementTab("tasks")}>Open board</button>
                  </div>
                  <div className={styles.todayWorkGrid}>
                    {todayWorkItems.map((item) => (
                      <button className={styles.todayWorkItem} type="button" key={item.id} onClick={item.action}>
                        <span>{item.title}</span>
                        <strong>{item.value}</strong>
                        <small>{item.detail}</small>
                        <StatusChip label={item.status} />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {managementTab === "overview" && role !== "admin" && <div className={styles.managementGrid}>
                <article className={styles.card}>
                  <div className={styles.cardHeader}>
                    <strong>Needs action</strong>
                    <span>{managementAttentionItems.length}</span>
                  </div>
                  {managementAttentionItems.map((item) => (
                    <div className={styles.actionItem} key={`${item.title}-${item.detail}`}>
                      <div>
                        <b>{item.title}</b>
                        <span>{item.detail}</span>
                      </div>
                      <button className={styles.quietButton} type="button">Review</button>
                    </div>
                  ))}
                  {!managementAttentionItems.length && <p className={styles.meta}>Nothing urgent right now.</p>}
                </article>

                <article className={styles.card}>
                  <div className={styles.cardHeader}>
                    <strong>Live event check-ins</strong>
                    <span>{activeCheckIns.length}</span>
                  </div>
                  {activeCheckIns.slice(0, 5).map((entry) => (
                    <div className={styles.actionItem} key={entry.id}>
                      <div>
                        <b>{entry.volunteerName}</b>
                        <span>{eventName(entry.eventId)} from {entry.checkedInAt}</span>
                      </div>
                      <button className={styles.quietButton} type="button" onClick={() => checkOut(entry.id)}>Check out</button>
                    </div>
                  ))}
                  {!activeCheckIns.length && <p className={styles.meta}>No one is currently checked in.</p>}
                </article>
                <article className={styles.card}>
                  <div className={styles.cardHeader}>
                    <strong>Manager tasks</strong>
                    <span>{openManagerTasks.length}</span>
                  </div>
                  {openManagerTasks.slice(0, 6).map((task) => (
                    <div className={styles.actionItem} key={task.id}>
                      <div>
                        <b>{task.title}</b>
                        <span>{task.volunteerName} - {task.source} - due {task.dueDate} - waiting on {waitingOnLabel(task)}<br />{task.detail}</span>
                      </div>
                      <div className={styles.inlineActions}>
                        <select value={task.status} onChange={(event) => {
                          const status = event.target.value as ManagerTask["status"];
                          updateManagerTask(task.id, { status, waitingOn: waitingOnForStatus(status) });
                        }}>
                          <option>Open</option>
                          <option>In progress</option>
                          <option>Submitted</option>
                          <option>Approved</option>
                          <option>Changes needed</option>
                          <option>Done</option>
                        </select>
                        <select value={waitingOnLabel(task)} onChange={(event) => updateManagerTask(task.id, { waitingOn: event.target.value as WaitingOn })} aria-label={`Waiting on for ${task.title}`}>
                          {waitingOnOptions.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  {!openManagerTasks.length && <p className={styles.meta}>No manager tasks open.</p>}
                  <div className={styles.emailActions}>
                    <button className={styles.quietButton} type="button" onClick={() => setManagementTab("tasks")}>Open task list</button>
                  </div>
                </article>
                <article className={styles.card}>
                  <div className={styles.cardHeader}>
                    <strong>Mailbox to address</strong>
                    <span>{emailActionItems.length}</span>
                  </div>
                  <p className={styles.mailboxAddress}>contact@violetproject.co.uk</p>
                  <p className={styles.meta}>Use this queue for DBS emails, volunteer replies, missing evidence and calendar invites that need action.</p>
                  <div className={styles.emailActions}>
                    <button className={styles.quietButton} type="button" onClick={() => setManagementTab("mailbox")}>Open mailbox</button>
                    <button className={styles.quietButton} type="button" onClick={() => setManagementTab("events")}>Import calendar invite</button>
                  </div>
                </article>
              </div>}

              {managementTab === "overview" && (
                <div className={styles.queueGrid}>
                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Unified follow-ups</strong>
                      <span>{unifiedFollowUps.length}</span>
                    </div>
                    {unifiedFollowUps.slice(0, 8).map((item) => (
                      <div className={styles.actionItem} key={`${item.title}-${item.detail}`}>
                        <div>
                          <b>{item.title}</b>
                          <span>{item.area} - {item.owner} - {item.due}<br />{item.detail}</span>
                        </div>
                        <StatusChip label={item.status} />
                      </div>
                    ))}
                    <div className={styles.emailActions}>
                      <button className={styles.secondary} type="button" onClick={exportFollowUps}>Export follow-ups</button>
                    </div>
                  </article>
                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Exceptions and gaps</strong>
                      <span>{checkInExceptions.length + staffingGaps.length}</span>
                    </div>
                    {checkInExceptions.slice(0, 4).map((item) => (
                      <div className={styles.actionItem} key={`${item.title}-${item.detail}`}>
                        <div><b>{item.title}</b><span>{item.detail}</span></div>
                        <StatusChip label="Needs review" />
                      </div>
                    ))}
                    {staffingGaps.slice(0, 4).map((item) => (
                      <div className={styles.actionItem} key={item.event.id}>
                        <div><b>{item.event.title}</b><span>{item.event.date} - {item.gap} places still open</span></div>
                        <button className={styles.quietButton} type="button" onClick={() => setManagementTab("events")}>Staff event</button>
                      </div>
                    ))}
                  </article>
                </div>
              )}

              {managementTab === "tasks" && (
                <>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3>Task board and document review</h3>
                      <p>Assign work, collect uploaded evidence, approve it or send feedback from one place.</p>
                    </div>
                    <p className={styles.integrationNote}>{submittedManagerTasks.length} ready for review</p>
                  </div>

                  <section className={styles.taskCommand} aria-label="Task summary">
                    <button className={`${styles.workloadButton} ${taskBoardFilter === "All" ? styles.taskMetricActive : ""}`} type="button" onClick={() => setTaskBoardFilter("All")}>
                      <span>Assigned</span>
                      <strong>{managerTasks.length}</strong>
                    </button>
                    <button className={`${styles.workloadButton} ${taskBoardFilter === "Submitted" ? styles.taskMetricActive : ""}`} type="button" onClick={() => setTaskBoardFilter("Submitted")}>
                      <span>Ready for review</span>
                      <strong>{submittedManagerTasks.length}</strong>
                    </button>
                    <button className={`${styles.workloadButton} ${taskBoardFilter === "Overdue" ? styles.taskMetricActive : ""}`} type="button" onClick={() => setTaskBoardFilter("Overdue")}>
                      <span>Overdue</span>
                      <strong>{overdueManagerTasks.length}</strong>
                    </button>
                    <button className={`${styles.workloadButton} ${taskBoardFilter === "Changes needed" ? styles.taskMetricActive : ""}`} type="button" onClick={() => setTaskBoardFilter("Changes needed")}>
                      <span>Changes requested</span>
                      <strong>{changesNeededTasks.length}</strong>
                    </button>
                    <button className={`${styles.workloadButton} ${taskBoardFilter === "Approved" ? styles.taskMetricActive : ""}`} type="button" onClick={() => setTaskBoardFilter("Approved")}>
                      <span>Approved</span>
                      <strong>{approvedManagerTasks.length}</strong>
                    </button>
                  </section>

                  <div className={styles.taskWorkspace}>
                    <article className={styles.taskCreatePanel}>
                      <div className={styles.cardHeader}>
                        <strong>Create task</strong>
                        <StatusChip label="Assign and track" />
                      </div>
                      <form className={styles.formGrid} onSubmit={submitManagerTask}>
                        <label className={styles.field}>
                          Assign to
                          <input
                            list="task-volunteer-options"
                            value={taskDraft.volunteerName}
                            onChange={(event) => setTaskDraft({ ...taskDraft, volunteerName: event.target.value })}
                            placeholder="Tom / volunteer name"
                          />
                          <datalist id="task-volunteer-options">
                            {visibleProfiles.map((profile) => <option key={profile.id} value={profile.name} />)}
                          </datalist>
                        </label>
                        <label className={styles.field}>Due date<input type="date" value={taskDraft.dueDate} onChange={(event) => setTaskDraft({ ...taskDraft, dueDate: event.target.value })} /></label>
                        <label className={styles.field}>Task title<input value={taskDraft.title} onChange={(event) => setTaskDraft({ ...taskDraft, title: event.target.value })} placeholder="Upload certificate / send form / confirm details" /></label>
                        <label className={styles.field}>Type<select value={taskDraft.source} onChange={(event) => setTaskDraft({ ...taskDraft, source: event.target.value as ManagerTask["source"] })}>
                          <option>Document</option>
                          <option>DBS</option>
                          <option>Certificate</option>
                          <option>Event</option>
                          <option>Expense</option>
                          <option>Profile</option>
                          <option>General</option>
                        </select></label>
                        <label className={styles.field}>Instructions<textarea value={taskDraft.detail} onChange={(event) => setTaskDraft({ ...taskDraft, detail: event.target.value })} placeholder="Tell them exactly what to upload and what you need them to do." /></label>
                        <div className={styles.emailActions}>
                          <button className={styles.primary} type="submit">Assign task</button>
                        </div>
                      </form>
                    </article>

                    <section className={styles.taskBoard} aria-label="Manager task board">
                      {filteredTaskBoard.map((column) => (
                        <div className={styles.taskColumn} key={column.status}>
                          <div className={styles.taskColumnHeader}>
                            <strong>{column.status}</strong>
                            <span>{column.tasks.length}</span>
                          </div>
                          {column.tasks.map((task) => (
                            <article className={styles.taskCard} key={task.id}>
                              <div className={styles.cardHeader}>
                                <div>
                                  <strong>{task.title}</strong>
                                  <span>{task.volunteerName} - {taskDueLabel(task)}</span>
                                </div>
                                <StatusChip label={task.source} />
                              </div>
                              <p>{task.detail}</p>
                              <div className={styles.taskMetaGrid}>
                                <div><span>Owner</span><b>{task.owner}</b></div>
                                <div><span>Due</span><b>{formatDateLong(task.dueDate)}</b></div>
                                <div><span>Files</span><b>{task.evidenceFiles?.length || 0}</b></div>
                                <div><span>Waiting on</span><b>{waitingOnLabel(task)}</b></div>
                              </div>
                              {task.volunteerNote && (
                                <div className={styles.feedbackBox}>
                                  <span>Volunteer note</span>
                                  <strong>{task.volunteerNote}</strong>
                                </div>
                              )}
                              <div className={styles.evidenceList}>
                                {(task.evidenceFiles || []).map((file) => (
                                  <span className={styles.evidenceChip} key={file}>{file}</span>
                                ))}
                                {!task.evidenceFiles?.length && <p className={styles.meta}>No evidence uploaded yet.</p>}
                              </div>
                              <label className={styles.field}>
                                Feedback
                                <textarea value={task.managerFeedback || ""} onChange={(event) => updateManagerTask(task.id, { managerFeedback: event.target.value })} placeholder="Feedback for the volunteer" />
                              </label>
                              {(task.comments || []).length > 0 && (
                                <div className={styles.commentThread}>
                                  <span>Task thread</span>
                                  {(task.comments || []).slice(-5).map((comment) => (
                                    <div className={styles.commentItem} key={comment.id}>
                                      <b>{comment.author} - {comment.tone}</b>
                                      <p>{comment.body}</p>
                                      <small>{comment.createdAt}</small>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className={styles.commentComposer}>
                                <textarea
                                  value={taskCommentDrafts[task.id] || ""}
                                  onChange={(event) => setTaskCommentDrafts((current) => ({ ...current, [task.id]: event.target.value }))}
                                  placeholder="Add internal note, phone update or evidence comment"
                                />
                                <button className={styles.quietButton} type="button" onClick={() => addManualTaskComment(task)}>Add note</button>
                              </div>
                              <div className={styles.emailActions}>
                                <select value={task.status} onChange={(event) => {
                                  const status = event.target.value as ManagerTask["status"];
                                  updateManagerTask(task.id, { status, waitingOn: waitingOnForStatus(status) });
                                }} aria-label={`Set status for ${task.title}`}>
                                  <option>Open</option>
                                  <option>In progress</option>
                                  <option>Submitted</option>
                                  <option>Changes needed</option>
                                  <option>Approved</option>
                                  <option>Done</option>
                                </select>
                                <select value={waitingOnLabel(task)} onChange={(event) => updateManagerTask(task.id, { waitingOn: event.target.value as WaitingOn })} aria-label={`Waiting on for ${task.title}`}>
                                  {waitingOnOptions.map((option) => <option key={option}>{option}</option>)}
                                </select>
                                <button className={styles.quietButton} type="button" onClick={() => approveManagerTask(task)}>Approve</button>
                                <button className={styles.quietButton} type="button" onClick={() => requestTaskChanges(task)}>Send feedback</button>
                              </div>
                            </article>
                          ))}
                          {!column.tasks.length && <p className={styles.meta}>No tasks here.</p>}
                        </div>
                      ))}
                    </section>
                  </div>
                </>
              )}

              {managementTab === "ask" && (
                <>
                  <section className={styles.askPanel}>
                    <div>
                      <span className={styles.meta}>Admin search</span>
                      <h3>Work Assistant</h3>
                      <p>Search across portal records for overdue emails, certificates, approvals, events, expenses and migration blockers.</p>
                    </div>
                    <form className={styles.askForm} onSubmit={answerAskViolet}>
                      <label className={styles.field}>
                        Question
                        <input
                          value={askVioletQuestion}
                          onChange={(event) => setAskVioletQuestion(event.target.value)}
                          placeholder="What emails are overdue? Who needs certificates? What is blocking migration?"
                        />
                      </label>
                      <button className={styles.primary} type="submit">Search records</button>
                    </form>
                    {askVioletAnswer && (
                      <label className={styles.field}>
                        Result
                        <textarea value={askVioletAnswer} onChange={(event) => setAskVioletAnswer(event.target.value)} />
                      </label>
                    )}
                  </section>
                  <div className={styles.commandActions}>
                    {[
                      "What emails are overdue?",
                      "Who needs certificates?",
                      "What needs Melanie approval?",
                      "What is blocking migration?",
                      "Which events need cover?",
                    ].map((question) => (
                      <button className={styles.quietButton} type="button" key={question} onClick={() => {
                        setAskVioletQuestion(question);
                        answerAskViolet(undefined, question);
                      }}>{question}</button>
                    ))}
                  </div>
                </>
              )}

              {managementTab === "intake" && role === "admin" && (
                <>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3>Website form intake</h3>
                      <p>Volunteer enquiries, event invites, training requests, fundraising offers and contact forms become structured work here.</p>
                    </div>
                    <p className={styles.integrationNote}>{publicIntakeOpen.length} open</p>
                  </div>
                  <div className={styles.inboxList}>
                    {publicIntake.map((item) => (
                      <article className={styles.inboxItem} key={item.id}>
                        <div>
                          <span>{item.type} - {item.region} - {item.receivedAt}</span>
                          <strong>{item.name}</strong>
                          <p>{item.message}</p>
                          <small>{item.email} {item.phone ? `- ${item.phone}` : ""}</small>
                        </div>
                        <StatusChip label={item.status} />
                        <div className={styles.inlineActions}>
                          <select value={item.status} onChange={(event) => updatePublicIntakeStatus(item.id, event.target.value as PublicIntakeStatus)}>
                            <option>New</option>
                            <option>Assigned</option>
                            <option>In progress</option>
                            <option>Closed</option>
                          </select>
                          <button className={styles.quietButton} type="button" onClick={() => createTaskFromIntake(item)}>Create task</button>
                          <button className={styles.quietButton} type="button" onClick={() => {
                            setForwardedEmailText(`Portal form: ${item.type}\nFrom: ${item.name} <${item.email}>\nRegion: ${item.region}\n\n${item.message}`);
                            setManagementTab("mailbox");
                          }}>Draft reply</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {managementTab === "messages" && (
                <>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3>Messages</h3>
                      <p>Send portal messages to volunteers, Melanie or the admin team. These are internal portal messages, not emails.</p>
                    </div>
                    <p className={styles.integrationNote}>{unreadMessages.length} unread</p>
                  </div>
                  <div className={styles.queueGrid}>
                    <article className={styles.card}>
                      <strong>Send message</strong>
                      <form className={styles.formGrid} onSubmit={sendPortalMessage}>
                        <label className={styles.field}>To<select value={messageRecipientOptions.includes(messageDraft.to) ? messageDraft.to : messageRecipientOptions[0]} onChange={(event) => setMessageDraft({ ...messageDraft, to: event.target.value })}>{messageRecipientOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
                        <label className={styles.field}>Subject<input value={messageDraft.subject} onChange={(event) => setMessageDraft({ ...messageDraft, subject: event.target.value })} /></label>
                        <label className={styles.field}>Message<textarea value={messageDraft.body} onChange={(event) => setMessageDraft({ ...messageDraft, body: event.target.value })} /></label>
                        <button className={styles.primary} type="submit">Send message</button>
                      </form>
                    </article>
                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>Inbox</strong>
                        <span>{messageInbox.length}</span>
                      </div>
                      {messageInbox.map((item) => (
                        <div className={styles.actionItem} key={item.id}>
                          <div>
                            <b>{item.subject}</b>
                            <span>From {item.fromName} - {item.sentAt}<br />{item.body}</span>
                          </div>
                          <label className={styles.checkboxField}>
                            <input type="checkbox" checked={item.status === "Read"} onChange={(event) => setPortalMessageRead(item.id, event.target.checked)} />
                            Read
                          </label>
                        </div>
                      ))}
                      {!messageInbox.length && <p className={styles.meta}>No messages yet.</p>}
                    </article>
                  </div>
                  <article className={styles.card}>
                    <strong>Sent</strong>
                    <div className={styles.compactList}>
                      {sentMessages.map((item) => (
                        <div key={item.id}><span>{item.to}: {item.subject}</span><b>{item.sentAt}</b></div>
                      ))}
                      {!sentMessages.length && <p className={styles.meta}>No sent messages yet.</p>}
                    </div>
                  </article>
                </>
              )}

              {managementTab === "approvals" && <>
                <section className={styles.approvalInbox}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3>Approval inbox</h3>
                      <p>One decision queue for expenses, hours, uploaded task evidence, design approvals and certificates.</p>
                    </div>
                    <p className={styles.integrationNote}>{approvalInboxItems.length} waiting</p>
                  </div>
                  <div className={styles.inboxList}>
                    {approvalInboxItems.map((item) => (
                      <article className={styles.inboxItem} key={`${item.kind}-${item.id}`}>
                        <div>
                          <span>{item.kind} - {item.owner}</span>
                          <strong>{item.title}</strong>
                          <p>{item.detail}</p>
                        </div>
                        <StatusChip label={item.status} />
                        <div className={styles.inlineActions}>
                          <button className={styles.primary} type="button" onClick={() => resolveApprovalItem(item)}>Approve / resolve</button>
                          <button className={styles.quietButton} type="button" onClick={() => createManagerTask({
                            title: `Question about ${item.title}`,
                            volunteerName: visibleProfiles[0]?.name || name || "Admin team",
                            owner: name || "Manager",
                            dueDate: today(),
                            source: item.kind === "expense" ? "Expense" : item.kind === "hours" ? "Hours" : "General",
                            detail: item.detail,
                          })}>Ask question</button>
                        </div>
                      </article>
                    ))}
                    {!approvalInboxItems.length && (
                      <article className={styles.inboxItem}>
                        <div>
                          <span>Clear</span>
                          <strong>No approvals waiting</strong>
                          <p>New expenses, hours, task uploads, design reviews and certificate actions will appear here.</p>
                        </div>
                        <StatusChip label="Ready" />
                      </article>
                    )}
                  </div>
                </section>
                {expenseQualityChecks.length > 0 && (
                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Evidence and duplicate checks</strong>
                      <span>{expenseQualityChecks.length}</span>
                    </div>
                    {expenseQualityChecks.slice(0, 6).map((check) => (
                      <div className={styles.actionItem} key={check.id}>
                        <div>
                          <b>{check.title}</b>
                          <span>{check.detail}</span>
                        </div>
                        <StatusChip label={check.status} />
                      </div>
                    ))}
                  </article>
                )}
                <div className={styles.filterBar}>
                  <label className={styles.field}>Expense status<select value={approvalFilter} onChange={(event) => setApprovalFilter(event.target.value)}>
                    <option>All</option>
                    <option>Submitted</option>
                    <option>Needs evidence</option>
                    <option>Approved</option>
                    <option>Paid</option>
                    <option>Rejected</option>
                  </select></label>
                  <label className={styles.field}>Sort<select value={approvalSort} onChange={(event) => setApprovalSort(event.target.value)}>
                    <option>Newest first</option>
                    <option>Oldest first</option>
                    <option>Highest amount</option>
                  </select></label>
                </div>
                <div className={styles.emailActions}>
                  <button className={styles.secondary} type="button" onClick={approveAllRoutineHours}>Bulk approve routine hours</button>
                  <button className={styles.secondary} type="button" onClick={exportPaymentBatch}>Export payment batch ({paymentBatch.length})</button>
                  <button className={styles.quietButton} type="button" onClick={exportExpenses}>Export visible expenses</button>
                </div>
                <div className={styles.queueGrid}>
                <article className={styles.card}>
                  <div className={styles.cardHeader}>
                    <strong>Expense approvals</strong>
                    <span>{filteredApprovalExpenses.length}</span>
                  </div>
                  {filteredApprovalExpenses.slice(0, 8).map((expense) => (
                    <div className={styles.managementItem} key={expense.id}>
                      <span>
                        <b>{expense.claimantName}</b>: {expense.type} / {expense.claimCategory || "General"} {money(expense.amount)} <StatusChip label={expense.status} /><br />
                        {expense.supplier && <>Supplier: {expense.supplier}<br /></>}
                        {expense.purchaseFor && <>For: {expense.purchaseFor}<br /></>}
                        Evidence: {expense.evidenceFile || expense.evidence || "No evidence attached"}<br />
                        Sync: {expense.syncStatus || "Not synced"}{expense.paidDate ? `; paid ${expense.paidDate} by ${expense.paidBy || "manager"}` : ""}
                      </span>
                      <select value={expense.status} onChange={(event) => updateExpense(expense.id, { status: event.target.value as ExpenseStatus })}>
                        {(["Submitted", "Needs evidence", "Approved", "Paid", "Rejected"] as ExpenseStatus[]).map((status) => <option key={status}>{status}</option>)}
                      </select>
                      <input value={expense.adminNote} onChange={(event) => updateExpense(expense.id, { adminNote: event.target.value })} placeholder="Manager note" />
                      <div className={styles.inlineActions}>
                        <button className={styles.quietButton} type="button" onClick={() => queryExpense(expense)}>Query volunteer</button>
                        <button className={styles.quietButton} type="button" onClick={() => updateExpense(expense.id, { status: "Approved", syncStatus: "Not synced" })}>Approve</button>
                        <button className={styles.quietButton} type="button" onClick={() => markExpensePaid(expense)}>Mark paid</button>
                      </div>
                    </div>
                  ))}
                  {!filteredApprovalExpenses.length && <p className={styles.meta}>No expenses match this filter.</p>}
                </article>

                <article className={styles.card}>
                  <div className={styles.cardHeader}>
                    <strong>Hours approvals</strong>
                    <span>{submittedHours.length}</span>
                  </div>
                  {submittedHours.slice(0, 6).map((entry) => (
                    <div className={styles.managementItem} key={entry.id}>
                      <span><b>{entry.name}</b>: {entry.activity} - {entry.hours}h <StatusChip label={entry.status} /><br />{eventName(entry.eventId)}<br />{entry.notes || "No notes"}<br />Sync: {entry.syncStatus || "Not synced"}</span>
                      <select value={entry.status} onChange={(event) => updateHourStatus(entry.id, event.target.value as HoursStatus)}>
                        <option>Submitted</option>
                        <option>Approved</option>
                        <option>Query</option>
                      </select>
                      <div className={styles.inlineActions}>
                        <button className={styles.quietButton} type="button" onClick={() => queryHours(entry)}>Query volunteer</button>
                        <button className={styles.quietButton} type="button" onClick={() => updateHourStatus(entry.id, "Approved")}>Approve</button>
                      </div>
                    </div>
                  ))}
                  {!submittedHours.length && <p className={styles.meta}>No hours waiting for approval.</p>}
                </article>
              </div>
              </>}

              {managementTab === "volunteers" && (
                <>
                  <div className={styles.filterBar}>
                    <label className={styles.field}>Search volunteers<input value={managementSearch} onChange={(event) => setManagementSearch(event.target.value)} placeholder="Name, email or role" /></label>
                    <label className={styles.field}>Filter<select value={managementFilter} onChange={(event) => setManagementFilter(event.target.value)}>
                      <option>All</option>
                      <option>DBS/training</option>
                      <option>Missing info</option>
                      <option>Expenses pending</option>
                    </select></label>
                  </div>
                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Volunteer onboarding journey</strong>
                      <span>{onboardingRows.filter((row) => row.percent < 100).length} open</span>
                    </div>
                    <div className={styles.onboardingGrid}>
                      {onboardingRows.map((row) => (
                        <button className={styles.onboardingCard} type="button" key={row.profile.id} onClick={() => setSelectedProfileForManager(row.profile.id)}>
                          <span>{row.profile.name}</span>
                          <strong>{row.percent}%</strong>
                          <small>{row.completeCount}/{onboardingSteps.length} complete</small>
                        </button>
                      ))}
                    </div>
                  </article>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Volunteer</th>
                          <th>Email</th>
                          <th>Expenses waiting</th>
                          <th>Hours</th>
                          <th>Check-ins</th>
                          <th>Compliance</th>
                          <th>Missing info</th>
                          <th>Latest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredManagementRows.map((row) => (
                          <tr key={row.profile.id}>
                            <td>
                              <button className={styles.textButton} type="button" onClick={() => setSelectedProfileForManager(row.profile.id)}>
                                <strong>{row.profile.name}</strong>
                              </button><br />{row.profile.role}
                            </td>
                            <td>{row.profile.email || "Missing"}</td>
                            <td>{money(row.waitingValue)} from {row.expenseCount} claims</td>
                            <td>{row.hoursValue}</td>
                            <td>{row.checkIns}</td>
                            <td>{row.dbs}; training due {row.trainingDue}</td>
                            <td>{row.missingInfo.length ? row.missingInfo.join(", ") : "Complete"}</td>
                            <td>{row.latest}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {selectedManagerProfile && (
                    <article className={styles.detailPanel}>
                      <div className={styles.cardHeader}>
                        <strong>{selectedManagerProfile.name}</strong>
                        <button className={styles.quietButton} type="button" onClick={() => setSelectedProfileForManager(null)}>Close</button>
                      </div>
                      <div className={styles.detailGrid}>
                        <span>Email <b>{selectedManagerProfile.email || "Missing"}</b></span>
                        <span>Phone <b>{selectedManagerProfile.phone || "Missing"}</b></span>
                        <span>Emergency contact <b>{selectedManagerProfile.emergencyContact || "Missing"}</b></span>
                        <span>Availability <b>{selectedManagerProfile.availability}</b></span>
                        <span>DBS expiry <b>{selectedManagerProfile.dbsExpiry}</b></span>
                        <span>Training due <b>{selectedManagerProfile.trainingDue}</b></span>
                      </div>
                      <label className={styles.field}>Management-only note<textarea placeholder="Private note for managers" /></label>
                      <div className={styles.timeline}>
                        <div className={styles.cardHeader}>
                          <strong>Person timeline</strong>
                          <span>{selectedPersonTimeline.length}</span>
                        </div>
                        {selectedPersonTimeline.map((item) => (
                          <div className={styles.timelineItem} key={`${item.at}-${item.title}-${item.detail}`}>
                            <span>{item.at || "No date"}</span>
                            <strong>{item.title}</strong>
                            <p>{item.detail}</p>
                          </div>
                        ))}
                        {!selectedPersonTimeline.length && <p className={styles.meta}>No activity recorded yet.</p>}
                      </div>
                      <div className={styles.timeline}>
                        <div className={styles.cardHeader}>
                          <strong>Onboarding checklist</strong>
                          <span>{onboardingRows.find((row) => row.profile.id === selectedManagerProfile.id)?.percent || 0}%</span>
                        </div>
                        {onboardingSteps.map((step, index) => {
                          const row = onboardingRows.find((item) => item.profile.id === selectedManagerProfile.id);
                          const done = Boolean(row?.completed[index]);
                          return (
                            <div className={styles.actionItem} key={step}>
                              <div>
                                <b>{step}</b>
                                <span>{done ? "Complete" : "Needs action"}</span>
                              </div>
                              <StatusChip label={done ? "Ready" : "Missing"} />
                            </div>
                          );
                        })}
                      </div>
                      <div className={styles.emailActions}>
                        <button className={styles.quietButton} type="button" onClick={() => createManagerTask({
                          title: "Update volunteer profile",
                          volunteerName: selectedManagerProfile.name,
                          owner: name || "Manager",
                          dueDate: today(),
                          source: "Profile",
                          detail: "Please check profile details and fill any missing information.",
                        })}>Create profile task</button>
                        <button className={styles.quietButton} type="button" onClick={() => setManagementTab("compliance")}>Open compliance</button>
                      </div>
                    </article>
                  )}
                </>
              )}

              {managementTab === "users" && role === "admin" && (
                <>
                  <div className={styles.managementGrid}>
                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>{profileEditorId ? "Edit person" : "Add person"}</strong>
                        <StatusChip label={profileEditorId ? "Editing" : "Ready"} />
                      </div>
                      <form className={styles.formGrid} onSubmit={saveProfileRecord}>
                        <label className={styles.field}>Name<input value={profileDraft.name} onChange={(event) => setProfileDraft({ ...profileDraft, name: event.target.value })} placeholder="Full name" /></label>
                        <label className={styles.field}>Role<input value={profileDraft.role} onChange={(event) => setProfileDraft({ ...profileDraft, role: event.target.value })} placeholder="Volunteer / coordinator / admin" /></label>
                        <label className={styles.field}>Email<input type="email" value={profileDraft.email} onChange={(event) => setProfileDraft({ ...profileDraft, email: event.target.value })} placeholder="name@example.org" /></label>
                        <label className={styles.field}>Volunteer PIN<input inputMode="numeric" value={profileDraft.pin} onChange={(event) => setProfileDraft({ ...profileDraft, pin: event.target.value })} placeholder="Private PIN" /></label>
                        <label className={styles.field}>Phone<input value={profileDraft.phone} onChange={(event) => setProfileDraft({ ...profileDraft, phone: event.target.value })} placeholder="Phone number" /></label>
                        <label className={styles.field}>Emergency contact<input value={profileDraft.emergencyContact} onChange={(event) => setProfileDraft({ ...profileDraft, emergencyContact: event.target.value })} placeholder="Name and number" /></label>
                        <label className={styles.field}>DBS expiry<input type="date" value={profileDraft.dbsExpiry} onChange={(event) => setProfileDraft({ ...profileDraft, dbsExpiry: event.target.value })} /></label>
                        <label className={styles.field}>Training due<input inputMode="numeric" value={profileDraft.trainingDue} onChange={(event) => setProfileDraft({ ...profileDraft, trainingDue: event.target.value })} /></label>
                        <label className={styles.field}>Years volunteering<input inputMode="numeric" value={profileDraft.yearsVolunteering} onChange={(event) => setProfileDraft({ ...profileDraft, yearsVolunteering: event.target.value })} /></label>
                        <label className={styles.field}>Availability<textarea value={profileDraft.availability} onChange={(event) => setProfileDraft({ ...profileDraft, availability: event.target.value })} placeholder="Days, evenings, event types" /></label>
                        <label className={styles.field}>Dietary/accessibility notes<textarea value={profileDraft.dietaryAccess} onChange={(event) => setProfileDraft({ ...profileDraft, dietaryAccess: event.target.value })} /></label>
                        <div className={styles.inlineActions}>
                          <button className={styles.primary} type="submit">{profileEditorId ? "Save changes" : "Add person"}</button>
                          <button className={styles.quietButton} type="button" onClick={resetProfileDraft}>Clear form</button>
                        </div>
                      </form>
                    </article>
                    <article className={styles.card}>
                      <strong>Portal access</strong>
                      <div className={styles.compactList}>
                        <div><span>Volunteer access</span><b>{visibleProfiles.length} people</b></div>
                        <div><span>Manager access</span><b>Operations and approvals</b></div>
                        <div><span>Admin access</span><b>Setup, integrations and data</b></div>
                        <div><span>Finance access</span><b>Future payment batch role</b></div>
                        <div><span>Real records</span><b>{profiles.length}</b></div>
                        <div><span>Demo records</span><b>{demoMode ? demoProfiles.length : 0}</b></div>
                      </div>
                    </article>
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>PIN</th>
                          <th>Role</th>
                          <th>Phone</th>
                          <th>Profile health</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleProfiles.map((profile) => (
                          <tr key={profile.id}>
                            <td>
                              <strong>{profile.name}</strong>
                              {profile.id.startsWith("demo-") && <><br /><StatusChip label="Demo sample" /></>}
                            </td>
                            <td>{profile.email || "Missing"}</td>
                            <td>{profile.pin ? "Set" : "Missing"}</td>
                            <td>{profile.role}</td>
                            <td>{profile.phone || "Missing"}</td>
                            <td>{profile.email && profile.phone && profile.emergencyContact ? "Complete" : "Missing details"}</td>
                            <td>
                              <div className={styles.inlineActions}>
                                <button className={styles.quietButton} type="button" onClick={() => editProfile(profile)}>
                                  {profile.id.startsWith("demo-") ? "Use as template" : "Edit"}
                                </button>
                                <button className={styles.quietButton} type="button" onClick={() => {
                                  setSelectedProfileForManager(profile.id);
                                  setManagementTab("volunteers");
                                }}>Open record</button>
                                <button className={styles.quietButton} type="button" onClick={() => createManagerTask({
                                  title: "Update person details",
                                  volunteerName: profile.name,
                                  owner: name || "Admin",
                                  dueDate: today(),
                                  source: "Profile",
                                  detail: "Check contact details, emergency contact, DBS date and availability.",
                                })}>Create task</button>
                                {!profile.id.startsWith("demo-") && (
                                  <button className={styles.quietButton} type="button" onClick={() => deleteProfileRecord(profile)}>Remove local</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {!visibleProfiles.length && (
                          <tr>
                            <td colSpan={7}>
                              No people added yet. Use the form above to add the first volunteer/person record, or turn on demo mode in Settings for a presentation.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {managementTab === "events" && (
                <>
                  <section className={styles.calendarWorkspace}>
                    <div className={styles.sectionHeader}>
                      <div>
                        <h3>Calendar</h3>
                        <p>Weekly planning and monthly overview for events, imported calendar items and staffing follow-up.</p>
                      </div>
                      <div className={styles.calendarControls}>
                        <div className={styles.segmentControl} aria-label="Calendar view">
                          <button className={calendarMode === "week" ? styles.segmentActive : ""} type="button" onClick={() => setCalendarMode("week")}>Week</button>
                          <button className={calendarMode === "month" ? styles.segmentActive : ""} type="button" onClick={() => setCalendarMode("month")}>Month</button>
                        </div>
                        <button
                          className={styles.quietButton}
                          type="button"
                          onClick={() =>
                            setCalendarFocusDate(
                              dateInputValue(
                                calendarMode === "week"
                                  ? addDays(calendarFocus, -7)
                                  : new Date(calendarFocus.getFullYear(), calendarFocus.getMonth() - 1, 1),
                              ),
                            )
                          }
                        >
                          Previous
                        </button>
                        <button
                          className={styles.quietButton}
                          type="button"
                          onClick={() =>
                            setCalendarFocusDate(
                              dateInputValue(
                                calendarMode === "week"
                                  ? addDays(calendarFocus, 7)
                                  : new Date(calendarFocus.getFullYear(), calendarFocus.getMonth() + 1, 1),
                              ),
                            )
                          }
                        >
                          Next
                        </button>
                        <label className={styles.field}>
                          Focus date
                          <input type="date" value={calendarFocusDate} onChange={(event) => setCalendarFocusDate(event.target.value)} />
                        </label>
                      </div>
                    </div>

                    <div className={styles.calendarShell}>
                      <div className={styles.calendarMain}>
                        <div className={styles.cardHeader}>
                          <strong>{calendarTitle}</strong>
                          <span>{portalEvents.length} events</span>
                        </div>
                        {calendarMode === "week" ? (
                          <div className={styles.weekCalendar}>
                            {weekCalendar.map((day) => (
                              <article className={styles.dayColumn} key={day.day.toISOString()}>
                                <div className={styles.dayHeader}>
                                  <strong>{day.day.toLocaleDateString("en-GB", { weekday: "short" })}</strong>
                                  <span>{day.day.getDate()}</span>
                                </div>
                                <div className={styles.dayEvents}>
                                  {day.events.map((event) => (
                                    <button className={styles.miniCalendarEvent} type="button" key={event.id} onClick={() => setSelectedEventId(event.id)}>
                                      <b>{event.time}</b>
                                      <span>{event.title}</span>
                                      <small>{event.location || "Location to add"}</small>
                                    </button>
                                  ))}
                                  {!day.events.length && <p className={styles.dayEmpty}>No events</p>}
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className={styles.monthCalendar}>
                            {monthCalendarDays.map((day) => (
                              <article className={`${styles.monthDay} ${!day.isCurrentMonth ? styles.outOfMonth : ""}`} key={day.day.toISOString()}>
                                <span className={styles.monthDayNumber}>{day.day.getDate()}</span>
                                {day.events.slice(0, 3).map((event) => (
                                  <button className={styles.miniCalendarEvent} type="button" key={event.id} onClick={() => setSelectedEventId(event.id)}>
                                    <b>{event.time}</b>
                                    <span>{event.title}</span>
                                  </button>
                                ))}
                                {day.events.length > 3 && <small className={styles.moreEvents}>+{day.events.length - 3} more</small>}
                              </article>
                            ))}
                          </div>
                        )}
                      </div>

                      <aside className={styles.calendarAgenda}>
                        <div className={styles.cardHeader}>
                          <strong>Upcoming</strong>
                          <span>{upcomingCalendarEvents.length}</span>
                        </div>
                        {upcomingCalendarEvents.map((event) => (
                          <button className={styles.agendaItem} type="button" key={event.id} onClick={() => {
                            setSelectedEventId(event.id);
                            setCalendarFocusDate(dateInputValue(parsePortalDate(event.date) || calendarFocus));
                          }}>
                            <span>{formatDateLong(event.date)} at {event.time}</span>
                            <strong>{event.title}</strong>
                            <small>{event.location || "Location to add"}</small>
                          </button>
                        ))}
                        {!upcomingCalendarEvents.length && (
                          <p className={styles.meta}>No upcoming events yet. Add one manually or paste an email calendar invite below.</p>
                        )}
                      </aside>
                    </div>
                  </section>

                  <div className={styles.queueGrid}>
                    <article className={styles.card}>
                      <strong>Add or update event</strong>
                      <form className={styles.formGrid} onSubmit={saveManagedEvent}>
                        <label className={styles.field}>Title<input value={eventDraft.title} onChange={(event) => setEventDraft({ ...eventDraft, title: event.target.value })} /></label>
                        <label className={styles.field}>Date<input value={eventDraft.date} onChange={(event) => setEventDraft({ ...eventDraft, date: event.target.value })} /></label>
                        <label className={styles.field}>Time<input value={eventDraft.time} onChange={(event) => setEventDraft({ ...eventDraft, time: event.target.value })} /></label>
                        <label className={styles.field}>Location<input value={eventDraft.location} onChange={(event) => setEventDraft({ ...eventDraft, location: event.target.value })} /></label>
                        <label className={styles.field}>Roles needed<input value={eventDraft.rolesNeeded} onChange={(event) => setEventDraft({ ...eventDraft, rolesNeeded: event.target.value })} /></label>
                        <label className={styles.field}>Capacity<input value={eventDraft.capacity} onChange={(event) => setEventDraft({ ...eventDraft, capacity: event.target.value })} /></label>
                        <label className={styles.field}>Default hours<input value={eventDraft.defaultHours} onChange={(event) => setEventDraft({ ...eventDraft, defaultHours: event.target.value })} /></label>
                        <label className={styles.field}>Details<textarea value={eventDraft.detail} onChange={(event) => setEventDraft({ ...eventDraft, detail: event.target.value })} /></label>
                        <button className={styles.primary} type="submit">Save event</button>
                      </form>
                    </article>
                    <article className={styles.card}>
                      <strong>Import from email calendar</strong>
                      <p className={styles.meta}>Paste an invite or forwarded calendar email. The portal copies obvious title/date/time/location fields into the event form.</p>
                      <label className={styles.field}>Calendar email or invite<textarea value={calendarImportText} onChange={(event) => setCalendarImportText(event.target.value)} placeholder={"Subject: Volunteer briefing\nDate: 24 June 2026\nTime: 18:00\nLocation: Community hall"} /></label>
                      <div className={styles.emailActions}>
                        <button className={styles.secondary} type="button" onClick={importCalendarText}>Use this invite</button>
                      </div>
                    </article>
                  </div>

                  <section className={styles.eventCommand}>
                    <div className={styles.sectionHeader}>
                      <div>
                        <span className={styles.meta}>Event command centre</span>
                        <h3>{selectedCommandEvent.title}</h3>
                        <p>One place for staffing, files, VIPs, design assets, feedback and follow-up tasks.</p>
                      </div>
                      <label className={styles.field}>
                        Event
                        <select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>
                          {portalEvents.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
                        </select>
                      </label>
                    </div>
                    <div className={styles.commandStats}>
                      <span><b>{selectedCommandStaffing?.confirmed.length || 0}</b> available</span>
                      <span><b>{selectedCommandStaffing?.spacesLeft || 0}</b> spaces left</span>
                      <span><b>{suggestedVips.length}</b> VIP suggestions</span>
                      <span><b>{selectedCommandFiles.length}</b> files</span>
                      <span><b>{selectedCommandTasks.length}</b> tasks</span>
                      <span><b>{selectedEventPrepOpen}</b> prep open</span>
                      <span><b>{selectedEventPrepBlocked}</b> blocked</span>
                      <span><b>{selectedCommandFeedback.length}</b> feedback</span>
                    </div>
                    <div className={styles.commandChecklist}>
                      {eventCommandChecklist.map((item) => (
                        <article key={item.label}>
                          <StatusChip label={item.status} />
                          <strong>{item.label}</strong>
                          <p>{item.detail}</p>
                        </article>
                      ))}
                    </div>
                    <section className={styles.eventPrepList}>
                      <div className={styles.cardHeader}>
                        <strong>Event prep checklist</strong>
                        <span>{selectedEventPrepOpen} open</span>
                      </div>
                      {selectedEventPrepItems.map((item) => (
                        <article className={styles.eventPrepItem} key={item.id}>
                          <div>
                            <strong>{item.label}</strong>
                            <p>{item.note || "No note yet."}</p>
                          </div>
                          <label className={styles.miniField}>
                            Owner
                            <select value={item.owner} onChange={(event) => updateEventPrepItem(item, { owner: event.target.value })}>
                              <option>Management</option>
                              <option>Melanie</option>
                              <option>Admin team</option>
                              <option>Tom</option>
                            </select>
                          </label>
                          <label className={styles.miniField}>
                            Status
                            <select value={item.status} onChange={(event) => updateEventPrepItem(item, { status: event.target.value as EventPrepStatus })}>
                              <option>Not started</option>
                              <option>In progress</option>
                              <option>Done</option>
                              <option>Blocked</option>
                            </select>
                          </label>
                          <label className={styles.miniField}>
                            Note
                            <input value={item.note} onChange={(event) => updateEventPrepItem(item, { note: event.target.value })} placeholder="What is needed?" />
                          </label>
                          <button className={styles.quietButton} type="button" onClick={() => createTaskFromEventPrep(item)}>Create task</button>
                        </article>
                      ))}
                      {!selectedEventPrepItems.length && <p className={styles.meta}>Add or import an event to build its prep checklist.</p>}
                    </section>
                    <section className={styles.runSheet}>
                      <div className={styles.cardHeader}>
                        <strong>Day-of-event run sheet</strong>
                        <StatusChip label={selectedCommandStaffing?.spacesLeft ? "Needs follow-up" : "Ready"} />
                      </div>
                      <div className={styles.runSheetGrid}>
                        <article>
                          <span>Arrival and setup</span>
                          <strong>{selectedCommandEvent.time}</strong>
                          <p>{selectedCommandEvent.location}</p>
                        </article>
                        <article>
                          <span>QR check-in</span>
                          <strong>{selectedCommandEvent.title}</strong>
                          <p>Open the event QR screen and let volunteers scan when they arrive.</p>
                        </article>
                        <article>
                          <span>Volunteer roles</span>
                          <strong>{selectedCommandEvent.rolesNeeded}</strong>
                          <p>{selectedCommandStaffing?.confirmed.length || 0} confirmed or interested.</p>
                        </article>
                        <article>
                          <span>VIP watch list</span>
                          <strong>{suggestedVips.slice(0, 3).map(({ vip }) => vip.name).join(", ") || "None yet"}</strong>
                          <p>Invite status and contact forms stay in the contact log.</p>
                        </article>
                        <article>
                          <span>Files and materials</span>
                          <strong>{selectedCommandFiles.length} linked</strong>
                          <p>Briefing notes, posters, forms and risk paperwork for the event.</p>
                        </article>
                        <article>
                          <span>After the event</span>
                          <strong>{selectedCommandFeedback.length} feedback forms</strong>
                          <p>Check hours, capture concerns, thank helpers and close tasks.</p>
                        </article>
                      </div>
                    </section>
                    <div className={styles.emailActions}>
                      <button className={styles.primary} type="button" onClick={createEventCommandPack}>Create event command pack</button>
                      <button className={styles.secondary} type="button" onClick={exportEventBriefing}>Download event brief</button>
                      <button className={styles.quietButton} type="button" onClick={() => setManagementTab("designs")}>Open design brief</button>
                      <button className={styles.quietButton} type="button" onClick={() => setManagementTab("mailbox")}>Open event emails</button>
                    </div>
                  </section>

                  <article className={styles.detailPanel}>
                    <div className={styles.cardHeader}>
                      <strong>Suggested VIPs nearby</strong>
                      <span>{eventSuggestionRegion}</span>
                    </div>
                    <p className={styles.meta}>Based on event title, location, campaign and West Midlands proximity. Real postcode distance can replace this later.</p>
                    <div className={styles.cards}>
                      {suggestedVips.map(({ vip, score }) => {
                        const draft = contactFormDrafts[vip.id] || "";
                        return (
                          <article className={styles.card} key={vip.id}>
                            <div className={styles.cardHeader}>
                              <strong>{vip.name}</strong>
                              <StatusChip label={vip.priority} />
                            </div>
                            <p className={styles.meta}>{vip.role} - {vip.organisation || "Independent"} - {vip.region}</p>
                            <div className={styles.compactList}>
                              <div><span>Contact route</span><b>{vip.contactMethodType}</b></div>
                              <div><span>Email/office</span><b>{vip.directEmail || vip.officeEmail || "Needs agent/contact"}</b></div>
                              <div><span>Form</span><b>{vip.formLink || "No form link"}</b></div>
                              <div><span>Campaign</span><b>{vip.campaignEvent}</b></div>
                              <div><span>Match score</span><b>{score}</b></div>
                              <div><span>Notes</span><b>{vip.notes || vip.relevance}</b></div>
                            </div>
                            <div className={styles.emailActions}>
                              <button className={styles.quietButton} type="button" onClick={() => autoFillVipInvite(vip)}>Auto-fill invite</button>
                              <button className={styles.quietButton} type="button" onClick={() => markVipInviteSent(vip)}>Mark sent</button>
                              {vip.formLink && <a className={styles.quietButton} href={vip.formLink} target="_blank" rel="noreferrer">Open form</a>}
                            </div>
                            {draft && (
                              <div className={styles.replyDraft}>
                                <label className={styles.field}>
                                  VIP invite draft
                                  <textarea value={draft} onChange={(event) => setContactFormDrafts((current) => ({ ...current, [vip.id]: event.target.value }))} />
                                </label>
                                <div className={styles.emailActions}>
                                  <button
                                    className={styles.secondary}
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard?.writeText(draft);
                                      vipLogEntry(vip, "VIP invite copied", `${vip.templateType} invite copied for ${eventDraft.title || vip.campaignEvent}.`);
                                      setMessage("VIP invite copied.");
                                    }}
                                  >
                                    Copy invite
                                  </button>
                                </div>
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </article>

                  <div className={styles.cards}>
                    {eventStaffing.map((item) => (
                      <article className={styles.card} key={item.event.id}>
                        <div className={styles.cardHeader}>
                          <strong>{item.event.title}</strong>
                          <span>{item.spacesLeft}</span>
                        </div>
                        <p className={styles.meta}>{item.event.date} at {item.event.time} - {item.event.location}</p>
                        <div className={styles.compactList}>
                          <div><span>Roles needed</span><b>{item.event.rolesNeeded}</b></div>
                          <div><span>Available/confirmed</span><b>{item.confirmed.length}</b></div>
                          <div><span>Gap</span><b>{item.spacesLeft} places</b></div>
                          <div><span>Sync</span><b>{item.event.syncStatus || "Synced"}</b></div>
                        </div>
                        <div className={styles.emailActions}>
                          <button className={styles.quietButton} type="button" onClick={() => setTab("events")}>Open event</button>
                          <button className={styles.quietButton} type="button">Message volunteers</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {managementTab === "mailbox" && (
                <>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3>{role === "admin" ? "Admin inbox" : "Mailbox"}</h3>
                      <p className={styles.mailboxAddress}>contact@violetproject.co.uk</p>
                      <p>Track who has been replied to, who is waiting, who owns the next step, and delegate email work into tasks.</p>
                    </div>
                    <p className={styles.integrationNote}>Longest wait: {longestEmailWait} days</p>
                  </div>
                  <section className={styles.approvalInbox}>
                    <div className={styles.cardHeader}>
                      <strong>Response timers</strong>
                      <span>{emailSlaRows.filter((email) => email.sla !== "Done").length}</span>
                    </div>
                    <p className={styles.meta}>Every inbox item shows how long it has waited, the next action, and whether it has been replied to.</p>
                    <div className={styles.slaGrid}>
                      {emailSlaBuckets.map((bucket) => (
                        <button className={styles.slaBucket} type="button" key={bucket.label} onClick={() => setManagementTab("mailbox")}>
                          <span>{bucket.label}</span>
                          <strong>{bucket.count}</strong>
                          <small>{bucket.detail}</small>
                        </button>
                      ))}
                    </div>
                    <div className={styles.inboxList}>
                      {emailSlaRows.slice(0, 6).map((email) => {
                        const linked = visibleProfiles.find((profile) => matchDbsEmail(profile, mailboxItems)?.id === email.id);
                        const linkedName = linked?.name || email.volunteerNameHint || "Needs review";
                        const delegatedTo = emailDelegations[email.id] || email.owner || "Admin team";
                        return (
                          <article className={styles.inboxItem} key={`timer-${email.id}`}>
                            <div>
                              <span>{email.category} - delegated to {delegatedTo} - {email.receivedAt}</span>
                              <strong>{email.subject}</strong>
                              <p>{email.nextAction}</p>
                              <small>{linkedName || email.relatedRegion || "Needs linking"} - waited {email.waitingDays} days</small>
                            </div>
                            <StatusChip label={email.sla} />
                            <div className={styles.inlineActions}>
                              <label className={styles.checkboxField}>
                                <input
                                  type="checkbox"
                                  checked={email.statusLabel === "Closed" || email.statusLabel === "Confirmed"}
                                  onChange={(event) => toggleEmailDone(email.id, event.target.checked)}
                                />
                                Done
                              </label>
                              <button className={styles.quietButton} type="button" onClick={() => draftEmailReply(email, linked?.name || email.volunteerNameHint || "there", email.statusLabel)}>
                                Generate reply
                              </button>
                              <button className={styles.quietButton} type="button" onClick={() => markEmailReplied(email)}>Mark replied</button>
                              <button className={styles.quietButton} type="button" onClick={() => markEmailWaitingExternal(email)}>Waiting external</button>
                              <select aria-label={`Delegate ${email.subject}`} value={delegatedTo} onChange={(event) => updateEmailDelegation(email.id, event.target.value)}>
                                {delegationOptions.map((option) => <option key={option}>{option}</option>)}
                              </select>
                              <button className={styles.quietButton} type="button" onClick={() => createDelegatedEmailTask(email, linkedName)}>Delegate task</button>
                              <button className={styles.quietButton} type="button" onClick={() => closeEmailItem(email)}>Close</button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Forwarded email cleaner</strong>
                      <StatusChip label="Portal first" />
                    </div>
                    <p className={styles.meta}>Paste Melanie&apos;s forwarded email exactly as received. The portal treats her note at the top as the instruction, then keeps the original email underneath as context.</p>
                    <div className={styles.formGrid}>
                      <label className={styles.field}>Assign to<select value={taskDraft.volunteerName} onChange={(event) => setTaskDraft({ ...taskDraft, volunteerName: event.target.value })}>
                        {visibleProfiles.map((profile) => <option key={profile.id}>{profile.name}</option>)}
                      </select></label>
                      <label className={styles.field}>Due date<input type="date" value={taskDraft.dueDate} onChange={(event) => setTaskDraft({ ...taskDraft, dueDate: event.target.value })} /></label>
                      <label className={styles.field}>Melanie&apos;s forwarded email<textarea value={forwardedEmailText} onChange={(event) => setForwardedEmailText(event.target.value)} placeholder={"Paste the whole forward here, including Melanie's note above the original email.\n\nExample:\nTom, please reply and ask them for the DBS certificate.\n\nFrom: ...\nSubject: ..."} /></label>
                    </div>
                    <div className={styles.emailActions}>
                      <button className={styles.secondary} type="button" onClick={cleanForwardedEmail}>Read Melanie&apos;s instruction</button>
                      <button className={styles.quietButton} type="button" onClick={createTaskFromForwardedEmail}>Create task from instruction</button>
                    </div>
                    {(forwardedEmailResult.instruction || forwardedEmailResult.cleanBody) && (
                      <div className={styles.replyDraft}>
                        <div className={styles.compactList}>
                          <div><span>What Melanie wants done</span><b>{forwardedEmailResult.instruction}</b></div>
                          <div><span>Suggested action</span><b>{forwardedEmailResult.actionType || "Review and action"}</b></div>
                          <div><span>Priority</span><b>{forwardedEmailResult.priority || "Routine"}</b></div>
                          <div><span>Original sender</span><b>{forwardedEmailResult.originalFrom || "Not detected"}</b></div>
                          <div><span>Subject</span><b>{forwardedEmailResult.subject}</b></div>
                          <div><span>Task summary</span><b>{forwardedEmailResult.taskSummary || forwardedEmailResult.instruction}</b></div>
                        </div>
                        <label className={styles.field}>Original email context<textarea value={forwardedEmailResult.cleanBody} onChange={(event) => setForwardedEmailResult({ ...forwardedEmailResult, cleanBody: event.target.value })} /></label>
                        <label className={styles.field}>Draft reply to original sender<textarea value={forwardedEmailResult.suggestedReply} onChange={(event) => setForwardedEmailResult({ ...forwardedEmailResult, suggestedReply: event.target.value })} /></label>
                        <section className={styles.draftAssistant}>
                          <div>
                            <strong>Draft assistant</strong>
                            <p>Use this to rewrite the draft. It still needs a human check before anything is sent.</p>
                          </div>
                          <div className={styles.rewriteButtonGrid}>
                            <button className={styles.quietButton} type="button" onClick={() => rewriteForwardedEmailDraft("melanie-email")}>Turn Melanie&apos;s note into email</button>
                            <button className={styles.quietButton} type="button" onClick={() => rewriteForwardedEmailDraft("warmer")}>Make warmer</button>
                            <button className={styles.quietButton} type="button" onClick={() => rewriteForwardedEmailDraft("shorter")}>Make shorter</button>
                            <button className={styles.quietButton} type="button" onClick={() => rewriteForwardedEmailDraft("formal")}>More formal</button>
                            <button className={styles.quietButton} type="button" onClick={() => rewriteForwardedEmailDraft("summarise")}>Summarise</button>
                          </div>
                        </section>
                        <div className={styles.emailActions}>
                          <button className={styles.secondary} type="button" onClick={() => {
                            navigator.clipboard?.writeText(forwardedEmailResult.suggestedReply);
                            setMessage("Clean reply copied.");
                          }}>Copy clean reply</button>
                        </div>
                      </div>
                    )}
                  </article>
                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Forward emails into the portal</strong>
                      <StatusChip label="Draft ready" />
                    </div>
                    <p className={styles.meta}>
                      Live version: Melanie forwards or redirects emails to the portal intake. The portal keeps her
                      instruction, strips old forwarding text, links the message to a person, event or region, then
                      creates a reply task.
                    </p>
                    <div className={styles.compactList}>
                      <div><span>Inbox watched</span><b>contact@violetproject.co.uk</b></div>
                      <div><span>Portal intake alias</span><b>portal-intake@violetproject.co.uk</b></div>
                      <div><span>Output</span><b>Clean task, clean reply draft, linked history</b></div>
                      <div><span>Human check</span><b>Admin approves before anything is sent</b></div>
                    </div>
                    <div className={styles.emailActions}>
                      <button className={styles.secondary} type="button" onClick={cleanForwardedEmail}>Clean current email</button>
                    </div>
                  </article>
                  <div className={styles.cards}>
                    {mailboxItems
                      .slice()
                      .sort((a, b) => b.waitingDays - a.waitingDays)
                      .map((email) => {
                      const matched = visibleProfiles.find((profile) => matchDbsEmail(profile, mailboxItems)?.id === email.id);
                      const linkedName = matched?.name || email.volunteerNameHint || "Needs review";
                      const followUpStatus = emailFollowUps[email.id] || email.followUpStatus;
                      const draft = emailDrafts[email.id] || "";
                      const draftSource = emailDraftSources[email.id] || "";
                      const isDrafting = emailDraftBusy === email.id;
                      const delegatedTo = emailDelegations[email.id] || email.owner || "Admin team";
                      return (
                        <article className={styles.card} key={email.id}>
                          <div className={styles.emailHeader}>
                            <strong>{email.subject}</strong>
                            <span>{email.waitingDays ? `${email.waitingDays} days` : "Today"}</span>
                          </div>
                          <p className={styles.meta}>{email.category} - {email.receivedAt}</p>
                          <p>{email.snippet}</p>
                          <div className={styles.compactList}>
                            <div><span>From</span><b>{email.from}</b></div>
                            <div><span>To</span><b>{email.to}</b></div>
                            <div><span>Linked person</span><b>{linkedName}</b></div>
                            <div><span>Region</span><b>{email.relatedRegion || "Not set"}</b></div>
                            <div><span>Owner</span><b>{email.owner}</b></div>
                            <div><span>Delegated to</span><b>{delegatedTo}</b></div>
                            <div><span>Response status</span><b>{followUpStatus}</b></div>
                            <div><span>Next action</span><b>{email.nextAction}</b></div>
                          </div>
                          <div className={styles.emailActions}>
                            <label className={styles.checkboxField}>
                              <input
                                type="checkbox"
                                checked={followUpStatus === "Closed" || followUpStatus === "Confirmed"}
                                onChange={(event) => toggleEmailDone(email.id, event.target.checked)}
                              />
                              Done
                            </label>
                            <StatusChip label={followUpStatus} />
                            <select value={followUpStatus} onChange={(event) => updateEmailFollowUp(email.id, event.target.value as DbsEmail["followUpStatus"])}>
                              <option>Reply needed</option>
                              <option>Waiting for confirmation</option>
                              <option>Confirmed</option>
                              <option>Closed</option>
                            </select>
                            <button className={styles.quietButton} type="button" onClick={() => {
                              if (matched) {
                                setSelectedProfileForManager(matched.id);
                                setManagementTab("volunteers");
                              } else {
                                setManagementTab(email.category === "Contact" || email.category === "Fundraising" ? "contacts" : "users");
                              }
                            }}>
                              {matched ? "Open linked record" : "Choose person"}
                            </button>
                            <select aria-label={`Delegate ${email.subject}`} value={delegatedTo} onChange={(event) => updateEmailDelegation(email.id, event.target.value)}>
                              {delegationOptions.map((option) => <option key={option}>{option}</option>)}
                            </select>
                            <button
                              className={styles.quietButton}
                              type="button"
                              disabled={isDrafting}
                              onClick={() => draftEmailReply(email, linkedName, followUpStatus)}
                            >
                              {isDrafting ? "Generating..." : "Smart generate reply"}
                            </button>
                            <button className={styles.quietButton} type="button" onClick={() => markEmailReplied(email)}>Mark replied</button>
                            <button className={styles.quietButton} type="button" onClick={() => markEmailWaitingExternal(email)}>Waiting external</button>
                            <button className={styles.quietButton} type="button" onClick={() => createDelegatedEmailTask(email, linkedName)}>Delegate task</button>
                            <button className={styles.quietButton} type="button" onClick={() => closeEmailItem(email)}>Close with note</button>
                          </div>
                          {draft && (
                            <div className={styles.replyDraft}>
                              {draftSource && <p className={styles.aiNote}>{draftSource}</p>}
                              <div className={styles.compactList}>
                                <div><span>Context used</span><b>{email.category}, {linkedName}, {email.relatedRegion || "no region"}, waited {email.waitingDays} days</b></div>
                                <div><span>Human check</span><b>Review before sending</b></div>
                              </div>
                              <label className={styles.field}>
                                Draft reply
                                <textarea value={draft} onChange={(event) => updateEmailDraft(email.id, event.target.value)} />
                              </label>
                              <section className={styles.draftAssistant}>
                                <div>
                                  <strong>Rewrite controls</strong>
                                  <p>Polish the draft or create a quick summary. Review before sending.</p>
                                </div>
                                <div className={styles.rewriteButtonGrid}>
                                  <button className={styles.quietButton} type="button" disabled={isDrafting} onClick={() => rewriteEmailDraft(email, linkedName, followUpStatus, "warmer")}>Make warmer</button>
                                  <button className={styles.quietButton} type="button" disabled={isDrafting} onClick={() => rewriteEmailDraft(email, linkedName, followUpStatus, "shorter")}>Make shorter</button>
                                  <button className={styles.quietButton} type="button" disabled={isDrafting} onClick={() => rewriteEmailDraft(email, linkedName, followUpStatus, "formal")}>More formal</button>
                                  <button className={styles.quietButton} type="button" disabled={isDrafting} onClick={() => rewriteEmailDraft(email, linkedName, followUpStatus, "summarise")}>Summarise</button>
                                </div>
                              </section>
                              <div className={styles.emailActions}>
                                <button
                                  className={styles.secondary}
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard?.writeText(draft);
                                    setMessage("Draft copied.");
                                  }}
                                >
                                  Copy draft
                                </button>
                                <button
                                  className={styles.quietButton}
                                  type="button"
                                  onClick={() => updateEmailFollowUp(email.id, "Waiting for confirmation")}
                                >
                                  Mark as replied
                                </button>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                    {!mailboxItems.length && (
                      <article className={styles.card}>
                        <strong>No mailbox items yet</strong>
                        <p>Connected emails, delegated replies and response timers will appear here.</p>
                      </article>
                    )}
                  </div>
                </>
              )}

              {managementTab === "training" && role === "admin" && (
                <>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3>Training certificates</h3>
                      <p>See who has completed training, who is waiting for a certificate, and how long they have waited.</p>
                    </div>
                    <p className={styles.integrationNote}>Longest wait: {longestCertificateWait} days</p>
                  </div>
                  <section className={styles.reportStudio}>
                    <div>
                      <span className={styles.meta}>Certificate generator</span>
                      <h3>Issue training certificate</h3>
                      <p>Create a certificate text pack, queue it for filing, then attach or send it from the inbox/task flow.</p>
                    </div>
                    <div className={styles.reportControlGrid}>
                      <label className={styles.field}>Volunteer<select value={certificateDraft.volunteer} onChange={(event) => setCertificateDraft({ ...certificateDraft, volunteer: event.target.value })}>
                        {visibleProfiles.map((profile) => <option key={profile.id}>{profile.name}</option>)}
                      </select></label>
                      <label className={styles.field}>Course<select value={certificateDraft.course} onChange={(event) => setCertificateDraft({ ...certificateDraft, course: event.target.value })}>
                        {certificateTemplates.map((template) => <option key={template}>{template}</option>)}
                      </select></label>
                      <label className={styles.field}>Completed<input type="date" value={certificateDraft.completedAt} onChange={(event) => setCertificateDraft({ ...certificateDraft, completedAt: event.target.value })} /></label>
                      <label className={styles.field}>Reference<input value={certificateDraft.reference} onChange={(event) => setCertificateDraft({ ...certificateDraft, reference: event.target.value })} /></label>
                    </div>
                    <div className={styles.emailActions}>
                      <button className={styles.primary} type="button" onClick={generateCertificate}>Generate certificate</button>
                      <button className={styles.secondary} type="button" disabled={!certificateOutput} onClick={() => {
                        navigator.clipboard?.writeText(certificateOutput);
                        setMessage("Certificate copied.");
                      }}>Copy certificate</button>
                      <button className={styles.quietButton} type="button" disabled={!certificateOutput} onClick={() => saveText(`violet-certificate-${certificateDraft.reference}.txt`, certificateOutput, "text/plain;charset=utf-8")}>Download certificate</button>
                    </div>
                    {certificateOutput && (
                      <label className={styles.field}>
                        Certificate output
                        <textarea value={certificateOutput} onChange={(event) => setCertificateOutput(event.target.value)} />
                      </label>
                    )}
                  </section>
                  <div className={styles.cards}>
                    {trainingCertificates.map((certificate) => (
                      <article className={styles.card} key={certificate.id}>
                        <div className={styles.cardHeader}>
                          <strong>{certificate.volunteer}</strong>
                          <StatusChip label={certificate.status} />
                        </div>
                        <div className={styles.compactList}>
                          <div><span>Course</span><b>{certificate.course}</b></div>
                          <div><span>Completed</span><b>{certificate.completedAt}</b></div>
                          <div><span>Waiting</span><b>{certificate.waitedDays} days</b></div>
                          <div><span>Provider</span><b>{certificate.provider}</b></div>
                        </div>
                        <div className={styles.emailActions}>
                          <button className={styles.quietButton} type="button" onClick={() => createManagerTask({
                            title: "Training certificate follow-up",
                            volunteerName: certificate.volunteer,
                            owner: name || "Admin",
                            dueDate: today(),
                            source: "Certificate",
                            detail: `${certificate.course}: ${certificate.status}; waiting ${certificate.waitedDays} days.`,
                          })}>Create follow-up</button>
                          {certificate.emailId && <button className={styles.quietButton} type="button" onClick={() => setManagementTab("mailbox")}>Open inbox item</button>}
                        </div>
                      </article>
                    ))}
                    {!trainingCertificates.length && (
                      <article className={styles.card}>
                        <strong>No certificate requests yet</strong>
                        <p>Completed training and certificate waits will appear once real records are imported or created.</p>
                      </article>
                    )}
                  </div>
                </>
              )}

              {managementTab === "fundraising" && role === "admin" && (
                <>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3>Fundraising follow-up</h3>
                      <p>Track donors, collection tins, raffle prizes and whether people have been thanked.</p>
                    </div>
                    <p className={styles.integrationNote}>{fundraisingNeedsThanks.length} thank-yous due</p>
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Contact</th>
                          <th>Item</th>
                          <th>Amount</th>
                          <th>Region</th>
                          <th>Thanked</th>
                          <th>Waiting</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fundraisingFollowUps.map((item) => (
                          <tr key={item.id}>
                            <td><strong>{item.name}</strong></td>
                            <td>{item.email}</td>
                            <td>{item.item}</td>
                            <td>{item.amount}</td>
                            <td>{item.region}</td>
                            <td><StatusChip label={item.thanked === "Yes" ? "Done" : item.thanked} /></td>
                            <td>{item.waitedDays} days</td>
                            <td>
                              <button className={styles.quietButton} type="button" onClick={() => createManagerTask({
                                title: "Send fundraising thank-you",
                                volunteerName: item.name,
                                owner: name || "Admin",
                                dueDate: today(),
                                source: "Fundraising",
                                detail: `${item.item} (${item.amount}) in ${item.region}.`,
                              })}>Create task</button>
                            </td>
                          </tr>
                        ))}
                        {!fundraisingFollowUps.length && (
                          <tr>
                            <td colSpan={8}>No fundraising follow-ups recorded yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {managementTab === "contacts" && role === "admin" && (
                <>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3>Contact profiles</h3>
                      <p>Store partner details, forms, attachments, auto-filled messages and a history of what has been sent.</p>
                    </div>
                    <p className={styles.integrationNote}>{eventContactsOpen.length} open contacts</p>
                  </div>
                  <div className={styles.managementSummary}>
                    <article className={styles.workloadCard}><span>Profiles</span><strong>{contactProfiles.length}</strong></article>
                    <article className={styles.workloadCard}><span>Open</span><strong>{eventContactsOpen.length}</strong></article>
                    <article className={styles.workloadCard}><span>Forms logged</span><strong>{contactLog.length}</strong></article>
                    <article className={styles.workloadCard}><span>VIP contacts</span><strong>{vipContacts.length}</strong></article>
                  </div>
                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Add contact profile</strong>
                      <StatusChip label="Ready" />
                    </div>
                    <form className={styles.formGrid} onSubmit={saveContactProfile}>
                      <label className={styles.field}>Name<input value={contactDraft.name} onChange={(event) => setContactDraft({ ...contactDraft, name: event.target.value })} /></label>
                      <label className={styles.field}>Organisation<input value={contactDraft.organisation} onChange={(event) => setContactDraft({ ...contactDraft, organisation: event.target.value })} /></label>
                      <label className={styles.field}>Email<input type="email" value={contactDraft.email} onChange={(event) => setContactDraft({ ...contactDraft, email: event.target.value })} /></label>
                      <label className={styles.field}>Phone<input value={contactDraft.phone} onChange={(event) => setContactDraft({ ...contactDraft, phone: event.target.value })} /></label>
                      <label className={styles.field}>Region<input value={contactDraft.region} onChange={(event) => setContactDraft({ ...contactDraft, region: event.target.value })} placeholder="Coventry, Birmingham, West Midlands..." /></label>
                      <label className={styles.field}>Area<select value={contactDraft.area} onChange={(event) => setContactDraft({ ...contactDraft, area: event.target.value as ContactProfile["area"] })}>
                        <option>Events</option>
                        <option>Training</option>
                        <option>Fundraising</option>
                        <option>Referrals</option>
                        <option>Corporate</option>
                        <option>General</option>
                      </select></label>
                      <label className={styles.field}>Purpose<input value={contactDraft.inviteFor} onChange={(event) => setContactDraft({ ...contactDraft, inviteFor: event.target.value })} placeholder="Event invite, training provider, donor follow-up..." /></label>
                      <label className={styles.field}>Status<input value={contactDraft.status} onChange={(event) => setContactDraft({ ...contactDraft, status: event.target.value })} /></label>
                      <label className={styles.field}>Form or contact route<input value={contactDraft.formType} onChange={(event) => setContactDraft({ ...contactDraft, formType: event.target.value })} placeholder="Email, web form, council request form" /></label>
                      <label className={styles.field}>Required attachments<textarea value={contactDraft.requiredAttachments} onChange={(event) => setContactDraft({ ...contactDraft, requiredAttachments: event.target.value })} placeholder="Comma separated: poster, risk assessment, charity letter" /></label>
                      <button className={styles.primary} type="submit">Add contact</button>
                    </form>
                  </article>
                  <div className={styles.cards}>
                    {contactProfiles.map((contact) => {
                      const missingAttachments = contact.requiredAttachments.filter((item) => !contact.attachments.includes(item));
                      const draft = contactFormDrafts[contact.id] || "";
                      return (
                      <article className={styles.card} key={contact.id}>
                        <div className={styles.cardHeader}>
                          <strong>{contact.name}</strong>
                          <StatusChip label={contact.status} />
                        </div>
                        <p className={styles.meta}>{contact.organisation} - {contact.area} - {contact.region}</p>
                        <div className={styles.compactList}>
                          <div><span>Email</span><b>{contact.email}</b></div>
                          <div><span>Phone</span><b>{contact.phone}</b></div>
                          <div><span>Form</span><b>{contact.formType}</b></div>
                          <div><span>Purpose</span><b>{contact.inviteFor}</b></div>
                          <div><span>Attachments</span><b>{contact.attachments.length ? contact.attachments.join(", ") : "None yet"}</b></div>
                          <div><span>Still needed</span><b>{missingAttachments.length ? missingAttachments.join(", ") : "Nothing missing"}</b></div>
                          <div><span>Last action</span><b>{contact.lastAction}</b></div>
                        </div>
                        <div className={styles.emailActions}>
                          <label className={styles.quietButton}>
                            Attach file
                            <input className={styles.hiddenFile} type="file" multiple onChange={(event) => attachContactFile(contact, event.target.files)} />
                          </label>
                          <button className={styles.quietButton} type="button" onClick={() => autoFillContactForm(contact)}>
                            Auto-fill form
                          </button>
                          <button className={styles.quietButton} type="button" onClick={() => markContactFormSent(contact)}>
                            Mark sent
                          </button>
                          <button className={styles.quietButton} type="button" onClick={() => createManagerTask({
                            title: "Event contact follow-up",
                            volunteerName: contact.name,
                            owner: name || "Admin",
                            dueDate: today(),
                            source: "Contact",
                            detail: `${contact.organisation}, ${contact.region}: ${contact.inviteFor}.`,
                          })}>Create task</button>
                          <button className={styles.quietButton} type="button" onClick={() => setManagementTab("events")}>Use for event</button>
                        </div>
                        {draft && (
                          <div className={styles.replyDraft}>
                            <label className={styles.field}>
                              Auto-filled form/message
                              <textarea value={draft} onChange={(event) => setContactFormDrafts((current) => ({ ...current, [contact.id]: event.target.value }))} />
                            </label>
                            <div className={styles.emailActions}>
                              <button
                                className={styles.secondary}
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(draft);
                                  addContactLog(contact, "Form copied", `${contact.formType} copied ready to send.`);
                                  setMessage("Auto-filled form copied.");
                                }}
                              >
                                Copy form
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                    {!contactProfiles.length && (
                      <article className={styles.card}>
                        <strong>No contact profiles yet</strong>
                        <p>Partner and event contact profiles will appear here once added or imported.</p>
                      </article>
                    )}
                  </div>
                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>VIP and campaign contact list</strong>
                      <span>{vipContacts.length}</span>
                    </div>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Organisation</th>
                            <th>Priority</th>
                            <th>Route</th>
                            <th>Email / Office</th>
                            <th>Campaign</th>
                            <th>Template</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vipContacts.map((vip) => (
                            <tr key={vip.id}>
                              <td><strong>{vip.name}</strong><br />{vip.region}</td>
                              <td>{vip.role}</td>
                              <td>{vip.organisation || "Not recorded"}</td>
                              <td><StatusChip label={vip.priority} /></td>
                              <td>{vip.contactMethodType}{vip.formLink ? <><br /><a href={vip.formLink} target="_blank" rel="noreferrer">Open form</a></> : null}</td>
                              <td>{vip.directEmail || vip.officeEmail || "Needs contact/agent"}</td>
                              <td>{vip.campaignEvent}</td>
                              <td>{vip.templateType}</td>
                              <td>
                                <button className={styles.quietButton} type="button" onClick={() => autoFillVipInvite(vip)}>Auto-fill</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </article>
                  <div className={styles.queueGrid}>
                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>History log</strong>
                        <span>{contactLog.length}</span>
                      </div>
                      {contactLog.slice(0, 8).map((entry) => (
                        <div className={styles.actionItem} key={entry.id}>
                          <div>
                            <b>{entry.action}: {entry.contactName}</b>
                            <span>{entry.area} - {entry.region} - {entry.at}<br />{entry.detail}</span>
                          </div>
                        </div>
                      ))}
                    </article>
                    <article className={styles.card}>
                      <strong>Log by area</strong>
                      <div className={styles.compactList}>
                        {["Events", "Training", "Fundraising", "Referrals", "Corporate", "General"].map((area) => (
                          <div key={area}><span>{area}</span><b>{contactLogByArea[area] || 0}</b></div>
                        ))}
                      </div>
                    </article>
                  </div>
                </>
              )}

              {managementTab === "designs" && role === "admin" && (
                <div className={styles.designStudio}>
                  <section className={styles.designCommand}>
                    <div>
                      <h3>Design Studio</h3>
                      <p>Campaign briefs, Canva handoff, approvals and finished assets in one place.</p>
                    </div>
                    <div className={styles.designCommandStats}>
                      <span><b>{designAssetsOpen.length}</b> open</span>
                      <span><b>{designAssetsForApproval.length}</b> need approval</span>
                      <span><b>{designAssetsPublished.length}</b> published</span>
                      <span><b>{designCampaigns.length}</b> campaigns</span>
                    </div>
                  </section>

                  <section className={styles.designBriefPanel}>
                    <div className={styles.sectionHeader}>
                      <div>
                        <h3>Campaign brief</h3>
                        <p>Start with the event or campaign, then copy the brief into Canva or create the asset pack.</p>
                      </div>
                      <StatusChip label="Canva ready" />
                    </div>
                    <div className={styles.designBriefGrid}>
                      <label className={styles.field}>Load from event<select value={designBriefDraft.eventId} onChange={(event) => loadDesignBriefFromEvent(event.target.value)}>
                        <option value="">Choose an event</option>
                        {portalEvents.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
                      </select></label>
                      <label className={styles.field}>Campaign<input value={designBriefDraft.campaign} onChange={(event) => setDesignBriefDraft({ ...designBriefDraft, campaign: event.target.value })} /></label>
                      <label className={styles.field}>Date<input value={designBriefDraft.eventDate} onChange={(event) => setDesignBriefDraft({ ...designBriefDraft, eventDate: event.target.value })} /></label>
                      <label className={styles.field}>Location<input value={designBriefDraft.location} onChange={(event) => setDesignBriefDraft({ ...designBriefDraft, location: event.target.value })} /></label>
                      <label className={styles.field}>Audience<textarea value={designBriefDraft.audience} onChange={(event) => setDesignBriefDraft({ ...designBriefDraft, audience: event.target.value })} /></label>
                      <label className={styles.field}>Key message<textarea value={designBriefDraft.keyMessage} onChange={(event) => setDesignBriefDraft({ ...designBriefDraft, keyMessage: event.target.value })} /></label>
                      <label className={styles.field}>Call to action<textarea value={designBriefDraft.action} onChange={(event) => setDesignBriefDraft({ ...designBriefDraft, action: event.target.value })} /></label>
                      <label className={styles.field}>Required assets<textarea value={designBriefDraft.requiredAssets} onChange={(event) => setDesignBriefDraft({ ...designBriefDraft, requiredAssets: event.target.value })} /></label>
                    </div>
                    <label className={styles.field}>Design notes<textarea value={designBriefDraft.notes} onChange={(event) => setDesignBriefDraft({ ...designBriefDraft, notes: event.target.value })} /></label>
                    <div className={styles.emailActions}>
                      <button className={styles.secondary} type="button" onClick={() => copyDesignBrief()}>Copy campaign brief</button>
                      <button className={styles.primary} type="button" onClick={createCampaignDesignPack}>Create campaign pack</button>
                    </div>
                  </section>

                  <section className={styles.designPipeline} aria-label="Design pipeline">
                    {designPipeline.map((stage) => (
                      <div className={styles.pipelineStep} key={stage.status}>
                        <span>{stage.label}</span>
                        <strong>{stage.count}</strong>
                        <small>{stage.detail}</small>
                      </div>
                    ))}
                  </section>

                  <div className={styles.designLayout}>
                    <section className={styles.assetRegister}>
                      <div className={styles.sectionHeader}>
                        <div>
                          <h3>Asset register</h3>
                          <p>Each item has a Canva brief, owner, approval route and export destination.</p>
                        </div>
                      </div>
                      {designAssets.map((asset) => (
                        <article className={styles.designAsset} key={asset.id}>
                          <div className={styles.assetPreview}>
                            <span>{asset.format}</span>
                            <strong>{asset.title}</strong>
                            <small>{asset.campaign}</small>
                          </div>
                          <div className={styles.assetBody}>
                            <div className={styles.cardHeader}>
                              <strong>{asset.title}</strong>
                              <StatusChip label={asset.status} />
                            </div>
                            <p className={styles.meta}>{asset.notes}</p>
                            <div className={styles.assetMetaGrid}>
                              <div><span>Campaign</span><b>{asset.campaign}</b></div>
                              <div><span>Channel</span><b>{asset.channel}</b></div>
                              <div><span>Due</span><b>{asset.dueDate}</b></div>
                              <div><span>Owner</span><b>{asset.owner}</b></div>
                              <div><span>Approver</span><b>{asset.approver}</b></div>
                              <div><span>Export</span><b>{asset.exportName}</b></div>
                              <div><span>Save to</span><b>{asset.destination}</b></div>
                            </div>
                            <div className={styles.emailActions}>
                              <a className={styles.secondary} href={asset.templateUrl} target="_blank" rel="noreferrer" onClick={() => markDesignStatus(asset, "In Canva", "Opened in Canva")}>Open in Canva</a>
                              <button className={styles.quietButton} type="button" onClick={() => copyDesignBrief(asset)}>Copy brief</button>
                              <button className={styles.quietButton} type="button" onClick={() => markDesignStatus(asset, "Needs approval", "Approval requested")}>Request approval</button>
                              <button className={styles.quietButton} type="button" onClick={() => markDesignStatus(asset, "Approved", "Approved")}>Mark approved</button>
                              <label className={styles.quietButton}>
                                Save export
                                <input className={styles.hiddenFile} type="file" multiple onChange={(event) => saveDesignExport(asset, event.target.files)} />
                              </label>
                              <button className={styles.quietButton} type="button" disabled={asset.status === "Published"} onClick={() => publishDesignAsset(asset)}>Publish</button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </section>

                    <aside className={styles.brandPanel}>
                      <div className={styles.cardHeader}>
                        <strong>Brand kit</strong>
                        <span>{brandColours.length}</span>
                      </div>
                      <div className={styles.brandSwatches}>
                        {brandColours.map((colour) => (
                          <div key={colour.value}>
                            <span style={{ backgroundColor: colour.value }} />
                            <b>{colour.value}</b>
                            <small>{colour.label}</small>
                          </div>
                        ))}
                      </div>
                      <div className={styles.compactList}>
                        <div><span>Website</span><b>violetproject.co.uk</b></div>
                        <div><span>Email</span><b>contact@violetproject.co.uk</b></div>
                        <div><span>QR code</span><b>Campaign / event link</b></div>
                        <div><span>Logo</span><b>Skipped for now</b></div>
                        <div><span>Tone</span><b>Warm, direct, practical</b></div>
                      </div>
                      <div className={styles.designHandoff}>
                        <strong>Canva handoff</strong>
                        <p>Open the template, paste the brief, export the finished file, then save it back here for approval and publishing.</p>
                      </div>
                    </aside>
                  </div>

                  <div className={styles.queueGrid}>
                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>Design history</strong>
                        <span>{designLog.length}</span>
                      </div>
                      {designLog.slice(0, 10).map((entry) => (
                        <div className={styles.actionItem} key={entry.id}>
                          <div>
                            <b>{entry.action}: {entry.assetTitle}</b>
                            <span>{entry.campaign} - {entry.at}<br />{entry.detail}</span>
                          </div>
                        </div>
                      ))}
                    </article>
                    <article className={styles.card}>
                      <strong>Publishing destinations</strong>
                      <div className={styles.compactList}>
                        <div><span>Event resources</span><b>{sharedFiles.filter((file) => file.area === "Event resources").length}</b></div>
                        <div><span>Design exports queued</span><b>{sharedFiles.filter((file) => file.uploadedBy === (name || "Admin")).length}</b></div>
                        <div><span>Canva-ready assets</span><b>{designAssetsOpen.length}</b></div>
                        <div><span>Approval owner</span><b>Melanie / Management</b></div>
                      </div>
                    </article>
                  </div>
                </div>
              )}

              {managementTab === "services" && (
                <>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3>Counselling and service delivery</h3>
                      <p>Referral triage, waiting list, allocation, appointment admin and outcome follow-up.</p>
                    </div>
                    <p className={styles.integrationNote}>Restricted records: admin status only</p>
                  </div>

                  <div className={styles.notice}>
                    Sensitive counselling notes are not shown in this general hub. Staff can track referral status, waiting time, allocation and admin actions; private notes need restricted service access.
                  </div>

                  <div className={styles.managementSummary}>
                    {serviceWorkload.map((item) => (
                      <button
                        className={`${styles.workloadCard} ${styles.workloadButton}`}
                        key={item.label}
                        type="button"
                        onClick={item.action}
                      >
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                        {item.detail && <small>{item.detail}</small>}
                      </button>
                    ))}
                  </div>

                  <div className={styles.subTabs} aria-label="Service referral filters">
                    {(["All", "New", "Waiting", "Urgent", "Unallocated", "Active", "Outcome due"] as ServiceFilter[]).map((filter) => (
                      <button
                        className={`${styles.subTab} ${serviceFilter === filter ? styles.subTabActive : ""}`}
                        key={filter}
                        type="button"
                        onClick={() => setServiceFilter(filter)}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>

                  <div className={styles.managementGrid}>
                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>Add referral</strong>
                        <span>{serviceNewReferrals.length}</span>
                      </div>
                      <form className={styles.formGrid} onSubmit={addServiceReferral}>
                        <label className={styles.field}>Client/reference name<input value={serviceReferralDraft.clientName} onChange={(event) => setServiceReferralDraft({ ...serviceReferralDraft, clientName: event.target.value })} placeholder="Use initials if needed" /></label>
                        <label className={styles.field}>Source<select value={serviceReferralDraft.referralSource} onChange={(event) => setServiceReferralDraft({ ...serviceReferralDraft, referralSource: event.target.value as ServiceReferral["referralSource"] })}>
                          <option>Self referral</option>
                          <option>GP</option>
                          <option>School</option>
                          <option>Partner</option>
                          <option>Internal</option>
                          <option>Other</option>
                        </select></label>
                        <label className={styles.field}>Region<input value={serviceReferralDraft.region} onChange={(event) => setServiceReferralDraft({ ...serviceReferralDraft, region: event.target.value })} placeholder="Region or area" /></label>
                        <label className={styles.field}>Urgency<select value={serviceReferralDraft.urgency} onChange={(event) => setServiceReferralDraft({ ...serviceReferralDraft, urgency: event.target.value as ServiceUrgency })}>
                          <option>Routine</option>
                          <option>Priority</option>
                          <option>Urgent</option>
                        </select></label>
                        <label className={styles.field}>Support type<select value={serviceReferralDraft.preferredSupport} onChange={(event) => setServiceReferralDraft({ ...serviceReferralDraft, preferredSupport: event.target.value as ServiceReferral["preferredSupport"] })}>
                          <option>Assessment</option>
                          <option>Counselling</option>
                          <option>Peer support</option>
                          <option>Group support</option>
                          <option>Signposting</option>
                        </select></label>
                        <label className={styles.field}>Contact method<input value={serviceReferralDraft.contactMethod} onChange={(event) => setServiceReferralDraft({ ...serviceReferralDraft, contactMethod: event.target.value })} placeholder="Phone, email, time preference" /></label>
                        <label className={styles.field}>Next action<textarea value={serviceReferralDraft.nextAction} onChange={(event) => setServiceReferralDraft({ ...serviceReferralDraft, nextAction: event.target.value })} placeholder="Book triage, call back, request consent..." /></label>
                        <button className={styles.primary} type="submit">Add to triage</button>
                      </form>
                    </article>

                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>Pathway</strong>
                        <span>{serviceOpenReferrals.length}</span>
                      </div>
                      {servicePathway.map((stage) => {
                        const count = serviceReferrals.filter((referral) => referral.status === stage.status).length;
                        return (
                          <div className={styles.actionItem} key={stage.label}>
                            <div>
                              <b>{stage.label}</b>
                              <span>{stage.detail}</span>
                            </div>
                            <span className={styles.statusChip}>{count}</span>
                          </div>
                        );
                      })}
                    </article>
                  </div>

                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Referral</th>
                          <th>Region</th>
                          <th>Wait</th>
                          <th>Need</th>
                          <th>Status</th>
                          <th>Assigned</th>
                          <th>Consent</th>
                          <th>Safeguarding</th>
                          <th>Outcome</th>
                          <th>Next action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredServiceReferrals.map((referral) => (
                          <tr key={referral.id}>
                            <td><strong>{referral.reference}</strong><br />{referral.clientName}<br /><span className={styles.meta}>{referral.referralSource}</span></td>
                            <td>{referral.region}</td>
                            <td>{referral.waitingDays}d</td>
                            <td>{referral.preferredSupport}<br /><span className={referral.urgency === "Urgent" ? styles.statusWarn : styles.statusInfo}>{referral.urgency}</span></td>
                            <td><select value={referral.status} onChange={(event) => updateServiceReferral(referral.id, { status: event.target.value as ServiceReferralStatus })}>
                              <option>New referral</option>
                              <option>Triage booked</option>
                              <option>Waiting list</option>
                              <option>Allocated</option>
                              <option>Active support</option>
                              <option>Closed</option>
                            </select></td>
                            <td><input value={referral.assignedTo} onChange={(event) => updateServiceReferral(referral.id, { assignedTo: event.target.value })} placeholder="Worker" /></td>
                            <td><select value={referral.consentStatus} onChange={(event) => updateServiceReferral(referral.id, { consentStatus: event.target.value as ServiceReferral["consentStatus"] })}>
                              <option>Consent needed</option>
                              <option>Consent recorded</option>
                            </select></td>
                            <td><select value={referral.safeguardingFlag} onChange={(event) => updateServiceReferral(referral.id, { safeguardingFlag: event.target.value as ServiceReferral["safeguardingFlag"] })}>
                              <option>None</option>
                              <option>Check needed</option>
                              <option>Escalated</option>
                            </select></td>
                            <td><select value={referral.outcomeStatus} onChange={(event) => updateServiceReferral(referral.id, { outcomeStatus: event.target.value as ServiceReferral["outcomeStatus"] })}>
                              <option>Not started</option>
                              <option>Baseline due</option>
                              <option>Review due</option>
                              <option>Completed</option>
                            </select></td>
                            <td><textarea value={referral.nextAction} onChange={(event) => updateServiceReferral(referral.id, { nextAction: event.target.value })} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.queueGrid}>
                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>Session admin log</strong>
                        <span>{serviceSessions.length}</span>
                      </div>
                      {serviceSessions.map((session) => {
                        const referral = serviceReferrals.find((item) => item.id === session.referralId);
                        return (
                          <div className={styles.actionItem} key={session.id}>
                            <div>
                              <b>{referral?.reference || "Unknown referral"} - {session.date}</b>
                              <span>{session.worker} - {session.format}<br />{session.nextStep}</span>
                            </div>
                            <div className={styles.inlineActions}>
                              <select value={session.attendance} onChange={(event) => updateServiceSession(session.id, { attendance: event.target.value as ServiceSession["attendance"] })}>
                                <option>Booked</option>
                                <option>Attended</option>
                                <option>Cancelled</option>
                                <option>No-show</option>
                              </select>
                              <select value={session.adminStatus} onChange={(event) => updateServiceSession(session.id, { adminStatus: event.target.value as ServiceSession["adminStatus"] })}>
                                <option>Notes locked</option>
                                <option>Follow-up due</option>
                                <option>Outcome due</option>
                                <option>Closed</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </article>

                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>Counsellor capacity</strong>
                        <span>{counsellorCapacity.length}</span>
                      </div>
                      {counsellorCapacity.map((worker) => (
                        <div className={styles.actionItem} key={worker.name}>
                          <div>
                            <b>{worker.name}</b>
                            <span>{worker.role} - {worker.region}</span>
                          </div>
                          <span className={worker.active >= worker.capacity ? styles.statusWarn : styles.statusGood}>
                            {worker.active}/{worker.capacity}
                          </span>
                        </div>
                      ))}
                    </article>
                  </div>

                  <div className={styles.queueGrid}>
                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>Privacy boundaries</strong>
                        <span>Locked</span>
                      </div>
                      <div className={styles.compactList}>
                        <div><span>Admin view</span><b>Status, allocation, waits, attendance</b></div>
                        <div><span>Restricted view</span><b>Session notes and clinical detail</b></div>
                        <div><span>Storage area</span><b>Restricted service referrals</b></div>
                        <div><span>Audit need</span><b>Viewed, edited, exported</b></div>
                      </div>
                    </article>

                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>Regional service breakdown</strong>
                        <span>{regionalServices.length}</span>
                      </div>
                      <div className={styles.tableWrap}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>Region</th>
                              <th>Referrals</th>
                              <th>Waiting</th>
                              <th>Flagged</th>
                              <th>Open emails</th>
                              <th>Contacts</th>
                              <th>Contact actions</th>
                              <th>Fundraising</th>
                            </tr>
                          </thead>
                          <tbody>
                            {serviceRegionRows.map((service) => (
                              <tr key={service.region}>
                                <td><strong>{service.region}</strong></td>
                                <td>{service.serviceReferrals}</td>
                                <td>{service.serviceWaiting}</td>
                                <td>{service.serviceUrgent}</td>
                                <td>{service.openEmails}</td>
                                <td>{contactProfiles.filter((contact) => contact.region === service.region).length}</td>
                                <td>{contactLogByRegion[service.region] || 0}</td>
                                <td>{service.fundraisingFollowUps}</td>
                              </tr>
                            ))}
                            {!serviceRegionRows.length && (
                              <tr>
                                <td colSpan={8}>No regional service data connected yet.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  </div>
                </>
              )}

              {managementTab === "resources" && (
                <>
                  <article
                    className={styles.dropZone}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      addSharedFiles(event.dataTransfer.files);
                    }}
                  >
                    <div>
                      <strong>Shared file drop</strong>
                      <p>Drag files here from OneDrive or your computer, check visibility, then publish them into the hub resource library.</p>
                    </div>
                    <div className={styles.filterBar}>
                      <label className={styles.field}>Area<select value={sharedFileArea} onChange={(event) => setSharedFileArea(event.target.value as SharedFile["area"])}>
                        <option>Policies</option>
                        <option>Training materials</option>
                        <option>Event resources</option>
                        <option>General</option>
                      </select></label>
                      <label className={styles.field}>Visible to<select value={sharedFileVisibility} onChange={(event) => setSharedFileVisibility(event.target.value as SharedFile["visibleTo"])}>
                        <option>Everyone</option>
                        <option>Managers only</option>
                      </select></label>
                    </div>
                    <div className={styles.emailActions}>
                      <label className={styles.secondary}>Choose files<input className={styles.hiddenFile} type="file" multiple onChange={(event) => addSharedFiles(event.target.files)} /></label>
                      <button className={styles.secondary} type="button">Access my OneDrive</button>
                    </div>
                  </article>
                  <div className={styles.cards}>
                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>Shared files queued</strong>
                        <span>{sharedFiles.length}</span>
                      </div>
                      {sharedFiles.slice(0, 8).map((file) => (
                        <div className={styles.actionItem} key={file.id}>
                          <div>
                            <b>{file.name}</b>
                            <span>{file.area} - {file.visibleTo} - added {file.uploadedAt}<br />Sync: {file.syncStatus}</span>
                          </div>
                          <StatusChip label={file.syncStatus} />
                        </div>
                      ))}
                      {!sharedFiles.length && <p className={styles.meta}>No shared files queued yet.</p>}
                    </article>
                    <article className={styles.card}>
                      <strong>Resource library health</strong>
                      <div className={styles.compactList}>
                        <div><span>Policies</span><b>{portalResources.filter((resource) => resource.type === "Policy").length}</b></div>
                        <div><span>Training materials</span><b>{portalResources.filter((resource) => resource.type === "Training").length}</b></div>
                        <div><span>Queued uploads</span><b>{sharedFiles.length}</b></div>
                        <div><span>Visible to everyone</span><b>{sharedFiles.filter((file) => file.visibleTo === "Everyone").length}</b></div>
                      </div>
                    </article>
                  </div>
                </>
              )}

              {managementTab === "compliance" && <div className={styles.cards}>
                <article className={styles.card}>
                  <strong>DBS and training</strong>
                  {complianceItems.map((profile) => (
                    <div className={styles.actionItem} key={profile.id}>
                      <div>
                        <b>{profile.name}</b>
                        <span>DBS expires {profile.dbsExpiry}; training due {profile.trainingDue}</span>
                      </div>
                      <button className={styles.quietButton} type="button" onClick={() => createManagerTask({
                        title: isDbsSoon(profile.dbsExpiry) ? "DBS renewal needed" : "Training due",
                        volunteerName: profile.name,
                        owner: name || "Manager",
                        dueDate: profile.dbsExpiry,
                        source: "DBS",
                        detail: `DBS expiry ${profile.dbsExpiry}; training due ${profile.trainingDue}.`,
                      })}>Assign task</button>
                    </div>
                  ))}
                  {!complianceItems.length && <p className={styles.meta}>No DBS or training items due.</p>}
                </article>
              </div>}

              {managementTab === "reports" && (
                <>
                  <section className={styles.reportStudio}>
                    <div>
                      <span className={styles.meta}>AI-ready PowerPoint creator</span>
                      <h3>Briefing pack generator</h3>
                      <p>
                        Build a trustee update, impact report, event briefing or regional pack from portal data.
                        The portal creates the structured deck brief now; the live build can turn this same pack into
                        an editable PowerPoint and save it back to the hub.
                      </p>
                    </div>
                    <div className={styles.reportControlGrid}>
                      <label className={styles.field}>Report period<select value={reportRange} onChange={(event) => setReportRange(event.target.value)}>
                        <option>This month</option>
                        <option>Last month</option>
                        <option>This year</option>
                        <option>Custom range</option>
                      </select></label>
                      <label className={styles.field}>Pack type<select value={reportPackDraft.template} onChange={(event) => setReportPackDraft({ ...reportPackDraft, template: event.target.value })}>
                        {reportPackTemplates.map((template) => <option key={template}>{template}</option>)}
                      </select></label>
                      <label className={styles.field}>Audience<input value={reportPackDraft.audience} onChange={(event) => setReportPackDraft({ ...reportPackDraft, audience: event.target.value })} /></label>
                      <label className={styles.field}>Focus<textarea value={reportPackDraft.focus} onChange={(event) => setReportPackDraft({ ...reportPackDraft, focus: event.target.value })} /></label>
                    </div>
                    <div className={styles.emailActions}>
                      <button className={styles.primary} type="button" onClick={generateReportPack}>Generate briefing pack</button>
                      <button className={styles.secondary} type="button" onClick={generateTrusteePack}>Generate trustee pack</button>
                      <button className={styles.secondary} type="button" onClick={() => copyReportPack()}>Copy PowerPoint brief</button>
                      <button className={styles.quietButton} type="button" onClick={() => downloadReportPack()}>Download outline</button>
                    </div>
                    {generatedReportPack && (
                      <label className={styles.field}>
                        Generated deck outline
                        <textarea value={generatedReportPack} onChange={(event) => setGeneratedReportPack(event.target.value)} />
                      </label>
                    )}
                  </section>

                  <div className={styles.managementSummary}>
                    {reportCards.map((item) => (
                      <article className={styles.workloadCard} key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </article>
                    ))}
                  </div>
                  <div className={styles.queueGrid}>
                    <article className={styles.card}>
                      <strong>Export centre</strong>
                      <div className={styles.emailActions}>
                        <button className={styles.secondary} type="button" onClick={exportManagement}>Monthly summary</button>
                        <button className={styles.secondary} type="button" onClick={exportExpenses}>Expense report</button>
                        <button className={styles.secondary} type="button" onClick={exportHours}>Hours report</button>
                        <button className={styles.secondary} type="button" onClick={exportCheckIns}>Check-in report</button>
                        <button className={styles.secondary} type="button" onClick={exportFeedback}>Feedback report</button>
                      </div>
                    </article>
                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>Saved briefing packs</strong>
                        <span>{reportPacks.length}</span>
                      </div>
                      {reportPacks.slice(0, 5).map((pack) => (
                        <div className={styles.actionItem} key={pack.id}>
                          <div>
                            <b>{pack.title}</b>
                            <span>{pack.audience} - {pack.generatedAt}<br />{pack.sections.length} slides; save to {pack.destination}</span>
                          </div>
                          <div className={styles.inlineActions}>
                            <StatusChip label={pack.status} />
                            <button className={styles.quietButton} type="button" onClick={() => copyReportPack(pack)}>Copy</button>
                            <button className={styles.quietButton} type="button" onClick={() => downloadReportPack(pack)}>Download</button>
                          </div>
                        </div>
                      ))}
                      {!reportPacks.length && <p className={styles.meta}>No briefing packs generated yet.</p>}
                    </article>
                    <article className={styles.card}>
                      <strong>Audit trail</strong>
                      {auditTrail.map((item) => (
                        <div className={styles.actionItem} key={`${item.title}-${item.detail}`}>
                          <div>
                            <b>{item.title}</b>
                            <span>{item.detail}</span>
                          </div>
                        </div>
                      ))}
                      {!auditTrail.length && <p className={styles.meta}>No activity yet.</p>}
                    </article>
                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>Smart receipt review</strong>
                        <span>{smartExpenseQueue.length}</span>
                      </div>
                      {smartExpenseQueue.map((expense) => (
                        <div className={styles.actionItem} key={expense.id}>
                          <div>
                            <b>{expense.claimantName}: {expense.type} {money(expense.amount)}</b>
                            <span>{expense.evidenceFile || expense.evidence || "No file name"}<br />{expense.receiptSuggestion || "Check date, amount, supplier and category."}</span>
                          </div>
                          <button className={styles.quietButton} type="button" onClick={() => createExpenseAiTask(expense)}>Create check task</button>
                        </div>
                      ))}
                      {!smartExpenseQueue.length && <p className={styles.meta}>Receipt and mileage reads will appear here once claims are submitted.</p>}
                    </article>
                  </div>
                </>
              )}

              {managementTab === "integrations" && role === "admin" && (
                <>
                  <div className={styles.cards}>
                    {integrationStatus.map((item) => (
                      <article className={styles.card} key={item.label}>
                        <div className={styles.cardHeader}>
                          <strong>{item.label}</strong>
                          <StatusChip label={item.status} />
                        </div>
                        <p>{item.detail}</p>
                        <div className={styles.emailActions}>
                          <button className={styles.secondary} type="button" disabled={microsoftStatusBusy} onClick={refreshMicrosoftStatus}>
                            {item.label === "OneDrive" ? "Check publish folder" : `Check ${item.label}`}
                          </button>
                          {item.label === "Mailbox" && <button className={styles.quietButton} type="button" onClick={() => setManagementTab("mailbox")}>Open mailbox</button>}
                        </div>
                      </article>
                    ))}
                  </div>
                  <article className={styles.card}>
                    <div className={styles.cardHeader}>
                      <strong>Hidden sync dashboard</strong>
                      <StatusChip label="Portal first" />
                    </div>
                    <p className={styles.meta}>This is the management view of the background plumbing. Staff still use the portal; this only shows whether records are ready to move into the hidden storage layer.</p>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Area</th>
                            <th>Backend target</th>
                            <th>Mode</th>
                            <th>Pending</th>
                            <th>Health</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {syncHealthRows.map((row) => (
                            <tr key={row.area}>
                              <td><strong>{row.area}</strong><br />{row.notes}</td>
                              <td>{row.sharePointTarget}</td>
                              <td>{row.syncMode}</td>
                              <td>{row.pending}</td>
                              <td><StatusChip label={row.health} /><br />{row.lastRun}</td>
                              <td><button className={styles.quietButton} type="button" onClick={() => markSyncAreaChecked(row.area)}>Mark checked</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </article>
                </>
              )}

              {managementTab === "data" && role === "admin" && (
                <>
                  <div className={styles.managementSummary}>
                    <article className={styles.workloadCard}><span>Expense records</span><strong>{expenses.length}</strong></article>
                    <article className={styles.workloadCard}><span>Hour records</span><strong>{hours.length}</strong></article>
                    <article className={styles.workloadCard}><span>Custom events</span><strong>{customEvents.length}</strong></article>
                    <article className={styles.workloadCard}><span>Queued files</span><strong>{sharedFiles.length}</strong></article>
                    <article className={styles.workloadCard}><span>Not synced</span><strong>{syncIssueCount}</strong></article>
                  </div>
                  <article className={styles.card}>
                    <strong>SharePoint data mapping</strong>
                    <p className={styles.meta}>Staff use the hub. SharePoint stores these lists and libraries behind it.</p>
                    <div className={styles.compactList}>
                      <div><span>Expense Claims</span><b>Claim fields, approval status, payment date, manager note</b></div>
                      <div><span>Expense Evidence</span><b>Receipt/document library linked by claim ID</b></div>
                      <div><span>Volunteer Hours</span><b>Hours, event, status, query message, approval history</b></div>
                      <div><span>Volunteer Profiles</span><b>Contact, emergency contact, availability, DBS date</b></div>
                      <div><span>Manager Tasks</span><b>Owner, due date, source record, status</b></div>
                      <div><span>Mailbox Log</span><b>Admin emails matched to people, regions, services and follow-up tasks</b></div>
                      <div><span>Events Calendar</span><b>Portal events and imported Outlook calendar items</b></div>
                      <div><span>Shared Documents</span><b>Published files from OneDrive into shared resource areas</b></div>
                    </div>
                  </article>
                </>
              )}

              {managementTab === "settings" && (
                <>
                  <div className={styles.managementGrid}>
                    {role === "admin" && (
                      <article className={styles.card}>
                        <div className={styles.cardHeader}>
                          <strong>Client branding and setup</strong>
                          <StatusChip label={demoMode ? "Demo mode" : "Real mode"} />
                        </div>
                        <div className={styles.formGrid}>
                          <label className={styles.field}>Organisation name<input value={clientSettings.organisationName} onChange={(event) => setClientSettings({ ...clientSettings, organisationName: event.target.value })} /></label>
                          <label className={styles.field}>Portal URL<input value={clientSettings.portalUrl} onChange={(event) => setClientSettings({ ...clientSettings, portalUrl: event.target.value })} /></label>
                          <label className={styles.field}>Website URL<input value={clientSettings.websiteUrl} onChange={(event) => setClientSettings({ ...clientSettings, websiteUrl: event.target.value })} /></label>
                          <label className={styles.field}>Admin email<input value={clientSettings.adminMailbox} onChange={(event) => setClientSettings({ ...clientSettings, adminMailbox: event.target.value })} /></label>
                          <label className={styles.field}>Management email<input value={clientSettings.managementMailbox} onChange={(event) => setClientSettings({ ...clientSettings, managementMailbox: event.target.value })} /></label>
                          <label className={styles.field}>Manager name<input value={clientSettings.managerName} onChange={(event) => setClientSettings({ ...clientSettings, managerName: event.target.value })} /></label>
                          <label className={styles.field}>Admin lead<input value={clientSettings.adminLeadName} onChange={(event) => setClientSettings({ ...clientSettings, adminLeadName: event.target.value })} /></label>
                          <label className={styles.field}>Mileage rate, pence per mile<input inputMode="decimal" value={clientSettings.mileageRatePence} onChange={(event) => setClientSettings({ ...clientSettings, mileageRatePence: event.target.value })} /></label>
                          <label className={styles.field}>Primary colour<input value={clientSettings.primaryColour} onChange={(event) => setClientSettings({ ...clientSettings, primaryColour: event.target.value })} /></label>
                          <label className={styles.field}>Accent colour<input value={clientSettings.accentColour} onChange={(event) => setClientSettings({ ...clientSettings, accentColour: event.target.value })} /></label>
                          <label className={styles.field}>Logo status<input value={clientSettings.logoStatus} onChange={(event) => setClientSettings({ ...clientSettings, logoStatus: event.target.value })} /></label>
                        </div>
                        <label className={styles.checkboxField}>
                          <input type="checkbox" checked={demoMode} onChange={(event) => setDemoMode(event.target.checked)} />
                          Show labelled sample records for demos
                        </label>
                        <p className={styles.meta}>Real mode stays empty unless real profiles, tasks, files or events are added.</p>
                      </article>
                    )}
                    {role !== "admin" && <article className={styles.card}>
                      <strong>Integrations</strong>
                      <div className={styles.compactList}>
                        <div><span>SharePoint</span><b>Background storage and sync</b></div>
                        <div><span>OneDrive</span><b>Private files can be selected then published to the hub</b></div>
                        <div><span>Mailbox</span><b>contact@violetproject.co.uk</b></div>
                        <div><span>Google Maps</span><b>Automatic mileage lookup needs a private key</b></div>
                      </div>
                      <div className={styles.emailActions}>
                        <button className={styles.secondary} type="button">Connect SharePoint</button>
                        <button className={styles.secondary} type="button">Access my OneDrive</button>
                        <button className={styles.quietButton} type="button" onClick={() => setManagementTab("mailbox")}>Open mailbox setup</button>
                      </div>
                    </article>}
                    <article className={styles.card}>
                      <strong>Permissions</strong>
                      <div className={styles.compactList}>
                        <div><span>Volunteers</span><b>Own hours, expenses, events, profile, resources</b></div>
                        <div><span>Managers</span><b>Approvals, volunteers, events, mailbox, reports</b></div>
                        <div><span>Admins</span><b>Users, integrations, data mapping and system settings</b></div>
                        <div><span>Finance</span><b>Expense approval, payment batches, reports</b></div>
                        <div><span>Admin inbox</span><b>Restricted email, certificate, fundraising and contact follow-up</b></div>
                      </div>
                    </article>
                    <article className={styles.card}>
                      <div className={styles.cardHeader}>
                        <strong>Permissions preview</strong>
                        <StatusChip label="Ready" />
                      </div>
                      <label className={styles.field}>
                        View role
                        <select value={permissionPreviewRole} onChange={(event) => setPermissionPreviewRole(event.target.value as PermissionPreviewRole)}>
                          <option value="volunteer">Volunteer</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                          <option value="finance">Finance</option>
                        </select>
                      </label>
                      <div className={styles.timeline}>
                        {permissionPreviewRows[permissionPreviewRole].map((item) => (
                          <div className={styles.timelineItem} key={item}>
                            <b>{item}</b>
                            <span>{permissionPreviewRole === "volunteer" ? "Visible in the volunteer hub." : "Visible in staff/admin tools only."}</span>
                          </div>
                        ))}
                      </div>
                    </article>
                    <article className={styles.card}>
                      <strong>System preferences</strong>
                      <div className={styles.compactList}>
                        <div><span>Default mailbox</span><b>contact@violetproject.co.uk</b></div>
                        <div><span>Hub mode</span><b>SharePoint behind the scenes</b></div>
                        <div><span>Install prompt</span><b>{role === "admin" ? "Hidden from admin workflow" : "Available"}</b></div>
                        <div><span>Current access</span><b>{role}</b></div>
                      </div>
                    </article>
                  </div>
                  {role !== "admin" && <article className={styles.card}>
                    <strong>Data mapping for SharePoint</strong>
                    <p className={styles.meta}>Staff should not need to open these lists directly. The hub is the front door; SharePoint stores and syncs the records behind it.</p>
                    <div className={styles.compactList}>
                      <div><span>Expense Claims</span><b>Claim fields, approval status, payment date, manager note</b></div>
                      <div><span>Expense Evidence</span><b>Receipt/document library linked by claim ID</b></div>
                      <div><span>Volunteer Hours</span><b>Hours, event, status, query message, approval history</b></div>
                      <div><span>Volunteer Profiles</span><b>Contact, emergency contact, availability, DBS date</b></div>
                      <div><span>Manager Tasks</span><b>Owner, due date, source record, status</b></div>
                      <div><span>Mailbox Log</span><b>Admin emails matched to people, regions, services and follow-up tasks</b></div>
                      <div><span>Events Calendar</span><b>Portal events and imported Outlook calendar items</b></div>
                      <div><span>Shared Documents</span><b>Published files from OneDrive into shared resource areas</b></div>
                    </div>
                  </article>}
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className={styles.stat}>
      <span>{label}</span>
      <strong>{value}</strong>
      <span>{detail}</span>
    </div>
  );
}

function EmptyState({
  title,
  detail,
  actionLabel,
  onAction,
}: {
  title: string;
  detail: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <article className={styles.emptyState}>
      <span aria-hidden="true">+</span>
      <strong>{title}</strong>
      <p>{detail}</p>
      {actionLabel && onAction && (
        <button className={styles.quietButton} type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </article>
  );
}

function StatusChip({ label }: { label: string }) {
  const tone = [
    "Approved",
    "Paid",
    "Synced",
    "Current",
    "Done",
    "Confirmed",
    "Closed",
    "Yes",
    "Low",
    "Ready",
    "Draft ready",
    "Copied",
    "Exported",
    "Portal first",
    "Brief ready",
    "Configured",
    "Runtime ready",
    "Selective publish",
    "Target ready",
    "Certificate issued",
    "Completed, no certificate needed",
    "Assigned",
  ].includes(label)
    ? "Good"
    : [
        "Overdue",
        "Urgent",
        "Needs evidence",
        "Query",
        "Needs review",
        "Sync issue",
        "Not synced",
        "Not connected",
        "Needs key",
        "Planned",
        "Target ready, auth pending",
        "Target missing",
        "Reply needed",
        "Waiting for confirmation",
        "Waiting for certificate",
        "Waiting",
        "Needs follow-up",
        "Invite to send",
        "Awaiting reply",
        "No",
        "High",
        "Chase due",
        "Missing",
        "Needs update",
      ].includes(label)
      ? "Warn"
      : "Info";

  return <span className={`${styles.statusChip} ${styles[`status${tone}`]}`}>{label}</span>;
}

function InstallCard({
  installStatus,
  isIosSafari,
  showNotificationPrefs,
  notificationPrefs,
  onInstall,
  onShowPrefs,
  onTogglePref,
}: {
  installStatus: InstallStatus;
  isIosSafari: boolean;
  showNotificationPrefs: boolean;
  notificationPrefs: string[];
  onInstall: () => void;
  onShowPrefs: () => void;
  onTogglePref: (channel: string) => void;
}) {
  return (
    <article className={styles.card}>
      <strong>Save to phone</strong>
      <p>
        Add the portal to your phone so it opens like an app. If your browser
        supports it, the next button opens the phone&apos;s install prompt.
      </p>
      <div className={styles.buttonRow}>
        <button className={styles.primary} type="button" onClick={onInstall}>
          {installStatus === "ready"
            ? "Install now"
            : installStatus === "installed"
              ? "Installed"
              : "Set up on this phone"}
        </button>
        <button className={styles.secondary} type="button" onClick={onShowPrefs}>
          Reminder preferences
        </button>
      </div>
      {(installStatus === "instructions" || isIosSafari) && (
        <ol className={styles.steps}>
          <li>On iPhone, open this page in Safari.</li>
          <li>Tap the Share button.</li>
          <li>Choose Add to Home Screen.</li>
          <li>Open Violet Project from your home screen.</li>
        </ol>
      )}
      {showNotificationPrefs && (
        <div className={styles.prefBox}>
          <strong>Reminder preferences</strong>
          <p>Choose the reminders you want.</p>
          {notificationChannels.map((channel) => (
            <label className={styles.checkboxField} key={channel}>
              <input
                type="checkbox"
                checked={notificationPrefs.includes(channel)}
                onChange={() => onTogglePref(channel)}
              />
              {channel}
            </label>
          ))}
          <p className={styles.meta}>
            {notificationSubscriptionService.name}: {notificationSubscriptionService.currentVersion}
          </p>
        </div>
      )}
    </article>
  );
}

function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.logoBrand}>
        <Image className={styles.logoMark} src="/violet-project-logo-real.png" alt="Violet Project" width={1700} height={1120} priority />
      </div>
    </header>
  );
}
