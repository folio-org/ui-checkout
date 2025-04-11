# Change history for ui-checkout

## IN_PROGRESS

* Replace moment with day.js. Refs UICHKOUT-949.
* Reduce count of eslint errors after update eslint-config-stripes. Refs UICHKOUT-953.

## [12.0.1] (https://github.com/folio-org/ui-checkout/tree/v12.0.1) (2025-04-11)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v12.0.1...v12.0.1)

* Remove failed tests after packages updating. Refs UICHKOUT-955.
* Add missed "users.configurations.item.get" permission. Refs UICHKOUT-956.

## [12.0.0] (https://github.com/folio-org/ui-checkout/tree/v12.0.0) (2025-03-14)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v11.0.3...v12.0.0)

* React v19: refactor away from default props for functional components. Refs UICHKOUT-909.
* Fix accessibility issues. Refs UICHKOUT-933.
* *BREAKING* Display user pronouns at check out. Refs UICHKOUT-932.
* Omit trailing whitespace when formatting names. Refs UICHKOUT-941.
* *BREAKING* Update `react-intl` to `^7`. Refs UICHKOUT-944.
* Migrate to shared GA workflows. Refs UICHKOUT-942.
* Add pagination to the Select item dialog in Check-out. Refs UICHKOUT-914.
* *BREAKING* Update stripes-* dependencies to latest version. Refs UICHKOUT-943.
* Add correct aria-label attribute to "Patron look-up" button. Refs UICHKOUT-934.
* Implement support for fields without information. Refs UICHKOUT-945.

## [11.0.3] (https://github.com/folio-org/ui-checkout/tree/v11.0.3) (2025-03-10)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v11.0.2...v11.0.3)
* Check out items using new endpoint from mod-circulation-bff. Refs UICHKOUT-946.
* Use `history.push` instead of `mutator.query` updating. Refs UICHKOUT-948.

## [11.0.2] (https://github.com/folio-org/ui-checkout/tree/v11.0.2) (2024-11-30)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v11.0.1...v11.0.2)

* Update permission after mod-patron-blocks permission changes. Refs UICHKOUT-930.

## [11.0.1](https://github.com/folio-org/ui-checkout/tree/v11.0.1) (2024-11-22)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v11.0.0...v11.0.1)

* Update permission checks of ui-users. Refs UICHKOUT-927.

## [11.0.0](https://github.com/folio-org/ui-checkout/tree/v11.0.0) (2024-10-31)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v10.1.0...v11.0.0)

* Remove bigtests from github actions. Refs UICHKOUT-908.
* *BREAKING* bump okapiInterfaces `users` to `16.1`. Display User Profile Picture on patron scan. Refs UICHKOUT-884.
* Update upload-artifact actions from v1 and v2 to v4. Refs UICHKOUT-917.
* Remove barcode trimming before it is sent to backend for processing. Refs - UICHKOUT-903.
* Update notes permission. Refs - UICHKOUT-920.
* Also support okapiInterfaces `inventory` `14.0`. Refs UICHKOUT-922.
* Review and cleanup Module Descriptor. Refs UICHKOUT-919.
* Update `ui-plugin-create-inventory-records` to version `5.0.0`. Refs UICHKOUT-925.

## [10.1.0](https://github.com/folio-org/ui-checkout/tree/v10.1.0) (2024-03-22)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v10.0.1...v10.1.0)

* UI tests replacement with RTL/Jest for src/CheckOut.js. Refs UICHKOUT-820.
* UI tests replacement with RTL/Jest for src/ModalManager.js. Refs UICHKOUT-821.
* UI tests replacement with RTL/Jest for src/ScanItems.js. Refs UICHKOUT-822.
* Increase code coverage for PatronForm.js. Refs UICHKOUT-879.
* UI tests replacement with RTL/Jest for AddInfoDialog.js. Refs UICHKOUT-878.
* Hide 'Item details' in Action menu when item is virtual. Refs. UICHKOUT-871.
* Hide Patron and Staff Info in Action menu when DCB patron. Refs. UICHKOUT-872.
* Use Save & close button label stripes-component translation key.Refs UICHKOUT-887.
* Fix words breaking on checkout table. Refs UICHKOUT-886.

## [10.0.1](https://github.com/folio-org/ui-checkout/tree/v10.0.1) (2023-10-23)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v10.0.0...v10.0.1)

* Fix circulation timeout issue. Refs UICHKOUT-869.

## [10.0.0](https://github.com/folio-org/ui-checkout/tree/v10.0.0) (2023-10-12)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v9.0.1...v10.0.0)

* UI tests replacement with RTL/Jest for src/components/PatronBlock/PatronBlockModal.js. Refs UICHKOUT-832.
* UI tests replacement with RTL/Jest for `ErrorModal.js`. Refs UICHKOUT-826.
* UI tests replacement with RTL/Jest for src/components/ScanFooter/ScanFooter.js. Refs UICHKOUT-834.
* UI tests replacement with RTL/Jest for src/components/ScanTotal/ScanTotal.js. Refs UICHKOUT-835.
* Use camel case notation for all data-testid. Refs UICHKOUT-848.
* UI tests replacement with RTL/Jest for `PatronBlock.js`. Refs UICHKOUT-831
* UI tests replacement with RTL/Jest for `SelectItemModal.js`. Refs UICHKOUT-836.
* UI tests replacement with RTL/Jest for src/components/UserDetail/Loans.js. Refs UICHKOUT-837
* Reassign limit variable from hardcoded value to MAX_RECORDS constant for `CheckOut.js`. Refs UICHKOUT-850.
* Reassign limit variable from hardcoded value to MAX_RECORDS constant for `UserDetail.js`. Refs UICHKOUT-851.
* Use == instead of = for CQL service point filtering. Refs UICHKOUT-853.
* If the user has fines, they can click the fine amount as a link and have it open the fine information in the Users app. Refs UICHKOUT-802.
* UI tests replacement with RTL/Jest for src/components/OverrideModal/OverrideModal.js. Refs UICHKOUT-830.
* Also support `circulation` `14.0`. Refs UICHKOUT-854.
* UI tests replacement with RTL/Jest for `src/components/UserDetail/UserDetail.js`. Refs-UICHKOUT-838.
* UI tests replacement with RTL/Jest for src/components/ViewPatron/ViewPatron.js. Refs UICHKOUT-840.
* Add two new options (Add patron info, Add staff info) to item action menu. Fixes UICHKOUT-855.
* UI tests replacement with RTL/Jest for src/components/ViewItem/ViewItem.js. Refs UICHKOUT-839.
* Use new WSAPI for adding patron/staff notes to loans. Fixes UICHKOUT-857. **Note.** The new requirement of the `add-info` interface is a breaking change.
* UI tests replacement with RTL/Jest for src/components/PatronForm/PatronForm.js. Refs UICHKOUT-833.
* Update check out ellipses UX for consistency. Refs UICHKOUT-856.
* UI tests replacement with RTL/Jest for src/components/ItemForm/ItemForm.js. Refs UICHKOUT-827.
* Upgrade babel config. Refs UICHKOUT-861.
* Add possible for run axe tests. Refs UICHKOUT-858.
* Update Node.js to v18 in GitHub Actions. Refs UICHKOUT-862.
* *BREAKING* Upgrade React to v18. Refs UICHKOUT-860.
* *BREAKING* bump `react-intl` to `v6.4.4`. Refs UICHKOUT-865.
* Fix issues with skipped tests. Refs UICHKOUT-864.
* Remove outdated imports. Refs UICHKOUT-867.
* Use current optional dependencies. Refs UICHKOUT-870.

## [9.0.1](https://github.com/folio-org/ui-checkout/tree/v9.0.1) (2023-03-08)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v9.0.0...v9.0.1)

* Update `@folio/circulation` to `8.0.1`. Refs UICHKOUT-849.

## [9.0.0](https://github.com/folio-org/ui-checkout/tree/v9.0.0) (2023-02-22)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v8.2.0...v9.0.0)

* Visual indicator in checkout due date column for shortened loan period - part1. Refs UICHKOUT-806
* Visual indicator in checkout due date column for shortened loan period - part1. Refs UICHKOUT-809
* Visual indicator in checkout due date column for shortened loan period - part1. Refs UICHKOUT-810
* Fix Due date in Check out: Last number goes to the next line. Refs UICHKOUT-811.
* Checkout table usability improvements. Ref UICHKOUT-805.
* Bump major versions of several @folio/stripes-* packages. Refs UICHKOUT-818.
* Remove unneeded `react-redux` dependency. Refs UICHKOUT-841.
* Support `inventory` `13.0` interface version. Refs UICHKOUT-814.
* Add screen reader accessibility to checkout flag. Refs UICHKOUT-842
* UI tests replacement with RTL/Jest for `NotificationModal`. Refs UICHKOUT-829.
* `PickupModal`: Show count of items awaiting pickup based on `totalRecords` API response field. Refs UICHKOUT-846.
* UI tests replacement with RTL/Jest for src/components/CheckoutNoteModal/CheckoutNoteModal.js. Refs UICHKOUT-825.
* UI tests replacement with RTL/Jest for src/components/MultipieceModal/MultipieceModal.js. Refs UICHKOUT-828.

## [8.2.0](https://github.com/folio-org/ui-checkout/tree/v8.2.0) (2022-10-20)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v8.1.0...v8.2.0)

* Handle empty values like other falsy values when formatting names. Refs UICHKOUT-792.
* Remove hardcoded empty values. Refs UICHKOUT-799.
* Also support `inventory` `12.0`. Refs UICHKOUT-800.
* Show correct limit of item block message. Refs UICHKOUT-801.
* Also support `users` `16.0`. Refs UICHKOUT-791.

## [8.1.0](https://github.com/folio-org/ui-checkout/tree/v8.1.0) (2022-06-29)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v8.0.1...v8.1.0)

* Add id for Pane component. Refs UICHKOUT-768.
* Add pull request template. Refs UICHKOUT-771.
* Compile Translation Files into AST Format. Refs UICHKOUT-708.
* Remove unnecessary request to `loan-policy-storage/loan-policies` end-point within checkout procedure. Refs UICHKOUT-767.
* Fix focus issue. Refs UICHKOUT-773.
* Refactor away from react-intl-safe-html. Refs UICHKOUT-721.
* Optional dependency `@folio/circulation` is out of date. Refs UICHKOUT-777.
* Enable error message when entering an item barcode without a patron barcode. Refs UICHKOUT-770.
* Remove react-hot-loader. Refs UICHKOUT-776.
* Migrate CI to NodeJS v16. Refs UICHKOUT-782.
* Replace babel-eslint with @babel/eslint-parser. Refs UICHKOUT-779.
* Warn when selected user lacks a barcode. Refs UICHKOUT-737.
* Improvement for bigtest running. Refs UICHKOUT-785.
* Use permanent error key instead of error message. Refs UICHKOUT-783.
* Set up Jest/RTL tests. Refs UICHKOUT-786.

## [8.0.1](https://github.com/folio-org/ui-checkout/tree/v8.0.1) (2022-03-28)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v8.0.0...v8.0.1)

* Patron block count increases erroneously when override entered at Check-out. Refs UICHKOUT-774.
* Extend ui-checkout.circulation sub permissions. Refs UICHKOUT-775.

## [8.0.0](https://github.com/folio-org/ui-checkout/tree/v8.0.0) (2022-02-24)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v7.1.0...v8.0.0)

* Add preferred name to check out UI. Refs UICHKOUT-699.
* Increase mocha version up to `9.0.0`. Refs UICHKOUT-762.
* Also support `circulation` `12.0`. Refs UICHKOUT-758.
* Also support `circulation` `13.0`. Refs UICHKOUT-760.
* Perform Wildcard Item Lookup Before Performing Checkout Transaction in Check Out App. Refs UICHKOUT-752.
* Update Item List Modal Contents for Wildcard Item Lookup. Refs UICHKOUT-763.
* DueDatePicker is incorrectly instantiated. Refs UICHKOUT-693.

## [7.1.0](https://github.com/folio-org/ui-checkout/tree/v7.1.0) (2021-11-10)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v7.0.0...v7.1.0)

* Fix an issue with the number of patron blocks when they were doubled. Refs UICHKOUT-750.
* Fix auto checkout of items with delivery requests. Fixes UICHKOUT-756.

## [7.0.0](https://github.com/folio-org/ui-checkout/tree/v7.0.0) (2021-10-05)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v6.1.0...v7.0.0)

* Checking out to blocked patron doesn't offer override option. Refs UICHKOUT-725.
* Add check for `ui-users.loans.view` permission in order to show link to loans in ui-users. Fixes UICHKOUT-727.
* Add check for `ui-requests.view` permission in order to show link to requests in ui-requests. Fixes UICHKOUT-728.
* Add check for `ui-users.accounts` permission in order to show link to fees/fines in ui-users. Fixes UICHKOUT-729.
* Hide `ScanFooter` when fast add record plugin is open. Fixes UICHKOUT-720.
* Date picker on circulation override cuts off after 4 weeks. Refs UICHKOUT-731.
* Always provide ISO-8601 dates in API requests. Refs UICHKOUT-732.
* Format numbers as numbers, not text. Refs UICHKOUT-734.
* Validate shape of circulation notes before accessing their optional attributes. Refs UICHKOUT-736.
* While checking out items the patron barcode disappears without inactivity. Refs UICHKOUT-730.
* Remove `item-storage` `8.0` dependency that ui-checkout doesn't use directly. Refs UICHKOUT-718.
* Add alternate `inventory` `11.0` dependency for optimistic locking. Refs UICHKOUT-718.
* Always display fee/fine decimal places on Checkout page. Refs UICHKOUT-742.
* Fix spacing of "Suspended fees/fines" in Borrower section of Checkout page. Refs UICHKOUT-743.
* Increment stripes to v7, react to v17. Refs UICHKOUT-740.
* UI tests replacement with RTL/Jest for `src/util.js`. Refs UICHKOUT-824.
* UI tests replacement with RTL/Jest for `src/index.js`. Refs UICHKOUT-823.
* UI tests replacement with RTL/Jest for `ErrorModal.js`. Refs UICHKOUT-826.

## [6.1.0](https://github.com/folio-org/ui-checkout/tree/v6.1.0) (2021-06-18)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v6.0.0...v6.1.0)

* Added ability to look-up patron by Custom Fields. Refs UICHKOUT-697
* Also support `circulation` `10.0`. Refs UICHKOUT-710.
* For checkout alerts, use the audio theme specified in circulation settings; fall back to classic sounds if no theme is specified. Refs UICIRC-556.
* Also support `circulation` `11.0`. Refs UICHKOUT-716.
* Added `NotePopupModal` to view patron page. Refs UICHKOUT-685.
* Adjust `ui-checkout.circulation` permission set. Fixes UICHKOUT-724.

## [6.0.0](https://github.com/folio-org/ui-checkout/tree/v6.0.0) (2021-03-16)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v5.0.0...v6.0.0)

* Do not use hard-coded dates in unit tests. Refs UICHKOUT-668.
* Make room for `<Datepicker>` in the loan-policy override modal. Refs UICHKOUT-666.
* Check out permissions: refinements. Refs UICHKOUT-622.
* Restore sortability of charged items table. Refs UICHKOUT-513.
* Update due date when changed in the Check Out app. Refs UICHKOUT-647.
* Replace 'ui-users.loans.edit' permisson with 'ui-users.loans.change-due-date' for changing due date.
* Fix a label translation. Fixes UICHKOUT-675.
* Upgraded to create-inventory plugin v2.0.0.
* Prevent check out when item with intellectual item status is scanned. Refs UICHKOUT-669.
* Update to stripes v6. Refs UICHKOUT-687.
* Proxy not allowed to checkout items for sponsor if proxy has patron block. Refs UICHKOUT-673.
* Show confirmation modal when scanning an item with one of the new statuses (Long missing, In process (non-requestable), Restricted, Unavailable, Unknown). Refs UICHKOUT-671.
* Increment `@folio/stripes-cli` to `v2`. Refs UICHKOUT-692.
* Handle a full list of errors when check out fails. Refs UICHKOUT-679.
* Item blocks: Allow for override when logged in user has credentials. Refs UICHKOUT-677.
* Remove old override endpoint and permission. Refs UICHKOUT-680.
* Patron blocks: Allow for override when logged in user has credentials. Refs UICHKOUT-688.
* Add support for optional `readyPrefix` property at the module level in stripes.config.js. If set, this prefix will be displayed in the title when the app is ready to receive a scanned item barcode. Implements UICHKOUT-686.
* Item level error at check out displays two errors that essentially mean the same thing. Refs UICHKOUT-695.
* Patron block override doesn't "stick" when you leave the page and then come back. Refs UICHKOUT-696.
* Use a compatible version of `ui-plugin-find-user`.

## [5.0.0](https://github.com/folio-org/ui-checkout/tree/v5.0.0) (2020-10-12)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v4.0.1...v5.0.0)

* Added permission checking to fast-add button.  Addresses UICHKOUT-646
* upgraded some dependencies and tweaked some testing settings.  Addresses UICHKOUT-643
* refactor of code fix for UICHKOUT-633
* Checkout barcode CQL injection.  Fixes UICHKOUT-633.
* Updated React-intl dependency to 4.7.2
* Use `==` for more efficient queries. Refs PERF-62.
* pass proxy borrower's barcode to checkout endpoint. Fixes UICHKOUT-639
* Use right truncation to fetch user's open request (UICHKOUT-641).
* Create BigTest tests for patron lookup widget. Refs UICHKOUT-533.
* Refactor from `bigtest/mirage` to `miragejs`.
* Increase test coverage for automated patron blocks. Refs UICHKOUT-531.
* Increment `@folio/stripes` to `v5`, `react-router` to `v5.2`.
* Create access to New fast add record template from Check out screen. Refs UICHKOUT-628.
* Do not send proxy info when patron has a proxy but is acting as self. Fixes UICHKOUT-644.
* Hide `ScanFooter` when fast add record plugin is open. Fixes UICHKOUT-650.
* Handle malformed timestamps. Refs UICHKOUT-649.
* Increment `react-intl` to `v5` as part of the `@folio/stripes` `v5` update. Refs STRIPES-694.
* Clean up imports for react-router v5.

## [4.0.1](https://github.com/folio-org/ui-checkout/tree/v4.0.1) (2020-06-19)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v4.0.0...v4.0.1)

* Use `==` for more efficient queries. Refs CIRCSTORE-215, PERF-62.
* Increment `@folio/plugin-find-user` to `v3.0` for `@folio/stripes` `v4` compatibility.

## [4.0.0](https://github.com/folio-org/ui-checkout/tree/v4.0.0) (2020-06-15)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v3.0.0...v4.0.0)

* Change selected parton background color to increase color contrast. Refs UICHKOUT-603.
* Fix bug preventing continuation after cancelling checkout notes or multipiece modal. Fixes UICHKOUT-610, UICHKOUT-611.
* Show confirmation modal when item with withdrawn status is scanned. Refs UICHKOUT-605.
* Show confirmation modal when item with Missing status is scanned. Refs UICHKOUT-582.
* Pin `moment` at `~2.24.0`. Refs STRIPES-678.
* Upgrade to `stripes` `4.0`, `react-intl` `4.5`. Refs STRIPES-672.
* Upgrade to `react-intl-safe-html` `2.0`. Refs STRIPES-672.
* Use local file as a profile placeholder. Refs UICHKOUT-624.
* Add confirmation modal for Lost and paid items. Refs UICHKOUT-549.
* Include automated patron blocks as reason to block patron from borrowing. Refs UICHKOUT-627.
* Make permission names l10nable. Refs UICHKOUT-629.

## [3.0.0](https://github.com/folio-org/ui-checkout/tree/v3.0.0) (2020-03-16)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v2.0.0...v3.0.0)

* Fix link path to loans list in user details information. Fixes UICHKOUT-554.
* Handle the wrong error message when checking out requested items to non-requester. Fixes UICHKOUT-580.
* Make the Check out ellipsis accessible. Refs UICHKOUT-558.
* Update okapiInterfaces: `item-storage:8.0`, `inventory:10.0`, `circulation:9.0`. Part of UICHKOUT-585.
* Security update eslint to v6.2.1. Refs UICHKOUT-586.
* Migrate to `stripes` `v3.0.0` and move `react-intl` and `react-router` to peerDependencies.
* Fix bug in viewing of item checkout notes & change due date dialog. Fixes UICHKOUT-597.
* Update to `plugin-find-user` `v2.0.0`.

## [2.0.0](https://github.com/folio-org/ui-checkout/tree/v2.0.0) (2019-12-04)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.11.2...v2.0.0)

* Make change due date button available on checked out loans when user has loan edit permission. Part of UIU-1177.
* Implement end session for check-out. Refs UICHKOUT-556.
* Implement check out circulating items permission. Refs UICHKOUT-535.
* Improve error messages upon checking item out at service point with no opening hours and loan policy that uses closed library due date management. Refs UICHKOUT-545.
* Handle end session API endpoint is called multiple times issue. Fixes UICHKOUT-560.
* Extend "okapiInterfaces" with "inventory" in order to handle permissions error. Refs UICHKOUT-562.
* Hide the empty checkout items list message during the checkout of the new item. Refs UICHKOUT-557.
* Include New 'Open - Awaiting delivery' status when accessing Request Queue from Check Out App. Refs UICHCKOUT-563.

## [1.11.2](https://github.com/folio-org/ui-checkout/tree/v1.11.2) (2019-11-02)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.11.1...v1.11.2)

* Ignore 'Closed - pickup expired' items in request queries. Refs UICHKOUT-553.

## [1.11.1](https://github.com/folio-org/ui-checkout/tree/v1.11.1) (2019-09-26)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.11.0...v1.11.1)

* Correctly report loan policy name, instead of "noncirculation loan policy", for non-loanable items. Fixes UICHKOUT-534.
* Be more semantic, less markupy, in tests with MCLs; not all rows are wrapped with `<div>`
* Correctly format query when retrieving requests by multiple statuses. Fixes UICHKOUT-572.

## [1.11.0](https://github.com/folio-org/ui-checkout/tree/v1.11.0) (2019-09-10)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.10.0...v1.11.0)
* Add date and source fields to checkout note. Refs UICHKOUT-496.
* Handle broken tests. Fixes UICHKOUT-538.

## [1.10.0](https://github.com/folio-org/ui-checkout/tree/v1.10.0) (2019-07-25)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.9.0...v1.10.0)

* Add missing permissions to "Check out: All permissions" permissions set. Fixes UIU-1078.
* Improve test coverage
* Bug fixes. UICHKOUT-478, UICHKOUT-502, UICHKOUT-508, UICHKOUT-509, UICHKOUT-526, UICHKOUT-527.

## [1.9.0](https://github.com/folio-org/ui-checkout/tree/v1.9.0) (2019-06-10)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.8.0...v1.9.0)

* Remove spurious, do-nothing settings permission.
* Add BigTest tests for increased code coverage. Completes UICHKOUT-481.
* Add open requests info for patron after lookup on Checkout screen. UICHKOUT-519.

## [1.8.0](https://github.com/folio-org/ui-checkout/tree/v1.8.0) (2019-05-10)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.7.0...v1.8.0)

* Display multiple messages at check out. UICHKOUT-493.
* Order checkouts first to last by default. UICHKOUT-498.
* Link to checkout notes from action menu. UICHKOUT-489.
* Trim whitespace padding from item barcodes to avoid server errors. Fixes UICHKOUT-506.
* Use exact matching for user identifiers. Fixes UICHKOUT-510.
* Implement override loan policy modal. UIU-879.
* Keep loan policy visible after due date change. UICIRC-197.
* Implement checkout notes modal. UICHKOUT-488.
* Requires stripes 2.3.0, stripes-core 3.3.0

## [1.7.0](https://github.com/folio-org/ui-checkout/tree/v1.7.0) (2019-03-16)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.6.0...v1.7.0)

* Supports `circulation` interface 7.0. UICHKOUT-492
* Update integration tests to accommodate MCL aria changes. Fixes UICHKOUT-490.
* Provide unique ID for find-user plugin. Refs UIU-884.
* Fix reasons when the patron has more than one block. Fix UIU-804.
* Fix UX Consistency Fixes for Patron Blocks. Ref UIU-902.
* Fix Fee/fine tag and icon missing from Checkout Borrower information. Fix UIU-888.

## [1.6.0](https://github.com/folio-org/ui-checkout/tree/v1.6.0) (2019-01-25)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.5.0...v1.6.0)

* Adjust item form focus. Fixes UICHKOUT-482.
* Add fees/fines owed. Ref UICHKOUT-33.
* Upgrade to stripes v2.0.0.

## [1.5.0](https://github.com/folio-org/ui-checkout/tree/v1.5.0) (2019-01-10)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.4.0...v1.5.0)

* Adjust checkout columns width. Fixes UICHKOUT-457.
* Add items awaiting pickup modal. Part of UICHKOUT-475.
* Fix enforce manual patron blocks. Fixes UIU-792.
* Display modal for multipiece items. Part of UICHKOUT-446.

## [1.4.0](https://github.com/folio-org/ui-checkout/tree/v1.4.0) (2018-12-13)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.3.1...v1.4.0)

* Show `active` column in find-user popup. Refs STCOM-385.
* Format the `active` attribute as `Status` on the find-user modal. Fixes UICHKOUT-472.
* Update due date on checkout after changed. Fixes UICHKOUT-470.
* Fix hardcoded strings. Fixes UICHKOUT-458.
* Simpler input focus due to better ref handling. Refs STCOM-394.
* Add feature enforce manual patron blocks. Ref UIU-675.
* Remove - 'Skip closed hours...' from Loan Policy Editor. UICHKOUT-456.
* Provide service point to API when checking out. UICHKOUT-460
* Fix: Can Select Inactive Users But Not Check Out to Them. UICHKOUT-463

## [1.3.1](https://github.com/folio-org/ui-checkout/tree/v1.3.1) (2018-10-09)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.3.0...v1.3.1)

* Reset app between tests. Refs UICHKOUT-448.

## [1.3.0](https://github.com/folio-org/ui-checkout/tree/v1.3.0) (2018-10-05)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.2.0...v1.3.0)

* Add alternate dependency on `item-storage` 6.0 UICHKOUT-445
* Clear check-out page when session expires. Available from v1.2.1. Fixes UICHKOUT-70.
* Use `stripes` 1.0 framework

## Release 1.2.0 (https://github.com/folio-org/ui-checkout/tree/v1.2.0) (2018-09-12)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.1.2...v1.2.0)

* Dependency on item-storage: 5.0
* Dependency on circulation: 3.0 or 4.0
* Fix spelling of parameter to lookup-users. UIS-71.
* Remove metadata property from JSON before PUTting settings. UICHKOUT-15.
* Add Patron info. UICHKOUT-5.
* Search and Select User on Check-Out Screen. UICHKOUT-7.
* Remove fixed dependency on plugin-find-users 1.0.0. Refs STRIPES-478, Fixes UICHKOUT-18.
* Use PropTypes, not React.PropTypes. Refs STRIPES-427.
* Refactor `dataKey`. Fixes UICHKOUT-23.
* Add `optionalDependencies` on find-user plugin. Fixes UICHKOUT-31.
* Refine Checkout Page. Fixes UICHKOUT-27.
* Refactor proxies based on the new API. Fixes UICHKOUT-38.
* Show/Hide Profile Picture based on the tenant-level setting. Fixes UICHKOUT-42.
* Favor react-intl date/time formatters. Refs STCOR-109.
* Adjust columns width on checkout items view. Fixes UICHKOUT-43.
* Add save button to scan id. Fixes UICHKOUT-40.
* Reposition Cursor After End Session. Fixes UICHKOUT-44.
* Change "Instance" to "Title". Fixes UICHKOUT-45.
* Add validation preventing check-out attempts for items already checked out. Fixes UICHKOUT-34.
* Fix auto-increment of open loan count in patron view. Fixes UICHKOUT-28.
* Use more-current stripes-components. Refs STRIPES-495.
* Display loan policy associated with loan on check out. Fixes UICHKOUT-37.
* Get rolling loan period from loan policy. Fixes UICHKOUT-25.
* Get renewal loan period from Loan Policy. Fixes UICHKOUT-24.
* Don't bind non-existent function; that's bad. Fixes UICHKOUT-50.
* Favor Link over href. Refs STRIPES-482.
* Fix validation errors. Fixes UICHKOUT-56.
* Prune unused deps; update stripes-connect. Refs STRIPES-490, STRIPES-501.
* Refactor settings to use ConfigManager. Fixes UICHKOUT-59.
* Fix state after returning back to the checkout app. Fixes UICHKOUT-58.
* Display end session button when a patron has been selected. Fixes UICHKOUT-57.
* Link to tests. Fixes UICHKOUT-61.
* Allow selection of more than one scan id. Fixes UICHKOUT-49.
* Rewire links from items to inventory. Fixes UICHKOUT-48.
* Remove settings from ui-checkout. Fixes UICHKOUT-64.
* Add link to loan details from checkout. Fixes UICHKOUT-36.
* Relabel the sponsor section in the proxy modal pop up. Fixes UICHKOUT-51.
* Display expiration status information for proxy/sponser relationships in the proxy modal pop up UICHKOUT-52
* Prevent expired sponsors and expired proxy relationships from being selected. Fixes UICHKOUT-53.
* Get fixed loan period from loan policy. Fixes UICHKOUT-66.
* Move checkout links into actions menu. Fixes UICHKOUT-74.
* Make borrowing patron more prominent. Fixes UICHKOUT-47. Available since v1.1.3.
* Update test to save Scan ID settings. Refs UITEST-20.
* Refactor checkout settings. Refs UICIRC-47.
* Extract hardcoded labels so they can be translated. Fixes UICHKOUT-75.
* Extract proxy modal into `<ProxyManager>`. Fixes STSMACOM-58.
* Ignore yarn-error.log file. Refs STRIPES-517.
* Bug fix: translate table-headers fixes patron lookup. Fixes UICHKOUT-411.
* Fix rolling loan due date calculation. Fixes UICHKOUT-408.
* Add audio alerts for successful and failed checkouts. Fixes UICHKOUT-68.
* Match interval period values with the values on the server. Refs UICIRC-53.
* Fix params being sent to apply endpoint. Fixes UICHKOUT-413.
* Show error when trying to check out item that has been requested. Fixes UICHKOUT-410.
* Stop using 'diku_admin' user for error message test, use find-user plugin. UICHKOUT-414.
* Replace fixedDueDateSchedule with fixedDueDateScheduleId. Fixes UICHKOUT-417.
* Initialize patron object to empty rather than null. Fixes UICHKOUT-418.
* Wire up new checkout API. Fixes UICHKOUT-419.
* Added link to borrower's open loans from the open loans count. Fixes UICHKOUT-424.
* Use == for looking up records by exact match. UICHKOUT-422.
* Adjust columns width on the checkout screen. Fixes UICHKOUT-423.
* Relocate language files. UICHKOUT-427.
* Accommodate ui-users "show inactive users" filter. Refs UIU-400.
* Remove old code responsible for the checkout processing. Fixes UICHKOUT-431.
* Added ability to change due date of newly checked-out items. Refs UIU-497.
* Update to current users interface. Refs UIU-495.
* Fix checkout sounds. Fixes UICHKOUT-429.
* Fix input focus issues. Fixes UICHKOUT-432.
* Show error messages on error modal. Fixes UICHKOUT-406.
* stripes-components dep consistent with stripes-core's.
* Position cursor on app start, after item processing, and on "End Session". UICHKOUT-442.
* Bug fixes not mentioned in separate change log entries: UICHKOUT-8, UICHKOUT-39, UICHKOUT-46, UICHKOUT-63, UICHKOUT-65, UICHKOUT-412, UICHKOUT-421, UICHKOUT-425, UICHKOUT-426, UICHKOUT-430, UICHKOUT-437

## [1.1.2](https://github.com/folio-org/ui-checkout/tree/v1.1.2) (2017-09-02)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.1.1...v1.1.2)

* Add settings.checkout.enabled permissionSet to package.json. UICHKOUT-13.

## [1.1.1](https://github.com/folio-org/ui-checkout/tree/v1.1.1) (2017-08-31)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.1.0...v1.1.1)

* Update permissions. Completes STRIPES-435 for ui-checkout.

## [1.1.0](https://github.com/folio-org/ui-checkout/tree/v1.1.0) (2017-08-30)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v1.0.0...v1.1.0)

* Settings: Fix labels and titles. UICHKOUT-11
* Settings: Fix horizontal scroll
* Remove loan policy settings. UICHKOUT-10
* Testing: Add module test suite. FOLIO-801.

## [1.0.0](https://github.com/folio-org/ui-checkout/tree/v1.0.0) (2017-08-21)
[Full Changelog](https://github.com/folio-org/ui-checkout/compare/v0.0.1...v1.0.0)

*  Switch from props.data to props.resources. Fixes UIS-66.
*  Assign element IDs for automated testing. STRIPES-300.
*  Add initial version of module local tests (Nightmare based). FOLIO-782.
*  Fix title of module in menu bar.

## [0.0.1](https://github.com/folio-org/ui-checkout/tree/v0.0.1) (2017-08-10)

* First version to have a documented change-log. Each subsequent version will
  describe its differences from the previous one.
