# Change history for ui-checkout

## Release 1.3.0 (IN PROGRESS)

* Add alternate dependency on `item-storage` 6.0 UICHKOUT-445
* Clear check-out page when session expires. Available from v1.2.1. Fixes UICHKOUT-70.

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
