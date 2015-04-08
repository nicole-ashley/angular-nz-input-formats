[![Build Status](https://travis-ci.org/nikrolls/angular-nz-input-formats.svg?branch=master)](https://travis-ci.org/nikrolls/angular-nz-input-formats)
[![Code Climate](https://codeclimate.com/github/nikrolls/angular-nz-input-formats/badges/gpa.svg)](https://codeclimate.com/github/nikrolls/angular-nz-input-formats) [![Test Coverage](https://codeclimate.com/github/nikrolls/angular-nz-input-formats/badges/coverage.svg)](https://codeclimate.com/github/nikrolls/angular-nz-input-formats)
[![Coverage Status](https://coveralls.io/repos/nikrolls/angular-nz-input-formats/badge.png)](https://coveralls.io/r/nikrolls/angular-nz-input-formats)
[![Dependency Status](https://david-dm.org/nikrolls/angular-nz-input-formats.svg?style=flat)](https://david-dm.org/nikrolls/angular-nz-input-formats)
[![devDependency Status](https://david-dm.org/nikrolls/angular-nz-input-formats/dev-status.svg?style=flat)](https://david-dm.org/nikrolls/angular-nz-input-formats#info=devDependencies)

Angular NZ Input Formats
========================

Angular directives to validate and format NZ-specific input types

Installation
------------

`npm install angular-nz-input-formats`
or
`bower install angular-nz-input-formats`

Then add `nzInputFormats` to your angular dependencies

Usage
-----

```html
<input ng-model="bankNumber" nz-bank-number />
<input ng-model="irdNumber" nz-ird-number />
<input ng-model="phoneNumber" nz-phone-number />
```
