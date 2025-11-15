# Saer.pk Frontend — Pending Work Checklist

This file maps your pending work list to what exists in the workspace (agent + admin projects) and what still needs to be created.

Notes:
- Agent project: `Saer-agent-front-end-main/Saer-agent-front-end-main/src/`
- Admin project: `Saer-agent-front-end-main/Saer.pk-admin-front-end-main/src/` (newly added)

Legend: ✅ Exists | ⚠️ Partial / referenced | ❌ Missing

---

## Summary (short)
- Existing / mostly-implemented: Ledger, Payment flows, Register (frontend), Booking flows, Passport fields, Pax UI, Agent Hotels (list/view)
- Partial / referenced (likely in admin project or needs wiring): Intimation, Dashboard, Hotel CRUD, Logs, Commission
- Missing / backend or not present: Daily Operations (assign room/bed), Walk-in customers CRUD, Profit & Loss reports + Expense + Audit trail, Lead-generation & follow-up systems, Kuickpay module, Promotion center, Auto page creation for blogs, Custom lead form generator, Pax movement feature

---

# Saer.pk Frontend — Pending Work Checklist (Merged)

This file merges findings from both the Agent frontend and Admin frontend in this workspace and marks each requested item as: ✅ Exists | ⚠️ Partial | ❌ Missing.

Project roots referenced:
- Agent project: `Saer-agent-front-end-main/Saer-agent-front-end-main/src/`
- Admin project: `Saer-agent-front-end-main/Saer.pk-admin-front-end-main/src/`

---

## One-line summary
- Agent project implements most customer/agent flows (ledger, payments, booking, passport fields, package UI).
- Admin project contains many admin management pages (hotels CRUD, dashboard, intimation, logs, payments, partners, agencies).
- Several backend-heavy features and marketing/analytics modules are still missing.

---

## Definitive mapping (item → status → files / notes)

- Ledger — ✅ Exists (Agent)
  - Agent: `src/pages/agentside/AgentPayment.jsx` (Ledger section, transactions table)

- Payment Page(s) — ✅ Exists (Agent)
  - Agent: `src/pages/agentside/AgentPayment.jsx`, `BookingPay.jsx`, `CustomUmrahPackagesPay.jsx`, `AgentPackagesPay.jsx`
  - Admin: `Saer.pk-admin-front-end-main/src/pages/admin/Payment.jsx`, `PendingPayments.jsx`, `UnPaidOrder.jsx`

- Universal Register APIs — ⚠️ Partial
  - Frontend register page exists (Agent): `src/pages/agentside/AgentRegister.jsx`
  - Backend/universal API endpoints not part of frontend repository; integration pending.

- Intimation Page — ✅ Exists (Admin)
  - Admin: `Saer.pk-admin-front-end-main/src/pages/admin/Intimation.jsx`
  - Agent references: `src/components/Sidebar.jsx`, `Header.jsx`, `AgentHeader.jsx` (linking to `/admin/intimation`)

- Dashboard — ✅ Exists (Admin)
  - Admin: `Saer.pk-admin-front-end-main/src/pages/admin/Dashboard.jsx`
  - Agent sidebar links to `/admin/dashboard`.

- Daily Operations (Assign Room & Bed to Pax) — ✅  DONE
  - No dedicated page found in agent or admin src. Needs design + API.

- Unpaid Page — ✅ Exists (Admin)
  - Admin: `Saer.pk-admin-front-end-main/src/pages/admin/UnPaidOrder.jsx`, `PendingPayments.jsx`

- Agency Relationship Page — ✅ Exists (Admin) / ⚠️ Agent partial
  - Admin: `Saer.pk-admin-front-end-main/src/pages/admin/Agencies.jsx`, `Partners.jsx`, `PartnerPortal.jsx`, `Branches.jsx`
  - Agent: `src/pages/agentside/Profile.jsx` (partial agency info)

- Hotel Availability / Room Add / Edit / Delete — ✅ Exists (Admin) / ⚠️ Agent partial
  - Admin (CRUD pages): `AddHotel.jsx`, `Hotels.jsx`, `EditHotelDetail.jsx`, `EditHotelPrice.jsx`, `EditHotelAv.jsx`
  - Agent: `AgentHotels.jsx`, `AgentHotelVoucher.jsx` (display-only/agent view)

- Rules Management — ✅ DONE
  - Admin: `Saer.pk-admin-front-end-main/src/pages/admin/RulesManagement.jsx`
  - Full CRUD interface with:
    - Create/Edit/Delete/View rules
    - Rule types: Terms & Conditions, Cancellation, Refund, Commission, Transport, Document, Hotel, Visa policies
    - Multi-page assignment (booking_page, agent_portal, hotel_page, transport_page, visa_page, etc.)
    - Active/Inactive toggle
    - Multi-language support (English/Urdu)
    - Search and filtering (by type, page, status)
    - Statistics dashboard
  - Route: `/rules` (admin project only)

- Walk-in Customers — ❌ Missing

- Profit & Loss Reports + Expense + Audit Trail — ❌ Missing
  - No dedicated pages found; may require backend/reporting endpoints.

- Passport Leads & Follow-up — ⚠️ Partial
  - Passport fields exist in agent booking forms: `src/pages/agentside/FlightBookingForm.jsx` and related booking pages.
  - Lead/follow-up systems not present.

- Customer Data Auto-Collection API (Branch + Area + Leads + Bookings) — ❌ Missing (backend)

- Lead Generation & Area Customer Management API — ❌ Missing (backend)

- Customer Lead (Passport Base + Loan Management + Follow-up) — ❌ Missing

- Logs Page — ✅ Exists (Admin)
  - Admin: `Saer.pk-admin-front-end-main/src/pages/admin/Logs.jsx`

- Commission Management — ❌ Missing (frontend pages not found)

- Hotel Outsourcing — ❌ Missing

- Auto Page Creation for Blogs (CRUD) — ❌ Missing
  - `src/components/NewsletterSection.jsx` references blogs but no blog CRUD/pages present.

- Custom Lead Form System Generation — ❌ Missing

- Pax Movement — ✅ DONE
  - Agent: `src/pages/agentside/PaxMovement.jsx` (Full dashboard with search, filters, individual tracking)
  - Admin: `Saer.pk-admin-front-end-main/src/pages/admin/PaxMovement.jsx` (Organization/Branch/Agent filters)

- Customer-side Booking Handling (Payments, Order Status, Showing Umrah Packages, Booking — Admin + Customer both) — ⚠️ Partial
  - Agent has full booking + payment pages: `Booking.jsx`, `BookingPay.jsx`, `BookingReview.jsx`, `FlightBookingForm.jsx`, package pages.
  - Admin includes order/ticket pages: `TicketBooking.jsx`, `TicketOrderList.jsx`, `TicketDetail.jsx`, `OrderDeliverySystem.jsx`.

- Promotion Center – Data Collection & Marketing Hub — ❌ Missing

- Some Column Additions in Existing Pages — Not assessed (needs specifics)

- Kuickpay module —  ✅ DONE

---

## Quick next steps (short)
1. Implement missing backend endpoints (Daily Operations, Lead systems, Auto-collection, Kuickpay) or confirm APIs exist.
2. Create missing admin pages for Walk-in, Commission Management, Profit & Loss reports (if required) or wire them to existing admin pages.
3. Add skeleton/loading components across lists and detail pages and run a responsive pass for the four screen sizes.

If you want, I can now:
- Produce a per-file/line checklist (detailed). OR
- Start scaffolding missing admin pages (placeholders) and wire routes. OR
- Generate a prioritized task list with rough effort estimates.

Pick one and I'll proceed.

*This file was updated by an automated scan of both agent and admin src trees.*
