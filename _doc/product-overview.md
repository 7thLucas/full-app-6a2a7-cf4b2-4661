# Product Overview — AttendSure (working name)

> Single source of truth for the product. "AttendSure" is a provisional working name
> pending the owner's confirmation during scoping.

## What it is
A simple web app that gives HR teams **attendance integrity** plus a place to manage
employee **SOPs / rules**. Employees clock in with a **face capture** that must be
validated as a real human face before the check-in counts; HR uploads the policy
documents employees operate under and watches a compliance dashboard.

## The problem
Manual attendance is easy to game — buddy-punching (one person clocking in for another)
quietly inflates hours and erodes trust. At the same time, the SOPs and rules employees
are supposed to follow live in scattered files nobody reads. HR has no single, credible
view of who actually showed up and whether attendance met the agreed standard.

## The solution
- **Face-verified check-in.** Employees submit a face capture for attendance. The system
  validates it: a real human face → **valid**; not a human face → **invalid**. This
  removes the easiest form of attendance fraud.
- **SOP / rules library.** HR uploads documents describing employee rules and procedures,
  giving everyone one authoritative place for policy.
- **SLA / compliance dashboard.** HR sees, at a glance, whether each employee validly
  attended — turning raw check-ins into a clear attendance-integrity signal.

## Users & roles
- **HR (admin):** uploads SOP/rules documents; views the SLA / attendance-validity
  dashboard across employees.
- **Employee:** views applicable SOPs/rules; submits a face capture to record attendance.

## Core workflow (the verified operation)
The domain event the app exists to perform is a **verified attendance check-in**: an
employee submits a face capture that the system confirms is a real human face, recording
a valid attendance for that day. SOP acknowledgements are a secondary operation.

## Scope & principles
- **Simple UI** is a hard requirement — clean, minimal, fast to use on both roles.
- Day-one focus: trustworthy face-validated attendance + an HR dashboard that makes
  validity obvious. SOP upload supports that, not the other way around.
- Validation is binary and explicit: human face = OK, non-human face = invalid.

## Open / to confirm
- Final product name.
- Team size, number of locations, and check-in frequency (needed to quantify impact).
- Whether SLA targets (e.g. required valid check-ins per week) are configurable by HR.
