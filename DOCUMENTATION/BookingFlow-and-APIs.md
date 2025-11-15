# Booking Flow, Pages, APIs and Business Logic

Version: 1.0
Date: 2025-11-08
Author: frontend changes (summarized)

---

## Executive summary
We converted the single-room booking flow into a multi-room → families flow. The package listing allows agents to select multiple rooms (e.g., quad, double, sharing) while enforcing seat limits. Selected rooms are transformed into a `families` array and an estimated `totalPrice` which are passed to the booking form. The booking form auto-generates passenger placeholders grouped by family and marks family heads. If a package includes visa, the UI forces per-passenger visa images and marks the booking accordingly. A Booking Summary page was added to review package details (structured), grouped passengers, and the estimated price before proceeding to payment.

This document is non-programmatic and intended for product, QA, and backend teams.

---

## Pages / Components (what was changed)

- `AgentPackages.jsx` (packages listing and booking modal)
  - Shows all packages for the logged-in agent organization.
  - Adds a modal for selecting multiple room types. Each room type has `+` and `-` buttons for adding rooms.
  - Maintains `selectedRooms` (map: roomType => count).
  - Builds `families` from `selectedRooms` and computes an estimated `totalPrice`.
  - Navigates to `/packages/booking` with `location.state = { package, families, totalPrice }`.

- `AgentBookingForm.jsx` (booking form — passengers, booking info, payment tab)
  - Reads `families` and `totalPrice` from navigation state.
  - Derives totals: `total_adult`, `total_child`, `total_infant`, `total_pax` from `families`.
  - Auto-creates `personDetails` grouped by family (field `family_index`) and flags the first adult as `is_family_head`.
  - Implements visa handling: if package includes visa price or ticket visa flags, checkbox is shown checked & disabled and each passenger requires a `visa_image` upload.
  - Shows booking date as a non-editable heading (not an input).
  - Passenger tab proceeds to Booking Summary instead of directly to payment.

- `BookingSummary.jsx` (new page)
  - Receives `package`, `bookingInfo`, `personDetails`, `families`, `totalPrice` from navigation state.
  - Renders a structured "Full Package Details" area (overview, ticket/flight info, hotels, pricing & extras, flags & rules).
  - Shows grouped passengers under "Family N" with badges for family head and visa upload status.
  - Actions: Edit (go back) and Proceed to Payment (navigates back to booking form with `openTab: 'payment-details'`).

- `App.jsx`
  - Registered route for `/packages/summary` (if not already present).

---

## API calls used by the frontend (observed in code)

- GET /api/umrah-packages/?organization=<orgId>
  - Purpose: fetch all packages for the agent's organization.
  - Notes: frontend filters returned packages by the same org id as a second check.

- GET /api/airlines/?organization=<orgId>
  - Purpose: get airline metadata to show airline names for package ticket details (ticket_info.airline references an id).

Note: booking POST endpoints and file upload endpoints were not changed or observed in the snippets. Visa images are currently kept in client state and not uploaded to server by the current code — backend integration is required for final persistence.

---

## Data shapes (frontend view)

- families (constructed in `AgentPackages.jsx` and passed to booking form):
  - Example: `[{ roomType: 'quad', adults: 4, children: 0 }, { roomType: 'double', adults: 2, children: 0 } ]`
  - Purpose: group rooms into families and determine how many passenger placeholders to create.

- bookingInfo (booking-level metadata)
  - Contains: `booking_date`, `client_note`, `total_adult`, `total_child`, `total_infant`, `total_pax`, `room_type` summary (optional)

- personDetails (array of passenger objects created by booking form)
  - A passenger object includes fields used in UI and validation:
    - `person_title` (mr/ms)
    - `first_name`, `last_name`
    - `passport_number`
    - `date_of_birth`
    - `contact_number`
    - `age_group` (adult/child/infant)
    - `family_index` (index into `families` array)
    - `is_family_head` (boolean)
    - `is_visa_included` (boolean) — derived from package data
    - `visa_image` (client-side File or metadata; not yet uploaded)

- package object (returned from `/api/umrah-packages/`)
  - Fields used by frontend (not exhaustive):
    - `id`, `title`, `organization`, `total_seats`, `rules`
    - prices: `adault_visa_price`, `child_visa_price`, `infant_visa_price`, `transport_price`, `food_price`, `makkah_ziyarat_price`, `madinah_ziyarat_price`
    - flags: `is_sharing_active`, `is_quaint_active`, `is_quad_active`, `is_triple_active`, `is_double_active`
    - `ticket_details`: array, each element has `ticket_info` with `adult_price`, `infant_price`, `trip_details`, `airline` (id)
    - `hotel_details`: array with `hotel_info`, `number_of_nights`, `sharing_bed_price`, `quaint_bed_price`, `quad_bed_price`, `triple_bed_price`, `double_bed_price`

---

## Business rules and constants

- bedsPerRoomType mapping (core rule used in selection & families generation):
  - `sharing: 1` (sharing is treated as a 1-person family)
  - `quint: 5`
  - `quad: 4`
  - `triple: 3`
  - `double: 2`
  - `single: 1`

- Room selection enforcement (client side):
  - `currentSelectedPax = sum(bedsPerRoomType[type] * count)` for all selectedRooms.
  - `remainingSeats = max(0, totalSeats - currentSelectedPax)`
  - A room type may be added only if `bedsPerRoomType[type] <= remainingSeats`.
  - UI shows disabled/+opaque state and a "Not enough seats" message when not allowed.

- Families generation:
  - For each selected room of type `T` and count `C`, create `C` entries in `families` as `{ roomType: T, adults: bedsPerRoomType[T], children: 0 }`.
  - Families are ordered by the sequence of selected rooms and are labeled "Family 1" etc. in the UI.

- Family and passengers grouping:
  - `personDetails` are created grouped by `family_index` matching the index in `families`.
  - The first adult in each family gets `is_family_head = true`.

- Visa handling:
  - Heuristic used to detect if the package requires (includes) visa: presence of visa prices or package fields indicating visa.
  - When visa included: a read-only checked checkbox is shown and each passenger requires a `visa_image` upload.

---

## Pricing & calculations (client-side estimation)

### Variables used
- `ticketInfo`: `pkg.ticket_details?.[0]?.ticket_info` (first ticket entry used for base ticket fares)
- `basePrice`: core per-adult base components (visa, transport, ticket adult fare, food, ziyarats)
- `hotelCost`: hotel-related cost per adult depending on bed type and nights

### Formula (per room type)
1. basePrice =
```
Number(pkg.adault_visa_price || 0)
+ Number(pkg.transport_price || 0)
+ Number(ticketInfo?.adult_price || 0)
+ Number(pkg.food_price || 0)
+ Number(pkg.makkah_ziyarat_price || 0)
+ Number(pkg.madinah_ziyarat_price || 0)
```

2. hotelCost(roomType) = sum over pkg.hotel_details:
```
Number(hotel[<roomType>_bed_price] || 0) * Number(hotel.number_of_nights || 0)
```
Map roomType to hotel fields as implemented: `sharing -> sharing_bed_price`, `quint -> quaint_bed_price` (or `quint_bed_price`), `quad -> quad_bed_price`, `triple -> triple_bed_price`, `double -> double_bed_price`.

3. pricePerAdult(roomType) = basePrice + hotelCost(roomType)

4. totalPrice = sum over selectedRooms of (pricePerAdult(roomType) * count * bedsPerRoomType[roomType])

Notes / caveats:
- Code currently reads `adault_visa_price` (typo-like). Confirm backend field names; normalize them or handle alternate keys.
- All numeric values should be coerced with `Number(...)` to avoid concatenation and NaN.

---

## Validation rules and edge cases

- Client prevents selecting more passengers than `total_seats` by enforcing the `remainingSeats` rule.
- UI ensures at least one room is selected before proceeding to booking (button disabled otherwise).
- When visa is required by the package: per-passenger `visa_image` is enforced in UI validation.
- The server must revalidate: seat counts, pricing, and visa requirements before accepting a booking to avoid race conditions or tampered client payloads.

Edge cases to test:
- Package fields with numeric values as strings ("10000") — must coerce to numbers.
- Missing hotel bed price fields (e.g., `quaint_bed_price` vs `quint_bed_price`) — verify both or canonicalize.
- Concurrent bookings that reduce available seats between selection and submission.

---

## UX notes and small design decisions

- Sharing rooms are treated as 1-person families to allow the sharing room to count as one family slot.
- Booking date is shown as a heading (non-editable) to avoid accidental changes; clients set booking date elsewhere.
- Passenger totals are derived from `families` and not auto-editable on the passenger entry screen to keep totals consistent with room selection.
- The Booking Summary page is the canonical place to view full package details (was moved from an earlier JSON modal).

---

## Next steps / recommendations (actionable)

1. Normalize pricing fields (backend or add a small helper in frontend) — resolve typos such as `adault_visa_price`.
2. Implement file upload for visa images:
   - Option A (recommended): pre-upload visa images to a file service; receive URLs and include them in booking POST payload.
   - Option B: submit booking and files together as multipart/form-data (if backend supports atomic handling).
3. Confirm backend booking payload contract:
   - Does backend accept `families` array? Or does it expect only totals + `person_details`? Adjust final payload mapping accordingly.
4. Add server-side seat reservation or optimistic locking to prevent overbooking.
5. Add small UI improvements: per-family cost breakdown, collapsible ticket/hotel sections, and developer-only raw JSON view toggled by a query param.

---

## QA checklist (quick)
- [ ] Selecting rooms doesn't allow exceeding `total_seats`.
- [ ] Families array matches the room selection counts.
- [ ] Booking form auto-creates the correct number of `personDetails` grouped into families.
- [ ] First adult in each family is marked `is_family_head`.
- [ ] Visa-required packages force per-passenger visa image upload.
- [ ] Booking Summary displays all package fields used in the UI and grouped passengers.
- [ ] Build (`npm run build`) completes without syntax errors.

---

## Appendix: quick sample (frontend-local) payloads

- families (from selection):
```json
[
  { "roomType": "quad", "adults": 4, "children": 0 },
  { "roomType": "double", "adults": 2, "children": 0 }
]
```

- example personDetails (generated automatically):
```json
[
  { "person_title":"Mr","first_name":"Ali","last_name":"Khan","passport_number":"A1234","date_of_birth":"1985-01-01","contact_number":"0312xxxxxxx","age_group":"adult","family_index":0,"is_family_head":true },
  { "person_title":"Mr","first_name":"Ahmed","family_index":0,"is_family_head":false },
  { "person_title":"Mr","first_name":"Usman","family_index":0,"is_family_head":false },
  { "person_title":"Mr","first_name":"Tariq","family_index":0,"is_family_head":false },
  { "person_title":"Mrs","first_name":"Sara","family_index":1,"is_family_head":true },
  { "person_title":"Mr","first_name":"Omar","family_index":1,"is_family_head":false }
]
```

---

If you want, I can:
- Produce a printable PDF of this document and add it to the repository.
- Add a small `DOCUMENTATION/README.md` that references this file and explains how to find the booking-related components.
- Implement one of the next steps (visa upload or backend payload adapter).

Which of these would you like me to do next?