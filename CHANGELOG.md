# Change history for ui-checkout

## [4.0.0] (IN PROGRESS)

* Upgrade to `stripes` `4.0`, `react-intl` `4.5`. Refs STRIPES-672.
* Upgrade to `react-intl-safe-html` `2.0`. Refs STRIPES-672.
* Use local file as a profile placeholder. Refs UICHKOUT-624

## [3.1.0] (IN PROGRESS)

* Change selected parton background color to increase color contrast. Refs UICHKOUT-603.
* Fix bug preventing continuation after cancelling checkout notes or multipiece modal. Fixes UICHKOUT-610, UICHKOUT-611.
* Show confirmation modal when item with withdrawn status is scanned. Refs UICHKOUT-605.
* Show confirmation modal when item with Missing status is scanned. Refs UICHKOUT-582.
* Pin `moment` at `~2.24.0`. Refs STRIPES-678.

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
